import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-live-spend-preflight.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-live-spend-preflight/v1");
assert.equal(artifact.status, "blocked-non-covenant-funded-output");
assert.equal(artifact.checks.compiledScriptMatchesFundedRedeemScript, true);
assert.equal(artifact.checks.compiledP2shMatchesFundedScriptPublicKey, true);
assert.equal(artifact.checks.ownerSigProofPassed, true);
assert.equal(artifact.checks.rustSubmitRoutePreservesCovenantBinding, true);
assert.equal(artifact.checks.fundedOutputStillUnspent, true);
assert.equal(artifact.checks.rpcDataRouteChecked, true);
assert.equal(artifact.checks.fundedOutputCovenantBound, false);
assert.equal(artifact.checks.liveUtxoCovenantIdAvailable, false);
assert.equal(artifact.rpcDataRoute.status, "funded-output-not-covenant-bound");
assert.equal(artifact.rpcDataRoute.fundingTransactionVersion, 0);
assert.match(artifact.constructorState.ownerXOnlyPublicKey, /^[0-9a-f]{64}$/);
assert.match(artifact.constructorState.destinationXOnlyPublicKey, /^[0-9a-f]{64}$/);
assert.equal(artifact.constructorState.capSompi, "7500000000");
assert.equal(artifact.constructorState.spentInWindowSompi, "0");
assert.ok(artifact.blockers.some((item) => item.id === "funded-output-not-covenant-bound"));
assert.ok(artifact.blockers.some((item) => item.id === "live-covenant-id-unavailable"));
assert.match(artifact.allowedNextAction, /covenant-bound funded output/);

console.log("Recurring treasury vault live spend preflight tests passed.");
