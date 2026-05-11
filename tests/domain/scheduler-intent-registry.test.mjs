import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSchedulerIntentRegistry } from "../../src/schedulerIntentRegistry.mjs";

const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
const acceptedActivity = await readJson("artifacts/defi-accepted-activity-ledger.json");
const payloadEvidenceByPath = Object.fromEntries(await Promise.all(
  payloadEvents.events.map(async (event) => [event.outPath, await readOptionalJson(event.outPath)])
));
const executionEvidenceByPath = {
  "artifacts/tn12-scheduler-execution-payout-user-03-evidence.json": await readOptionalJson("artifacts/tn12-scheduler-execution-payout-user-03-evidence.json")
};

const registry = buildSchedulerIntentRegistry({
  payloadEvents,
  payloadEvidenceByPath,
  executionEvidenceByPath,
  acceptedActivity,
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(registry.schema, "tn12-scheduler-intent-registry/v1");
assert.equal(registry.status, "scheduler-intent-registry-ready");
assert.equal(registry.enforcement, "INDEXER_DERIVED");
assert.equal(registry.summary.acceptedIntents, 1);
assert.equal(registry.summary.eligibleTriggers, 0);
assert.equal(registry.summary.executedTriggers, 1);
assert.equal(registry.summary.blockedNegativeRows, 4);
assert.equal(registry.summary.executionReceipts, 1);
assert.equal(registry.summary.protocolSchedulerClaims, 0);
assert.equal(registry.summary.autonomousCustodyClaims, 0);
assert.ok(registry.acceptedIntents[0].txid);
assert.equal(registry.triggerRows[0].status, "executed");
assert.equal(registry.triggerRows[0].executionMode, "local-key-review-required");
assert.equal(registry.triggerRows[0].executionReceiptTxid, "d6008cb5e4772f9d3c3173c39ad2ef8df91dcca02d7d1d76862ec1817bf36909");
assert.equal(registry.triggerRows[0].executionTransferTxid, "1a486540fa324d8b4590a97a27b791eb895f32a5196e92fe0d1be584ece1ec1d");
assert.ok(registry.boundaries.some((boundary) => /not an implementation of vProgs/.test(boundary)));

const artifact = await readJson("artifacts/scheduler-intent-registry.json");
assert.equal(artifact.status, registry.status);
assert.equal(artifact.summary.acceptedIntents, registry.summary.acceptedIntents);

console.log("Scheduler intent registry tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch {
    return {};
  }
}
