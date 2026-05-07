export function buildMainnetReadiness(fixture = {}) {
  const components = (fixture.components || []).map(normalizeComponent);
  return {
    schema: "kaspa-app-mainnet-readiness/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    status: "readiness-map-not-launch-approval",
    sources: fixture.sources || [],
    summary: {
      total: components.length,
      mainnetCapable: components.filter((component) => component.readiness === "mainnet-capable-with-engineering").length,
      tn12Only: components.filter((component) => component.readiness === "tn12-toccata-only").length,
      researchOnly: components.filter((component) => component.readiness === "research-only").length,
      localOnly: components.filter((component) => component.readiness === "local-only-not-production").length
    },
    components,
    rules: [
      "Mainnet-capable does not mean production-safe.",
      "TN12 accepted proof transactions are not mainnet proof transactions.",
      "Covenant and Silverscript flows stay TN12/Toccata-only until final mainnet activation and compatible tooling.",
      "Payment, payload, and accepted-transaction indexer apps still need wallet integration, node/RPC reliability, rollback handling, and tests before launch."
    ]
  };
}

function normalizeComponent(component = {}) {
  return {
    id: String(component.id || ""),
    name: String(component.name || ""),
    lane: String(component.lane || ""),
    readiness: String(component.readiness || "research-only"),
    why: String(component.why || ""),
    blockers: component.blockers || [],
    next: String(component.next || "")
  };
}
