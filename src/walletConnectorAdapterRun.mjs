export function buildWalletConnectorAdapterRun({
  submitRequests = {},
  runAt = new Date().toISOString()
} = {}) {
  const requests = Array.isArray(submitRequests.requests) ? submitRequests.requests : [];
  const reviewSessions = requests.map((request) => buildReviewSession({ request, runAt }));
  const blockedSessions = reviewSessions.filter((session) => session.status !== "adapter-review-ready");
  const payloadSessions = reviewSessions.filter((session) => session.payload.present);
  const computeBudgetSessions = reviewSessions.filter((session) => session.preservation.computeBudgetInputs > 0);
  const secretFields = findSecretFields(JSON.stringify({ submitRequests, reviewSessions }));

  return {
    schema: "tn12-wallet-connector-adapter-run/v1",
    network: submitRequests.network || "kaspa-testnet-12",
    runAt,
    status: blockedSessions.length === 0 && secretFields.length === 0
      ? "adapter-dry-run-ready"
      : "adapter-dry-run-blocked",
    summary: {
      requests: requests.length,
      reviewReady: reviewSessions.length - blockedSessions.length,
      blocked: blockedSessions.length,
      payloadRequests: payloadSessions.length,
      computeBudgetRequests: computeBudgetSessions.length,
      secretFields: secretFields.length,
      submitBroadcasts: 0
    },
    adapterSurface: {
      connectorName: submitRequests.adapterContract?.name || "tn12ConnectorSubmit",
      version: submitRequests.adapterContract?.version || "v1",
      implementedMethods: [
        "buildReviewSession",
        "verifyPreservationFields",
        "recordDryRunResult"
      ],
      stillExternal: [
        "wallet account selection",
        "wallet signature approval",
        "payload-preserving network submit",
        "accepted transaction confirmation"
      ]
    },
    reviewSessions,
    submitResults: reviewSessions.map((session) => ({
      requestId: session.requestId,
      transactionId: session.transactionId,
      status: "not-submitted",
      reason: "dry-run adapter never broadcasts",
      recordForIndexer: false
    })),
    boundaries: [
      "This artifact consumes the wallet connector request bundle and proves review-session shape without local private keys.",
      "It does not sign, submit, or connect to an external wallet.",
      "A real connector must preserve the transaction fingerprint, payload byte count, lock time, version, and computeBudget fields before submit.",
      "Indexer state must still wait for accepted TN12 transaction evidence."
    ],
    secretFields
  };
}

function buildReviewSession({ request, runAt }) {
  const problems = [
    request.status !== "connector-request-ready" ? `request status ${request.status}` : "",
    request.userReview?.required !== true ? "user review is not marked required" : "",
    !request.transaction?.id ? "missing transaction id" : "",
    !Array.isArray(request.transaction?.inputs) || request.transaction.inputs.length === 0 ? "missing inputs" : "",
    !Array.isArray(request.transaction?.outputs) || request.transaction.outputs.length === 0 ? "missing outputs" : "",
    request.payload?.routeRequired && Number(request.payload?.bytes || 0) === 0 ? "payload route has zero payload bytes" : ""
  ].filter(Boolean);
  const fingerprint = transactionFingerprint(request);

  return {
    sessionId: `review-${request.requestId}`,
    requestId: request.requestId,
    path: request.path,
    label: request.label,
    lane: request.lane,
    class: request.class,
    status: problems.length ? "adapter-review-blocked" : "adapter-review-ready",
    createdAt: runAt,
    transactionId: request.transaction?.id || "",
    route: request.route,
    payload: {
      present: Boolean(request.payload?.present),
      bytes: Number(request.payload?.bytes || 0),
      routeRequired: Boolean(request.payload?.routeRequired)
    },
    preservation: {
      fingerprint,
      version: Number(request.transaction?.version || 0),
      lockTime: String(request.transaction?.lockTime ?? "0"),
      inputs: request.transaction?.inputs?.length || 0,
      outputs: request.transaction?.outputs?.length || 0,
      computeBudgetInputs: (request.transaction?.inputs || []).filter((input) => input.computeBudget !== null).length,
      signatureScriptBytes: (request.transaction?.inputs || []).reduce((sum, input) => sum + Number(input.signatureScriptBytes || 0), 0)
    },
    displayFields: request.userReview?.fields || [],
    warnings: request.userReview?.warnings || [],
    problems
  };
}

function transactionFingerprint(request) {
  const transaction = request.transaction || {};
  const inputSeed = (transaction.inputs || []).map((input) => [
    input.previousOutpoint?.transactionId || "",
    input.previousOutpoint?.index ?? 0,
    input.sequence ?? "",
    input.sigOpCount ?? "",
    input.computeBudget ?? "",
    input.signatureScriptBytes ?? 0
  ].join(":")).join("|");
  const outputSeed = (transaction.outputs || []).map((output) => [
    output.index ?? 0,
    output.amount ?? "",
    output.scriptVersion ?? 0,
    output.scriptPublicKeyBytes ?? 0
  ].join(":")).join("|");
  return stableHash([
    transaction.id || "",
    transaction.version ?? 0,
    transaction.lockTime ?? "0",
    transaction.subnetworkId || "",
    inputSeed,
    outputSeed,
    request.payload?.bytes || 0,
    request.route || ""
  ].join("||"));
}

function stableHash(seed) {
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fp-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function findSecretFields(serialized) {
  return [/"privateKey"\s*:/i, /"mnemonic"\s*:/i, /"seed"\s*:/i, /"secret"\s*:/i]
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
