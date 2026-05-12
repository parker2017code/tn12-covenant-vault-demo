import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-window-reset-proof.json", "utf8"));
const resetEvidence = JSON.parse(await readFile("artifacts/recurring-treasury-vault-window-reset-evidence.json", "utf8"));
const resetDraft = JSON.parse(await readFile("artifacts/signed-drafts/recurring-treasury-vault-window-reset.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-window-reset-proof/v1");
assert.equal(artifact.status, "accepted-window-reset-with-local-negatives");
assert.equal(artifact.contract, "contracts/RecurringTreasuryVaultWindow.sil");
assert.equal(artifact.accepted.resetTxid, "f99bb6f6552beac976b770448ef2d75748b4d7fbf66932e1156ea41493978759");
assert.equal(resetEvidence.status, "accepted-script-enforced-window-reset");
assert.equal(resetDraft.status, "signed-local-engine-passed-not-broadcast");
assert.equal(resetDraft.mode, "reset");
assert.equal(resetDraft.state.prevSpentSompi, 6500000000);
assert.equal(resetDraft.state.spendAmountSompi, 4000000000);
assert.equal(resetDraft.state.nextSpentSompi, 4000000000);
assert.equal(resetDraft.state.nextWindow, 9900000);
assert.equal(resetDraft.state.lockTime, 9900000);
assert.equal(artifact.negativeCases.length, 3);
assert.ok(artifact.negativeCases.every((item) => item.status === "blocked-local-engine-failed"));
assert.ok(artifact.negativeCases.every((item) => item.localEngineAcceptedGeneratedSigScript === false));
assert.ok(/normal app server/.test(artifact.cryptoPoint));
assert.ok(/Fast UTXO/.test(artifact.kaspaEdge));
assert.ok(artifact.doesNotProve.includes("wallet-standard user signing"));

console.log("Recurring treasury vault window reset proof tests passed.");
