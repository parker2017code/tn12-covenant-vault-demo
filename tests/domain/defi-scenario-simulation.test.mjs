import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiScenarioSimulation } from "../../src/defiScenarioSimulation.mjs";

const simulation = buildDefiScenarioSimulation({
  fixture: await readJson("fixtures/DefiScenarioSimulation.json"),
  plannerSimulation: await readJson("artifacts/defi-planner-simulation.json"),
  acceptedIndex: await readJson("artifacts/checkpointed-accepted-index.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(simulation.status, "scenario-simulation-ready-not-live-defi");
assert.equal(simulation.enforcement, "PLANNER_ONLY");
assert.equal(simulation.summary.swaps, 2);
assert.equal(simulation.summary.executableSwapSimulations, 1);
assert.equal(simulation.summary.slippageBlockedSwaps, 1);
assert.equal(simulation.summary.oraclePrices, 2);
assert.equal(simulation.summary.freshOraclePrices, 1);
assert.equal(simulation.summary.staleOraclePrices, 1);
assert.equal(simulation.summary.lendingPositions, 3);
assert.equal(simulation.summary.safePositions, 1);
assert.equal(simulation.summary.liquidationReviewPositions, 1);
assert.equal(simulation.summary.staleOracleBlockedPositions, 1);
assert.equal(simulation.summary.liveProductClaims, 0);
assert.equal(simulation.summary.custodyActions, 0);
assert.equal(simulation.summary.acceptedReferencesIndexed, simulation.summary.acceptedReferences);

const okSwap = simulation.amm.swaps.find((swap) => swap.id === "swap-ok-001");
assert.equal(okSwap.expectedOutputUnits, "987158034");
assert.equal(okSwap.status, "simulated-fill-ok");
assert.equal(okSwap.minOutputMet, true);
assert.equal(okSwap.settlementReady, false);

const blockedSwap = simulation.amm.swaps.find((swap) => swap.id === "swap-slippage-blocked-001");
assert.equal(blockedSwap.expectedOutputUnits, "987158034");
assert.equal(blockedSwap.status, "blocked-min-output");
assert.equal(blockedSwap.minOutputMet, false);

const freshOracle = simulation.oracle.prices.find((price) => price.id === "oracle-fresh-tkas");
assert.equal(freshOracle.status, "fresh-review-only");
assert.equal(freshOracle.custodyReady, false);

const staleOracle = simulation.oracle.prices.find((price) => price.id === "oracle-stale-tkas");
assert.equal(staleOracle.status, "stale-block-custody");

const safe = simulation.lending.positions.find((position) => position.id === "lend-safe-001");
assert.equal(safe.healthFactorBps, "16250");
assert.equal(safe.status, "healthy-review-only");
assert.equal(safe.liquidationExecutable, false);

const review = simulation.lending.positions.find((position) => position.id === "lend-liquidation-review-001");
assert.equal(review.healthFactorBps, "7222");
assert.equal(review.status, "liquidation-review-only");

const stale = simulation.lending.positions.find((position) => position.id === "lend-stale-oracle-blocked-001");
assert.equal(stale.oracleStatus, "stale-block-custody");
assert.equal(stale.status, "blocked-stale-oracle");

assert.ok(simulation.negativeCases.some((item) => item.id === "swap-below-min-output"));
assert.ok(simulation.negativeCases.some((item) => item.id === "lending-stale-oracle"));
assert.ok(simulation.negativeCases.every((item) => item.status === "blocked"));

const artifact = await readJson("artifacts/defi-scenario-simulation.json");
assert.equal(artifact.status, simulation.status);
assert.equal(artifact.summary.swaps, simulation.summary.swaps);
assert.equal(artifact.summary.acceptedReferencesIndexed, simulation.summary.acceptedReferencesIndexed);

console.log("DeFi scenario simulation tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
