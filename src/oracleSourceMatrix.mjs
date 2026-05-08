export function buildOracleSourceMatrix(fixture = {}) {
  const sourceReferences = (fixture.sourceReferences || []).map(normalizeReference);
  const referenceIds = new Set(sourceReferences.map((reference) => reference.id));
  const models = (fixture.models || []).map((model) => normalizeModel(model, referenceIds));
  const byLane = countBy(models, "currentKaspaLane");
  const byRisk = countBy(models, "riskLevel");
  const missingRails = [...new Set(models.flatMap((model) => model.missingRails))].sort();
  const unresolvedReferences = models
    .flatMap((model) => model.references.map((reference) => ({ modelId: model.id, reference })))
    .filter((item) => !referenceIds.has(item.reference));

  return {
    schema: "kaspa-oracle-source-matrix/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: unresolvedReferences.length ? "oracle-source-matrix-needs-review" : "oracle-source-matrix-ready",
    purpose: String(fixture.purpose || ""),
    summary: {
      models: models.length,
      sourceReferences: sourceReferences.length,
      missingRails: missingRails.length,
      highRiskModels: models.filter((model) => model.riskLevel === "high").length,
      custodyReadyModels: models.filter((model) => model.custodyReady).length,
      byLane,
      byRisk
    },
    sourceReferences,
    models,
    missingRails,
    unresolvedReferences,
    claimRules: arrayOfStrings(fixture.claimRules),
    boundaries: [
      "This matrix is an oracle research artifact, not a live oracle integration.",
      "It can justify review prompts, simulations, and app briefs, not automated liquidation or settlement.",
      "Kaskad and Eliott Mea sources are treated as research leads until their assumptions are remapped to this repo's payload, indexer, wallet, and TN12 covenant rails.",
      "No model here is custody-ready without stale-feed, challenge, signer, and settlement rules."
    ]
  };
}

function normalizeReference(reference = {}) {
  return {
    id: String(reference.id || ""),
    name: String(reference.name || ""),
    url: reference.url ? String(reference.url) : undefined,
    path: reference.path ? String(reference.path) : undefined,
    notes: String(reference.notes || "")
  };
}

function normalizeModel(model = {}, referenceIds) {
  const references = arrayOfStrings(model.references);
  return {
    id: String(model.id || ""),
    name: String(model.name || ""),
    dataSource: String(model.dataSource || ""),
    possibleUse: String(model.possibleUse || ""),
    manipulationModel: String(model.manipulationModel || ""),
    staleOrWrongHandling: String(model.staleOrWrongHandling || ""),
    determinism: String(model.determinism || ""),
    currentKaspaLane: String(model.currentKaspaLane || "research"),
    repoUseNow: String(model.repoUseNow || ""),
    missingRails: arrayOfStrings(model.missingRails),
    riskLevel: String(model.riskLevel || "unknown"),
    references,
    custodyReady: false,
    referenceCoverage: {
      total: references.length,
      known: references.filter((reference) => referenceIds.has(reference)).length
    }
  };
}

function arrayOfStrings(items) {
  return Array.isArray(items) ? items.map((item) => String(item)) : [];
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}
