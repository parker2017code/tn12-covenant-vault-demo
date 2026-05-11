import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSchedulerCovenantBinding } from "../../src/schedulerCovenantBinding.mjs";

const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
const payloadEvidenceByPath = Object.fromEntries(await Promise.all(
  payloadEvents.events.map(async (event) => [event.outPath, await readOptionalJson(event.outPath)])
));

const artifact = buildSchedulerCovenantBinding({
  payloadEvents,
  payloadEvidenceByPath,
  proofEvidence: await readJson("artifacts/proof-evidence.json"),
  roleProofEvidence: await readJson("artifacts/role-separated-proof-evidence.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-scheduler-covenant-binding/v1");
assert.equal(artifact.status, "scheduler-covenant-binding-ready");
assert.equal(artifact.enforcement, "INDEXER_DERIVED");
assert.equal(artifact.summary.acceptedBindings, 1);
assert.equal(artifact.summary.readyBindings, 1);
assert.equal(artifact.summary.scriptEnforcedPrimitiveRefs, 1);
assert.equal(artifact.summary.protocolSchedulerClaims, 0);
assert.equal(artifact.rows[0].proofTxid, "b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391");
assert.equal(artifact.rows[0].primitiveStatus, "SCRIPT_ENFORCED_REFERENCE");
assert.equal(artifact.rows[0].bindingEnforcement, "INDEXER_DERIVED");
assert.ok(artifact.negativeRows.every((row) => row.status === "blocked"));
assert.ok(artifact.boundaries.some((boundary) => /not TangVM/.test(boundary)));

const checkedIn = await readJson("artifacts/scheduler-covenant-binding.json");
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.summary.acceptedBindings, artifact.summary.acceptedBindings);

console.log("Scheduler covenant binding tests passed.");

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
