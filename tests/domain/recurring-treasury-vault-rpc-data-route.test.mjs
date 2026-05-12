import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-rpc-data-route.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-rpc-data-route/v1");
assert.equal(artifact.status, "rpc-data-route-covenant-id-found");
assert.equal(artifact.checks.wrpcUtxoFound, true);
assert.equal(artifact.checks.wrpcUtxoCovenantIdAvailable, true);
assert.equal(artifact.checks.fundingTransactionFetched, true);
assert.equal(artifact.checks.fundingTransactionVersion, 1);
assert.equal(artifact.checks.fundingOutputFound, true);
assert.equal(artifact.checks.fundingOutputHasCovenantBinding, true);
assert.match(artifact.observed.fundingOutputCovenant.covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.blockers.length, 0);
assert.match(artifact.allowedNextAction, /guarded Rust live-spend/);

console.log("Recurring treasury vault RPC data route tests passed.");
