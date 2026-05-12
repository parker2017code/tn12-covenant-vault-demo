import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildCovenantExperimentMap } from "../../src/covenantExperimentMap.mjs";

const map = buildCovenantExperimentMap({ generatedAt: "2026-05-12T00:00:00.000Z" });

assert.equal(map.schema, "tn12-covenant-experiment-map/v1");
assert.equal(map.status, "experiment-map-ready");
assert.equal(map.summary.experiments, 6);
assert.equal(map.summary.spotlight, 3);
assert.equal(map.summary.buildFirst, 0);
assert.equal(map.summary.blockedBeforeLiveSubmit, 1);
assert.equal(map.summary.scriptEnforcedClaims, 0);
assert.deepEqual(map.showMichaelFirst, ["blitz-mux-arena", "treasury-wars", "covenant-owned-asset-game"]);
assert.ok(map.experiments.some((item) => item.id === "treasury-wars" && item.status === "blocked-before-live-submit"));
assert.ok(map.experiments.some((item) => item.id === "covenant-heist" && /wrong signer/.test(item.websitePitch)));
assert.ok(map.experiments.some((item) => item.id === "blitz-mux-arena" && /fast multi-transaction/.test(item.whyItMatters)));
assert.equal(map.summary.localProofs, 2);
assert.ok(map.experiments.some((item) => item.id === "blitz-mux-arena" && item.status === "local-proof-passed" && item.currentRepoEvidence.includes("artifacts/blitz-mux-arena-proof.json")));
assert.ok(map.experiments.some((item) => item.id === "covenant-owned-asset-game" && /ICC/.test(item.covenantPattern) && item.status === "local-proof-passed"));
assert.ok(map.experiments.every((item) => item.currentRepoEvidence.length > 0));
assert.ok(map.experiments.every((item) => item.hardBoundary.length > 20));

const checkedIn = JSON.parse(await readFile("artifacts/covenant-experiment-map.json", "utf8"));
assert.equal(checkedIn.schema, map.schema);
assert.equal(checkedIn.summary.experiments, map.summary.experiments);
assert.deepEqual(checkedIn.showMichaelFirst, map.showMichaelFirst);

console.log("Covenant experiment map tests passed.");
