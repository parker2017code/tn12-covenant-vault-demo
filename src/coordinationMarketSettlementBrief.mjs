export function buildCoordinationMarketSettlementBrief({
  fixture = {},
  coordinationPrototype = {}
} = {}) {
  const packs = Array.isArray(coordinationPrototype.packs) ? coordinationPrototype.packs : [];
  const selectedPack = packs.find((pack) => pack.packId === fixture.selectedPackId) || null;
  const missingRails = (fixture.missingRails || []).map(normalizeMissingRail);
  const settlementRoutes = (fixture.settlementRoutes || []).map((route) =>
    buildSettlementRoute(route, selectedPack)
  );

  return {
    schema: "kaspa-coordination-market-settlement-app-brief/v1",
    network: fixture.network || coordinationPrototype.network || "kaspa-testnet-12",
    status: selectedPack?.solver?.status === "satisfiable-transparent-pack"
      ? "transparent-settlement-brief-ready-not-production"
      : "transparent-settlement-brief-blocked",
    appId: String(fixture.appId || "coordination-market-settlement-brief"),
    prototypeArtifact: String(fixture.prototypeArtifact || "artifacts/coordination-market-prototype.json"),
    selectedPackId: String(fixture.selectedPackId || ""),
    appBrief: normalizeAppBrief(fixture.appBrief),
    summary: {
      packFound: Boolean(selectedPack),
      selectedSolverStatus: selectedPack?.solver?.status || "missing-pack",
      qualifyingIntendos: selectedPack?.solver?.qualifyingCount || 0,
      qualifyingTkas: selectedPack?.solver?.qualifyingTkas || 0,
      settlementRoutes: settlementRoutes.length,
      missingRails: missingRails.length,
      productionReady: false
    },
    selectedPack: selectedPack ? summarizePack(selectedPack) : null,
    runThisPack: selectedPack ? buildRunThisPack({
      fixture,
      selectedPack,
      settlementRoutes
    }) : null,
    settlementRoutes,
    missingRails,
    nonProductionBoundary: [
      "This is not Hashdag or Staghunt production infrastructure.",
      "It does not provide opacity, capital multiplexing, atomic Hunt execution, or oracle-backed settlement.",
      "It is a transparent app brief for wallet review and later settlement draft design."
    ],
    nextArtifact: String(fixture.nextArtifact || "define custody source before settlement drafts")
  };
}

function normalizeAppBrief(appBrief = {}) {
  return {
    title: String(appBrief.title || "Transparent coordination settlement brief"),
    userPromise: String(appBrief.userPromise || ""),
    userSurface: String(appBrief.userSurface || ""),
    currentLane: String(appBrief.currentLane || "planner-indexer"),
    notProduction: String(appBrief.notProduction || "Not Hashdag/Staghunt production.")
  };
}

function normalizeMissingRail(rail = {}) {
  return {
    id: String(rail.id || ""),
    name: String(rail.name || rail.id || ""),
    currentAnswer: String(rail.currentAnswer || ""),
    neededForProduction: String(rail.neededForProduction || "")
  };
}

function buildSettlementRoute(route = {}, selectedPack) {
  const solverStatus = selectedPack?.solver?.status || "missing-pack";
  const routeStatus = route.fromSolverStatus === solverStatus
    ? "route-applicable-needs-wallet-review"
    : "route-conditional";

  return {
    routeId: String(route.routeId || ""),
    kind: String(route.kind || "review"),
    status: routeStatus,
    fromSolverStatus: String(route.fromSolverStatus || ""),
    draftStatus: String(route.draftStatus || "brief-only"),
    custodySource: String(route.custodySource || ""),
    recipient: String(route.recipient || ""),
    qualifyingIntendoIds: routeStatus === "route-applicable-needs-wallet-review"
      ? selectedPack.solver.qualifyingIntendoIds
      : [],
    amountTkas: routeStatus === "route-applicable-needs-wallet-review"
      ? selectedPack.solver.qualifyingTkas
      : 0,
    walletReview: (route.walletReview || []).map(String)
  };
}

function buildRunThisPack({ fixture = {}, selectedPack = {}, settlementRoutes = [] } = {}) {
  const releaseRoute = settlementRoutes.find((route) => route.kind === "release" && route.status === "route-applicable-needs-wallet-review");
  return {
    id: `${selectedPack.packId}:run-first`,
    title: "Run the transparent docs sprint pack",
    userGoal: "See conditional commitments become one selected release route.",
    currentEvidence: [
      fixture.prototypeArtifact || "artifacts/coordination-market-prototype.json",
      "artifacts/coordination-market-settlement-brief.json",
      releaseRoute?.routeId || ""
    ].filter(Boolean),
    steps: [
      "Open the Stag goal.",
      "Check each qualifying Intendo.",
      "Check the Pack solver result.",
      "Review the selected release route.",
      "Do not submit alternate refunds for the same selected pack.",
      "Build wallet-reviewed settlement only after custody source and recipient are explicit."
    ],
    expectedResult: `${selectedPack.solver?.qualifyingCount || 0} commitments qualify for ${selectedPack.solver?.qualifyingTkas || 0} TKAS of transparent route amount.`,
    nextUpgrade: "Turn this route into a wallet-standard settlement request, then require accepted replay before marking settlement complete."
  };
}

function summarizePack(pack) {
  return {
    packId: pack.packId,
    stagId: pack.stagId,
    status: pack.status,
    committedTkas: pack.committedTkas,
    solver: pack.solver,
    huntStatus: pack.hunt?.status || "missing-hunt"
  };
}
