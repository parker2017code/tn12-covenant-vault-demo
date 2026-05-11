export function buildUniversalSchedulerWorkbench({
  schedulerRegistry = {},
  schedulerBinding = {},
  coordinationPrototype = {},
  coordinationBrief = {},
  auctionCustody = {},
  agentSettlement = {},
  acceptedActivity = {},
  checkpoint = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const jobs = [
    schedulerTriggerJob(schedulerRegistry, acceptedActivity),
    schedulerBidJob(schedulerRegistry),
    schedulerBindingJob(schedulerBinding),
    coordinationPackJob(coordinationPrototype, coordinationBrief),
    auctionSettlementJob(auctionCustody),
    agentSettlementJob(agentSettlement)
  ];

  const acceptedEvidenceJobs = jobs.filter((job) => job.tn12Reality === "accepted-evidence").length;
  const replayCheckedJobs = jobs.filter((job) => job.replayCheck === "passed").length;
  const blockedPredictions = jobs.reduce((count, job) => count + job.blockedCases.length, 0);

  return {
    schema: "tn12-universal-scheduler-workbench/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "scheduler-workbench-ready",
    thesis: "A scheduler is useful when it routes accepted triggers, bids, solver results, proof jobs, and settlement reviews without pretending to be protocol-level automation.",
    summary: {
      jobs: jobs.length,
      acceptedEvidenceJobs,
      replayCheckedJobs,
      blockedPredictions,
      acceptedCheckpointRows: Number(checkpoint.summary?.total || 0),
      liveProductClaims: 0,
      protocolSchedulerClaims: 0,
      autonomousCustodyClaims: 0,
      mainnetClaims: 0
    },
    jobs,
    expectedBehavior: [
      "Accepted trigger receipts can make an app job eligible.",
      "Execution is promoted only when the accepted execution receipt and accepted transfer evidence match.",
      "Executor bids can be ranked by explicit policy, but winner selection stays planner/indexer state until settlement is wallet-reviewed and accepted.",
      "Coordination packs can be solved transparently now; private accumulation and atomic Hunt execution remain research.",
      "Auction and agent settlement rows stay blocked until custody source, wallet-standard signing, submit result, and accepted replay all match."
    ],
    predictionsToTestNext: [
      "A duplicate scheduler execution receipt should stay blocked.",
      "A low-fee but too-slow scheduler bid should lose to a valid faster bid.",
      "A stale-source bid should never win even if its price is attractive.",
      "A satisfiable coordination pack should produce exactly one selected settlement route.",
      "A disputed agent task should stay held until reviewer decision and wallet review are attached."
    ],
    boundaries: [
      "This is a TN12 app workbench, not a protocol universal scheduler.",
      "It schedules reviewable jobs over accepted evidence; it does not create autonomous custody.",
      "The full research target still needs privacy, capital multiplexing, solver incentives, censorship resistance, MEV resistance, and atomic execution."
    ]
  };
}

function schedulerTriggerJob(registry, acceptedActivity) {
  const trigger = registry.triggerRows?.[0] || {};
  return {
    id: "scheduler-trigger-execution",
    title: "Accepted trigger -> execution",
    lane: "defi-scheduler",
    tn12Reality: trigger.executionReceiptTxid && trigger.executionTransferTxid ? "accepted-evidence" : "expected-behavior",
    replayCheck: trigger.status === "executed" ? "passed" : "pending",
    evidence: compact([
      trigger.sourceEvidencePath,
      trigger.executionReceiptTxid,
      trigger.executionTransferTxid,
      acceptedActivity.source || "artifacts/defi-accepted-activity-ledger.json"
    ]),
    expected: `Pool net must satisfy ${trigger.metric || "metric"} ${trigger.operator || ">="} ${trigger.thresholdTkas || "threshold"} before execution.`,
    observed: trigger.status === "executed"
      ? `${trigger.executionTransferAmountTkas || "unknown"} TKAS execution transfer matched accepted receipt.`
      : "No accepted matching execution yet.",
    blockedCases: ["duplicate-execution-receipt", "stale-execution-receipt", "execution-transfer-mismatch"]
  };
}

function schedulerBidJob(registry) {
  const winner = (registry.auctionRows || []).find((row) => row.status === "winner-selected") || {};
  return {
    id: "scheduler-bid-selection",
    title: "Executor bid selection",
    lane: "defi-scheduler",
    tn12Reality: registry.summary?.acceptedBids > 0 ? "accepted-evidence" : "expected-behavior",
    replayCheck: winner.bidTxid ? "passed" : "pending",
    evidence: compact((registry.auctionRows || []).map((row) => row.evidencePath)),
    expected: "Pick the lowest valid bid that satisfies latency and source policy.",
    observed: winner.bidder
      ? `${winner.bidder} selected; stale or too-slow bids remain blocked.`
      : "No winning bid selected.",
    blockedCases: (registry.auctionRows || []).filter((row) => row.status === "blocked").map((row) => row.reason)
  };
}

function schedulerBindingJob(binding) {
  return {
    id: "scheduler-covenant-binding",
    title: "Scheduler intent -> covenant proof binding",
    lane: "proof-binding",
    tn12Reality: binding.summary?.acceptedBindings > 0 ? "accepted-evidence" : "expected-behavior",
    replayCheck: binding.status === "scheduler-covenant-binding-ready" ? "passed" : "pending",
    evidence: compact((binding.bindings || []).map((row) => row.sourceEvidencePath || row.evidencePath)),
    expected: "A scheduler row can reference an accepted covenant proof without upgrading itself into protocol scheduling.",
    observed: `${binding.summary?.acceptedBindings || 0} binding rows accepted.`,
    blockedCases: (binding.negativeRows || []).map((row) => row.reason || row.id)
  };
}

function coordinationPackJob(prototype, brief) {
  const selected = brief.selectedPack || {};
  return {
    id: "coordination-pack-solver",
    title: "Transparent coordination pack",
    lane: "coordination-market",
    tn12Reality: "deterministic-artifact",
    replayCheck: selected.solver?.status === "satisfiable-transparent-pack" ? "passed" : "pending",
    evidence: compact([brief.prototypeArtifact, "artifacts/coordination-market-settlement-brief.json"]),
    expected: "Signed compatible intendos should form a pack only when threshold conditions are satisfied.",
    observed: `${selected.solver?.qualifyingCount || 0} qualifying intendos; ${selected.solver?.qualifyingTkas || 0} TKAS route amount.`,
    blockedCases: prototype.missingProperties || []
  };
}

function auctionSettlementJob(custody) {
  return {
    id: "auction-settlement-review",
    title: "Auction settlement review",
    lane: "auction-intents",
    tn12Reality: custody.summary?.plannerEvidenceRows > 0 ? "accepted-evidence" : "expected-behavior",
    replayCheck: custody.summary?.custodyReadyRows > 0 ? "passed" : "pending",
    evidence: compact((custody.rows || []).map((row) => row.custodySource?.fundingTxid)),
    expected: "Winner release and loser refund rows need accepted planner evidence, amount-matched custody, wallet review, and accepted replay.",
    observed: `${custody.summary?.custodyReadyRows || 0} custody rows ready; ${custody.summary?.drafts || 0} settlement rows reviewed.`,
    blockedCases: custody.requiredBeforeSubmit || []
  };
}

function agentSettlementJob(settlement) {
  return {
    id: "agent-task-settlement-review",
    title: "Agent task release / hold / refund",
    lane: "agent-commitments",
    tn12Reality: settlement.summary?.reviewEvidenceReadyRows > 0 ? "accepted-evidence" : "expected-behavior",
    replayCheck: settlement.summary?.custodyReadyRows > 0 ? "passed" : "pending",
    evidence: compact((settlement.rows || []).map((row) => row.custodySource?.fundingTxid)),
    expected: "Release, hold, or refund can be scheduled only after task/proof/dispute evidence and wallet-reviewed settlement agree.",
    observed: `${settlement.summary?.releaseRows || 0} release, ${settlement.summary?.holdRows || 0} hold, ${settlement.summary?.refundRows || 0} refund rows.`,
    blockedCases: settlement.boundaries || []
  };
}

function compact(values) {
  return [...new Set((values || []).flat().filter(Boolean).map(String))];
}
