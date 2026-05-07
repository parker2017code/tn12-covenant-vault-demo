export function buildStableValuePathRegistry(fixture = {}) {
  const paths = (fixture.paths || []).map(normalizePath);
  const byStatus = countBy(paths, "status");
  const byEarliestLane = countBy(paths, "earliestKaspaLane");
  const missingRails = [...new Set(paths.flatMap((path) => path.missingRails))].sort();

  return {
    schema: "kaspa-stable-value-path-registry/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    status: "comparison-brief-not-native-stablecoin",
    summary: {
      total: paths.length,
      buildableNow: paths.filter((path) => path.earliestKaspaLane === "issuer-indexer").length,
      researchOnly: paths.filter((path) => path.status === "research-only").length,
      missingRailCount: missingRails.length,
      byStatus,
      byEarliestLane
    },
    missingRails,
    paths,
    boundaries: [
      "This is a stable-value comparison brief, not a live stablecoin design.",
      "Issuer-backed paths can be modeled with accepted receipts now, but they depend on issuer/legal redemption trust.",
      "Overcollateralized, synthetic, and bridge paths require oracle, liquidity, custody, and settlement assumptions before product claims.",
      "Do not call anything here Kaspa-native until asset issuance, redemption, and enforcement are proven with accepted transaction state or future covenant/vProg rails."
    ]
  };
}

function normalizePath(path = {}) {
  return {
    id: String(path.id || ""),
    name: String(path.name || ""),
    status: String(path.status || "research-only"),
    earliestKaspaLane: String(path.earliestKaspaLane || "research"),
    userJob: String(path.userJob || ""),
    mechanism: String(path.mechanism || ""),
    custodyModel: String(path.custodyModel || ""),
    proofInputs: path.proofInputs || [],
    missingRails: path.missingRails || [],
    firstSafeArtifact: String(path.firstSafeArtifact || ""),
    next: String(path.next || "")
  };
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}
