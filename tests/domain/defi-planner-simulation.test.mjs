import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiPlannerSimulation } from "../../src/defiPlannerSimulation.mjs";

const inputs = {
  backlog: await readJson("artifacts/defi-backlog.json"),
  missingRails: await readJson("artifacts/missing-rails-matrix.json"),
  oracleMatrix: await readJson("artifacts/oracle-source-matrix.json"),
  acceptedIndex: await readJson("artifacts/checkpointed-accepted-index.json"),
  walletValidation: await readJson("artifacts/wallet-submit-result-validation.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
};

const simulation = buildDefiPlannerSimulation(inputs);
assert.equal(simulation.status, "planner-only-defi-simulation-ready");
assert.equal(simulation.enforcement, "PLANNER_ONLY");
assert.equal(simulation.summary.lanes, 5);
assert.equal(simulation.summary.simulationReadyLanes, 5);
assert.equal(simulation.summary.liveProductClaims, 0);
assert.equal(simulation.summary.custodyReadyLanes, 0);
assert.equal(simulation.summary.scriptEnforcedLanes, 0);
assert.equal(simulation.summary.blockedLiveLanes, 5);
assert.equal(simulation.summary.walletPromotions, 0);
assert.equal(simulation.summary.blockedNegativeCases, 5);
assert.deepEqual(
  simulation.lanes.map((lane) => lane.id),
  ["amm", "lending", "liquidation", "oracle", "settlement"]
);
assert.ok(simulation.lanes.every((lane) =>
  lane.status === "simulation-only-blocked-live-product"
  && lane.enforcement === "PLANNER_ONLY"
  && lane.simulationReady
  && lane.liveProductBlocked
  && !lane.custodyReady
  && !lane.scriptEnforced
));
assert.ok(simulation.negativeCases.every((negativeCase) => negativeCase.status === "blocked"));

const amm = simulation.lanes.find((lane) => lane.id === "amm");
assert.ok(amm.missingRails.includes("enforced shared pool state"));
assert.ok(amm.missingRails.includes("pricing engine tied to enforceable reserves"));
assert.ok(amm.cannotClaim.includes("live Kaspa DEX"));

const lending = simulation.lanes.find((lane) => lane.id === "lending");
assert.ok(lending.missingRails.includes("collateral custody model"));
assert.ok(lending.missingRails.includes("liquidation authority"));
assert.ok(lending.oracleModels.some((model) => model.id === "cex-weighted-median"));

const liquidation = simulation.lanes.find((lane) => lane.id === "liquidation");
assert.ok(liquidation.missingRails.includes("oracle dispute window"));
assert.ok(liquidation.checks.includes("stale oracle rejection"));

const oracle = simulation.lanes.find((lane) => lane.id === "oracle");
assert.ok(oracle.oracleModels.length >= 4);
assert.ok(oracle.missingRails.includes("canonical truth source"));
assert.ok(oracle.cannotClaim.includes("oracle truth"));

const settlement = simulation.lanes.find((lane) => lane.id === "settlement");
assert.ok(settlement.acceptedInputs.records >= 40);
assert.ok(settlement.acceptedInputs.payloadEvents >= 30);
assert.ok(settlement.missingRails.includes("external signer roundtrip"));
assert.equal(settlement.indexerState, "accepted-records-replayable-from-fixtures");

const artifact = await readJson("artifacts/defi-planner-simulation.json");
assert.equal(artifact.status, simulation.status);
assert.equal(artifact.summary.lanes, simulation.summary.lanes);
assert.equal(artifact.summary.liveProductClaims, 0);
assert.equal(artifact.summary.custodyReadyLanes, 0);
assert.equal(artifact.summary.blockedNegativeCases, simulation.summary.blockedNegativeCases);

console.log("DeFi planner simulation tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
