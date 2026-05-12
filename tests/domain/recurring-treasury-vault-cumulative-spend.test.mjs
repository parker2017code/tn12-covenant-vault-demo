import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const draft = JSON.parse(await readFile("artifacts/signed-drafts/recurring-treasury-vault-cumulative-spend.json", "utf8"));
const evidence = JSON.parse(await readFile("artifacts/recurring-treasury-vault-cumulative-spend-evidence.json", "utf8"));
const continuation = JSON.parse(await readFile("fixtures/RecurringTreasuryVaultCumulativeContinuationOutpoint.json", "utf8"));
const overCap = JSON.parse(await readFile("artifacts/signed-drafts/recurring-treasury-vault-cumulative-over-cap.json", "utf8"));

assert.equal(draft.schema, "tn12-recurring-treasury-vault-live-spend-draft/v1");
assert.equal(draft.status, "signed-local-engine-passed-not-broadcast");
assert.equal(draft.source.contractOutpoint.txid, "029eb68aec033e659cfff9615e49ac489a9d0ee4df7041507e8471215305b26f");
assert.equal(draft.source.contractOutpoint.outputIndex, 1);
assert.equal(draft.state.prevSpentSompi, 2500000000);
assert.equal(draft.state.spendAmountSompi, 4000000000);
assert.equal(draft.state.nextSpentSompi, 6500000000);
assert.equal(draft.state.nextSpentSompi <= draft.state.capSompi, true);

assert.equal(evidence.status, "accepted-script-enforced-under-cap-spend");
assert.equal(evidence.txid, draft.transactionId);
assert.equal(evidence.checks.acceptedOnTn12, true);
assert.equal(evidence.checks.output1ContinuationCovenantMatchesDraft, true);

assert.equal(continuation.txid, draft.transactionId);
assert.equal(continuation.outputIndex, 1);
assert.equal(continuation.state.spentInWindowSompi, "6500000000");

assert.equal(overCap.status, "blocked-local-engine-failed");
assert.equal(overCap.state.prevSpentSompi, 6500000000);
assert.equal(overCap.state.spendAmountSompi, 1500000000);
assert.equal(overCap.state.nextSpentSompi, 8000000000);
assert.equal(overCap.localChecks.engineAcceptedGeneratedSigScript, false);

console.log("Recurring treasury vault cumulative spend tests passed.");
