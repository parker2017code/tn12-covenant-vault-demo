export function buildWalletConnectorSubmitRequests({ submitPackage = {}, draftArtifacts = {} } = {}) {
  const intents = submitPackage.intents || [];
  const requests = intents.map((intent) => buildRequest(intent, draftArtifacts[intent.path]));
  const payloadRequests = requests.filter((request) => request.payload.present);
  const computeBudgetRequests = requests.filter((request) => request.transaction.inputs.some((input) => input.computeBudget !== null));
  const secretFields = findSecretFields(JSON.stringify({ submitPackage, requests }));
  const ready = submitPackage.status === "wallet-submit-package-ready"
    && requests.every((request) => request.status === "connector-request-ready")
    && secretFields.length === 0;

  return {
    schema: "tn12-wallet-connector-submit-requests/v1",
    network: submitPackage.network || "kaspa-testnet-12",
    status: ready ? "connector-submit-requests-ready" : "connector-submit-requests-blocked",
    summary: {
      requests: requests.length,
      payloadRequests: payloadRequests.length,
      computeBudgetRequests: computeBudgetRequests.length,
      missingArtifacts: requests.filter((request) => request.artifactPresent === false).length,
      secretFields: secretFields.length
    },
    adapterContract: {
      name: "tn12ConnectorSubmit",
      version: "v1",
      requiredMethods: [
        {
          name: "reviewTransaction",
          purpose: "Display network, draft path, txid, inputs, outputs, fees, version, lock time, payload bytes, and route before any user action."
        },
        {
          name: "submitReviewedTransaction",
          purpose: "Submit the reviewed transaction without changing payload bytes, lock time, input fields, or version-1 computeBudget values."
        },
        {
          name: "recordSubmitResult",
          purpose: "Return txid, submitted route, timestamp, and accepted/rejected/error state for indexer ingestion."
        }
      ],
      forbiddenInputs: [".local/tn12-wallet.json", "privateKey", "mnemonic", "seed", "secret"],
      userActionRequired: true
    },
    routePolicy: submitPackage.routePolicy || {},
    requests,
    firstPayloadRequests: payloadRequests.slice(0, 5),
    boundaries: [
      "This is the connector request bundle the browser/wallet should exchange, not a browser-held private-key flow.",
      "Existing artifacts are already signed local drafts; this bundle is the exact-review and submit contract for replacing local shell submission.",
      "Payload requests must reject REST submit routes that drop payload bytes.",
      "Version-1 contract requests must preserve computeBudget and must not rewrite it to sigOpCount."
    ],
    secretFields
  };
}

function buildRequest(intent = {}, draft = {}) {
  const transaction = draft?.submitPayload?.transaction || draft?.signedTransaction?.tx?.inner || draft?.signedTransaction?.tx || {};
  const inputs = normalizeInputs(transaction.inputs || []);
  const outputs = normalizeOutputs(transaction.outputs || []);
  const payloadHex = Array.isArray(transaction.payload)
    ? Buffer.from(transaction.payload).toString("hex")
    : String(transaction.payload || "");
  const payloadBytes = payloadHex ? Math.ceil(payloadHex.length / 2) : Number(intent.payload?.bytes || 0);
  const txid = String(intent.transactionId || draft.transactionId || transaction.id || "");
  const artifactPresent = Boolean(draft && Object.keys(draft).length);
  const route = intent.payload?.present ? "payload-preserving-wallet-or-json-wrpc" : "wallet-exact-transaction-submit";
  const blockers = [];
  if (!artifactPresent) blockers.push("missing draft artifact");
  if (!txid) blockers.push("missing transaction id");
  if (!inputs.length) blockers.push("missing inputs");
  if (!outputs.length) blockers.push("missing outputs");
  if (intent.payload?.present && payloadBytes === 0) blockers.push("payload intent missing payload bytes");

  return {
    requestId: stableRequestId(intent.path || txid),
    path: String(intent.path || ""),
    label: String(intent.label || ""),
    lane: String(intent.lane || ""),
    class: String(intent.class || ""),
    status: blockers.length ? "connector-request-blocked" : "connector-request-ready",
    artifactPresent,
    blockers,
    transaction: {
      id: txid,
      version: Number(transaction.version || 0),
      lockTime: String(transaction.lockTime ?? "0"),
      subnetworkId: String(transaction.subnetworkId || "0000000000000000000000000000000000000000"),
      inputs,
      outputs
    },
    payload: {
      present: Boolean(intent.payload?.present || payloadHex),
      bytes: payloadBytes,
      hexPreview: payloadHex ? `${payloadHex.slice(0, 48)}${payloadHex.length > 48 ? "..." : ""}` : "",
      routeRequired: Boolean(intent.payload?.present)
    },
    route,
    userReview: {
      required: true,
      fields: [
        "network",
        "path",
        "transaction.id",
        "transaction.version",
        "transaction.inputs",
        "transaction.outputs",
        "transaction.lockTime",
        "payload.bytes",
        "route"
      ],
      warnings: intent.requiredWalletChecks || []
    }
  };
}

function normalizeInputs(inputs) {
  return inputs.map((rawInput) => {
    const input = rawInput.inner || rawInput;
    return {
    previousOutpoint: {
      transactionId: String(input.previousOutpoint?.transactionId || input.previousOutpoint?.inner?.transactionId || input.previous_outpoint_hash || ""),
      index: Number(input.previousOutpoint?.index ?? input.previousOutpoint?.inner?.index ?? input.previous_outpoint_index ?? 0)
    },
    sequence: String(input.sequence ?? "0"),
    sigOpCount: input.sigOpCount === undefined ? null : Number(input.sigOpCount),
    computeBudget: input.computeBudget === undefined ? null : Number(input.computeBudget),
    signatureScriptBytes: Array.isArray(input.signatureScript)
      ? input.signatureScript.length
      : input.signatureScript ? Math.ceil(String(input.signatureScript).length / 2) : 0
  };
  });
}

function normalizeOutputs(outputs) {
  return outputs.map((rawOutput, index) => {
    const output = rawOutput.inner || rawOutput;
    return {
    index,
    amount: String(output.amount ?? output.value ?? "0"),
    scriptVersion: Number(output.scriptPublicKey?.version ?? 0),
    scriptPublicKeyBytes: output.scriptPublicKey?.scriptPublicKey
      ? Math.ceil(String(output.scriptPublicKey.scriptPublicKey).length / 2)
      : String(output.scriptPublicKey || "").length
  };
  });
}

function stableRequestId(seed) {
  const text = String(seed || "wallet-request");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `wreq-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function findSecretFields(serialized) {
  const patterns = [
    /"privateKey"\s*:/,
    /"mnemonic"\s*:/,
    /"seed"\s*:/,
    /"secret"\s*:/
  ];
  return patterns
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
