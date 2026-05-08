export function buildMissingRailsMatrix(fixture = {}) {
  const categories = (fixture.categories || []).map(normalizeCategory);
  const questionCount = categories.reduce((total, category) => total + category.questions.length, 0);
  const missingRails = countValues(categories.flatMap((category) =>
    category.questions.map((question) => question.missingRail)
  ));

  return {
    schema: "kaspa-missing-rails-matrix/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: "missing-rails-explicit",
    summary: {
      categories: categories.length,
      questions: questionCount,
      realRailsNow: (fixture.realRailsNow || []).length,
      uniqueMissingRails: Object.keys(missingRails).length,
      topMissingRails: topCounts(missingRails, 10),
      buildNowClaimsAllowed: 0
    },
    realRailsNow: arrayOfStrings(fixture.realRailsNow),
    categories,
    rules: [
      "Every high-impact app can stay in the pipeline, but product claims require the relevant rails to be real.",
      "A simulator, brief, payload registry, or wallet-review artifact is useful only when labeled correctly.",
      "Do not upgrade a research lane to a build-now app until custody, indexing, oracle, settlement, and wallet assumptions are explicit.",
      "Each category must name what not to claim yet."
    ]
  };
}

function normalizeCategory(category = {}) {
  const questions = (category.questions || []).map(normalizeQuestion);
  return {
    id: String(category.id || ""),
    name: String(category.name || ""),
    targetUseCase: String(category.targetUseCase || ""),
    currentLane: String(category.currentLane || "research"),
    repoPosition: String(category.repoPosition || ""),
    sourceAnchors: arrayOfStrings(category.sourceAnchors),
    questions,
    smallestHonestPrototype: String(category.smallestHonestPrototype || ""),
    doNotClaim: arrayOfStrings(category.doNotClaim),
    status: questions.every((question) => question.missingRail && question.currentAnswer)
      ? "questions-answered-rails-named"
      : "needs-rail-review"
  };
}

function normalizeQuestion(question = {}) {
  return {
    question: String(question.question || ""),
    currentAnswer: String(question.currentAnswer || ""),
    existingRail: String(question.existingRail || ""),
    missingRail: String(question.missingRail || ""),
    nextArtifact: String(question.nextArtifact || "")
  };
}

function arrayOfStrings(items) {
  return Array.isArray(items) ? items.map((item) => String(item)) : [];
}

function countValues(items) {
  return items.reduce((counts, item) => {
    if (!item) return counts;
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}

function topCounts(counts, limit) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
