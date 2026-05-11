export function buildFullDefiBenchmark({
  provenStatus = {},
  acceptedActivity = {},
  schedulerRegistry = {},
  schedulerBinding = {},
  durableReplayGuard = {},
  signerValidation = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const rails = [
    rail("accepted-proof-core", "Covenant primitives accepted on TN12", "TN12_ACCEPTED", 12, hasProofCore(provenStatus), "Vault, pledge, escrow, auction, and role-separated proof rows are accepted."),
    rail("accepted-receipt-ledger", "Accepted app-state payload ledger", "TN12_ACCEPTED", 10, Number(provenStatus.acceptedEvidence?.payloadEvents || 0) >= 40, `${Number(provenStatus.acceptedEvidence?.payloadEvents || 0)} payload events are accepted and replayed.`),
    rail("multi-wallet-custody-activity", "Multi-wallet local-key custody movement", "LOCAL_KEY_CUSTODY_TEST", 10, Number(acceptedActivity.summary?.acceptedTransferRows || 0) >= 16, `${Number(acceptedActivity.summary?.acceptedTransferRows || 0)} accepted transfer rows cover deposits, payouts, and user roles.`),
    rail("scheduler-intent-bid-execution", "Scheduler intent, bids, and execution receipts", "INDEXER_DERIVED", 10, Number(schedulerRegistry.summary?.acceptedBids || 0) >= 3 && Number(schedulerRegistry.summary?.executedTriggers || 0) >= 1, "Accepted scheduler payloads feed deterministic trigger and bid reducers."),
    rail("scheduler-covenant-binding", "Scheduler-to-covenant proof binding", "INDEXER_DERIVED", 8, Number(schedulerBinding.summary?.readyBindings || 0) >= 1, "Accepted binding payload references an accepted covenant proof row."),
    rail("deterministic-indexer-replay", "Deterministic indexer replay and duplicate guards", "INDEXER_DERIVED", 10, durableReplayGuard.summary?.localPromotionReady === true, "Fixture replay, overlap, duplicate, and rollback-match guards pass locally."),
    rail("external-signer-roundtrip", "External signer round trip", "MAINNET_BLOCKED", 15, signerValidation.liveExternalSignerAccepted === true, "A real wallet must sign bytes and return a verifiable accepted txid."),
    rail("live-rollback-evidence", "Live removed-block rollback evidence", "MAINNET_BLOCKED", 10, durableReplayGuard.summary?.liveRollbackObserved === true, "Promotion stays blocked until live removed-block evidence is captured."),
    rail("amm-lending-liquidation-custody", "AMM/lending/liquidation custody execution", "PLANNER_ONLY", 10, false, "Pricing, oracle truth, autonomous pool custody, liquidations, and risk engine execution are not script-enforced."),
    rail("mainnet-activation", "Mainnet covenant activation and production wallet/indexer review", "MAINNET_BLOCKED", 5, false, "TN12 evidence does not prove mainnet activation or production custody readiness.")
  ];
  const completedWeight = rails.filter((item) => item.done).reduce((sum, item) => sum + item.weight, 0);
  const totalWeight = rails.reduce((sum, item) => sum + item.weight, 0);
  const currentPercent = Math.round((completedWeight / totalWeight) * 100);

  return {
    schema: "tn12-full-defi-benchmark/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "full-defi-benchmark-review",
    currentPercent,
    completedWeight,
    totalWeight,
    summary: {
      rails: rails.length,
      completedRails: rails.filter((item) => item.done).length,
      blockedRails: rails.filter((item) => !item.done && /BLOCKED/.test(item.label)).length,
      plannerOnlyRails: rails.filter((item) => item.label === "PLANNER_ONLY").length,
      mainnetReady: false,
      fullDefiClaimAllowed: false,
      liveProductClaims: 0,
      custodyActions: 0
    },
    rails,
    nextHighestImpact: rails
      .filter((item) => !item.done)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        weight: item.weight,
        blocker: item.label
      })),
    boundaries: [
      "This benchmark is a repo-local progress model, not a production readiness score.",
      "Accepted TN12 receipts and local-key transfers are real testnet activity.",
      "AMM, lending, liquidation, oracle truth, and production custody remain planner/indexer or mainnet-blocked until separately proven.",
      "External signer and live rollback evidence are the highest-signal readiness blockers."
    ]
  };
}

function rail(id, title, label, weight, done, evidence) {
  return {
    id,
    title,
    label,
    weight,
    done: Boolean(done),
    evidence
  };
}

function hasProofCore(provenStatus) {
  return Number(provenStatus.acceptedEvidence?.proofTransactions || 0) >= 9
    && Number(provenStatus.acceptedEvidence?.roleSeparatedProofTransactions || 0) >= 7;
}
