export function buildVirtualChainReaderAdapter({
  fixture = {},
  checkpointIndex = {},
  ingestionRun = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const endpoint = fixture.endpoint || {};
  const adapter = fixture.adapter || {};
  const cursor = fixture.cursor || {};
  const rollback = fixture.rollback || {};
  const retryBackoff = fixture.retryBackoff || {};
  const matching = fixture.matching || {};
  const checkpoint = checkpointIndex.checkpoint || {};
  const ingestionSummary = ingestionRun.summary || {};
  const endpointConfigured = Boolean(process.env[endpoint.configEnv || ""]);
  const localNodeRequired = adapter.localNodeRequired === true;
  const hasHighVerbosity = endpoint.dataVerbosity === "High";
  const hasDurableCursor = cursor.kind === "blue-score-checkpoint"
    && cursor.persistTable === "checkpoint_watermarks"
    && Array.isArray(cursor.persistFields)
    && cursor.persistFields.includes("max_blue_score");
  const hasRollbackPolicy = Array.isArray(rollback.detectWhen)
    && rollback.detectWhen.length >= 4
    && Array.isArray(rollback.actions)
    && rollback.actions.some((action) => /rollback_segments/.test(action));
  const hasRetry = Number(retryBackoff.maxAttempts || 0) >= 3
    && Number(retryBackoff.initialDelayMs || 0) > 0
    && Number(retryBackoff.maxDelayMs || 0) >= Number(retryBackoff.initialDelayMs || 0);
  const payloadRules = matching.payload?.required || [];
  const proofRules = matching.proof?.required || [];
  const hasMatchingRules = payloadRules.some((rule) => /payload bytes/.test(rule))
    && proofRules.some((rule) => /P2SH outpoint/.test(rule));
  const fixtureRowsReady = ingestionRun.status === "fixture-virtual-chain-run-ready"
    && Number(ingestionSummary.virtualChainRows || 0) === Number(checkpoint.recordCount || 0)
    && Number(ingestionSummary.rollbackRows || 0) === 0;
  const ready = !localNodeRequired
    && hasHighVerbosity
    && hasDurableCursor
    && hasRollbackPolicy
    && hasRetry
    && hasMatchingRules
    && fixtureRowsReady;

  return {
    schema: "tn12-virtual-chain-reader-adapter/v1",
    network: fixture.network || checkpointIndex.network || ingestionRun.network || "kaspa-testnet-12",
    generatedAt,
    status: ready ? "virtual-chain-reader-adapter-ready" : "virtual-chain-reader-adapter-review",
    mode: adapter.mode || "configured-rpc-adapter-contract",
    endpoint: {
      configEnv: endpoint.configEnv || "TN12_VIRTUAL_CHAIN_RPC_URL",
      configured: endpointConfigured,
      transport: endpoint.transport || "json-wrpc-or-rpc-client",
      networkId: endpoint.networkId || "testnet-12",
      method: endpoint.method || "getVirtualChainFromBlockV2",
      dataVerbosity: endpoint.dataVerbosity || "High",
      minConfirmationCount: Number(endpoint.minConfirmationCount ?? 0),
      requiredRequestFields: endpoint.requiredRequestFields || []
    },
    bounds: {
      localNodeRequired,
      liveReadAttempted: adapter.liveReadAttemptedByDefault === true && endpointConfigured,
      maxBlueScoreSpan: Number(adapter.boundedWindow?.maxBlueScoreSpan || 0),
      maxAcceptedTransactions: Number(adapter.boundedWindow?.maxAcceptedTransactions || 0),
      stopAfterEmptyWindows: Number(adapter.boundedWindow?.stopAfterEmptyWindows || 0)
    },
    cursor: {
      kind: cursor.kind || "blue-score-checkpoint",
      bootstrapFrom: cursor.bootstrapFrom || "artifacts/checkpointed-accepted-index.json",
      persistTable: cursor.persistTable || "checkpoint_watermarks",
      startBlueScore: checkpoint.maxAcceptingBlockBlueScore ?? ingestionRun.source?.endBlueScore ?? null,
      trustedOverlapStartBlueScore: checkpoint.minAcceptingBlockBlueScore ?? ingestionRun.source?.startBlueScore ?? null,
      persistFields: cursor.persistFields || [],
      resumeRule: cursor.resumeRule || ""
    },
    retryBackoff: {
      maxAttempts: Number(retryBackoff.maxAttempts || 0),
      initialDelayMs: Number(retryBackoff.initialDelayMs || 0),
      multiplier: Number(retryBackoff.multiplier || 0),
      maxDelayMs: Number(retryBackoff.maxDelayMs || 0),
      jitter: retryBackoff.jitter || "none",
      retryOn: retryBackoff.retryOn || [],
      doNotRetryOn: retryBackoff.doNotRetryOn || []
    },
    rollbackHandling: {
      detectWhen: rollback.detectWhen || [],
      actions: rollback.actions || [],
      currentRollbackRows: Number(ingestionSummary.rollbackRows || 0),
      blocksAppReady: Number(ingestionSummary.rollbackRows || 0) > 0
    },
    matching: {
      payload: {
        source: matching.payload?.source || "",
        required: payloadRules,
        currentMatchedRows: Number(ingestionSummary.payloadRows || 0)
      },
      proof: {
        source: matching.proof?.source || "",
        required: proofRules,
        currentMatchedRows: Number(ingestionSummary.proofRows || 0)
      },
      appStateReady: Boolean(ingestionSummary.appStateReady)
    },
    summary: {
      sourceCheckpointRecords: Number(checkpoint.recordCount || 0),
      virtualChainRows: Number(ingestionSummary.virtualChainRows || 0),
      payloadRows: Number(ingestionSummary.payloadRows || 0),
      proofRows: Number(ingestionSummary.proofRows || 0),
      rollbackRows: Number(ingestionSummary.rollbackRows || 0),
      endpointConfigured,
      localNodeRequired,
      acceptedCountsChanged: false
    },
    readinessChecks: {
      highVerbosityTransactions: hasHighVerbosity,
      durableCursor: hasDurableCursor,
      rollbackPolicy: hasRollbackPolicy,
      retryBackoff: hasRetry,
      payloadAndProofMatching: hasMatchingRules,
      fixtureReplayCompatible: fixtureRowsReady,
      endpointConfiguredForLiveRead: endpointConfigured
    },
    nextLiveStep: endpointConfigured
      ? "Run the live adapter against the configured TN12 virtual-chain endpoint and compare its rows with this artifact before committing a checkpoint."
      : `Set ${endpoint.configEnv || "TN12_VIRTUAL_CHAIN_RPC_URL"} to a hosted TN12 RPC endpoint before attempting live reads.`,
    boundaries: fixture.boundaries || [
      "This artifact is an adapter contract, not a live node subscription.",
      "It does not require local kaspad."
    ]
  };
}
