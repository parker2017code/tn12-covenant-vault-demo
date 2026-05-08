export function buildRailResearchTriggers(fixture = {}) {
  const triggers = (fixture.triggers || []).map(normalizeTrigger);
  const sourceKinds = triggers.reduce((counts, trigger) => {
    counts.local += trigger.localSources.length;
    counts.external += trigger.externalSources.length;
    return counts;
  }, { local: 0, external: 0 });

  return {
    schema: "kaspa-rail-research-triggers/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: "research-triggers-ready",
    purpose: String(fixture.purpose || ""),
    summary: {
      triggers: triggers.length,
      localSourceRefs: sourceKinds.local,
      externalSourceRefs: sourceKinds.external,
      firstArtifacts: [...new Set(triggers.map((trigger) => trigger.firstArtifact))].length
    },
    triggers,
    rules: [
      "When a trigger phrase appears in planning, consult the local sources before widening research.",
      "Use external sources as leads, then encode the result in a repo artifact before upgrading claims.",
      "Research can include docs, code, simulations, miner/pool signal design, and direct protocol questions.",
      "No app claim moves from research to build-now without a first artifact and do-not-claim boundary."
    ]
  };
}

function normalizeTrigger(trigger = {}) {
  return {
    id: String(trigger.id || ""),
    name: String(trigger.name || ""),
    triggerPhrases: arrayOfStrings(trigger.triggerPhrases),
    whyItMatters: String(trigger.whyItMatters || ""),
    localSources: arrayOfStrings(trigger.localSources),
    externalSources: (trigger.externalSources || []).map((source) => ({
      name: String(source.name || ""),
      url: source.url ? String(source.url) : undefined,
      path: source.path ? String(source.path) : undefined,
      useFor: String(source.useFor || "")
    })),
    researchQuestions: arrayOfStrings(trigger.researchQuestions),
    firstArtifact: String(trigger.firstArtifact || ""),
    doNotClaim: arrayOfStrings(trigger.doNotClaim),
    status: trigger.firstArtifact && trigger.researchQuestions?.length
      ? "trigger-ready"
      : "trigger-needs-review"
  };
}

function arrayOfStrings(items) {
  return Array.isArray(items) ? items.map((item) => String(item)) : [];
}
