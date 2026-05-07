export function buildEnforcementMatrix(fixture = {}) {
  const features = (fixture.features || []).map(normalizeFeature);
  const byEnforcement = countBy(features, "enforcement");
  const byLane = countBy(features, "lane");
  const contractEnforced = features.filter((feature) => feature.enforcement === "script").length;
  const notScriptEnforced = features.length - contractEnforced;

  return {
    schema: "tn12-enforcement-matrix/v1",
    status: "claim-surface-audit",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    summary: {
      total: features.length,
      contractEnforced,
      notScriptEnforced,
      byEnforcement,
      byLane
    },
    features,
    rules: [
      "A browser feature is not a contract guarantee unless this matrix says enforcement is script.",
      "Planner/indexer state can make app UX useful, but it must not be described as covenant-enforced.",
      "Wallet policy is a safety layer, not consensus enforcement.",
      "Simulation-only features stay product direction until a script, accepted indexer, or wallet route proves them."
    ]
  };
}

function normalizeFeature(feature = {}) {
  return {
    id: String(feature.id || ""),
    name: String(feature.name || ""),
    lane: String(feature.lane || "unknown"),
    enforcement: String(feature.enforcement || "simulation"),
    currentSurface: String(feature.currentSurface || ""),
    proof: String(feature.proof || ""),
    risk: String(feature.risk || ""),
    nextHardeningStep: String(feature.nextHardeningStep || "")
  };
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}
