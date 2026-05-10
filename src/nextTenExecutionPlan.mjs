export function buildNextTenExecutionPlan({
  queue = {},
  walletMapping = {},
  walletStandardRequests = {},
  livePreflight = {},
  settlementDecision = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const tasks = Array.isArray(queue.tasks) ? queue.tasks.slice(0, 10) : [];
  const slices = [
    slice("wallet-submit", "Wire no-local-key signing around the mapped wallet standard.", [
      "wallet-connector-submit",
      "auction-settlement-refund-drafts",
      "agent-release-refund-drafts",
      "treasury-constrained-spend-drafts"
    ]),
    slice("durable-indexer", "Move accepted state from fixture windows to a configured virtual-chain endpoint.", [
      "durable-virtual-chain-indexer",
      "invoice-mainnet-readiness-brief",
      "access-pass-expiry-issuer-review"
    ]),
    slice("custody-settlement", "Keep accepted settlement evidence and alternate-path state synchronized.", [
      "batch-assurance-settlement-submit",
      "escrow-marketplace-demo"
    ]),
    slice("signal-quality", "Keep attestation-fed review prompts gated by signer and quorum checks.", [
      "attestation-reputation-thresholds"
    ])
  ].map((item) => ({
    ...item,
    taskIds: item.taskIds.filter((id) => tasks.some((task) => task.id === id)),
    tasks: tasks.filter((task) => item.taskIds.includes(task.id)).map((task) => task.rank)
  })).filter((item) => item.taskIds.length > 0);

  return {
    schema: "tn12-next-ten-execution-plan/v1",
    generatedAt,
    status: tasks.length === 10 ? "next-ten-execution-plan-ready" : "next-ten-execution-plan-review",
    summary: {
      tasks: tasks.length,
      critical: tasks.filter((task) => task.importance === "critical").length,
      high: tasks.filter((task) => task.importance === "high").length,
      medium: tasks.filter((task) => task.importance === "medium").length,
      walletMapped: walletMapping.status === "wallet-standard-mapping-ready",
      walletStandardRequests: Number(walletStandardRequests.summary?.mappedRequests || 0),
      liveIndexerEndpointConfigured: livePreflight.summary?.endpointConfigured === true,
      batchSettlementPath: settlementDecision.selectedPath || ""
    },
    tasks: tasks.map((task) => ({
      rank: task.rank,
      id: task.id,
      lane: task.lane,
      importance: task.importance,
      nextOutput: firstArtifact(task.startWith),
      gate: firstGate(task.gates)
    })),
    slices,
    operatorOrder: [
      "Do wallet-standard implementation work before more settlement surfaces.",
      "Do live indexer endpoint work before promoting new app-state claims.",
      "Keep the accepted batch-assurance release indexed and refund alternates non-selected.",
      "Keep research lanes tied to a concrete artifact, not a new product page."
    ]
  };
}

function slice(id, goal, taskIds) {
  return { id, goal, taskIds };
}

function firstArtifact(items = []) {
  return Array.isArray(items) ? items.find((item) => item.startsWith("artifacts/")) || items[0] || "" : "";
}

function firstGate(items = []) {
  return Array.isArray(items) ? items[0] || "" : "";
}
