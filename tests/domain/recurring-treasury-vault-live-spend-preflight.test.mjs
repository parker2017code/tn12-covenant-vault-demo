import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-live-spend-preflight.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-live-spend-preflight/v1");
assert.equal(artifact.status, "accepted-script-enforced-under-cap-spend");
assert.equal(artifact.checks.compiledScriptMatchesFundedRedeemScript, true);
assert.equal(artifact.checks.compiledP2shMatchesFundedScriptPublicKey, true);
assert.equal(artifact.checks.ownerSigProofPassed, true);
assert.equal(artifact.checks.rustSubmitRoutePreservesCovenantBinding, true);
assert.equal(artifact.checks.acceptedSpendRecorded, true);
assert.equal(artifact.checks.rpcDataRouteChecked, true);
assert.equal(artifact.checks.fundedOutputCovenantBound, true);
assert.equal(artifact.checks.liveUtxoCovenantIdAvailable, true);
assert.equal(artifact.checks.wrpcCovenantIdAvailable, true);
assert.match(artifact.acceptedSpend.txid, /^[0-9a-f]{64}$/);
assert.equal(artifact.rpcDataRoute.status, "rpc-data-route-covenant-id-found");
assert.equal(artifact.rpcDataRoute.fundingTransactionVersion, 1);
assert.match(artifact.constructorState.ownerXOnlyPublicKey, /^[0-9a-f]{64}$/);
assert.match(artifact.constructorState.destinationXOnlyPublicKey, /^[0-9a-f]{64}$/);
assert.equal(artifact.constructorState.capSompi, "7500000000");
assert.equal(artifact.constructorState.spentInWindowSompi, "0");
assert.equal(artifact.blockers.length, 0);
assert.match(artifact.allowedNextAction, /continuation output/);

console.log("Recurring treasury vault live spend preflight tests passed.");
