import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/blitz-mux-live-flow-evidence.json", "utf8"));

assert.equal(artifact.schema, "tn12-blitz-mux-live-flow-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "accepted-mux-route-worker-return-and-timeout");
assert.match(artifact.contractFamily.covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.acceptedFlow.length, 7);
assert.deepEqual(artifact.acceptedFlow.map((item) => item.step), [
  "family-genesis",
  "route-to-worker-a",
  "worker-a-return-to-mux",
  "route-to-worker-a-for-timeout",
  "worker-a-timeout-to-mux",
  "route-to-worker-b",
  "worker-b-return-to-mux"
]);
assert.ok(artifact.acceptedFlow.every((item) => item.status === "accepted"));
assert.equal(artifact.localChecks.routeEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.returnEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.timeoutRouteEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.timeoutEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.routeCovenantMatchesInput, true);
assert.equal(artifact.localChecks.returnCovenantMatchesInput, true);
assert.equal(artifact.localChecks.timeoutRouteCovenantMatchesInput, true);
assert.equal(artifact.localChecks.timeoutCovenantMatchesInput, true);
assert.equal(artifact.localChecks.timeoutSequenceMeetsThreshold, true);
assert.equal(artifact.localChecks.workerBRouteEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.workerBReturnEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.workerBRouteCovenantMatchesInput, true);
assert.equal(artifact.localChecks.workerBReturnCovenantMatchesInput, true);
assert.equal(artifact.acceptedFlow[1].state.nextPending, 1);
assert.equal(artifact.acceptedFlow[2].state.nextPending, 0);
assert.equal(artifact.acceptedFlow[3].state.value, 8);
assert.equal(artifact.acceptedFlow[4].state.valueBefore, 8);
assert.equal(artifact.acceptedFlow[4].state.valueAfter, 7);
assert.equal(artifact.acceptedFlow[5].state.selectedWorker, "B");
assert.equal(artifact.acceptedFlow[5].state.nextPending, 2);
assert.equal(artifact.acceptedFlow[6].state.worker, "B");
assert.equal(artifact.acceptedFlow[6].state.valueBefore, 7);
assert.equal(artifact.acceptedFlow[6].state.valueAfter, 11);

console.log("Blitz mux live flow evidence tests passed.");
