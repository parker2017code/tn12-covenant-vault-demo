import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/covenant-owned-asset-duel-proof.json", "utf8"));

assert.equal(artifact.schema, "tn12-covenant-owned-asset-duel-proof/v1");
assert.equal(artifact.status, "local-icc-sibling-proof-passed");
assert.equal(artifact.source, "contracts/CovenantOwnedAssetDuel.sil");
assert.equal(artifact.pattern, "ICC sibling-input authorization");
assert.equal(artifact.cases.length, 4);
assert.ok(artifact.cases.every((item) => item.status === "passed"));
assert.ok(artifact.cases.some((item) => item.name === "sibling_covenant_authorizes_asset_move" && item.got === true));
assert.ok(artifact.cases.some((item) => item.name === "missing_sibling_rejects_asset_move" && item.got === false));
assert.ok(artifact.proves.some((item) => /sibling input/.test(item)));
assert.ok(artifact.doesNotProve.includes("accepted TN12 broadcast"));

console.log("Covenant-owned asset duel proof tests passed.");
