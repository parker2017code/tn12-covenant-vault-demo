import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = await readJson("artifacts/scheduler-covenant-payout-negative-evidence.json");

assert.equal(artifact.schema, "tn12-scheduler-covenant-payout-negative-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "local-payout-negative-candidates-passed");
assert.equal(artifact.acceptedPositivePath.release.txid, "634873a5a55136d010ba9371c4a90da997755c8a31b7eca458d5f6756eddb986");
assert.ok(artifact.cases.some((row) => row.id === "valid_scheduler_payout_passes" && row.got === true));
assert.ok(artifact.cases.some((row) => row.id === "wrong_recipient_rejects" && row.got === false));
assert.ok(artifact.cases.some((row) => row.id === "wrong_payout_amount_rejects" && row.got === false));
assert.ok(artifact.cases.some((row) => row.id === "wrong_input_value_rejects" && row.got === false));
assert.ok(artifact.cases.every((row) => row.status === "passed"));
assert.ok(artifact.doesNotProve.includes("TN12 rejected-mempool records for the negative candidates"));
assert.equal(artifact.debug, null);

console.log("Scheduler covenant payout negative evidence tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
