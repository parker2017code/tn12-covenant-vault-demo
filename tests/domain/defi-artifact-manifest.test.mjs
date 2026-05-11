import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiArtifactManifest } from "../../src/defiArtifactManifest.mjs";

const artifacts = {
  planner: await readJson("artifacts/defi-planner-simulation.json"),
  scenario: await readJson("artifacts/defi-scenario-simulation.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json"),
  advanced: await readJson("artifacts/defi-advanced-simulation.json"),
  "multi-wallet": await readJson("artifacts/defi-multi-wallet-scenario-pack.json"),
  "accepted-activity": await readJson("artifacts/defi-accepted-activity-ledger.json")
};

const manifest = buildDefiArtifactManifest({
  artifacts,
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(manifest.status, "defi-artifact-manifest-ready");
assert.equal(manifest.summary.artifacts, 6);
assert.equal(manifest.summary.readyArtifacts, 6);
assert.equal(manifest.summary.problems, 0);
assert.equal(manifest.summary.liveProductClaims, 0);
assert.equal(manifest.summary.custodyActions, 0);
assert.equal(manifest.summary.externalSignerClaims, 0);
assert.equal(manifest.summary.secretFindings, 0);
assert.ok(manifest.rows.every((row) => row.ready && row.problems.length === 0));
assert.ok(manifest.commands.includes("npm run defi:multi-wallet"));
assert.ok(manifest.commands.includes("npm run defi:accepted-activity"));

const badManifest = buildDefiArtifactManifest({
  artifacts: {
    ...artifacts,
    scenario: {
      ...artifacts.scenario,
      summary: {
        ...artifacts.scenario.summary,
        liveProductClaims: 1
      }
    }
  },
  generatedAt: "2026-05-11T00:00:00.000Z"
});
assert.equal(badManifest.status, "defi-artifact-manifest-review");
assert.equal(badManifest.summary.liveProductClaims, 1);
assert.ok(badManifest.problems.some((problem) => /live product claims/.test(problem)));

const artifact = await readJson("artifacts/defi-artifact-manifest.json");
assert.equal(artifact.status, manifest.status);
assert.equal(artifact.summary.readyArtifacts, manifest.summary.readyArtifacts);

console.log("DeFi artifact manifest tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
