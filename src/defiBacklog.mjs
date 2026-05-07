export function buildDefiResearchBacklog(fixture = {}) {
  const briefs = (fixture.briefs || []).map(normalizeBrief);
  const byStatus = countBy(briefs, "status");
  const byEarliestLane = countBy(briefs, "earliestKaspaLane");
  const missingRails = [...new Set(briefs.flatMap((brief) => brief.missingRails))].sort();

  return {
    schema: "kaspa-defi-research-backlog/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    status: "research-backlog-not-live-defi",
    summary: {
      total: briefs.length,
      researchOnly: briefs.filter((brief) => brief.status === "research-only").length,
      prototypeLater: briefs.filter((brief) => brief.status === "prototype-later").length,
      missingRailCount: missingRails.length,
      byStatus,
      byEarliestLane
    },
    missingRails,
    briefs,
    rules: [
      "Do not market AMMs, lending, stable-value products, derivatives, or insurance as live Kaspa apps from this backlog.",
      "Start with risk dashboards, simulations, payload receipts, and intent registries before settlement claims.",
      "Any real-money DeFi lane needs oracle, liquidity, liquidation, wallet, indexer, and security review plans.",
      "Prediction and hedge workflows must stay advice-safe and simulation-first until settlement and resolution rails exist."
    ]
  };
}

function normalizeBrief(brief = {}) {
  return {
    id: String(brief.id || ""),
    name: String(brief.name || ""),
    category: String(brief.category || ""),
    oldWorldReference: String(brief.oldWorldReference || ""),
    userJob: String(brief.userJob || ""),
    kaspaEdge: String(brief.kaspaEdge || ""),
    earliestKaspaLane: String(brief.earliestKaspaLane || "research"),
    status: String(brief.status || "research-only"),
    missingRails: brief.missingRails || [],
    firstSafeArtifact: String(brief.firstSafeArtifact || ""),
    failureModes: brief.failureModes || [],
    next: String(brief.next || "")
  };
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}
