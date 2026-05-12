import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/signed-drafts/recurring-treasury-vault-live-spend.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-live-spend-draft/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "signed-local-engine-passed-not-broadcast");
assert.match(artifact.source.covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.localChecks.engineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.inputCovenantIdKnown, true);
assert.equal(artifact.localChecks.output1ContinuationCovenantMatchesInput, true);
assert.equal(artifact.localChecks.output0AmountMatchesSpend, true);
assert.equal(artifact.submitPayload.transaction.version, 1);
assert.equal(artifact.submitPayload.transaction.inputs.length, 1);
assert.equal(artifact.submitPayload.transaction.outputs.length, 2);
assert.equal(artifact.submitPayload.transaction.inputs[0].computeBudget, 100);
assert.equal(artifact.submitPayload.transaction.outputs[0].amount, 2500000000);
assert.equal(artifact.submitPayload.transaction.outputs[1].covenant.covenantId, artifact.source.covenantId);
assert.ok(artifact.submit.submitCommand.includes("--submit"));

console.log("Recurring treasury vault live spend draft tests passed.");
