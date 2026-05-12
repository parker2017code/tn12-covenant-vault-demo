import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const status = JSON.parse(await readFile("artifacts/recurring-treasury-vault-status.json", "utf8"));

assert.equal(status.schema, "tn12-recurring-treasury-vault-status/v1");
assert.match(status.status, /^script-(compiled-not-submitted|funded-not-spent)$/);
assert.equal(status.contract, "contracts/RecurringTreasuryVault.sil");
assert.match(status.currentEvidence.acceptedWalletPolicyTxid, /^[0-9a-f]{64}$/);
if (status.currentEvidence.acceptedContractFunding) {
  assert.match(status.currentEvidence.acceptedContractFunding.txid, /^[0-9a-f]{64}$/);
  assert.equal(status.currentEvidence.acceptedContractFunding.outputIndex, 0);
  assert.equal(status.currentEvidence.acceptedContractFunding.amountTkas, 150);
}
assert.ok(status.compiledBytes > 1000);
assert.ok(status.scriptIntendedEnforcement.includes("amount plus prior window spend cannot exceed cap"));
assert.ok(status.scriptIntendedEnforcement.includes("remaining value must relock through validateOutputState"));
assert.equal(status.negativeCandidates.length, 5);
assert.match(status.promotionRule, /Do not label recurring caps SCRIPT_ENFORCED/);

console.log("Recurring treasury vault status tests passed.");
