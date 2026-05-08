export function buildBatchAssuranceState(fixture = {}) {
  const campaign = normalizeCampaign(fixture.campaign || {});
  const pledges = (fixture.pledgeOutputs || []).map(normalizePledge);
  const duplicateMap = buildDuplicateMap(pledges);
  const reviewedPledges = pledges.map((pledge) => reviewPledge({ pledge, campaign, duplicateMap }));
  const acceptedPledges = reviewedPledges.filter((pledge) => pledge.review.countsTowardRelease);
  const pendingPledges = reviewedPledges.filter((pledge) => pledge.review.countsTowardPlanned && !pledge.review.countsTowardRelease);
  const rejectedPledges = reviewedPledges.filter((pledge) => pledge.review.status !== "eligible" && !pledge.review.countsTowardPlanned);
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
      rejectedCount: rejectedPledges.length,
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
    pledges: reviewedPledges,
    releasePlan: buildReleasePlan({ campaign, acceptedPledges, acceptedTargetMet, remainingAcceptedTkas }),
    refundPlan: buildRefundPlan({ campaign, acceptedPledges, acceptedTargetMet }),
    boundaries: [
      "This state is planner/indexer-side aggregation over pledge records.",
      "It does not prove pooled assurance target enforcement in one covenant output.",
      "Only accepted pledge records with valid source outpoints and minimum pledge amounts count toward release readiness.",
      "Pending or signed-only pledge drafts can show planned progress but cannot make the campaign releasable.",
      "Accepted payload pledge records are app-state evidence, not custody of pledge funds."
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
    acceptedTxid: String(pledge.acceptedTxid || ""),
    outpoint: {
      txid: String(pledge.outpoint?.txid || ""),
      index: Number.isInteger(Number(pledge.outpoint?.index)) ? Number(pledge.outpoint.index) : 0
    },
    status: String(pledge.status || "draft"),
    note: String(pledge.note || "")
  };
}

function reviewPledge({ pledge, campaign, duplicateMap }) {
  const hasOutpoint = isHex64(pledge.outpoint.txid);
  const hasAcceptedTxid = isHex64(pledge.acceptedTxid);
  const acceptedStatus = pledge.status === "accepted-output-imported" || pledge.status === "accepted-payload-indexed";
  const signedOnlyStatus = pledge.status === "signed-not-submitted" || pledge.status === "draft";
  const meetsMinimum = pledge.amountTkas >= campaign.minimumPledgeTkas;
  const duplicateOutpoint = hasOutpoint && duplicateMap.outpoints.get(outpointKey(pledge.outpoint)) > 1;
  const duplicateAcceptedTxid = hasAcceptedTxid && duplicateMap.acceptedTxids.get(pledge.acceptedTxid) > 1;
  const duplicateAcceptedSource = duplicateOutpoint || duplicateAcceptedTxid;
  const countsTowardRelease = acceptedStatus && hasOutpoint && meetsMinimum && !duplicateAcceptedSource;
  const countsTowardPlanned = countsTowardRelease || (signedOnlyStatus && meetsMinimum);
  const problems = [
    !meetsMinimum ? `below minimum pledge of ${campaign.minimumPledgeTkas} TKAS` : "",
    acceptedStatus && !hasOutpoint ? "accepted pledge is missing a valid source outpoint" : "",
    pledge.status === "accepted-payload-indexed" && !hasAcceptedTxid ? "accepted payload pledge is missing accepted txid" : "",
    duplicateOutpoint ? "duplicate accepted source outpoint" : "",
    duplicateAcceptedTxid ? "duplicate accepted txid" : ""
  ].filter(Boolean);

  return {
    ...pledge,
    review: {
      status: problems.length ? "review-needed" : "eligible",
      countsTowardRelease,
      countsTowardPlanned,
      hasOutpoint,
      hasAcceptedTxid,
      meetsMinimum,
      duplicateOutpoint,
      duplicateAcceptedTxid,
      problems
    }
  };
}

function buildDuplicateMap(pledges) {
  const outpoints = new Map();
  const acceptedTxids = new Map();
  for (const pledge of pledges) {
    if (isHex64(pledge.outpoint.txid)) {
      increment(outpoints, outpointKey(pledge.outpoint));
    }
    if (isHex64(pledge.acceptedTxid)) {
      increment(acceptedTxids, pledge.acceptedTxid);
    }
  }
  return { outpoints, acceptedTxids };
}

function outpointKey(outpoint) {
  return `${outpoint.txid}:${outpoint.index}`;
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function buildReleasePlan({ campaign, acceptedPledges, acceptedTargetMet, remainingAcceptedTkas }) {
  return {
    status: acceptedTargetMet ? "ready-to-draft-batch-release" : "wait-for-more-accepted-pledges",
    recipientAddress: campaign.recipientAddress,
    acceptedInputCount: acceptedPledges.length,
    acceptedInputTkas: sumTkas(acceptedPledges),
    remainingAcceptedTkas,
    inputs: acceptedPledges.map((pledge) => ({
      pledgeId: pledge.pledgeId,
      contributor: pledge.contributor,
      amountTkas: pledge.amountTkas,
      sourceOutpoint: pledge.outpoint,
      acceptedTxid: pledge.acceptedTxid || null
    })),
    output: {
      address: campaign.recipientAddress,
      amountTkas: sumTkas(acceptedPledges)
    },
    next: acceptedTargetMet
      ? "Build release drafts from accepted pledge outpoints and verify recipient output amount before submit."
      : "Do not release yet; import more accepted pledge outputs before target status changes."
  };
}

function buildRefundPlan({ campaign, acceptedPledges, acceptedTargetMet }) {
  return {
    status: acceptedTargetMet ? "not-primary-path-target-met" : "available-after-deadline-if-target-not-met",
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

function isHex64(value) {
  return /^[0-9a-f]{64}$/i.test(String(value || ""));
}
