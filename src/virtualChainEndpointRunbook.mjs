export function buildVirtualChainEndpointRunbook({
  adapter = {},
  preflight = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const endpointConfigured = preflight.summary?.endpointConfigured === true;
  const blocking = Array.isArray(preflight.checks) ? preflight.checks.filter((check) => !check.pass) : [];

  return {
    schema: "tn12-virtual-chain-endpoint-runbook/v1",
    network: adapter.network || preflight.network || "kaspa-testnet-12",
    generatedAt,
    status: endpointConfigured ? "endpoint-runbook-ready-to-test" : "endpoint-runbook-needs-endpoint",
    summary: {
      endpointConfigured,
      blockingChecks: blocking.length,
      localNodeRequired: adapter.summary?.localNodeRequired === true,
      fixtureReplayCompatible: adapter.readinessChecks?.fixtureReplayCompatible === true
    },
    env: {
      required: "TN12_VIRTUAL_CHAIN_RPC_URL",
      optional: ["TN12_VIRTUAL_CHAIN_START_BLUE_SCORE", "TN12_VIRTUAL_CHAIN_CONFIRMATIONS"]
    },
    testSequence: [
      "Set TN12_VIRTUAL_CHAIN_RPC_URL to a hosted TN12 wRPC endpoint.",
      "Run npm run indexer:virtual-chain-adapter.",
      "Run npm run indexer:live-preflight.",
      "Compare returned rows against checkpointed accepted proof and payload records.",
      "Persist checkpoint only after rollback and payload/proof matching checks pass."
    ],
    promotionRule: "A transaction becomes app state only after the virtual-chain window reports the accepted txid and the reducer matches payload or output rules.",
    blocking
  };
}
