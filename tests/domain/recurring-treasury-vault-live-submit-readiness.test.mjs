import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-live-submit-readiness.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-live-submit-readiness/v1");
assert.equal(artifact.currentEvidence.ownerSigProof, "local-owner-sig-covenant-proof-passed");
assert.match(artifact.currentEvidence.acceptedFunding.txid, /^[0-9a-f]{64}$/);
assert.equal(artifact.currentEvidence.jsCovenantOutputSupport.preservesCovenantOutput, false);
assert.equal(artifact.status, "blocked-before-live-submit");
assert.equal(artifact.blocker.id, "js-runtime-drops-output-covenant");
assert.match(artifact.safetyRule, /Do not submit/);

console.log("Recurring treasury vault live submit readiness tests passed.");
