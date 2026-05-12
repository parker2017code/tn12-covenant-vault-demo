import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/covenant-owned-asset-duel-live-negative-evidence.json", "utf8"));

assert.equal(artifact.schema, "tn12-covenant-owned-asset-duel-live-negative-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "local-live-id-negative-candidates-passed");
assert.match(artifact.acceptedPositivePath.ownerMarker.covenantId, /^[0-9a-f]{64}$/);
assert.match(artifact.acceptedPositivePath.assetGenesis.covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.acceptedPositivePath.siblingAuthorizedStrike.status, "accepted");
assert.equal(artifact.cases.length, 4);
assert.ok(artifact.cases.every((item) => item.status === "passed"));
assert.ok(artifact.cases.some((item) => item.name === "sibling_covenant_authorizes_asset_move" && item.got === true));
assert.ok(artifact.cases.some((item) => item.name === "wrong_witness_rejects_asset_move" && item.got === false));
assert.ok(artifact.cases.some((item) => item.name === "missing_sibling_rejects_asset_move" && item.got === false));
assert.ok(artifact.cases.some((item) => item.name === "wrong_sibling_covenant_rejects_asset_move" && item.got === false));
assert.ok(/not broadcast/i.test(artifact.candidateScope));
assert.ok(artifact.doesNotProve.includes("TN12 rejected-mempool records for the negative candidates"));

console.log("Covenant-owned asset duel live negative tests passed.");
