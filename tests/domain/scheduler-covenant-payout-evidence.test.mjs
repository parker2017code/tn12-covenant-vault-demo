import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const evidence = await readJson("artifacts/scheduler-covenant-payout-evidence.json");

assert.equal(evidence.schema, "tn12-scheduler-covenant-payout-evidence/v1");
assert.equal(evidence.network, "kaspa-testnet-12");
assert.equal(evidence.status, "accepted-covenant-payout-spend");
assert.equal(evidence.funding.txid, "a1928dfc9434c71a759a138429dea903cc44f4df7aee61079f9b865dc4a97dab");
assert.equal(evidence.release.txid, "634873a5a55136d010ba9371c4a90da997755c8a31b7eca458d5f6756eddb986");
assert.equal(evidence.release.status, "accepted");
assert.equal(evidence.release.amountSompi, "400000000");
assert.ok(evidence.summary.scriptEnforces.includes("operator signature"));
assert.ok(evidence.summary.replayStillChecks.some((item) => /winning bid/.test(item)));
assert.ok(evidence.boundaries.some((item) => /not protocol scheduling/.test(item)));

console.log("Scheduler covenant payout evidence tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
