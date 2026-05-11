import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { buildProjectReviewManifest } from "../../src/projectReviewManifest.mjs";

const docs = await readDocs([
  "README.md",
  "MAINNET_READINESS.md",
  "TN12_HANDOFF.md",
  "docs/PROGRESS.md",
  "docs/NEXT_STEPS.md",
  "docs/AUDIT_MAP.md",
  "docs/SCRIPT_INDEX.md",
  "docs/TN12_TEST_MATRIX.md"
]);
const artifacts = await readArtifacts([
  "artifacts/proven-status.json",
  "artifacts/operator-receipt-pack.json",
  "artifacts/mainnet-readiness.json",
  "artifacts/defi-artifact-manifest.json",
  "artifacts/durable-replay-promotion-guard.json",
  "artifacts/wallet-submit-result-validation.json",
  "artifacts/checkpointed-accepted-index.json",
  "artifacts/proof-evidence.json",
  "artifacts/role-separated-proof-evidence.json"
]);
const manifest = buildProjectReviewManifest({
  packageJson: await readJson("package.json"),
  docs,
  artifacts,
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(manifest.schema, "tn12-project-review-manifest/v1");
assert.equal(manifest.status, "project-review-manifest-ready");
assert.equal(manifest.summary.problems, 0);
assert.equal(manifest.summary.commandPresent, manifest.summary.commands);
assert.equal(manifest.summary.docsPresent, manifest.summary.docs);
assert.equal(manifest.summary.artifactsReady, manifest.summary.artifacts);
assert.ok(manifest.artifacts.some((row) => row.path === "artifacts/defi-artifact-manifest.json"));
assert.ok(manifest.commands.some((row) => row.command === "npm run operator:refresh" && row.present));

const artifact = await readJson("artifacts/project-review-manifest.json");
assert.equal(artifact.schema, manifest.schema);
assert.equal(artifact.status, manifest.status);
assert.equal(artifact.summary.problems, 0);

console.log("Project review manifest tests passed.");

async function readDocs(paths) {
  const entries = await Promise.all(paths.map(async (path) => {
    const info = await stat(path);
    return [path, { present: info.isFile(), bytes: info.size }];
  }));
  return Object.fromEntries(entries);
}

async function readArtifacts(paths) {
  const entries = await Promise.all(paths.map(async (path) => {
    const artifact = await readJson(path);
    return [path, { present: true, schema: artifact.schema, status: artifact.status, summary: artifact.summary }];
  }));
  return Object.fromEntries(entries);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
