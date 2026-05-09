export function buildWalletExternalSignerGap({
  submitRequests = {},
  adapterRun = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const requests = Array.isArray(submitRequests.requests) ? submitRequests.requests : [];
  const sessions = Array.isArray(adapterRun.reviewSessions) ? adapterRun.reviewSessions : [];
  const sessionByRequest = new Map(sessions.map((session) => [session.requestId, session]));
  const rows = requests.map((request) => buildSignerRow({ request, session: sessionByRequest.get(request.requestId) }));
  const signedLocalRows = rows.filter((row) => row.currentArtifactMode === "signed-local-draft");
  const unsignedRows = rows.filter((row) => row.currentArtifactMode === "unsigned-wallet-sign-request");
  const payloadRows = rows.filter((row) => row.payload.present);
  const computeBudgetRows = rows.filter((row) => row.preservation.computeBudgetInputs > 0);
  const blockedRows = rows.filter((row) => row.status === "external-signer-review-blocked");
  const sensitiveFieldMatches = findSensitiveFieldMatches(JSON.stringify({ rows }));
  const liveNoLocalKeySigningReady = unsignedRows.length > 0
    && unsignedRows.length === rows.length
    && blockedRows.length === 0
    && sensitiveFieldMatches.length === 0;

  return {
    schema: "tn12-wallet-external-signer-gap/v1",
    network: submitRequests.network || adapterRun.network || "kaspa-testnet-12",
    generatedAt,
    status: sensitiveFieldMatches.length === 0
      ? "external-signer-gap-documented"
      : "external-signer-gap-review",
    liveNoLocalKeySigningReady,
    summary: {
      requests: rows.length,
      signedLocalDrafts: signedLocalRows.length,
      unsignedWalletSignRequests: unsignedRows.length,
      submitOnlyCandidates: rows.filter((row) => row.externalSignerMode === "submit-only").length,
      signAndSubmitCandidates: rows.filter((row) => row.externalSignerMode === "sign-and-submit").length,
      payloadPreservationNeeded: payloadRows.length,
      computeBudgetPreservationNeeded: computeBudgetRows.length,
      blockedRows: blockedRows.length,
      sensitiveFieldMatches: sensitiveFieldMatches.length
    },
    currentTruth: [
      "The existing wallet-submit request bundle is useful for exact transaction review and submit-result validation.",
      "The current artifacts are signed local drafts, so they can model external submit and promotion rules but not no-local-key signing.",
      "No-local-key readiness requires unsigned wallet sign requests or a standard partial transaction handoff that an external signer can authorize."
    ],
    rows,
    closeGapChecklist: [
      {
        id: "unsigned-request-schema",
        requirement: "Create an unsigned transaction request schema that carries inputs, outputs, payload bytes, network, fee, lock time, version, and computeBudget without signature scripts."
      },
      {
        id: "ownership-and-derivation",
        requirement: "Tell the wallet which addresses, derivation paths, or public keys are expected to authorize each input without exposing private key material."
      },
      {
        id: "standard-handoff-format",
        requirement: "Map the request to a Kaspa wallet API, PSKB/PSKT, KSPT, or another documented partial-transaction format before claiming external signer support."
      },
      {
        id: "payload-preservation",
        requirement: "Prove payload byte count and payload hash survive wallet signing and network submit."
      },
      {
        id: "compute-budget-preservation",
        requirement: "Prove tx version 1 contract spends preserve computeBudget and do not rewrite the field into sigOpCount."
      },
      {
        id: "accepted-result-promotion",
        requirement: "Promote a wallet-submitted tx only after explicit user action, returned txid, accepted virtual-chain evidence, and matching accepted evidence artifact."
      }
    ],
    nextBuildStep: liveNoLocalKeySigningReady
      ? "Run one external signer submit and validate the accepted result."
      : "Build one unsigned payload receipt request and one unsigned v1 contract request before claiming no-local-key wallet signing.",
    boundaries: [
      "This artifact intentionally does not sign or broadcast.",
      "Submit-only rows do not prove external wallet signing because the repo already contains signed local drafts.",
      "KasSigner/KasSee remains a reference for air-gapped/watch-only handoff patterns, not an integrated signer in this repo.",
      "The wallet connector can become real only when an external signer returns a transaction from an unsigned or partial request and the indexer confirms acceptance."
    ],
    sensitiveFieldMatches
  };
}

function buildSignerRow({ request = {}, session = {} }) {
  const inputSignatureBytes = (request.transaction?.inputs || [])
    .reduce((sum, input) => sum + Number(input.signatureScriptBytes || 0), 0);
  const sessionSignatureBytes = Number(session?.preservation?.signatureScriptBytes || 0);
  const signatureScriptBytes = Math.max(inputSignatureBytes, sessionSignatureBytes);
  const currentArtifactMode = signatureScriptBytes > 0
    ? "signed-local-draft"
    : "unsigned-wallet-sign-request";
  const externalSignerMode = currentArtifactMode === "signed-local-draft"
    ? "submit-only"
    : "sign-and-submit";
  const blockers = [
    request.status !== "connector-request-ready" ? `request status ${request.status}` : "",
    !request.transaction?.id ? "missing transaction id" : "",
    currentArtifactMode === "signed-local-draft" ? "already signed by local draft builder" : "",
    request.payload?.present && Number(request.payload?.bytes || 0) === 0 ? "payload request has zero payload bytes" : ""
  ].filter(Boolean);

  return {
    requestId: request.requestId || "",
    sessionId: session?.sessionId || "",
    path: request.path || "",
    label: request.label || "",
    class: request.class || "",
    status: blockers.length ? "external-signer-review-blocked" : "external-signer-signing-ready",
    currentArtifactMode,
    externalSignerMode,
    blockers,
    transactionId: request.transaction?.id || "",
    payload: {
      present: Boolean(request.payload?.present),
      bytes: Number(request.payload?.bytes || 0),
      route: request.route || ""
    },
    preservation: {
      version: Number(request.transaction?.version || session?.preservation?.version || 0),
      inputs: request.transaction?.inputs?.length || session?.preservation?.inputs || 0,
      outputs: request.transaction?.outputs?.length || session?.preservation?.outputs || 0,
      signatureScriptBytes,
      computeBudgetInputs: (request.transaction?.inputs || [])
        .filter((input) => input.computeBudget !== null).length || Number(session?.preservation?.computeBudgetInputs || 0),
      fingerprint: session?.preservation?.fingerprint || ""
    },
    requiredUpgrade: currentArtifactMode === "signed-local-draft"
      ? "Replace signed-local draft input with an unsigned or partial transaction request for external wallet signing."
      : "Validate external wallet signature, submit route, accepted txid, and replayed app state."
  };
}

function findSensitiveFieldMatches(serialized) {
  return [/"privateKey"\s*:/i, /"mnemonic"\s*:/i, /"seed"\s*:/i, /\.local\/tn12-wallet\.json/i]
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
