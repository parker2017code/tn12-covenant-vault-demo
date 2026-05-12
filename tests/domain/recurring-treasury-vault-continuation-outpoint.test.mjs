import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const firstSpend = JSON.parse(await readFile("artifacts/signed-drafts/recurring-treasury-vault-live-spend.json", "utf8"));
const evidence = JSON.parse(await readFile("artifacts/recurring-treasury-vault-live-spend-evidence.json", "utf8"));
const continuation = JSON.parse(await readFile("fixtures/RecurringTreasuryVaultContinuationOutpoint.json", "utf8"));

assert.equal(continuation.schema, "tn12-contract-outpoint/v1");
assert.equal(continuation.network, "kaspa-testnet-12");
assert.equal(continuation.lane, "recurring-treasury-vault-continuation");
assert.equal(continuation.contract, "RecurringTreasuryVault");
assert.equal(continuation.status, "accepted-continuation-active");
assert.equal(continuation.txid, firstSpend.transactionId);
assert.equal(continuation.txid, evidence.txid);
assert.equal(continuation.outputIndex, 1);
assert.equal(continuation.amountSompi, String(firstSpend.submitPayload.transaction.outputs[1].amount));
assert.equal(continuation.scriptPublicKey, firstSpend.submitPayload.transaction.outputs[1].scriptPublicKey.scriptPublicKey);
assert.equal(continuation.covenantId, firstSpend.source.covenantId);
assert.equal(continuation.redeemScriptHex, firstSpend.scriptEvidence.nextRedeemScriptHex);
assert.equal(continuation.state.spentInWindowSompi, String(firstSpend.state.nextSpentSompi));
assert.equal(continuation.sourceEvidence.output1ContinuationAmountMatchesDraft, true);
assert.equal(continuation.sourceEvidence.output1ContinuationScriptMatchesDraft, true);
assert.equal(continuation.sourceEvidence.output1ContinuationCovenantMatchesDraft, true);

console.log("Recurring treasury vault continuation outpoint tests passed.");
