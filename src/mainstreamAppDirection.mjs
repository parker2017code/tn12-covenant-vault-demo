export function buildMainstreamAppDirection(fixture = {}) {
  const targets = (fixture.targets || [])
    .map(normalizeTarget)
    .sort((a, b) => a.priority - b.priority);
  const buildNow = targets.filter((target) => target.buildNow);
  const research = targets.filter((target) => !target.buildNow);
  const missingRails = countRails(targets, "missingRails");

  return {
    schema: "kaspa-mainstream-app-direction/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: "high-impact-app-direction-documented",
    summary: {
      total: targets.length,
      buildNow: buildNow.length,
      researchOrLater: research.length,
      topPriority: targets[0]?.id || null,
      highestMissingRails: topMissingRails(missingRails, 8)
    },
    buildNow: buildNow.map(toBrief),
    researchOrLater: research.map(toBrief),
    targets,
    rules: [
      "High-impact categories stay in the pipeline, but claims follow current rails.",
      "Build-now means the repo has accepted transaction, payload, covenant, or wallet-review evidence to extend.",
      "Research means the user job is worth tracking but the missing rails must be named before product claims.",
      "Every app target must name what not to claim yet."
    ]
  };
}

function normalizeTarget(target = {}) {
  return {
    id: String(target.id || ""),
    priority: Number(target.priority || 999),
    name: String(target.name || ""),
    userUseCase: String(target.userUseCase || ""),
    mainstreamReference: String(target.mainstreamReference || ""),
    kaspaLane: String(target.kaspaLane || "research"),
    currentRepoStatus: String(target.currentRepoStatus || "not-started"),
    buildNow: Boolean(target.buildNow),
    liquidityOrAttentionReason: String(target.liquidityOrAttentionReason || ""),
    existingRails: arrayOfStrings(target.existingRails),
    missingRails: arrayOfStrings(target.missingRails),
    smallestHonestPrototype: String(target.smallestHonestPrototype || ""),
    doNotClaimYet: String(target.doNotClaimYet || "")
  };
}

function toBrief(target) {
  return {
    id: target.id,
    priority: target.priority,
    name: target.name,
    kaspaLane: target.kaspaLane,
    currentRepoStatus: target.currentRepoStatus,
    missingRails: target.missingRails,
    smallestHonestPrototype: target.smallestHonestPrototype
  };
}

function arrayOfStrings(items) {
  return Array.isArray(items) ? items.map((item) => String(item)) : [];
}

function countRails(targets, key) {
  return targets.flatMap((target) => target[key]).reduce((counts, rail) => {
    counts[rail] = (counts[rail] || 0) + 1;
    return counts;
  }, {});
}

function topMissingRails(counts, limit) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([rail, count]) => ({ rail, count }));
}
