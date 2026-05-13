import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSchedulerCovenantSettlementTarget } from "../../src/schedulerCovenantSettlementTarget.mjs";

const [workbench, intentRegistry, binding, checkedIn] = await Promise.all([
  readJson("artifacts/universal-scheduler-workbench.json"),
  readJson("artifacts/scheduler-intent-registry.json"),
  readJson("artifacts/scheduler-covenant-binding.json"),
  readJson("artifacts/scheduler-covenant-settlement-target.json")
]);

const artifact = buildSchedulerCovenantSettlementTarget({
  workbench,
  intentRegistry,
  binding,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-scheduler-covenant-settlement-target/v1");
assert.equal(artifact.status, "fresh-covenant-settlement-output-required");
assert.equal(artifact.currentEvidence.intentTxid, "185d62928f5cddadafc7faf14ec7b092ea44a3ea8c08af71ac7a135032243d4d");
assert.equal(artifact.currentEvidence.executionReceiptTxid, "d6008cb5e4772f9d3c3173c39ad2ef8df91dcca02d7d1d76862ec1817bf36909");
assert.equal(artifact.currentEvidence.executionTransferAmountTkas, "4");
assert.equal(artifact.currentEvidence.intentEnforcement, "INDEXER_DERIVED");
assert.equal(artifact.targetV1.preferredExistingContract, "contracts/RecurringTreasuryVaultWindow.sil");
assert.ok(artifact.targetV1.scriptCanEnforce.includes("payout amount"));
assert.ok(artifact.targetV1.replayMustStillCheck.some((item) => /winning bid/.test(item)));
assert.ok(artifact.nextTn12Run.some((item) => /fresh covenant settlement output/.test(item)));
assert.ok(artifact.blockers.some((item) => /P2PK/.test(item)));
assert.ok(artifact.boundaries.some((item) => /not accepted scheduler covenant-settlement/.test(item)));

assert.equal(checkedIn.schema, artifact.schema);
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.targetV1.payout.amountTkas, artifact.targetV1.payout.amountTkas);

console.log("Scheduler covenant settlement target tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
