import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiAdvancedSimulation } from "../../src/defiAdvancedSimulation.mjs";

const advanced = buildDefiAdvancedSimulation({
  fixture: await readJson("fixtures/DefiAdvancedSimulation.json"),
  scenario: await readJson("artifacts/defi-scenario-simulation.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(advanced.status, "advanced-simulation-ready-not-custody");
assert.equal(advanced.enforcement, "PLANNER_ONLY");
assert.equal(advanced.summary.ammActions, 4);
assert.equal(advanced.summary.ammReviewActions, 2);
assert.equal(advanced.summary.ammBlockedActions, 2);
assert.equal(advanced.summary.priceImpactRows, 3);
assert.equal(advanced.summary.oracleFailureCases, 6);
assert.equal(advanced.summary.oracleBlockedCases, 5);
assert.equal(advanced.summary.oracleReviewOnlyCases, 1);
assert.equal(advanced.summary.lendingSweeps, 5);
assert.equal(advanced.summary.lendingHealthyOrBoundary, 2);
assert.equal(advanced.summary.lendingLiquidationReview, 1);
assert.equal(advanced.summary.lendingBlocked, 2);
assert.equal(advanced.summary.liveProductClaims, 0);
assert.equal(advanced.summary.custodyActions, 0);

const balancedAdd = advanced.amm.liquidityActions.find((action) => action.id === "lp-add-balanced-001");
assert.equal(balancedAdd.status, "review-state-promoted");
assert.equal(balancedAdd.mintedShares, "1000000000");
assert.equal(balancedAdd.invariantNonDecreasing, true);

const imbalancedAdd = advanced.amm.liquidityActions.find((action) => action.id === "lp-add-imbalanced-blocked-001");
assert.equal(imbalancedAdd.status, "blocked");
assert.equal(imbalancedAdd.mintedShares, "0");
assert.equal(imbalancedAdd.reason, "imbalanced liquidity add");

const remove = advanced.amm.liquidityActions.find((action) => action.id === "lp-remove-001");
assert.equal(remove.status, "review-state-promoted");
assert.equal(remove.baseOut, "500000000");
assert.equal(remove.quoteOut, "500000000");

const mutation = advanced.amm.liquidityActions.find((action) => action.id === "reserve-mutation-blocked-001");
assert.equal(mutation.status, "blocked");
assert.match(mutation.reason, /reserve mutation/);

assert.deepEqual(
  advanced.amm.priceImpactRows.map((row) => row.priceImpactBps),
  [9, 99, 909]
);

const stale = advanced.oracleFailures.find((failure) => failure.id === "oracle-stale-feed");
assert.equal(stale.status, "blocked");
assert.equal(stale.checks.stale, true);

const conflict = advanced.oracleFailures.find((failure) => failure.id === "oracle-conflicting-feed");
assert.equal(conflict.status, "blocked");
assert.equal(conflict.checks.conflict, true);

const missingQuorum = advanced.oracleFailures.find((failure) => failure.id === "oracle-missing-quorum");
assert.equal(missingQuorum.status, "blocked");
assert.equal(missingQuorum.checks.quorumMet, false);

const freshNotTruth = advanced.oracleFailures.find((failure) => failure.id === "oracle-fresh-not-truth");
assert.equal(freshNotTruth.status, "review-only");
assert.equal(freshNotTruth.checks.freshButNotTruth, true);

assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-safe").status, "healthy-review-only");
assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-boundary").status, "boundary-review-only");
assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-boundary").healthFactorBps, "10000");
assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-liquidation-review").status, "liquidation-review-only");
assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-liquidation-review").liquidationExecutable, false);
assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-stale-oracle-blocked").status, "oracle-blocked");
assert.equal(advanced.lendingSweeps.find((sweep) => sweep.id === "sweep-manipulated-oracle-blocked").status, "oracle-blocked");

const artifact = await readJson("artifacts/defi-advanced-simulation.json");
assert.equal(artifact.status, advanced.status);
assert.equal(artifact.summary.ammBlockedActions, advanced.summary.ammBlockedActions);
assert.equal(artifact.summary.oracleBlockedCases, advanced.summary.oracleBlockedCases);
assert.equal(artifact.summary.lendingBlocked, advanced.summary.lendingBlocked);

console.log("DeFi advanced simulation tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
