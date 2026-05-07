export function buildProjectStatus(fixture = {}) {
  const lanes = (fixture.lanes || []).map(normalizeLane);
  return {
    schema: "kaspa-app-build-status/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    status: "active-build-map",
    summary: {
      total: lanes.length,
      builtBases: lanes.filter((lane) => lane.status === "base-built").length,
      proofBacked: lanes.filter((lane) => lane.proof === "accepted-tn12").length,
      blocked: lanes.filter((lane) => lane.status === "blocked").length,
      nextBuilds: lanes.filter((lane) => lane.status === "next-build").length,
      research: lanes.filter((lane) => lane.status === "research").length
    },
    lanes,
    naturalNextSteps: fixture.naturalNextSteps || [],
    consistencyRules: [
      "Every lane must keep status, enforcement, readiness, and proof labels aligned.",
      "Do not call planner/indexer state covenant enforcement.",
      "Do not call TN12 proofs mainnet readiness.",
      "Do not advance a vertical slice to paid/released/redeemed until accepted transaction state proves it."
    ]
  };
}

function normalizeLane(lane = {}) {
  return {
    order: Number(lane.order || 0),
    id: String(lane.id || ""),
    name: String(lane.name || ""),
    status: String(lane.status || "planned"),
    enforcement: String(lane.enforcement || "unknown"),
    readiness: String(lane.readiness || "unknown"),
    proof: String(lane.proof || "none"),
    builtSurface: lane.builtSurface || [],
    next: String(lane.next || "")
  };
}
