export function buildResearchLibrary(fixture = {}) {
  const candidates = (fixture.candidates || []).map(normalizeCandidate);
  const lanes = groupBy(candidates, "kaspaLane");
  const priorities = groupBy(candidates, "priority");

  return {
    schema: "kaspa-cross-chain-research-library/v1",
    status: "research-inputs-not-protocol-claims",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    summary: {
      total: candidates.length,
      lanes,
      priorities,
      buildNow: candidates.filter((candidate) => candidate.priority === "build-now").length,
      researchOnly: candidates.filter((candidate) => candidate.kaspaLane === "research").length
    },
    candidates,
    rules: [
      "Use open-source code as design evidence and engineering reference, not as proof of Kaspa feature availability.",
      "Map every idea to live Kaspa, TN12/Toccata, roadmap, or research before building UI.",
      "Extract PMF, failure modes, state schemas, indexer patterns, wallet review UX, and risk controls before porting code.",
      "Prefer payload receipts and accepted-transaction indexing as the first Kaspa app-state bridge."
    ]
  };
}

export function normalizeCandidate(candidate = {}) {
  return {
    id: String(candidate.id || ""),
    name: String(candidate.name || ""),
    category: String(candidate.category || ""),
    sourceChain: String(candidate.sourceChain || "multi-chain"),
    sourceUrl: String(candidate.sourceUrl || ""),
    sourceType: String(candidate.sourceType || "open-source-reference"),
    pmfSignal: String(candidate.pmfSignal || ""),
    reusablePatterns: candidate.reusablePatterns || [],
    failureModes: candidate.failureModes || [],
    kaspaLane: String(candidate.kaspaLane || "research"),
    kaspaBuild: String(candidate.kaspaBuild || ""),
    priority: String(candidate.priority || "research"),
    firstArtifact: String(candidate.firstArtifact || "")
  };
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key] || "unknown";
    groups[value] = (groups[value] || 0) + 1;
    return groups;
  }, {});
}
