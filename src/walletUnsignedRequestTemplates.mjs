export function buildWalletUnsignedRequestTemplates({
  submitPackage = {},
  draftArtifacts = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const intents = Array.isArray(submitPackage.intents) ? submitPackage.intents : [];
  const templates = intents.map((intent) => buildTemplate({ intent, draft: draftArtifacts[intent.path] || {} }));
  const blocked = templates.filter((template) => template.status !== "unsigned-request-template-ready");
  const payloadTemplates = templates.filter((template) => template.payload.present);
  const computeBudgetTemplates = templates.filter((template) => template.preservation.computeBudgetInputs > 0);
  const secretFields = findSecretFields(JSON.stringify({ templates }));

  return {
    schema: "tn12-wallet-unsigned-request-templates/v1",
    network: submitPackage.network || "kaspa-testnet-12",
    generatedAt,
    status: blocked.length === 0 && secretFields.length === 0
      ? "unsigned-request-templates-ready"
      : "unsigned-request-templates-review",
    standardMapped: false,
    liveExternalSignerReady: false,
    summary: {
      templates: templates.length,
      ready: templates.length - blocked.length,
      blocked: blocked.length,
      payloadTemplates: payloadTemplates.length,
      computeBudgetTemplates: computeBudgetTemplates.length,
      signatureScriptsStripped: templates.reduce((sum, template) => sum + template.preservation.strippedSignatureScriptBytes, 0),
      secretFields: secretFields.length
    },
    templates,
    nextStandardMapping: [
      "Map these templates to a documented Kaspa wallet API, PSKB/PSKT, KSPT, or equivalent partial-transaction format.",
      "Add owner/public-key or derivation metadata for each input without exposing private keys.",
      "Have the external signer return a signed transaction plus a preservation report.",
      "Submit only after explicit user action and promote only after accepted virtual-chain evidence."
    ],
    boundaries: [
      "These are unsigned request templates derived from signed local drafts; they are not yet a wallet-standard format.",
      "Signature scripts are stripped from the request body so the artifact can describe what an external signer must sign.",
      "This does not prove KasSigner, KasSee, or any other wallet can consume the request yet.",
      "No private keys, mnemonics, seeds, or local wallet files are included."
    ],
    secretFields
  };
}

function buildTemplate({ intent = {}, draft = {} }) {
  const transaction = draft?.submitPayload?.transaction || draft?.signedTransaction?.tx?.inner || draft?.signedTransaction?.tx || {};
  const artifactPresent = Boolean(draft && Object.keys(draft).length);
  const unsignedInputs = (transaction.inputs || []).map(stripInput);
  const outputs = (transaction.outputs || []).map(normalizeOutput);
  const payloadHex = payloadToHex(transaction.payload);
  const payloadBytes = payloadHex ? Math.ceil(payloadHex.length / 2) : Number(intent.payload?.bytes || 0);
  const strippedSignatureBytes = (transaction.inputs || []).reduce((sum, input) => sum + signatureScriptBytes(input), 0);
  const blockers = [
    !artifactPresent ? "missing draft artifact" : "",
    !transaction.version && Number(transaction.version || 0) !== 0 ? "missing transaction version" : "",
    unsignedInputs.length === 0 ? "missing inputs" : "",
    outputs.length === 0 ? "missing outputs" : "",
    intent.payload?.present && payloadBytes === 0 ? "payload intent missing payload bytes" : ""
  ].filter(Boolean);

  return {
    requestId: stableRequestId(intent.path || intent.transactionId || "unsigned-request"),
    sourceSignedDraftPath: intent.path || "",
    label: intent.label || "",
    class: intent.class || "",
    status: blockers.length ? "unsigned-request-template-blocked" : "unsigned-request-template-ready",
    blockers,
    transaction: {
      version: Number(transaction.version || 0),
      lockTime: String(transaction.lockTime ?? "0"),
      subnetworkId: String(transaction.subnetworkId || "0000000000000000000000000000000000000000"),
      inputs: unsignedInputs,
      outputs
    },
    payload: {
      present: Boolean(intent.payload?.present || payloadHex),
      bytes: payloadBytes,
      hash: payloadHex ? stableHash(payloadHex) : "",
      hexPreview: payloadHex ? `${payloadHex.slice(0, 48)}${payloadHex.length > 48 ? "..." : ""}` : ""
    },
    preservation: {
      expectedTransactionIdAfterSigning: intent.transactionId || draft.transactionId || "",
      originalSignedDraftFingerprint: stableHash(JSON.stringify({
        id: intent.transactionId || draft.transactionId || "",
        version: transaction.version || 0,
        lockTime: transaction.lockTime ?? "0",
        inputs: (transaction.inputs || []).map((input) => ({
          previousOutpoint: input.previousOutpoint,
          sequence: input.sequence,
          sigOpCount: input.sigOpCount ?? null,
          computeBudget: input.computeBudget ?? null,
          signatureScriptBytes: signatureScriptBytes(input)
        })),
        outputs,
        payloadBytes
      })),
      strippedSignatureScriptBytes: strippedSignatureBytes,
      computeBudgetInputs: unsignedInputs.filter((input) => input.computeBudget !== null).length,
      requiredWalletChecks: intent.requiredWalletChecks || []
    },
    requestedSignerAction: {
      kind: "sign-then-return-transaction",
      userActionRequired: true,
      routeAfterSigning: intent.route || "",
      mustPreserve: [
        "network",
        "version",
        "lockTime",
        "subnetworkId",
        "previousOutpoints",
        "sequences",
        "sigOpCount fields when present",
        "computeBudget fields when present",
        "outputs",
        "payload bytes"
      ]
    }
  };
}

function stripInput(input = {}) {
  return {
    previousOutpoint: {
      transactionId: String(input.previousOutpoint?.transactionId || ""),
      index: Number(input.previousOutpoint?.index ?? 0)
    },
    sequence: String(input.sequence ?? "0"),
    sigOpCount: input.sigOpCount === undefined ? null : Number(input.sigOpCount),
    computeBudget: input.computeBudget === undefined ? null : Number(input.computeBudget),
    signatureScript: "",
    signatureScriptBytes: 0
  };
}

function normalizeOutput(output = {}, index) {
  return {
    index,
    amount: String(output.amount ?? "0"),
    scriptPublicKey: {
      version: Number(output.scriptPublicKey?.version ?? 0),
      scriptPublicKey: String(output.scriptPublicKey?.scriptPublicKey || "")
    }
  };
}

function signatureScriptBytes(input = {}) {
  if (Array.isArray(input.signatureScript)) return input.signatureScript.length;
  return input.signatureScript ? Math.ceil(String(input.signatureScript).length / 2) : 0;
}

function payloadToHex(payload) {
  if (Array.isArray(payload)) return Buffer.from(payload).toString("hex");
  return String(payload || "");
}

function stableRequestId(seed) {
  return `ureq-${stableHash(seed).replace(/^h-/, "")}`;
}

function stableHash(seed) {
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `h-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function findSecretFields(serialized) {
  return [/"privateKey"\s*:/i, /"mnemonic"\s*:/i, /"seed"\s*:/i, /\.local\/tn12-wallet\.json/i]
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
