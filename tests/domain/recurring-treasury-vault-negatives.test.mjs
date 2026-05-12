import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildRecurringTreasuryVaultNegatives } from "../../src/recurringTreasuryVaultNegatives.mjs";

const status = JSON.parse(await readFile("artifacts/recurring-treasury-vault-status.json", "utf8"));
const checkedIn = JSON.parse(await readFile("artifacts/recurring-treasury-vault-negative-map.json", "utf8"));
const rebuilt = buildRecurringTreasuryVaultNegatives({ status });

assert.deepEqual(checkedIn, rebuilt);
assert.equal(rebuilt.status, "negative-candidate-map-ready");
assert.equal(rebuilt.summary.candidates, 5);
assert.equal(rebuilt.summary.blockedCandidates, 5);
assert.equal(rebuilt.summary.submittedRejections, 0);
assert.ok(rebuilt.rows.some((row) => row.id === "wrong-owner-signature" && /checkSig/.test(row.expectedFailure)));
assert.ok(rebuilt.rows.some((row) => row.id === "wrong-destination" && /ScriptPubKeyP2PK/.test(row.expectedFailure)));
assert.ok(rebuilt.rows.some((row) => row.id === "over-cap" && /<= cap/.test(row.expectedFailure)));
assert.ok(rebuilt.rows.some((row) => row.id === "missing-continuation" && /validateOutputState/.test(row.expectedFailure)));
assert.match(rebuilt.nextStep, /fresh expendable contract outputs/);

console.log("Recurring treasury vault negative map tests passed.");
