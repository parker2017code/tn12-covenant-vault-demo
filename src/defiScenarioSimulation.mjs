const TOKEN_SCALE = 100000000n;

export function buildDefiScenarioSimulation({
  fixture = {},
  plannerSimulation = {},
  acceptedIndex = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const oracle = buildOracleState(fixture.oracle || {});
  const swaps = buildSwapScenarios(fixture.amm || {});
  const positions = buildLendingPositions(fixture.lending || {}, oracle.pricesById);
  const acceptedTxids = new Set((acceptedIndex.records || []).map((record) => record.txid));
  const acceptedReferences = [
    ...swaps.map((swap) => ({ id: swap.id, txid: swap.acceptedIntentTxid })),
    ...positions.map((position) => ({ id: position.id, txid: position.acceptedPositionTxid })),
    ...oracle.prices.map((price) => ({ id: price.id, txid: price.acceptedUpdateTxid }))
  ].map((item) => ({
    ...item,
    acceptedIndexed: item.txid ? acceptedTxids.has(item.txid) : false
  }));
  const negativeCases = buildNegativeCases({ swaps, positions, oracle });

  return {
    schema: "tn12-defi-scenario-simulation/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "scenario-simulation-ready-not-live-defi",
    enforcement: "PLANNER_ONLY",
    summary: {
      swaps: swaps.length,
      executableSwapSimulations: swaps.filter((swap) => swap.status === "simulated-fill-ok").length,
      slippageBlockedSwaps: swaps.filter((swap) => swap.status === "blocked-min-output").length,
      oraclePrices: oracle.prices.length,
      freshOraclePrices: oracle.prices.filter((price) => price.status === "fresh-review-only").length,
      staleOraclePrices: oracle.prices.filter((price) => price.status === "stale-block-custody").length,
      lendingPositions: positions.length,
      safePositions: positions.filter((position) => position.status === "healthy-review-only").length,
      liquidationReviewPositions: positions.filter((position) => position.status === "liquidation-review-only").length,
      staleOracleBlockedPositions: positions.filter((position) => position.status === "blocked-stale-oracle").length,
      acceptedReferences: acceptedReferences.length,
      acceptedReferencesIndexed: acceptedReferences.filter((item) => item.acceptedIndexed).length,
      liveProductClaims: 0,
      custodyActions: 0,
      blockedNegativeCases: negativeCases.filter((item) => item.status === "blocked").length
    },
    inputs: {
      plannerSimulationStatus: String(plannerSimulation.status || ""),
      acceptedIndexStatus: String(acceptedIndex.status || "")
    },
    amm: {
      poolId: String(fixture.amm?.poolId || ""),
      baseSymbol: String(fixture.amm?.baseSymbol || "BASE"),
      quoteSymbol: String(fixture.amm?.quoteSymbol || "QUOTE"),
      baseReserveUnits: String(fixture.amm?.baseReserveUnits || "0"),
      quoteReserveUnits: String(fixture.amm?.quoteReserveUnits || "0"),
      feeBps: Number(fixture.amm?.feeBps || 0),
      swaps
    },
    oracle: {
      maxAgeSeconds: oracle.maxAgeSeconds,
      prices: oracle.prices
    },
    lending: {
      positions
    },
    acceptedReferences,
    negativeCases,
    promotionRule: [
      "A simulated swap can become a settlement claim only when reserve state and min-output enforcement are tied to a signed and accepted transaction path.",
      "A simulated lending position can become a custody claim only when collateral custody, borrow accounting, oracle challenge, and liquidation authority are enforceable.",
      "A fresh oracle value can drive review prompts; it cannot move funds unless stale/wrong-data handling and dispute policy are enforced.",
      "Every custody-moving action remains blocked until external signer review, accepted txid replay, rollback behavior, and security review all pass."
    ],
    boundaries: [
      "This artifact computes deterministic DeFi scenarios from fixture inputs and accepted receipt references.",
      "It does not custody funds, update pool reserves on TN12, lend assets, liquidate positions, or prove oracle truth.",
      "Accepted txids are used as replayable evidence inputs only; app semantics remain planner/indexer-derived."
    ]
  };
}

function buildOracleState(oracleFixture) {
  const maxAgeSeconds = Number(oracleFixture.maxAgeSeconds || 0);
  const prices = (oracleFixture.prices || []).map((price) => {
    const ageSeconds = Number(price.ageSeconds || 0);
    return {
      id: String(price.id || ""),
      symbol: String(price.symbol || ""),
      priceCents: String(price.priceCents || "0"),
      ageSeconds,
      maxAgeSeconds,
      sourceModelId: String(price.sourceModelId || ""),
      acceptedUpdateTxid: String(price.acceptedUpdateTxid || ""),
      status: ageSeconds <= maxAgeSeconds ? "fresh-review-only" : "stale-block-custody",
      custodyReady: false
    };
  });

  return {
    maxAgeSeconds,
    prices,
    pricesById: new Map(prices.map((price) => [price.id, price]))
  };
}

function buildSwapScenarios(ammFixture) {
  const baseReserve = BigInt(ammFixture.baseReserveUnits || 0);
  const quoteReserve = BigInt(ammFixture.quoteReserveUnits || 0);
  const feeBps = BigInt(ammFixture.feeBps || 0);
  const baseSymbol = String(ammFixture.baseSymbol || "BASE");
  const quoteSymbol = String(ammFixture.quoteSymbol || "QUOTE");

  return (ammFixture.swaps || []).map((swap) => {
    const inputUnits = BigInt(swap.inputUnits || 0);
    const minOutputUnits = BigInt(swap.minOutputUnits || 0);
    const inputSymbol = String(swap.inputSymbol || "");
    const inputReserve = inputSymbol === baseSymbol ? baseReserve : quoteReserve;
    const outputReserve = inputSymbol === baseSymbol ? quoteReserve : baseReserve;
    const outputSymbol = inputSymbol === baseSymbol ? quoteSymbol : baseSymbol;
    const outputUnits = constantProductOutput({ inputUnits, inputReserve, outputReserve, feeBps });
    const minOutputMet = outputUnits >= minOutputUnits;

    return {
      id: String(swap.id || ""),
      inputSymbol,
      outputSymbol,
      inputUnits: inputUnits.toString(),
      expectedOutputUnits: outputUnits.toString(),
      minOutputUnits: minOutputUnits.toString(),
      feeBps: Number(feeBps),
      priceImpactBps: priceImpactBps({ inputUnits, inputReserve }),
      minOutputMet,
      status: minOutputMet ? "simulated-fill-ok" : "blocked-min-output",
      acceptedIntentTxid: String(swap.acceptedIntentTxid || ""),
      custodyReady: false,
      settlementReady: false
    };
  });
}

function buildLendingPositions(lendingFixture, pricesById) {
  return (lendingFixture.positions || []).map((position) => {
    const price = pricesById.get(position.oraclePriceId);
    const collateralUnits = BigInt(position.collateralUnits || 0);
    const debtCents = BigInt(position.debtCents || 0);
    const liquidationThresholdBps = BigInt(position.liquidationThresholdBps || 0);
    const priceCents = BigInt(price?.priceCents || 0);
    const collateralValueCents = (collateralUnits * priceCents) / TOKEN_SCALE;
    const liquidationValueCents = (collateralValueCents * liquidationThresholdBps) / 10000n;
    const healthFactorBps = debtCents > 0n ? (liquidationValueCents * 10000n) / debtCents : 0n;
    const staleOracle = !price || price.status === "stale-block-custody";
    const status = staleOracle
      ? "blocked-stale-oracle"
      : healthFactorBps < 10000n
      ? "liquidation-review-only"
      : "healthy-review-only";

    return {
      id: String(position.id || ""),
      collateralSymbol: String(position.collateralSymbol || ""),
      collateralUnits: collateralUnits.toString(),
      collateralValueCents: collateralValueCents.toString(),
      debtCents: debtCents.toString(),
      liquidationThresholdBps: Number(liquidationThresholdBps),
      liquidationValueCents: liquidationValueCents.toString(),
      healthFactorBps: healthFactorBps.toString(),
      oraclePriceId: String(position.oraclePriceId || ""),
      oracleStatus: price?.status || "missing-oracle",
      status,
      acceptedPositionTxid: String(position.acceptedPositionTxid || ""),
      custodyReady: false,
      liquidationExecutable: false
    };
  });
}

function buildNegativeCases({ swaps, positions, oracle }) {
  const cases = [];
  if (swaps.some((swap) => swap.status === "blocked-min-output")) {
    cases.push({
      id: "swap-below-min-output",
      status: "blocked",
      reason: "Simulated output is below user minOutput; settlement must not be promoted."
    });
  }
  if (positions.some((position) => position.status === "blocked-stale-oracle")) {
    cases.push({
      id: "lending-stale-oracle",
      status: "blocked",
      reason: "Oracle price is stale; custody-moving lending or liquidation action must pause."
    });
  }
  if (positions.some((position) => position.status === "liquidation-review-only")) {
    cases.push({
      id: "liquidation-without-authority",
      status: "blocked",
      reason: "Health factor is below threshold, but no enforceable liquidation authority exists."
    });
  }
  if (oracle.prices.some((price) => price.status === "fresh-review-only")) {
    cases.push({
      id: "fresh-oracle-is-not-truth",
      status: "blocked",
      reason: "Fresh source data can drive review prompts, not oracle-truth or automatic settlement claims."
    });
  }
  cases.push({
    id: "accepted-receipt-is-not-custody",
    status: "blocked",
    reason: "Accepted TN12 receipt references prove replay inputs, not custody or live DeFi."
  });
  return cases;
}

function constantProductOutput({ inputUnits, inputReserve, outputReserve, feeBps }) {
  if (inputUnits <= 0n || inputReserve <= 0n || outputReserve <= 0n) return 0n;
  const inputAfterFee = inputUnits * (10000n - feeBps);
  return (inputAfterFee * outputReserve) / ((inputReserve * 10000n) + inputAfterFee);
}

function priceImpactBps({ inputUnits, inputReserve }) {
  if (inputUnits <= 0n || inputReserve <= 0n) return 0;
  return Number((inputUnits * 10000n) / (inputReserve + inputUnits));
}
