import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-live-spend-evidence.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-live-spend-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "accepted-script-enforced-under-cap-spend");
assert.match(artifact.txid, /^[0-9a-f]{64}$/);
assert.equal(artifact.checks.acceptedOnTn12, true);
assert.equal(artifact.checks.output0AmountMatchesSpend, true);
assert.equal(artifact.checks.output0DestinationMatchesDraft, true);
assert.equal(artifact.checks.output1ContinuationAmountMatchesDraft, true);
assert.equal(artifact.checks.output1ContinuationScriptMatchesDraft, true);
assert.equal(artifact.checks.output1ContinuationCovenantMatchesDraft, true);
assert.equal(artifact.checks.localEngineAcceptedGeneratedSigScript, true);

console.log("Recurring treasury vault live spend evidence tests passed.");
