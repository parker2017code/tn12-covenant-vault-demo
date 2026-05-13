import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSchedulerCovenantSettlementTarget } from "../../src/schedulerCovenantSettlementTarget.mjs";

const [workbench, intentRegistry, binding, payoutEvidence, negativeEvidence, checkedIn] = await Promise.all([
  readJson("artifacts/universal-scheduler-workbench.json"),
  readJson("artifacts/scheduler-intent-registry.json"),
  readJson("artifacts/scheduler-covenant-binding.json"),
  readJson("artifacts/scheduler-covenant-payout-evidence.json"),
  readJson("artifacts/scheduler-covenant-payout-negative-evidence.json"),
  readJson("artifacts/scheduler-covenant-settlement-target.json")
]);

const artifact = buildSchedulerCovenantSettlementTarget({
  workbench,
  intentRegistry,
  binding,
  payoutEvidence,
  negativeEvidence,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-scheduler-covenant-settlement-target/v1");
assert.equal(artifact.status, "accepted-covenant-payout-spend");
assert.equal(artifact.currentEvidence.intentTxid, "185d62928f5cddadafc7faf14ec7b092ea44a3ea8c08af71ac7a135032243d4d");
assert.equal(artifact.currentEvidence.executionReceiptTxid, "d6008cb5e4772f9d3c3173c39ad2ef8df91dcca02d7d1d76862ec1817bf36909");
assert.equal(artifact.currentEvidence.executionTransferAmountTkas, "4");
assert.equal(artifact.currentEvidence.covenantPayoutReleaseTxid, "634873a5a55136d010ba9371c4a90da997755c8a31b7eca458d5f6756eddb986");
assert.equal(artifact.currentEvidence.covenantPayoutStatus, "accepted-covenant-payout-spend");
assert.equal(artifact.currentEvidence.covenantPayoutNegativeStatus, "local-payout-negative-candidates-passed");
assert.deepEqual(artifact.currentEvidence.covenantPayoutNegativeCases, [
  "wrong_recipient_rejects",
  "wrong_payout_amount_rejects",
  "wrong_input_value_rejects"
]);
assert.equal(artifact.currentEvidence.intentEnforcement, "INDEXER_DERIVED");
assert.equal(artifact.targetV1.preferredExistingContract, "contracts/SchedulerCovenantPayout.sil");
assert.ok(artifact.targetV1.scriptCanEnforce.includes("payout amount"));
assert.ok(artifact.targetV1.replayMustStillCheck.some((item) => /winning bid/.test(item)));
assert.equal(artifact.acceptedCovenantPayout.releaseTxid, "634873a5a55136d010ba9371c4a90da997755c8a31b7eca458d5f6756eddb986");
assert.equal(artifact.localNegativePayoutEvidence.status, "local-payout-negative-candidates-passed");
assert.ok(artifact.localNegativePayoutEvidence.cases.some((row) => row.id === "wrong_recipient_rejects" && row.got === false));
assert.ok(artifact.nextTn12Run.some((item) => /wrong-recipient/.test(item)));
assert.ok(artifact.blockers.some((item) => /replay/.test(item)));
assert.ok(artifact.boundaries.some((item) => /payout money movement/.test(item)));

assert.equal(checkedIn.schema, artifact.schema);
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.targetV1.payout.amountTkas, artifact.targetV1.payout.amountTkas);

console.log("Scheduler covenant settlement target tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
