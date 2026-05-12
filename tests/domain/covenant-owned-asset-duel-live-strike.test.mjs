import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/covenant-owned-asset-duel-live-strike-evidence.json", "utf8"));

assert.equal(artifact.schema, "tn12-covenant-owned-asset-duel-live-strike-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "accepted-sibling-input-strike");
assert.equal(artifact.pattern.name, "ICC sibling-input authorization");
assert.deepEqual(artifact.acceptedFlow.map((item) => item.step), [
  "owner-marker-genesis",
  "asset-duel-genesis",
  "sibling-authorized-strike"
]);
assert.ok(artifact.acceptedFlow.every((item) => item.status === "accepted"));
assert.match(artifact.acceptedFlow[0].covenantId, /^[0-9a-f]{64}$/);
assert.match(artifact.acceptedFlow[1].covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.acceptedFlow[1].ownerCovenantId, artifact.acceptedFlow[0].covenantId);
assert.equal(artifact.acceptedFlow[2].covenantId, artifact.acceptedFlow[1].covenantId);
assert.equal(artifact.localChecks.strikeEngineAcceptedGeneratedSigScript, true);
assert.equal(artifact.localChecks.assetContractAccepted, true);
assert.equal(artifact.localChecks.ownerMarkerP2pkAccepted, true);
assert.equal(artifact.localChecks.outputCovenantMatchesAssetInput, true);
assert.equal(artifact.localChecks.ownerMarkerInputPresent, true);
assert.equal(artifact.acceptedFlow[2].state.powerBefore, 600);
assert.equal(artifact.acceptedFlow[2].state.spendPower, 150);
assert.equal(artifact.acceptedFlow[2].state.powerAfter, 450);
assert.ok(artifact.proves.some((item) => /two-input strike spend/.test(item)));
assert.ok(artifact.doesNotProve.includes("nested contract execution"));

console.log("Covenant-owned asset duel live strike tests passed.");
