export function buildVirtualChainLivePreflight({ readerAdapter = {}, generatedAt = new Date().toISOString() } = {}) {
  const checks = [
    check("endpoint-configured", readerAdapter.readinessChecks?.endpointConfiguredForLiveRead === true, "Set TN12_VIRTUAL_CHAIN_RPC_URL before live reads."),
    check("high-verbosity", readerAdapter.readinessChecks?.highVerbosityTransactions === true, "Reader must request high transaction verbosity."),
    check("durable-cursor", readerAdapter.readinessChecks?.durableCursor === true, "Persist blue-score checkpoint fields."),
    check("rollback-policy", readerAdapter.readinessChecks?.rollbackPolicy === true, "Rollback detection must be active."),
    check("payload-proof-matching", readerAdapter.readinessChecks?.payloadAndProofMatching === true, "Payload and proof matching rules must be present."),
    check("local-node-not-required", readerAdapter.summary?.localNodeRequired === false, "Do not reintroduce local kaspad as a default.")
  ];
  const blocking = checks.filter((item) => !item.pass);

  return {
    schema: "tn12-virtual-chain-live-preflight/v1",
    network: readerAdapter.network || "kaspa-testnet-12",
    generatedAt,
    status: blocking.length === 0 ? "live-preflight-ready" : "live-preflight-blocked",
    liveReadAttempted: false,
    endpoint: readerAdapter.endpoint || {},
    cursor: readerAdapter.cursor || {},
    checks,
    summary: {
      checks: checks.length,
      passing: checks.length - blocking.length,
      blocking: blocking.length,
      endpointConfigured: readerAdapter.summary?.endpointConfigured === true,
      fixtureRowsReady: readerAdapter.readinessChecks?.fixtureReplayCompatible === true
    },
    nextCommand: "TN12_VIRTUAL_CHAIN_RPC_URL=<wss-or-wrpc-endpoint> npm run indexer:virtual-chain-adapter",
    boundaries: [
      "This is a live-read preflight, not a live read.",
      "It does not open a node connection, write checkpoints, or alter accepted evidence.",
      "A configured endpoint is required before this lane can become durable-indexer evidence."
    ]
  };
}

function check(id, pass, detail) {
  return { id, pass, detail };
}
