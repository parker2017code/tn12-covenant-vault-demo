export function buildCoordinationMarketPrototype(fixture = {}) {
  const stags = (fixture.stags || []).map(normalizeStag);
  const intendos = (fixture.intendos || []).map(normalizeIntendo);
  const packs = stags.map((stag) => buildPack(stag, intendos.filter((intendo) => intendo.stagId === stag.stagId)));

  return {
    schema: "kaspa-transparent-coordination-market-prototype/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "transparent-toy-staghunt-preprototype",
    source: fixture.source || "https://hashd.ag/raw",
    summary: {
      stags: stags.length,
      intendos: intendos.length,
      packs: packs.length,
      satisfiablePacks: packs.filter((pack) => pack.solver.status === "satisfiable-transparent-pack").length
    },
    stags,
    intendos,
    packs,
    missingProperties: [
      "accumulation opacity",
      "capital multiplexing",
      "coordinated atomic execution across independent participants",
      "composability across downstream markets",
      "DVP/private propagation",
      "thFHE or sMPC opacity",
      "RTD/miner-oracle event resolution"
    ],
    boundary: "This is not a Hashdag/Staghunt implementation. It is a transparent planner that maps Stag, Intendo, Pack, Solver, and Hunt into repo artifacts before any opaque or multiplexed protocol claims."
  };
}

function normalizeStag(stag = {}) {
  return {
    stagId: String(stag.stagId || ""),
    title: String(stag.title || "Coordination market"),
    goal: String(stag.goal || ""),
    thresholdType: String(stag.thresholdType || "count"),
    thresholdValue: Number(stag.thresholdValue || 1),
    executionTemplate: String(stag.executionTemplate || "assurance-release"),
    deadlineIso: String(stag.deadlineIso || ""),
    settlementLane: String(stag.settlementLane || "planner-indexer"),
    status: String(stag.status || "draft")
  };
}

function normalizeIntendo(intendo = {}) {
  return {
    intendoId: String(intendo.intendoId || ""),
    stagId: String(intendo.stagId || ""),
    user: String(intendo.user || ""),
    committedAction: String(intendo.committedAction || ""),
    thresholdCondition: Number(intendo.thresholdCondition || 1),
    amountTkas: Number(intendo.amountTkas || 0),
    capitalReference: String(intendo.capitalReference || ""),
    expiryIso: String(intendo.expiryIso || ""),
    cancelRule: String(intendo.cancelRule || "user-cancel-before-hunt"),
    signatureStatus: String(intendo.signatureStatus || "unsigned"),
    privacyMode: String(intendo.privacyMode || "transparent"),
    executionTarget: String(intendo.executionTarget || "")
  };
}

function buildPack(stag, intendos) {
  const signedIntendos = intendos.filter((intendo) => intendo.signatureStatus === "signed");
  const solver = solveTransparentPack(stag, signedIntendos);

  return {
    packId: `pack-${stag.stagId}`,
    stagId: stag.stagId,
    status: "transparent-pack-not-opaque",
    intendoCount: intendos.length,
    signedIntendoCount: signedIntendos.length,
    committedTkas: Number(signedIntendos.reduce((total, intendo) => total + intendo.amountTkas, 0).toFixed(8)),
    solver,
    hunt: buildHunt(stag, solver)
  };
}

function solveTransparentPack(stag, signedIntendos) {
  const sorted = [...signedIntendos].sort((a, b) => a.thresholdCondition - b.thresholdCondition);
  let subset = [];

  for (const candidate of sorted) {
    const nextSubset = [...subset, candidate];
    if (isSubsetSatisfied(stag, nextSubset)) {
      subset = nextSubset;
    } else if (candidate.thresholdCondition <= nextSubset.length) {
      subset = nextSubset;
    }
  }

  const finalSubset = signedIntendos.filter((intendo) => intendo.thresholdCondition <= signedIntendos.length);
  const qualifyingSubset = finalSubset.length >= subset.length ? finalSubset : subset;
  const satisfied = isSubsetSatisfied(stag, qualifyingSubset);

  return {
    status: satisfied ? "satisfiable-transparent-pack" : "not-satisfiable",
    algorithm: "transparent-count-threshold-filter",
    qualifyingIntendoIds: satisfied ? qualifyingSubset.map((intendo) => intendo.intendoId) : [],
    qualifyingCount: satisfied ? qualifyingSubset.length : 0,
    qualifyingTkas: satisfied
      ? Number(qualifyingSubset.reduce((total, intendo) => total + intendo.amountTkas, 0).toFixed(8))
      : 0,
    note: "This toy solver handles transparent count thresholds only; it is not the monotone fixed-point solver described for full coordination markets."
  };
}

function isSubsetSatisfied(stag, subset) {
  if (stag.thresholdType === "amount") {
    const amount = subset.reduce((total, intendo) => total + intendo.amountTkas, 0);
    return amount >= stag.thresholdValue && subset.every((intendo) => intendo.thresholdCondition <= amount);
  }
  return subset.length >= stag.thresholdValue && subset.every((intendo) => intendo.thresholdCondition <= subset.length);
}

function buildHunt(stag, solver) {
  return {
    status: solver.status === "satisfiable-transparent-pack" ? "hunt-plan-ready-not-atomic-execution" : "hunt-not-ready",
    executionTemplate: stag.executionTemplate,
    settlementLane: stag.settlementLane,
    next: solver.status === "satisfiable-transparent-pack"
      ? "Build settlement drafts for the qualifying subset; do not claim coordinated atomicity until the execution path consumes all qualified commitments together."
      : "Keep accumulating signed intendos or adjust no thresholds without participant signatures."
  };
}
