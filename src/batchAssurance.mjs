export function buildBatchAssuranceState(fixture = {}) {
  const campaign = normalizeCampaign(fixture.campaign || {});
  const pledges = (fixture.pledgeOutputs || []).map(normalizePledge);
  const acceptedPledges = pledges.filter((pledge) => pledge.status === "accepted-output-imported");
  const pendingPledges = pledges.filter((pledge) => pledge.status !== "accepted-output-imported");
  const acceptedTkas = sumTkas(acceptedPledges);
  const pendingTkas = sumTkas(pendingPledges);
  const totalPlannedTkas = Number((acceptedTkas + pendingTkas).toFixed(8));
  const remainingAcceptedTkas = Math.max(Number((campaign.targetTkas - acceptedTkas).toFixed(8)), 0);
  const acceptedProgress = campaign.targetTkas === 0 ? 0 : acceptedTkas / campaign.targetTkas;
  const plannedProgress = campaign.targetTkas === 0 ? 0 : totalPlannedTkas / campaign.targetTkas;
  const acceptedTargetMet = acceptedTkas >= campaign.targetTkas;
  const plannedTargetMet = totalPlannedTkas >= campaign.targetTkas;

  return {
    schema: "tn12-batch-assurance-campaign/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "app-layer-campaign-planner-not-pooled-covenant",
    campaign,
    summary: {
      pledgeCount: pledges.length,
      acceptedCount: acceptedPledges.length,
      pendingCount: pendingPledges.length,
      acceptedTkas,
      pendingTkas,
      totalPlannedTkas,
      targetTkas: campaign.targetTkas,
      remainingAcceptedTkas,
      acceptedProgress: Number(acceptedProgress.toFixed(4)),
      plannedProgress: Number(plannedProgress.toFixed(4)),
      acceptedTargetMet,
      plannedTargetMet,
      releaseStatus: acceptedTargetMet ? "release-ready-from-accepted-pledges" : "release-not-ready",
      refundStatus: acceptedTargetMet ? "refund-not-primary-path" : "refund-plan-needed-if-deadline-expires"
    },
    pledges,
    releasePlan: buildReleasePlan({ campaign, acceptedPledges, acceptedTargetMet, remainingAcceptedTkas }),
    refundPlan: buildRefundPlan({ campaign, acceptedPledges }),
    boundaries: [
      "This state is planner/indexer-side aggregation over pledge records.",
      "It does not prove pooled assurance target enforcement in one covenant output.",
      "Only accepted pledge outputs should count toward release readiness.",
      "Pending or signed-only pledge drafts can show planned progress but cannot make the campaign releasable."
    ]
  };
}

function normalizeCampaign(campaign) {
  return {
    id: String(campaign.id || "tn12-assurance-campaign"),
    name: String(campaign.name || "TN12 assurance campaign"),
    targetTkas: clampNumber(Number(campaign.targetTkas), 1, 100000000),
    minimumPledgeTkas: clampNumber(Number(campaign.minimumPledgeTkas), 0.00000001, 100000000),
    recipientAddress: String(campaign.recipientAddress || ""),
    deadlineIso: String(campaign.deadlineIso || ""),
    releaseMode: String(campaign.releaseMode || "batch-release-after-target"),
    refundMode: String(campaign.refundMode || "individual-refund-after-deadline")
  };
}

function normalizePledge(pledge) {
  return {
    pledgeId: String(pledge.pledgeId || ""),
    contributor: String(pledge.contributor || ""),
    refundAddress: String(pledge.refundAddress || ""),
    amountTkas: clampNumber(Number(pledge.amountTkas), 0, 100000000),
    outpoint: {
      txid: String(pledge.outpoint?.txid || ""),
      index: Number.isInteger(Number(pledge.outpoint?.index)) ? Number(pledge.outpoint.index) : 0
    },
    status: String(pledge.status || "draft"),
    note: String(pledge.note || "")
  };
}

function buildReleasePlan({ campaign, acceptedPledges, acceptedTargetMet, remainingAcceptedTkas }) {
  return {
    status: acceptedTargetMet ? "ready-to-plan-batch-release" : "wait-for-more-accepted-pledges",
    recipientAddress: campaign.recipientAddress,
    acceptedInputCount: acceptedPledges.length,
    acceptedInputTkas: sumTkas(acceptedPledges),
    remainingAcceptedTkas,
    next: acceptedTargetMet
      ? "Build release drafts from accepted pledge outpoints and verify recipient output amount before submit."
      : "Do not release yet; import more accepted pledge outputs before target status changes."
  };
}

function buildRefundPlan({ campaign, acceptedPledges }) {
  return {
    status: "available-after-deadline-if-target-not-met",
    deadlineIso: campaign.deadlineIso,
    refundCount: acceptedPledges.length,
    refunds: acceptedPledges.map((pledge) => ({
      pledgeId: pledge.pledgeId,
      refundAddress: pledge.refundAddress,
      amountTkas: pledge.amountTkas,
      sourceOutpoint: pledge.outpoint
    }))
  };
}

function sumTkas(pledges) {
  return Number(pledges.reduce((total, pledge) => total + pledge.amountTkas, 0).toFixed(8));
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(number, min), max);
}
