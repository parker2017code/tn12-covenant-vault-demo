export function buildBasedRollupScout(fixture = {}) {
  const sources = fixture.sources || [];
  const contributors = fixture.contributors || [];
  const capabilityChanges = fixture.capabilityChanges || [];
  const nextActions = fixture.nextActions || [];

  return {
    schema: "tn12-based-rollup-scout/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: fixture.status || "scouting-not-deployment",
    summary: {
      sourceCount: sources.length,
      contributorCount: contributors.length,
      nowChanges: capabilityChanges.filter((item) => item.timeframe === "now").length,
      laterChanges: capabilityChanges.filter((item) => item.timeframe === "later").length,
      nextActions: nextActions.filter((item) => item.status === "next").length
    },
    conclusion: {
      changesCurrentTn12Work: false,
      changesFuturePlan: true,
      buildOnExistingStackFirst: true,
      buildOwnRollupIsMajorInfra: true,
      needsProductionReadinessAnswerNow: Boolean(fixture.currentDecision?.needsProductionReadinessAnswerNow),
      usingIgra: Boolean(fixture.currentDecision?.usingIgra),
      usingKasplex: Boolean(fixture.currentDecision?.usingKasplex),
      usingAnyL2Now: Boolean(fixture.currentDecision?.usingAnyL2Now),
      considerCoreMigratableRollup: Boolean(fixture.currentDecision?.considerCoreMigratableRollup),
      whenItMatters: String(fixture.currentDecision?.whenItMatters || ""),
      detail: "Based-app prototypes are the richer-state lane around Kaspa ordering, commitments, proofs, settlement, and replay. Based rollups are one possible implementation surface, not the whole category."
    },
    sources,
    contributors,
    capabilityChanges,
    nextActions,
    boundaries: [
      "This artifact is a scouting map for based-app implementation surfaces.",
      "Maxim's rollup PoC is a reference input for bridge and proof mechanics, not a production dependency in this repo yet.",
      "Hans' vProgs work is tracked as runtime/proving direction, not as a completed rollup deployment by this repo.",
      "Current repo claims stay tied to accepted TN12 transactions, generated artifacts, or explicit research labels."
    ]
  };
}
