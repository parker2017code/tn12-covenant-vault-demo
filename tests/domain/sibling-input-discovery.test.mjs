import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSiblingInputDiscovery } from "../../src/siblingInputDiscovery.mjs";

const [strikeEvidence, strikeDraft, negativeEvidence, ownerOutpoint, assetOutpoint, checkedIn] = await Promise.all([
  readJson("artifacts/covenant-owned-asset-duel-live-strike-evidence.json"),
  readJson("artifacts/signed-drafts/covenant-owned-asset-duel-live-strike.json"),
  readJson("artifacts/covenant-owned-asset-duel-live-negative-evidence.json"),
  readJson("fixtures/AssetDuelOwnerMarkerOutpoint.json"),
  readJson("fixtures/CovenantOwnedAssetDuelLiveContractOutpoint.json"),
  readJson("artifacts/sibling-input-discovery.json")
]);

const artifact = buildSiblingInputDiscovery({
  strikeEvidence,
  strikeDraft,
  negativeEvidence,
  ownerOutpoint,
  assetOutpoint,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-sibling-input-discovery/v1");
assert.equal(artifact.status, "sibling-input-discovery-ready");
assert.equal(artifact.requiredSibling.covenantId, strikeDraft.source.ownerMarkerOutpoint.covenantId);
assert.equal(artifact.requiredSibling.witnessInput, 1);
assert.equal(artifact.selectedCandidate.outpoint, `${ownerOutpoint.txid}:0`);
assert.equal(artifact.selectedCandidate.covenantId, artifact.requiredSibling.covenantId);
assert.equal(artifact.assetInput.covenantId, strikeDraft.source.assetOutpoint.covenantId);
assert.equal(artifact.acceptedStrike.txid, strikeDraft.transactionId);
assert.equal(artifact.acceptedStrike.powerBefore, 600);
assert.equal(artifact.acceptedStrike.powerAfter, 450);
assert.deepEqual(artifact.localRejectCoverage.map((item) => item.name), [
  "wrong_witness_rejects_asset_move",
  "missing_sibling_rejects_asset_move",
  "wrong_sibling_covenant_rejects_asset_move"
]);
assert.ok(artifact.localRejectCoverage.every((item) => item.status === "passed"));
assert.ok(artifact.boundaries.some((item) => /future asset moves/.test(item)));

assert.equal(checkedIn.schema, artifact.schema);
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.selectedCandidate.outpoint, artifact.selectedCandidate.outpoint);

console.log("Sibling input discovery tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
