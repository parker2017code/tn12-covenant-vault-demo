export function buildAgentSettlementDrafts({
  agentBoard = {},
  walletConnectorRequests = {}
} = {}) {
  const tasks = Array.isArray(agentBoard.tasks) ? agentBoard.tasks : [];
  const drafts = tasks.map(buildTaskDraft);

  return {
    schema: "kaspa-agent-settlement-drafts/v1",
    network: agentBoard.network || "kaspa-testnet-12",
    status: "agent-settlement-drafts-ready-not-autonomous",
    summary: {
      tasks: tasks.length,
      drafts: drafts.length,
      releaseDrafts: drafts.filter((draft) => draft.kind === "release").length,
      refundDrafts: drafts.filter((draft) => draft.kind === "refund").length,
      holdDrafts: drafts.filter((draft) => draft.kind === "hold").length,
      walletConnectorRequestsReady: walletConnectorRequests.status === "connector-submit-requests-ready",
      autonomousPayouts: 0
    },
    drafts,
    acceptanceCriteria: [
      "Release drafts require accepted task payload, accepted proof payload, and accepted reviewer state.",
      "Refund drafts require expired or rejected task state and explicit sponsor review.",
      "Dispute holds must not release or refund funds automatically.",
      "Wallet review must show task id, agent, sponsor, amount, state source, and route before submit."
    ],
    boundaries: [
      "These are app-level settlement draft records, not autonomous agent payouts.",
      "Completion quality is reviewer policy, not consensus truth.",
      "Deposit and reward custody are not proven until amount-matched accepted outputs or covenant paths exist."
    ]
  };
}

function buildTaskDraft(task) {
  const plan = task.settlementPlan || {};
  const lifecycleEvent = (task.lifecycleEvents || [])[0] || null;
  if (task.state === "release-ready") {
    return {
      id: `${task.taskId}:release`,
      taskId: task.taskId,
      kind: "release",
      status: "wallet-review-needed-not-autonomous",
      amountTkas: plan.amountTkas || task.rewardTkas,
      recipient: task.agent,
      acceptedTaskTxid: task.acceptedTxid,
      acceptedProofTxid: task.proofs?.find((proof) => proof.reviewerStatus === "accepted")?.acceptedTxid || "",
      acceptedPlannerEvent: lifecycleEvent,
      next: "Build explicit reward release draft after custody source is defined."
    };
  }
  if (task.state === "refund-ready") {
    return {
      id: `${task.taskId}:refund`,
      taskId: task.taskId,
      kind: "refund",
      status: task.payloadStatus === "accepted-payload" ? "wallet-review-needed" : "blocked-no-accepted-task",
      amountTkas: plan.amountTkas || task.depositTkas,
      recipient: task.sponsor,
      acceptedTaskTxid: task.acceptedTxid,
      acceptedPlannerEvent: lifecycleEvent,
      next: "Build explicit sponsor refund draft only after accepted task/custody review."
    };
  }
  if (task.state === "disputed") {
    return {
      id: `${task.taskId}:hold`,
      taskId: task.taskId,
      kind: "hold",
      status: "accepted-dispute-hold-review",
      amountTkas: plan.amountTkas || task.depositTkas + task.rewardTkas,
      recipient: "",
      acceptedTaskTxid: task.acceptedTxid,
      acceptedDisputeTxid: task.disputes?.[0]?.acceptedTxid || "",
      acceptedPlannerEvent: lifecycleEvent,
      next: "Keep funds held until accepted reviewer decision selects release, refund, or cancel."
    };
  }
  return {
    id: `${task.taskId}:wait`,
    taskId: task.taskId,
    kind: "wait",
    status: "no-settlement-yet",
    amountTkas: plan.amountTkas || 0,
    recipient: "",
    next: plan.next || "Wait for accepted proof payload or deadline."
  };
}
