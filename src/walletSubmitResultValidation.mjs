export function buildWalletSubmitResultValidation({
  adapterRun = {},
  submitResults = {},
  virtualChainRun = {},
  validationFixture = {},
  runAt = new Date().toISOString()
} = {}) {
  const sessions = Array.isArray(adapterRun.reviewSessions) ? adapterRun.reviewSessions : [];
  const sessionByRequest = new Map(sessions.map((session) => [session.requestId, session]));
  const resultByRequest = new Map((submitResults.results || []).map((result) => [result.requestId, result]));
  const acceptedTxids = new Set(
    (virtualChainRun.tables?.virtual_chain_window || [])
      .filter((row) => row.accepted === true)
      .map((row) => row.txid)
  );
  const policy = normalizePolicy(validationFixture.policy);
  const claims = validationFixture.claims || [];
  const negativeCases = validationFixture.negativeCases || [];
  const actualRows = claims.map((claim) => validateClaim({
    claim,
    session: sessionByRequest.get(claim.requestId),
    result: resultByRequest.get(claim.requestId),
    acceptedTxids,
    policy
  }));
  const negativeRows = negativeCases.map((claim) => validateClaim({
    claim,
    session: sessionByRequest.get(claim.requestId),
    result: {
      requestId: claim.requestId,
      sessionId: claim.sessionId,
      transactionId: claim.transactionId,
      status: claim.status || "accepted-evidence-already-recorded",
      route: claim.returnedRoute,
      acceptedEvidencePath: claim.acceptedEvidencePath
    },
    acceptedTxids,
    policy,
    negative: true
  }));
  const computeBudgetSessions = sessions.filter((session) => session.preservation?.computeBudgetInputs > 0);
  const actualFailures = actualRows.filter((row) => row.problems.length > 0);
  const uncaughtNegativeCases = negativeRows.filter((row) => row.problems.length === 0);
  const secretFields = findSecretFields(JSON.stringify({ validationFixture, submitResults, actualRows }));

  return {
    schema: "tn12-wallet-submit-result-validation/v1",
    network: adapterRun.network || virtualChainRun.network || "kaspa-testnet-12",
    runAt,
    status: actualFailures.length === 0
      && uncaughtNegativeCases.length === 0
      && secretFields.length === 0
      && validationFixture.liveWalletConnectorExists === false
      ? "wallet-submit-result-validation-ready"
      : "wallet-submit-result-validation-review",
    liveWalletConnectorExists: validationFixture.liveWalletConnectorExists === true,
    summary: {
      claims: actualRows.length,
      validClaims: actualRows.length - actualFailures.length,
      invalidClaims: actualFailures.length,
      negativeCases: negativeRows.length,
      caughtNegativeCases: negativeRows.length - uncaughtNegativeCases.length,
      uncaughtNegativeCases: uncaughtNegativeCases.length,
      acceptedEvidencePromotions: actualRows.filter((row) => row.promotion.state === "accepted-evidence-only").length,
      liveWalletPromotions: actualRows.filter((row) => row.promotion.state === "live-wallet-accepted").length,
      payloadValidated: actualRows.filter((row) => row.checks.payloadBytesPreserved).length,
      computeBudgetSessions: computeBudgetSessions.length,
      v1ComputeBudgetSessionsPreserved: computeBudgetSessions.filter((session) =>
        Number(session.preservation?.version || 0) === 1
        && Number(session.preservation?.computeBudgetInputs || 0) > 0
      ).length,
      secretFields: secretFields.length
    },
    policy: {
      requireExplicitUserActionForLiveWalletSubmit: policy.requireExplicitUserActionForLiveWalletSubmit,
      promotionRequiresAcceptedEvidence: policy.promotionRequiresAcceptedEvidence,
      promotionRequiresVirtualChainAcceptance: policy.promotionRequiresVirtualChainAcceptance,
      forbiddenRoutes: policy.forbiddenRoutes
    },
    actualRows,
    negativeRows,
    computeBudgetRows: computeBudgetSessions.map((session) => ({
      requestId: session.requestId,
      sessionId: session.sessionId,
      path: session.path,
      transactionId: session.transactionId,
      version: Number(session.preservation?.version || 0),
      computeBudgetInputs: Number(session.preservation?.computeBudgetInputs || 0),
      fingerprint: session.preservation?.fingerprint || "",
      preserved: Number(session.preservation?.version || 0) === 1
        && Number(session.preservation?.computeBudgetInputs || 0) > 0
    })),
    promotionRules: [
      "Result txid, route, request id, and session fingerprint must match the adapter review session.",
      "Payload routes must preserve the reviewed payload byte count and must not use public REST submit.",
      "Version-1 contract submits must preserve computeBudget inputs; rewriting to sigOpCount is invalid.",
      "A live wallet result requires explicit user approval before submit.",
      "Accepted app-state promotion requires accepted virtual-chain evidence and an accepted evidence artifact.",
      "Historical JSON wRPC evidence remains accepted evidence only; it does not prove a live wallet connector exists."
    ],
    boundaries: validationFixture.boundaries || [],
    secretFields
  };
}

function validateClaim({ claim = {}, session = {}, result = {}, acceptedTxids, policy, negative = false }) {
  const problems = [];
  const sessionFingerprint = session?.preservation?.fingerprint || "";
  const resultRoute = claim.returnedRoute || result?.route || "";
  const resultTxid = String(result?.transactionId || claim.transactionId || "");
  const acceptedEvidencePath = String(result?.acceptedEvidencePath || claim.acceptedEvidencePath || "");
  const payloadBytes = Number(session?.payload?.bytes || 0);
  const expectedPayloadBytes = Number(claim.expectedPayloadBytes || 0);
  const version = Number(session?.preservation?.version || 0);
  const expectedVersion = Number(claim.expectedVersion || 0);
  const computeBudgetInputs = Number(session?.preservation?.computeBudgetInputs || 0);
  const expectedComputeBudgetInputs = Number(claim.expectedComputeBudgetInputs || 0);
  const resultStatus = String(result?.status || claim.status || "");
  const source = String(result?.source || claim.source || "");
  const isHistoricalEvidence = source === "historical-json-wrpc-accepted"
    || claim.userAction?.kind === "historical-json-wrpc-evidence";
  const acceptedByVirtualChain = acceptedTxids.has(resultTxid);

  if (!session || Object.keys(session).length === 0) problems.push("missing adapter review session");
  if (!result || Object.keys(result).length === 0) problems.push("missing submit result");
  if (claim.sessionId && session.sessionId !== claim.sessionId) problems.push("session id mismatch");
  if (resultTxid !== session.transactionId) problems.push("transaction id does not match review session");
  if (claim.expectedFingerprint && claim.expectedFingerprint !== sessionFingerprint) problems.push("session fingerprint mismatch");
  if (policy.forbiddenRoutes.includes(resultRoute)) problems.push("forbidden submit route");
  if (session.payload?.present && !policy.allowedPayloadRoutes.includes(resultRoute)) problems.push("payload route is not payload-preserving");
  if (!session.payload?.present && resultRoute && !policy.allowedExactRoutes.includes(resultRoute) && !policy.allowedPayloadRoutes.includes(resultRoute)) {
    problems.push("exact submit route is not allowed");
  }
  if (session.payload?.present && payloadBytes !== expectedPayloadBytes) problems.push("payload byte count mismatch");
  if (version !== expectedVersion) problems.push("transaction version mismatch");
  if (computeBudgetInputs !== expectedComputeBudgetInputs) problems.push("computeBudget input count mismatch");
  if (version === 1 && computeBudgetInputs === 0) problems.push("version-1 transaction lost computeBudget inputs");
  if (/submitted|accepted/.test(resultStatus) && !isHistoricalEvidence && policy.requireExplicitUserActionForLiveWalletSubmit && claim.userAction?.explicit !== true) {
    problems.push("live wallet result missing explicit user action");
  }
  if (/accepted/.test(resultStatus)) {
    if (policy.promotionRequiresAcceptedEvidence && !acceptedEvidencePath) problems.push("accepted result missing evidence artifact");
    if (policy.promotionRequiresVirtualChainAcceptance && !acceptedByVirtualChain) problems.push("accepted result missing virtual-chain acceptance");
  }

  return {
    id: claim.id || claim.requestId || "",
    negative,
    requestId: claim.requestId || "",
    sessionId: session.sessionId || claim.sessionId || "",
    transactionId: resultTxid,
    resultStatus,
    resultRoute,
    resultSource: source || "fixture-claim",
    acceptedEvidencePath,
    checks: {
      txidMatchesSession: resultTxid === session.transactionId,
      fingerprintMatchesSession: claim.expectedFingerprint === sessionFingerprint,
      routeAllowed: !policy.forbiddenRoutes.includes(resultRoute),
      payloadBytesPreserved: !session.payload?.present || payloadBytes === expectedPayloadBytes,
      versionPreserved: version === expectedVersion,
      computeBudgetPreserved: computeBudgetInputs === expectedComputeBudgetInputs && (version !== 1 || computeBudgetInputs > 0),
      explicitUserAction: claim.userAction?.explicit === true,
      historicalEvidence: isHistoricalEvidence,
      acceptedByVirtualChain
    },
    promotion: resolvePromotion({
      resultStatus,
      acceptedByVirtualChain,
      acceptedEvidencePath,
      isHistoricalEvidence,
      explicitUserAction: claim.userAction?.explicit === true,
      problems
    }),
    problems
  };
}

function resolvePromotion({ resultStatus, acceptedByVirtualChain, acceptedEvidencePath, isHistoricalEvidence, explicitUserAction, problems }) {
  if (problems.length > 0) {
    return { state: "blocked-review", indexerReady: false };
  }
  if (/accepted/.test(resultStatus) && acceptedByVirtualChain && acceptedEvidencePath && isHistoricalEvidence) {
    return { state: "accepted-evidence-only", indexerReady: true };
  }
  if (/accepted/.test(resultStatus) && acceptedByVirtualChain && acceptedEvidencePath && explicitUserAction) {
    return { state: "live-wallet-accepted", indexerReady: true };
  }
  if (/submitted/.test(resultStatus)) {
    return { state: "submitted-awaiting-acceptance", indexerReady: false };
  }
  return { state: "not-promoted", indexerReady: false };
}

function normalizePolicy(policy = {}) {
  return {
    acceptedEvidenceStatuses: policy.acceptedEvidenceStatuses || ["accepted-evidence-already-recorded"],
    allowedPayloadRoutes: policy.allowedPayloadRoutes || ["json-wrpc", "payload-preserving-wallet", "payload-preserving-wallet-or-json-wrpc"],
    allowedExactRoutes: policy.allowedExactRoutes || ["wallet-exact-transaction-submit"],
    forbiddenRoutes: policy.forbiddenRoutes || ["rest-submit", "public-rest-submit", "payload-dropping-rest"],
    requireExplicitUserActionForLiveWalletSubmit: policy.requireExplicitUserActionForLiveWalletSubmit !== false,
    promotionRequiresAcceptedEvidence: policy.promotionRequiresAcceptedEvidence !== false,
    promotionRequiresVirtualChainAcceptance: policy.promotionRequiresVirtualChainAcceptance !== false
  };
}

function findSecretFields(serialized) {
  return [/"privateKey"\s*:/i, /"mnemonic"\s*:/i, /"seed"\s*:/i, /"secret"\s*:/i, /\.local\/tn12-wallet\.json/i]
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
