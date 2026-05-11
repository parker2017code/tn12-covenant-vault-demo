const TOKEN_SCALE = 100000000n;

export function buildDefiAdvancedSimulation({
  fixture = {},
  scenario = {},
  reducer = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const oracleFailures = (fixture.oracleFailures || []).map(evaluateOracleFailure);
  const oracleById = new Map(oracleFailures.map((failure) => [failure.id, failure]));
  const amm = evaluateAmm(fixture.amm || {});
  const lendingSweeps = (fixture.lendingSweeps || []).map((sweep) => evaluateLendingSweep(sweep, oracleById));
  const blockedOracleFailures = oracleFailures.filter((failure) => failure.status === "blocked");
  const blockedAmmActions = amm.liquidityActions.filter((action) => action.status === "blocked");
  const blockedLendingSweeps = lendingSweeps.filter((sweep) => sweep.status.endsWith("-blocked"));

  return {
    schema: "tn12-defi-advanced-simulation/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: blockedOracleFailures.length >= 5
      && blockedAmmActions.length >= 2
      && blockedLendingSweeps.length >= 2
      ? "advanced-simulation-ready-not-custody"
      : "advanced-simulation-review",
    enforcement: "PLANNER_ONLY",
    summary: {
      ammActions: amm.liquidityActions.length,
      ammReviewActions: amm.liquidityActions.filter((action) => action.status === "review-state-promoted").length,
      ammBlockedActions: blockedAmmActions.length,
      priceImpactRows: amm.priceImpactRows.length,
      oracleFailureCases: oracleFailures.length,
      oracleBlockedCases: blockedOracleFailures.length,
      oracleReviewOnlyCases: oracleFailures.filter((failure) => failure.status === "review-only").length,
      lendingSweeps: lendingSweeps.length,
      lendingHealthyOrBoundary: lendingSweeps.filter((sweep) => ["healthy-review-only", "boundary-review-only"].includes(sweep.status)).length,
      lendingLiquidationReview: lendingSweeps.filter((sweep) => sweep.status === "liquidation-review-only").length,
      lendingBlocked: blockedLendingSweeps.length,
      reviewStateRowsFromReducer: Number(reducer.summary?.promotedReviewRows || 0),
      acceptedReferencesFromScenario: Number(scenario.summary?.acceptedReferencesIndexed || 0),
      liveProductClaims: 0,
      custodyActions: 0
    },
    inputs: {
      scenarioStatus: String(scenario.status || ""),
      reducerStatus: String(reducer.status || "")
    },
    amm,
    oracleFailures,
    lendingSweeps,
    promotionRule: [
      "AMM liquidity math can enter review state only when reserve ratio and invariant checks pass; invalid reserve mutation stays blocked.",
      "Lending sweeps can show health-factor state, but liquidation remains review-only or blocked until oracle and custody authority are enforceable.",
      "Oracle failures block custody-moving actions even if some reports are fresh or numerous.",
      "This advanced simulation is still planner/indexer state; it does not alter TN12 pool reserves or move user funds."
    ],
    boundaries: [
      "This artifact hardens simulation logic for AMM, lending, liquidation, and oracle failure cases.",
      "It is useful for product and reducer tests before external signing, but it is not live DeFi.",
      "Review-state rows are dashboard/operator inputs only."
    ]
  };
}

function evaluateAmm(amm = {}) {
  const baseReserve = BigInt(amm.baseReserveUnits || 0);
  const quoteReserve = BigInt(amm.quoteReserveUnits || 0);
  const totalLpShares = BigInt(amm.totalLpShares || 0);
  const invariantBefore = baseReserve * quoteReserve;
  const liquidityActions = (amm.liquidityActions || []).map((action) =>
    evaluateLiquidityAction({ action, baseReserve, quoteReserve, totalLpShares, invariantBefore })
  );
  const priceImpactRows = (amm.priceImpactInputs || []).map((inputUnits) => {
    const input = BigInt(inputUnits || 0);
    return {
      inputUnits: input.toString(),
      priceImpactBps: priceImpactBps({ inputUnits: input, inputReserve: baseReserve }),
      outputUnits: constantProductOutput({ inputUnits: input, inputReserve: baseReserve, outputReserve: quoteReserve, feeBps: 30n }).toString()
    };
  });

  return {
    poolId: String(amm.poolId || ""),
    baseSymbol: String(amm.baseSymbol || ""),
    quoteSymbol: String(amm.quoteSymbol || ""),
    baseReserveUnits: baseReserve.toString(),
    quoteReserveUnits: quoteReserve.toString(),
    totalLpShares: totalLpShares.toString(),
    invariantBefore: invariantBefore.toString(),
    liquidityActions,
    priceImpactRows
  };
}

function evaluateLiquidityAction({ action, baseReserve, quoteReserve, totalLpShares, invariantBefore }) {
  const type = String(action.type || "");
  if (type === "add") {
    const baseUnits = BigInt(action.baseUnits || 0);
    const quoteUnits = BigInt(action.quoteUnits || 0);
    const baseShare = baseReserve > 0n ? (baseUnits * totalLpShares) / baseReserve : 0n;
    const quoteShare = quoteReserve > 0n ? (quoteUnits * totalLpShares) / quoteReserve : 0n;
    const balanced = baseUnits * quoteReserve === quoteUnits * baseReserve;
    const mintedShares = balanced ? minBigInt(baseShare, quoteShare) : 0n;
    const newBaseReserve = baseReserve + baseUnits;
    const newQuoteReserve = quoteReserve + quoteUnits;
    return {
      id: String(action.id || ""),
      type,
      baseUnits: baseUnits.toString(),
      quoteUnits: quoteUnits.toString(),
      mintedShares: mintedShares.toString(),
      invariantAfter: (newBaseReserve * newQuoteReserve).toString(),
      invariantNonDecreasing: newBaseReserve * newQuoteReserve >= invariantBefore,
      status: balanced && mintedShares > 0n ? "review-state-promoted" : "blocked",
      reason: balanced ? "balanced liquidity add" : "imbalanced liquidity add"
    };
  }
  if (type === "remove") {
    const lpShares = BigInt(action.lpShares || 0);
    const baseOut = totalLpShares > 0n ? (baseReserve * lpShares) / totalLpShares : 0n;
    const quoteOut = totalLpShares > 0n ? (quoteReserve * lpShares) / totalLpShares : 0n;
    const valid = lpShares > 0n && lpShares <= totalLpShares;
    const newBaseReserve = baseReserve - baseOut;
    const newQuoteReserve = quoteReserve - quoteOut;
    return {
      id: String(action.id || ""),
      type,
      lpShares: lpShares.toString(),
      baseOut: baseOut.toString(),
      quoteOut: quoteOut.toString(),
      invariantAfter: (newBaseReserve * newQuoteReserve).toString(),
      status: valid ? "review-state-promoted" : "blocked",
      reason: valid ? "pro-rata liquidity remove" : "invalid LP share amount"
    };
  }
  if (type === "mutate") {
    const newBaseReserve = BigInt(action.newBaseReserveUnits || 0);
    const newQuoteReserve = BigInt(action.newQuoteReserveUnits || 0);
    const invariantAfter = newBaseReserve * newQuoteReserve;
    return {
      id: String(action.id || ""),
      type,
      newBaseReserveUnits: newBaseReserve.toString(),
      newQuoteReserveUnits: newQuoteReserve.toString(),
      invariantAfter: invariantAfter.toString(),
      status: "blocked",
      reason: "reserve mutation without matched liquidity/swap path"
    };
  }
  return {
    id: String(action.id || ""),
    type,
    status: "blocked",
    reason: "unknown AMM action"
  };
}

function evaluateOracleFailure(failure = {}) {
  const prices = (failure.pricesCents || []).map((price) => BigInt(price));
  const median = prices.length ? medianBigInt(prices) : 0n;
  const min = prices.length ? prices.reduce((a, b) => a < b ? a : b) : 0n;
  const max = prices.length ? prices.reduce((a, b) => a > b ? a : b) : 0n;
  const spreadBps = median > 0n ? Number(((max - min) * 10000n) / median) : 0;
  const stale = Number(failure.ageSeconds || 0) > Number(failure.maxAgeSeconds || 0);
  const quorumMet = Number(failure.reporterCount || 0) >= Number(failure.requiredQuorum || 0);
  const conflict = spreadBps > 5000;
  const kind = String(failure.kind || "");
  const blocked = stale || !quorumMet || conflict || ["manipulated", "unavailable"].includes(kind);

  return {
    id: String(failure.id || ""),
    kind,
    reporterCount: Number(failure.reporterCount || 0),
    requiredQuorum: Number(failure.requiredQuorum || 0),
    ageSeconds: Number(failure.ageSeconds || 0),
    maxAgeSeconds: Number(failure.maxAgeSeconds || 0),
    medianPriceCents: median.toString(),
    spreadBps,
    checks: {
      stale,
      quorumMet,
      conflict,
      manipulated: kind === "manipulated",
      unavailable: kind === "unavailable",
      freshButNotTruth: kind === "fresh-not-truth"
    },
    status: blocked ? "blocked" : "review-only",
    reason: blocked
      ? "oracle input cannot drive custody-moving action"
      : "fresh quorum input can drive review prompts only"
  };
}

function evaluateLendingSweep(sweep = {}, oracleById) {
  const oracle = oracleById.get(sweep.oracleFailureId);
  const collateralUnits = BigInt(sweep.collateralUnits || 0);
  const priceCents = BigInt(sweep.priceCents || 0);
  const debtCents = BigInt(sweep.debtCents || 0);
  const liquidationThresholdBps = BigInt(sweep.liquidationThresholdBps || 0);
  const collateralValueCents = (collateralUnits * priceCents) / TOKEN_SCALE;
  const liquidationValueCents = (collateralValueCents * liquidationThresholdBps) / 10000n;
  const healthFactorBps = debtCents > 0n ? (liquidationValueCents * 10000n) / debtCents : 0n;
  const oracleBlocked = oracle?.status === "blocked";
  const status = oracleBlocked
    ? "oracle-blocked"
    : healthFactorBps < 10000n
      ? "liquidation-review-only"
      : healthFactorBps === 10000n
        ? "boundary-review-only"
        : "healthy-review-only";

  return {
    id: String(sweep.id || ""),
    collateralUnits: collateralUnits.toString(),
    priceCents: priceCents.toString(),
    debtCents: debtCents.toString(),
    liquidationThresholdBps: Number(liquidationThresholdBps),
    collateralValueCents: collateralValueCents.toString(),
    liquidationValueCents: liquidationValueCents.toString(),
    healthFactorBps: healthFactorBps.toString(),
    oracleFailureId: String(sweep.oracleFailureId || ""),
    oracleStatus: oracle?.status || "missing-oracle-case",
    status,
    liquidationExecutable: false,
    custodyReady: false
  };
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

function medianBigInt(values) {
  const sorted = [...values].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2n : sorted[middle];
}

function minBigInt(a, b) {
  return a < b ? a : b;
}
