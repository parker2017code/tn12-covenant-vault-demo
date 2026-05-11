import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildFullDefiBenchmark } from "../../src/fullDefiBenchmark.mjs";

const artifact = buildFullDefiBenchmark({
  provenStatus: await readJson("artifacts/proven-status.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  schedulerRegistry: await readJson("artifacts/scheduler-intent-registry.json"),
  schedulerBinding: await readJson("artifacts/scheduler-covenant-binding.json"),
  durableReplayGuard: await readJson("artifacts/durable-replay-promotion-guard.json"),
  signerValidation: await readJson("artifacts/wallet-standard-signer-validation.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-full-defi-benchmark/v1");
assert.equal(artifact.status, "full-defi-benchmark-review");
assert.equal(artifact.summary.fullDefiClaimAllowed, false);
assert.equal(artifact.summary.mainnetReady, false);
assert.ok(artifact.currentPercent >= 50);
assert.ok(artifact.currentPercent < 80);
assert.ok(artifact.rails.some((rail) => rail.id === "scheduler-covenant-binding" && rail.done));
assert.ok(artifact.rails.some((rail) => rail.id === "external-signer-roundtrip" && !rail.done));
assert.ok(artifact.nextHighestImpact.some((rail) => rail.id === "external-signer-roundtrip"));

const checkedIn = await readJson("artifacts/full-defi-benchmark.json");
assert.equal(checkedIn.currentPercent, artifact.currentPercent);
assert.equal(checkedIn.summary.completedRails, artifact.summary.completedRails);

console.log("Full DeFi benchmark tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
