export function buildWalletConnectorSubmitLedger({
  adapterRun = {},
  submitResults = {},
  virtualChainRun = {},
  runAt = new Date().toISOString()
} = {}) {
  const sessions = Array.isArray(adapterRun.reviewSessions) ? adapterRun.reviewSessions : [];
  const suppliedResults = Array.isArray(submitResults.results) ? submitResults.results : [];
  const resultByRequest = new Map(suppliedResults.map((result) => [result.requestId, result]));
  const acceptedTxids = new Set(
    (virtualChainRun.tables?.virtual_chain_window || [])
      .filter((row) => row.accepted === true)
      .map((row) => row.txid)
  );
  const ledgerRows = sessions.map((session) => buildLedgerRow({ session, result: resultByRequest.get(session.requestId), acceptedTxids, runAt }));
  const acceptedEvidence = ledgerRows.filter((row) => row.state === "accepted-evidence-recorded");
  const pending = ledgerRows.filter((row) => row.state === "pending-wallet-submit");
  const blocked = ledgerRows.filter((row) => row.state === "blocked-review");
  const rejected = ledgerRows.filter((row) => row.state === "wallet-submit-rejected" || row.state === "wallet-submit-error");
  const payloadRows = ledgerRows.filter((row) => row.payload.present);
  const computeBudgetRows = ledgerRows.filter((row) => row.preservation.computeBudgetInputs > 0);
  const secretFields = findSecretFields(JSON.stringify({ adapterRun, submitResults, ledgerRows }));

  return {
    schema: "tn12-wallet-connector-submit-ledger/v1",
    network: adapterRun.network || virtualChainRun.network || "kaspa-testnet-12",
    runAt,
    status: secretFields.length === 0 && blocked.length === 0
      ? "wallet-submit-ledger-ready"
      : "wallet-submit-ledger-review",
    summary: {
      sessions: sessions.length,
      acceptedEvidence: acceptedEvidence.length,
      pendingWalletSubmit: pending.length,
      blockedReview: blocked.length,
      rejectedOrError: rejected.length,
      payloadRows: payloadRows.length,
      computeBudgetRows: computeBudgetRows.length,
      secretFields: secretFields.length,
      broadcastsByThisArtifact: 0
    },
    promotionRules: [
      "A review session can become submitted only after an external wallet returns a txid and route.",
      "A submitted txid can become app state only after the virtual-chain reader reports it accepted with matching payload/output rules.",
      "Historical accepted JSON wRPC evidence can be recorded, but it does not prove the wallet connector is live.",
      "Rejected, error, stale, or missing accepted evidence rows stay out of app reducers."
    ],
    requiredResultFields: [
      "requestId",
      "sessionId",
      "transactionId",
      "status",
      "route",
      "acceptedEvidencePath"
    ],
    ledgerRows,
    readyForIndexer: acceptedEvidence.map((row) => ({
      requestId: row.requestId,
      transactionId: row.transactionId,
      acceptedEvidencePath: row.acceptedEvidencePath,
      source: row.resultSource,
      caveat: "Only already accepted evidence is indexer-ready; wallet connector liveness is still unproven."
    })),
    boundaries: [
      "This ledger records review/submit/result state; it does not sign or broadcast.",
      "Rows with historical JSON wRPC evidence keep the accepted payload facts, but do not upgrade the wallet connector to live.",
      "Pending wallet-submit rows remain candidates until a real wallet and virtual-chain accepted evidence exist.",
      "No private keys, mnemonics, seeds, or local wallet files are inputs to this artifact."
    ],
    secretFields
  };
}

function buildLedgerRow({ session = {}, result = {}, acceptedTxids, runAt }) {
  const hasResult = Boolean(result && Object.keys(result).length);
  const transactionId = String(result.transactionId || session.transactionId || "");
  const acceptedByVirtualChain = hasResult && acceptedTxids.has(transactionId);
  const state = resolveState({ session, result, hasResult, acceptedByVirtualChain });

  return {
    requestId: session.requestId || result.requestId || "",
    sessionId: session.sessionId || result.sessionId || "",
    path: session.path || "",
    transactionId,
    state,
    reviewedAt: session.createdAt || "",
    recordedAt: runAt,
    resultSource: result.source || "none",
    route: result.route || session.route || "",
    acceptedEvidencePath: result.acceptedEvidencePath || "",
    acceptedByVirtualChain,
    payload: {
      present: Boolean(session.payload?.present),
      bytes: Number(session.payload?.bytes || 0),
      routeRequired: Boolean(session.payload?.routeRequired)
    },
    preservation: {
      fingerprint: session.preservation?.fingerprint || "",
      version: Number(session.preservation?.version || 0),
      lockTime: String(session.preservation?.lockTime ?? "0"),
      computeBudgetInputs: Number(session.preservation?.computeBudgetInputs || 0),
      signatureScriptBytes: Number(session.preservation?.signatureScriptBytes || 0)
    },
    reviewProblems: session.problems || [],
    notes: result.notes || ""
  };
}

function resolveState({ session = {}, result = {}, hasResult, acceptedByVirtualChain }) {
  if (session.status !== "adapter-review-ready") return "blocked-review";
  if (!hasResult) return "pending-wallet-submit";
  if (/rejected/.test(result.status || "")) return "wallet-submit-rejected";
  if (/error/.test(result.status || "")) return "wallet-submit-error";
  if (/accepted/.test(result.status || "") && acceptedByVirtualChain) return "accepted-evidence-recorded";
  if (/submitted/.test(result.status || "")) return "submitted-awaiting-acceptance";
  return "pending-wallet-submit";
}

function findSecretFields(serialized) {
  return [/"privateKey"\s*:/i, /"mnemonic"\s*:/i, /"seed"\s*:/i, /"secret"\s*:/i, /\.local\/tn12-wallet\.json/i]
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
