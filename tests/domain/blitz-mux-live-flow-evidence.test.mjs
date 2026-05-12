import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/blitz-mux-live-flow-evidence.json", "utf8"));

assert.equal(artifact.schema, "tn12-blitz-mux-live-flow-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "accepted-mux-route-and-worker-return");
assert.match(artifact.contractFamily.covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.acceptedFlow.length, 3);
assert.deepEqual(artifact.acceptedFlow.map((item) => item.step), ["family-genesis", "route-to-worker-a", "worker-a-return-to-mux"]);
assert.ok(artifact.acceptedFlow.every((item) => item.status === "accepted"));
assert.equal(artifact.localChecks.routeEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.returnEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.routeCovenantMatchesInput, true);
assert.equal(artifact.localChecks.returnCovenantMatchesInput, true);
assert.equal(artifact.acceptedFlow[1].state.nextPending, 1);
assert.equal(artifact.acceptedFlow[2].state.nextPending, 0);

console.log("Blitz mux live flow evidence tests passed.");
