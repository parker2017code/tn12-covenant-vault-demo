import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-owner-sig-proof.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-owner-sig-proof/v1");
assert.equal(artifact.status, "local-owner-sig-covenant-proof-passed");
assert.equal(artifact.source, "contracts/RecurringTreasuryVault.sil");
assert.deepEqual(
  artifact.cases.map((item) => item.name),
  [
    "under_cap_owner_sig_continuation_pass",
    "over_cap_owner_sig_fails",
    "wrong_destination_owner_sig_fails",
    "missing_continuation_owner_sig_fails"
  ]
);
assert.equal(artifact.cases.every((item) => item.status === "passed"), true);
assert.ok(artifact.proves.some((item) => /owner signature/.test(item)));
assert.ok(artifact.doesNotProve.some((item) => /accepted TN12 spend/.test(item)));

console.log("Recurring treasury vault ownerSig proof tests passed.");
