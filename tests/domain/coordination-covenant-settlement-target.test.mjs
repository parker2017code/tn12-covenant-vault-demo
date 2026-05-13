import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildCoordinationCovenantSettlementTarget } from "../../src/coordinationCovenantSettlementTarget.mjs";

const [dossier, acceptedOutputs, settlementDrafts, checkedIn] = await Promise.all([
  readJson("artifacts/coordination-market-evidence-dossier.json"),
  readJson("fixtures/AcceptedOutputEvidence.json"),
  readJson("artifacts/batch-assurance-settlement-drafts.json"),
  readJson("artifacts/coordination-covenant-settlement-target.json")
]);

const artifact = buildCoordinationCovenantSettlementTarget({
  dossier,
  acceptedOutputs,
  settlementDrafts,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-coordination-covenant-settlement-target/v1");
assert.equal(artifact.status, "fresh-covenant-pledge-outputs-required");
assert.equal(artifact.currentEvidence.releaseAccepted, true);
assert.equal(artifact.currentEvidence.releaseTxid, dossier.selectedRelease.txid);
assert.deepEqual(artifact.currentEvidence.pledgeOutputScriptTypes, ["pubkey"]);
assert.equal(artifact.targetV1.contractSource, "contracts/AssurancePledge.sil");
assert.equal(artifact.targetV1.requiredFreshOutputs.length, 3);
assert.equal(artifact.targetV1.requiredFreshOutputs[0].targetScriptType, "covenant");
assert.ok(artifact.localChecksNeeded.some((item) => /release path/.test(item)));
assert.ok(artifact.nextTn12Run.some((item) => /covenant-bound pledge outputs/.test(item)));
assert.ok(artifact.blockers.some((item) => /P2PK/.test(item)));
assert.ok(artifact.boundaries.some((item) => /not accepted covenant-settlement/.test(item)));

assert.equal(checkedIn.schema, artifact.schema);
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.targetV1.requiredFreshOutputs.length, artifact.targetV1.requiredFreshOutputs.length);

console.log("Coordination covenant settlement target tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
