const EXPECTED = [
  {
    id: "planner",
    path: "artifacts/defi-planner-simulation.json",
    schema: "tn12-defi-planner-simulation/v1",
    command: "npm run defi:simulation"
  },
  {
    id: "scenario",
    path: "artifacts/defi-scenario-simulation.json",
    schema: "tn12-defi-scenario-simulation/v1",
    command: "npm run defi:scenario"
  },
  {
    id: "reducer",
    path: "artifacts/defi-scenario-reducer.json",
    schema: "tn12-defi-scenario-reducer/v1",
    command: "npm run defi:reducer"
  },
  {
    id: "advanced",
    path: "artifacts/defi-advanced-simulation.json",
    schema: "tn12-defi-advanced-simulation/v1",
    command: "npm run defi:advanced"
  },
  {
    id: "multi-wallet",
    path: "artifacts/defi-multi-wallet-scenario-pack.json",
    schema: "tn12-defi-multi-wallet-scenario-pack/v1",
    command: "npm run defi:multi-wallet"
  },
  {
    id: "accepted-activity",
    path: "artifacts/defi-accepted-activity-ledger.json",
    schema: "tn12-defi-accepted-activity-ledger/v1",
    command: "npm run defi:accepted-activity"
  }
];

export function buildDefiArtifactManifest({
  artifacts = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const rows = EXPECTED.map((expected) => reviewArtifact(expected, artifacts[expected.id]));
  const problems = rows.flatMap((row) => row.problems.map((problem) => `${row.id}: ${problem}`));
  const summary = {
    artifacts: rows.length,
    readyArtifacts: rows.filter((row) => row.ready).length,
    problems: problems.length,
    liveProductClaims: sum(rows, "liveProductClaims"),
    custodyActions: sum(rows, "custodyActions"),
    externalSignerClaims: sum(rows, "externalSignerClaims"),
    secretFindings: sum(rows, "secretFindings")
  };

  return {
    schema: "tn12-defi-artifact-manifest/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: summary.readyArtifacts === rows.length
      && summary.problems === 0
      && summary.liveProductClaims === 0
      && summary.custodyActions === 0
      && summary.externalSignerClaims === 0
      && summary.secretFindings === 0
      ? "defi-artifact-manifest-ready"
      : "defi-artifact-manifest-review",
    summary,
    rows,
    problems,
    commands: EXPECTED.map((item) => item.command),
    boundaries: [
      "This manifest is the reviewer entry point for DeFi simulation artifacts.",
      "Ready means the artifacts are internally consistent and claim-bounded, not that DeFi is live.",
      "All custody, live product, and external signer claims must remain zero until real wallet and settlement evidence exists."
    ]
  };
}

function reviewArtifact(expected, artifact = {}) {
  const serialized = JSON.stringify(artifact);
  const summary = artifact.summary || {};
  const secretFindings = findSecretFields(serialized);
  const liveProductClaims = Number(summary.liveProductClaims || 0);
  const custodyActions = Number(summary.custodyActions || summary.custodyReadyLanes || summary.custodyPromotions || 0);
  const externalSignerClaims = Number(summary.externalSignerClaims || 0);
  const problems = [
    artifact.schema === expected.schema ? "" : `schema mismatch: expected ${expected.schema}`,
    artifact.network === "kaspa-testnet-12" ? "" : "network mismatch",
    /ready|simulation/.test(String(artifact.status || "")) ? "" : "status is not ready/simulation",
    liveProductClaims === 0 ? "" : "live product claims present",
    custodyActions === 0 ? "" : "custody actions present",
    externalSignerClaims === 0 ? "" : "external signer claims present",
    secretFindings.length === 0 ? "" : "secret-like fields present"
  ].filter(Boolean);

  return {
    id: expected.id,
    path: expected.path,
    command: expected.command,
    schema: artifact.schema || "",
    status: artifact.status || "",
    ready: problems.length === 0,
    liveProductClaims,
    custodyActions,
    externalSignerClaims,
    secretFindings: secretFindings.length,
    problems
  };
}

function findSecretFields(serialized) {
  return [/"privateKey"\s*:/i, /"mnemonic"\s*:/i, /"seed"\s*:/i, /"secret"\s*:/i, /\.local\/tn12-wallet\.json/i]
    .filter((pattern) => pattern.test(serialized));
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}
