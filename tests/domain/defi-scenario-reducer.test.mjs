import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiScenarioReducer } from "../../src/defiScenarioReducer.mjs";

const scenario = await readJson("artifacts/defi-scenario-simulation.json");
const acceptedActivity = await readJson("artifacts/defi-accepted-activity-ledger.json");
const reducer = buildDefiScenarioReducer({
  scenario,
  acceptedActivity,
  duplicateCandidates: [
    {
      id: "swap-ok-001",
      txid: "8e3911ac9bd6d65e81e77a0ce69554ba3259f44c3846f026a64ed3f8e03e0807"
    }
  ],
  missingCandidates: [
    {
      id: "swap-missing-accepted-reference",
      txid: "missing-defi-scenario-txid"
    }
  ],
  custodyPromotionCandidates: [
    {
      id: "lend-safe-001",
      txid: "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa",
      requestedAction: "custody-promotion"
    },
    {
      id: "lend-liquidation-review-001",
      txid: "8dcda29ef07f3bc2ab799241ecbe932b98f003cd37839357ae14830bfa3c6e39",
      requestedAction: "custody-promotion"
    }
  ],
  withdrawalCandidates: [
    {
      id: "pool-over-withdraw-001",
      address: acceptedActivity.pool.address,
      amountSompi: "999999999999999",
      requestedAction: "withdraw-execute"
    },
    {
      id: "unknown-wallet-withdraw-001",
      address: "kaspatest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      amountSompi: "100000000",
      requestedAction: "withdraw-execute"
    }
  ],
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(reducer.status, "scenario-reducer-ready-not-custody");
assert.equal(reducer.enforcement, "INDEXER_DERIVED");
assert.equal(reducer.summary.stateRows, 7);
assert.equal(reducer.summary.promotedReviewRows, 3);
assert.equal(reducer.summary.blockedScenarioRows, 4);
assert.equal(reducer.summary.swapRows, 2);
assert.equal(reducer.summary.oracleRows, 2);
assert.equal(reducer.summary.lendingRows, 3);
assert.equal(reducer.summary.balanceRows, 22);
assert.equal(reducer.summary.blockedBalanceRows, 4);
assert.equal(reducer.summary.negativeRows, 6);
assert.equal(reducer.summary.blockedNegativeRows, 6);
assert.equal(reducer.summary.custodyPromotions, 0);
assert.equal(reducer.summary.balanceCustodyPromotions, 0);
assert.equal(reducer.summary.liveProductClaims, 0);

const okSwap = reducer.state.swaps.find((row) => row.id === "swap-ok-001");
assert.equal(okSwap.promotionState, "review-state-promoted");
assert.deepEqual(okSwap.problems, []);
assert.equal(okSwap.custodyAction, false);

const blockedSwap = reducer.state.swaps.find((row) => row.id === "swap-slippage-blocked-001");
assert.equal(blockedSwap.promotionState, "blocked-review");
assert.ok(blockedSwap.problems.includes("min output not met"));

const freshOracle = reducer.state.oraclePrices.find((row) => row.id === "oracle-fresh-tkas");
assert.equal(freshOracle.promotionState, "review-state-promoted");

const staleOracle = reducer.state.oraclePrices.find((row) => row.id === "oracle-stale-tkas");
assert.equal(staleOracle.promotionState, "blocked-review");
assert.ok(staleOracle.problems.includes("stale oracle price"));

const safeLending = reducer.state.lendingPositions.find((row) => row.id === "lend-safe-001");
assert.equal(safeLending.promotionState, "review-state-promoted");

const liquidationReview = reducer.state.lendingPositions.find((row) => row.id === "lend-liquidation-review-001");
assert.equal(liquidationReview.promotionState, "blocked-review");
assert.ok(liquidationReview.problems.includes("liquidation review is not executable"));

const staleLending = reducer.state.lendingPositions.find((row) => row.id === "lend-stale-oracle-blocked-001");
assert.equal(staleLending.promotionState, "blocked-review");
assert.ok(staleLending.problems.includes("stale oracle blocks position"));

const poolBalance = reducer.state.balances.find((row) => row.address === acceptedActivity.pool.address);
assert.equal(poolBalance.balanceTkas, "56");
assert.equal(poolBalance.custodyAction, false);
assert.equal(poolBalance.promotionState, "review-state-promoted");

const partialFundingDelta = reducer.state.balances.find((row) =>
  row.address === "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt"
);
assert.equal(partialFundingDelta.promotionState, "blocked-review");
assert.ok(partialFundingDelta.problems.includes("negative net delta from selected transfer rows"));

const playgroundPoolBalance = reducer.state.balances.find((row) => row.address === "kaspatest:qpa69mcl63hffd8lral24ycnzt8spvdxr8wxvaxh0m52rhtzwfq5vythc2ehg");
assert.equal(playgroundPoolBalance.balanceTkas, "30");
assert.equal(playgroundPoolBalance.promotionState, "review-state-promoted");

const playgroundUserB = reducer.state.balances.find((row) => row.address === "kaspatest:qps6e65f6567rsexvulkkh5yvqa497xu0grnw463dqx2knft6s9muelu4j7dt");
assert.equal(playgroundUserB.balanceTkas, "8");
assert.equal(playgroundUserB.promotionState, "review-state-promoted");

const playgroundUserA = reducer.state.balances.find((row) => row.address === "kaspatest:qq3zk3cjp8tnzpduk69586qj8jkr3zxfezk2c2mew7r5edsvjfq4vwspyz9wr");
assert.equal(playgroundUserA.balanceTkas, "7");
assert.equal(playgroundUserA.promotionState, "review-state-promoted");

assert.ok(reducer.negativeRows.some((row) => row.kind === "duplicate-candidate" && row.status === "blocked"));
assert.ok(reducer.negativeRows.some((row) => row.kind === "missing-reference-candidate" && row.status === "blocked"));
assert.equal(
  reducer.negativeRows.filter((row) => row.kind === "custody-promotion-candidate" && row.status === "blocked").length,
  2
);
assert.equal(
  reducer.negativeRows.filter((row) => row.kind === "withdrawal-candidate" && row.status === "blocked").length,
  2
);

const artifact = await readJson("artifacts/defi-scenario-reducer.json");
assert.equal(artifact.status, reducer.status);
assert.equal(artifact.summary.stateRows, reducer.summary.stateRows);
assert.equal(artifact.summary.balanceRows, reducer.summary.balanceRows);
assert.equal(artifact.summary.blockedBalanceRows, reducer.summary.blockedBalanceRows);
assert.equal(artifact.summary.blockedNegativeRows, reducer.summary.blockedNegativeRows);

console.log("DeFi scenario reducer tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
