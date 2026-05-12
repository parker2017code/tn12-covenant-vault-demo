import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildCovenantExperimentMap } from "../../src/covenantExperimentMap.mjs";

const map = buildCovenantExperimentMap({ generatedAt: "2026-05-12T00:00:00.000Z" });

assert.equal(map.schema, "tn12-covenant-experiment-map/v1");
assert.equal(map.status, "experiment-map-ready");
assert.equal(map.summary.experiments, 6);
assert.equal(map.summary.spotlight, 3);
assert.equal(map.summary.buildFirst, 0);
assert.equal(map.summary.blockedBeforeLiveSubmit, 0);
assert.equal(map.summary.genesisFundingDrafts, 0);
assert.equal(map.summary.scriptEnforcedClaims, 3);
assert.equal(map.summary.acceptedGenesisPreflights, 1);
assert.deepEqual(map.spotlight, ["blitz-mux-arena", "treasury-wars", "covenant-owned-asset-game"]);
assert.ok(map.experiments.some((item) => item.id === "treasury-wars" && item.status === "accepted-cumulative-cap-proof"));
assert.ok(map.experiments.some((item) => item.id === "covenant-heist" && /wrong signer/.test(item.websitePitch)));
assert.ok(map.experiments.some((item) => item.id === "blitz-mux-arena" && /fast multi-transaction/.test(item.whyItMatters)));
assert.equal(map.summary.localProofs, 0);
assert.ok(map.experiments.some((item) => item.id === "blitz-mux-arena" && item.status === "accepted-mux-route-and-worker-return" && item.currentRepoEvidence.includes("artifacts/blitz-mux-live-flow-evidence.json")));
assert.ok(map.experiments.some((item) => item.id === "covenant-owned-asset-game" && /ICC/.test(item.covenantPattern) && item.status === "accepted-genesis-funded-preflight"));
assert.ok(map.experiments.every((item) => item.currentRepoEvidence.length > 0));
assert.ok(map.experiments.every((item) => item.hardBoundary.length > 20));

const checkedIn = JSON.parse(await readFile("artifacts/covenant-experiment-map.json", "utf8"));
assert.equal(checkedIn.schema, map.schema);
assert.equal(checkedIn.summary.experiments, map.summary.experiments);
assert.deepEqual(checkedIn.spotlight, map.spotlight);

console.log("Covenant experiment map tests passed.");
