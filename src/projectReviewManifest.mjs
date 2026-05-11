const REQUIRED_COMMANDS = [
  "check:focused",
  "check:all",
  "check:tn12",
  "operator:refresh",
  "defi:refresh",
  "mainnet:readiness",
  "project:proven-status",
  "project:operator-pack"
];

const REQUIRED_DOCS = [
  "README.md",
  "MAINNET_READINESS.md",
  "TN12_HANDOFF.md",
  "docs/PROGRESS.md",
  "docs/NEXT_STEPS.md",
  "docs/AUDIT_MAP.md",
  "docs/SCRIPT_INDEX.md",
  "docs/TN12_TEST_MATRIX.md"
];

const REQUIRED_ARTIFACTS = [
  ["artifacts/proven-status.json", "tn12-proven-status/v1"],
  ["artifacts/operator-receipt-pack.json", "tn12-operator-receipt-pack/v1"],
  ["artifacts/mainnet-readiness.json", "kaspa-app-mainnet-readiness/v1"],
  ["artifacts/defi-artifact-manifest.json", "tn12-defi-artifact-manifest/v1"],
  ["artifacts/durable-replay-promotion-guard.json", "tn12-durable-replay-promotion-guard/v1"],
  ["artifacts/wallet-submit-result-validation.json", "tn12-wallet-submit-result-validation/v1"],
  ["artifacts/checkpointed-accepted-index.json", "tn12-checkpointed-accepted-index/v1"],
  ["artifacts/proof-evidence.json", "tn12-contract-spend-evidence/v1"],
  ["artifacts/role-separated-proof-evidence.json", "tn12-contract-spend-evidence/v1"],
  ["artifacts/standards-adapter-backlog.json", "tn12-standards-adapter-backlog/v1"]
];

export function buildProjectReviewManifest({
  packageJson = {},
  docs = {},
  artifacts = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const commandRows = REQUIRED_COMMANDS.map((command) => ({
    command: `npm run ${command}`,
    present: typeof packageJson.scripts?.[command] === "string"
  }));
  const docRows = REQUIRED_DOCS.map((path) => ({
    path,
    present: Boolean(docs[path]?.present),
    bytes: Number(docs[path]?.bytes || 0)
  }));
  const artifactRows = REQUIRED_ARTIFACTS.map(([path, expectedSchema]) => reviewArtifact(path, expectedSchema, artifacts[path]));
  const problems = [
    ...commandRows.filter((row) => !row.present).map((row) => `missing command: ${row.command}`),
    ...docRows.filter((row) => !row.present || row.bytes === 0).map((row) => `missing/empty doc: ${row.path}`),
    ...artifactRows.flatMap((row) => row.problems.map((problem) => `${row.path}: ${problem}`))
  ];
  const summary = {
    commands: commandRows.length,
    commandPresent: commandRows.filter((row) => row.present).length,
    docs: docRows.length,
    docsPresent: docRows.filter((row) => row.present && row.bytes > 0).length,
    artifacts: artifactRows.length,
    artifactsReady: artifactRows.filter((row) => row.ready).length,
    problems: problems.length
  };

  return {
    schema: "tn12-project-review-manifest/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: problems.length === 0 ? "project-review-manifest-ready" : "project-review-manifest-review",
    summary,
    commands: commandRows,
    docs: docRows,
    artifacts: artifactRows,
    problems,
    boundaries: [
      "This manifest checks reviewer routing, not protocol truth.",
      "Artifact readiness means schema/status presence and expected schema match.",
      "Accepted TN12 evidence still comes from the proof and payload verification gates."
    ]
  };
}

function reviewArtifact(path, expectedSchema, artifact = {}) {
  const hasReviewSignal = Boolean(artifact.status || artifact.summary);
  const problems = [
    artifact.present ? "" : "missing artifact",
    artifact.schema === expectedSchema ? "" : `schema mismatch: expected ${expectedSchema}`,
    hasReviewSignal ? "" : "missing status/summary"
  ].filter(Boolean);

  return {
    path,
    expectedSchema,
    schema: artifact.schema || "",
    status: artifact.status || "",
    hasSummary: Boolean(artifact.summary),
    present: Boolean(artifact.present),
    ready: problems.length === 0,
    problems
  };
}
