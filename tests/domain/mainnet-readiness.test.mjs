import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildMainnetReadiness } from "../../src/mainnetReadiness.mjs";

const fixture = await readJson("fixtures/MainnetReadiness.json");
const readiness = buildMainnetReadiness(fixture);

assert.equal(readiness.schema, "kaspa-app-mainnet-readiness/v1");
assert.equal(readiness.status, "readiness-map-not-launch-approval");
assert.equal(readiness.reviewedAt, "2026-05-11");
assert.equal(readiness.summary.mainnetCapable, 4);
assert.equal(readiness.summary.tn12Only, 3);
assert.equal(readiness.summary.researchOnly, 2);
assert.equal(readiness.summary.localOnly, 1);

const defi = readiness.components.find((component) => component.id === "defi-simulation-suite");
assert.ok(defi);
assert.equal(defi.readiness, "research-only");
assert.equal(defi.lane, "defi");
assert.match(defi.why, /no live DeFi custody/);
assert.ok(defi.blockers.includes("real external-signer round trip"));
assert.match(defi.next, /defi:refresh/);

const artifact = await readJson("artifacts/mainnet-readiness.json");
assert.equal(artifact.reviewedAt, readiness.reviewedAt);
assert.equal(artifact.summary.researchOnly, readiness.summary.researchOnly);
assert.ok(artifact.components.some((component) => component.id === "defi-simulation-suite"));

console.log("Mainnet readiness tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
