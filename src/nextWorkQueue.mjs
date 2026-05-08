export function buildNextWorkQueue(fixture = {}) {
  const done = (fixture.done || []).map(normalizeStatusItem);
  const wip = (fixture.wip || []).map(normalizeWipItem);
  const roadmap = (fixture.roadmap || []).map(normalizeRoadmapItem);
  const tasks = (fixture.tasks || []).map(normalizeTask).sort((a, b) => a.rank - b.rank);
  const byLane = countBy(tasks, "lane");
  const byImportance = countBy(tasks, "importance");
  const topFive = tasks.slice(0, 5).map((task) => task.id);
  const nextTen = tasks.slice(0, 10).map((task) => task.id);
  const nextTwenty = tasks.slice(0, 20).map((task) => task.id);

  return {
    schema: "kaspa-next-work-queue/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: tasks.length >= 30 ? "ordered-project-queue-ready" : "ordered-project-queue-needs-review",
    purpose: String(fixture.purpose || ""),
    sourceDocs: arrayOfStrings(fixture.sourceDocs),
    summary: {
      done: done.length,
      wip: wip.length,
      roadmap: roadmap.length,
      tasks: tasks.length,
      critical: tasks.filter((task) => task.importance === "critical").length,
      high: tasks.filter((task) => task.importance === "high").length,
      medium: tasks.filter((task) => task.importance === "medium").length,
      low: tasks.filter((task) => task.importance === "low").length,
      byLane,
      byImportance,
      topPriority: tasks[0]?.id || ""
    },
    done,
    wip,
    roadmap,
    next: {
      five: topFive,
      ten: nextTen,
      twenty: nextTwenty,
      thirty: tasks.map((task) => task.id)
    },
    tasks,
    operatingRule: "Build the wallet-submit and durable-indexer rails first; turn app lanes into user-facing products only when accepted state, custody, wallet review, and failure paths are explicit."
  };
}

function normalizeStatusItem(item = {}) {
  return {
    id: String(item.id || ""),
    label: String(item.label || ""),
    evidence: String(item.evidence || ""),
    lane: String(item.lane || "")
  };
}

function normalizeWipItem(item = {}) {
  return {
    id: String(item.id || ""),
    label: String(item.label || ""),
    whyFirst: String(item.whyFirst || ""),
    blocking: arrayOfStrings(item.blocking)
  };
}

function normalizeRoadmapItem(item = {}) {
  return {
    id: String(item.id || ""),
    label: String(item.label || ""),
    examples: arrayOfStrings(item.examples),
    condition: String(item.condition || "")
  };
}

function normalizeTask(task = {}) {
  return {
    rank: Number(task.rank || 0),
    id: String(task.id || ""),
    title: String(task.title || ""),
    lane: String(task.lane || "unknown"),
    importance: String(task.importance || "medium"),
    why: String(task.why || ""),
    definitionOfDone: String(task.definitionOfDone || ""),
    startWith: arrayOfStrings(task.startWith),
    gates: arrayOfStrings(task.gates)
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
