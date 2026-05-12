import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-state-proof.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-state-proof/v1");
assert.equal(artifact.status, "local-state-transition-proof-passed");
assert.equal(artifact.source, "contracts/probes/RecurringTreasuryVaultStateProbe.sil");
assert.equal(artifact.testFile, "fixtures/RecurringTreasuryVaultStateProbe.test.json");
assert.deepEqual(
  artifact.cases.map((item) => item.name),
  ["under_cap_continuation_pass", "over_cap_fails", "wrong_destination_fails", "missing_continuation_fails"]
);
assert.equal(artifact.cases.every((item) => item.status === "passed"), true);
assert.ok(artifact.proves.some((item) => /under-cap/.test(item)));
assert.ok(artifact.doesNotProve.some((item) => /ownerSig/.test(item)));

console.log("Recurring treasury vault state proof tests passed.");
