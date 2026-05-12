import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-cumulative-cap-proof.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-cumulative-cap-proof/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "accepted-cumulative-under-cap-plus-local-over-cap-reject");
assert.equal(artifact.acceptedSpends.length, 2);
assert.ok(artifact.acceptedSpends.every((spend) => spend.acceptedOnTn12 === true));
assert.equal(artifact.cumulative.firstSpendSompi, "2500000000");
assert.equal(artifact.cumulative.secondSpendSompi, "4000000000");
assert.equal(artifact.cumulative.totalAcceptedSompi, "6500000000");
assert.equal(artifact.cumulative.nextSpentInWindowSompi, "6500000000");
assert.equal(artifact.cumulative.underCap, true);
assert.equal(artifact.capSompi, "7500000000");
assert.equal(artifact.continuationChain[0].spentInWindowSompi, "2500000000");
assert.equal(artifact.continuationChain[1].spentInWindowSompi, "6500000000");
assert.equal(artifact.blockedCandidate.status, "blocked-local-engine-failed");
assert.equal(artifact.blockedCandidate.prevSpentSompi, "6500000000");
assert.equal(artifact.blockedCandidate.spendAmountSompi, "1500000000");
assert.equal(artifact.blockedCandidate.attemptedNextSpentSompi, "8000000000");
assert.equal(artifact.blockedCandidate.exceedsCap, true);
assert.equal(artifact.blockedCandidate.localEngineAcceptedGeneratedSigScript, false);

console.log("Recurring treasury vault cumulative cap proof tests passed.");
