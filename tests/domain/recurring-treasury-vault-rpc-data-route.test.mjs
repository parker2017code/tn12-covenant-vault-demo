import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-rpc-data-route.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-rpc-data-route/v1");
assert.equal(artifact.status, "funded-output-not-covenant-bound");
assert.equal(artifact.checks.wrpcUtxoFound, true);
assert.equal(artifact.checks.wrpcUtxoCovenantIdAvailable, false);
assert.equal(artifact.checks.fundingTransactionFetched, true);
assert.equal(artifact.checks.fundingTransactionVersion, 0);
assert.equal(artifact.checks.fundingOutputFound, true);
assert.equal(artifact.checks.fundingOutputHasCovenantBinding, false);
assert.ok(artifact.blockers.some((item) => item.id === "funded-output-not-covenant-bound"));
assert.match(artifact.allowedNextAction, /covenant-bound funded output/);

console.log("Recurring treasury vault RPC data route tests passed.");
