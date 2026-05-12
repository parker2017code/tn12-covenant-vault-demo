import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildTreasuryRecurringCaps } from "../../src/treasuryRecurringCaps.mjs";

const spendCaps = await readJson("artifacts/treasury-spend-caps.json");
const evidence = await readJson("artifacts/treasury-recurring-cap-under-001-evidence.json");
const recurringCaps = buildTreasuryRecurringCaps({
  spendCaps,
  underCapEvidence: evidence
});
const checkedIn = await readJson("artifacts/treasury-recurring-caps.json");

assert.equal(recurringCaps.status, "local-wallet-recurring-cap-evidence-ready");
assert.equal(recurringCaps.summary.acceptedUnderCapTxs, 1);
assert.equal(recurringCaps.summary.blockedOverCapRows, 1);
assert.equal(recurringCaps.summary.blockedCumulativeRows, 1);
assert.equal(recurringCaps.summary.scriptEnforcedRows, 0);
assert.equal(recurringCaps.window.status, "cap-window-policy-ready");
assert.equal(recurringCaps.window.spentAfterTkas, 25);
assert.equal(recurringCaps.window.remainingAfterTkas, 50);
assert.equal(recurringCaps.window.proposedSecondSpendTkas, 60);
assert.equal(recurringCaps.window.secondSpendStatus, "blocked-by-cumulative-window");
assert.equal(recurringCaps.positive.amountTkas, 25);
assert.equal(recurringCaps.positive.capTkas, 75);
assert.equal(recurringCaps.positive.status, "accepted-on-tn12-under-cap");
assert.equal(recurringCaps.positive.txid, "d9eba84e7565ba28e5631c4a3b914da93b68e77daf9279a435f9303eeb63cf65");
assert.match(recurringCaps.positive.explorerUrl, /tn12\.kaspa\.stream\/transactions\//);
assert.equal(recurringCaps.negative.status, "blocked-by-wallet-policy");
assert.equal(recurringCaps.cumulativeNegative.status, "blocked-by-cumulative-window");
assert.match(recurringCaps.boundaries.join(" "), /does not prove script-enforced recurring limits/);
assert.deepEqual(checkedIn, recurringCaps);

console.log("Treasury recurring cap tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
