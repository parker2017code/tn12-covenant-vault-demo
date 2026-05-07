export function buildAgentCommitmentBoard(fixture = {}) {
  const tasks = (fixture.tasks || []).map(normalizeTask);
  const proofs = (fixture.proofs || []).map(normalizeProof);
  const disputes = (fixture.disputes || []).map(normalizeDispute);
  const tasksWithState = tasks.map((task) => {
    const taskProofs = proofs.filter((proof) => proof.taskId === task.taskId);
    const taskDisputes = disputes.filter((dispute) => dispute.taskId === task.taskId);
    return {
      ...task,
      proofs: taskProofs,
      disputes: taskDisputes,
      state: taskState(task, taskProofs, taskDisputes),
      settlementPlan: settlementPlan(task, taskProofs, taskDisputes)
    };
  });

  return {
    schema: "kaspa-agent-commitment-board/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "payload-indexed-agent-commitments-not-autonomous-payouts",
    summary: {
      tasks: tasks.length,
      open: tasksWithState.filter((task) => task.state === "open-offer").length,
      proofSubmitted: tasksWithState.filter((task) => task.state === "proof-submitted").length,
      disputed: tasksWithState.filter((task) => task.state === "disputed").length,
      releaseReady: tasksWithState.filter((task) => task.state === "release-ready").length,
      refundReady: tasksWithState.filter((task) => task.state === "refund-ready").length,
      acceptedPayloads: [...tasks, ...proofs, ...disputes].filter((item) => item.payloadStatus === "accepted-payload").length
    },
    tasks: tasksWithState,
    proofs,
    disputes,
    boundaries: [
      "This board models accepted task, proof, and dispute payloads; it does not run autonomous agents.",
      "Deposit custody, release, and refund are planner state until exact signed drafts or covenant paths exist.",
      "Completion proof quality is app/reviewer policy, not consensus truth.",
      "Never let agent tooling submit from reusable private keys in this repo."
    ]
  };
}

function normalizeTask(task = {}) {
  return {
    taskId: String(task.taskId || ""),
    title: String(task.title || "Agent task"),
    sponsor: String(task.sponsor || ""),
    agent: String(task.agent || ""),
    depositTkas: Number(task.depositTkas || 0),
    rewardTkas: Number(task.rewardTkas || 0),
    deadlineIso: String(task.deadlineIso || ""),
    acceptedTxid: String(task.acceptedTxid || ""),
    payloadStatus: String(task.payloadStatus || "draft"),
    reviewWindowHours: Number(task.reviewWindowHours || 24),
    status: String(task.status || "open")
  };
}

function normalizeProof(proof = {}) {
  return {
    proofId: String(proof.proofId || ""),
    taskId: String(proof.taskId || ""),
    submittedBy: String(proof.submittedBy || ""),
    artifactHash: String(proof.artifactHash || ""),
    acceptedTxid: String(proof.acceptedTxid || ""),
    payloadStatus: String(proof.payloadStatus || "draft"),
    reviewerStatus: String(proof.reviewerStatus || "pending-review"),
    note: String(proof.note || "")
  };
}

function normalizeDispute(dispute = {}) {
  return {
    disputeId: String(dispute.disputeId || ""),
    taskId: String(dispute.taskId || ""),
    openedBy: String(dispute.openedBy || ""),
    reason: String(dispute.reason || ""),
    acceptedTxid: String(dispute.acceptedTxid || ""),
    payloadStatus: String(dispute.payloadStatus || "draft"),
    status: String(dispute.status || "open")
  };
}

function taskState(task, proofs, disputes) {
  if (disputes.some((dispute) => dispute.status === "open")) return "disputed";
  if (task.status === "expired") return "refund-ready";
  if (proofs.some((proof) => proof.reviewerStatus === "accepted" && proof.payloadStatus === "accepted-payload")) return "release-ready";
  if (proofs.some((proof) => proof.payloadStatus === "accepted-payload")) return "proof-submitted";
  return "open-offer";
}

function settlementPlan(task, proofs, disputes) {
  const state = taskState(task, proofs, disputes);
  if (state === "release-ready") {
    return {
      status: "release-planned-not-broadcast",
      amountTkas: task.rewardTkas,
      next: "Build explicit release draft and require sponsor/wallet review before submit."
    };
  }
  if (state === "refund-ready") {
    return {
      status: "refund-planned-not-broadcast",
      amountTkas: task.depositTkas,
      next: "Build explicit refund draft after deadline and accepted state review."
    };
  }
  if (state === "disputed") {
    return {
      status: "hold-during-dispute",
      amountTkas: task.depositTkas + task.rewardTkas,
      next: "Wait for reviewer decision; do not release or refund automatically."
    };
  }
  return {
    status: "no-settlement-yet",
    amountTkas: task.depositTkas + task.rewardTkas,
    next: "Wait for accepted proof payload or deadline."
  };
}
