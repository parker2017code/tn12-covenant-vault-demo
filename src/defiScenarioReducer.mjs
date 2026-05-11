export function buildDefiScenarioReducer({
  scenario = {},
  acceptedActivity = {},
  duplicateCandidates = [],
  missingCandidates = [],
  custodyPromotionCandidates = [],
  withdrawalCandidates = [],
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedReferences = Array.isArray(scenario.acceptedReferences) ? scenario.acceptedReferences : [];
  const referenceById = new Map(acceptedReferences.map((reference) => [reference.id, reference]));
  const swapRows = (scenario.amm?.swaps || []).map((swap) => reduceSwap({ swap, referenceById }));
  const oracleRows = (scenario.oracle?.prices || []).map((price) => reduceOracle({ price, referenceById }));
  const lendingRows = (scenario.lending?.positions || []).map((position) => reduceLending({ position, referenceById }));
  const balanceRows = reduceBalances(acceptedActivity);
  const stateRows = [...swapRows, ...oracleRows, ...lendingRows];
  const negativeRows = [
    ...duplicateCandidates.map((candidate) => reviewDuplicate({ candidate, stateRows })),
    ...missingCandidates.map((candidate) => reviewMissing({ candidate, referenceById })),
    ...custodyPromotionCandidates.map((candidate) => reviewCustodyPromotion({ candidate, stateRows })),
    ...withdrawalCandidates.map((candidate) => reviewWithdrawal({ candidate, balanceRows }))
  ];
  const blockedScenarioRows = stateRows.filter((row) => row.promotionState === "blocked-review");
  const promotedRows = stateRows.filter((row) => row.promotionState === "review-state-promoted");
  const blockedNegativeRows = negativeRows.filter((row) => row.status === "blocked");

  return {
    schema: "tn12-defi-scenario-reducer/v1",
    network: scenario.network || "kaspa-testnet-12",
    generatedAt,
    status: stateRows.length > 0
      && blockedScenarioRows.length >= 3
      && blockedNegativeRows.length === negativeRows.length
      ? "scenario-reducer-ready-not-custody"
      : "scenario-reducer-review",
    enforcement: "INDEXER_DERIVED",
    summary: {
      stateRows: stateRows.length,
      promotedReviewRows: promotedRows.length,
      blockedScenarioRows: blockedScenarioRows.length,
      swapRows: swapRows.length,
      oracleRows: oracleRows.length,
      lendingRows: lendingRows.length,
      balanceRows: balanceRows.length,
      blockedBalanceRows: balanceRows.filter((row) => row.promotionState === "blocked-review").length,
      duplicateCandidateRows: duplicateCandidates.length,
      missingCandidateRows: missingCandidates.length,
      custodyPromotionCandidateRows: custodyPromotionCandidates.length,
      withdrawalCandidateRows: withdrawalCandidates.length,
      negativeRows: negativeRows.length,
      blockedNegativeRows: blockedNegativeRows.length,
      custodyPromotions: promotedRows.filter((row) => row.custodyAction === true).length,
      balanceCustodyPromotions: balanceRows.filter((row) => row.custodyAction === true).length,
      liveProductClaims: 0
    },
    state: {
      swaps: swapRows,
      oraclePrices: oracleRows,
      lendingPositions: lendingRows,
      balances: balanceRows
    },
    negativeRows,
    promotionRule: [
      "Only accepted-indexed references can enter review app state.",
      "Scenario rows with min-output failure, stale oracle data, or liquidation-only status stay blocked.",
      "Accepted local-key transfer balances are review state only; balances do not authorize withdrawals.",
      "Review-state promotion never means custody promotion; custody candidates are blocked until external signer, settlement, and live replay evidence exist.",
      "Duplicate, missing, impossible-withdrawal, and over-balance rows are blocked before UI or operator state can use them."
    ],
    boundaries: [
      "This reducer promotes review-only app state from deterministic DeFi scenarios.",
      "It is indexer-derived state, not script-enforced settlement and not live DeFi custody.",
      "Rows marked review-state-promoted are safe for dashboards and operator review only."
    ]
  };
}

function reduceBalances(acceptedActivity) {
  const rows = Array.isArray(acceptedActivity.transferRows) ? acceptedActivity.transferRows : [];
  const balances = new Map();
  for (const row of rows) {
    if (row.accepted !== true || row.matches !== true) continue;
    const amount = BigInt(row.amountSompi || 0);
    addBalance(balances, row.from, -amount);
    addBalance(balances, row.to, amount);
  }
  return [...balances.entries()]
    .filter(([address]) => Boolean(address))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([address, balanceSompi]) => {
      const problems = balanceSompi < 0n ? ["negative net delta from selected transfer rows"] : [];
      return {
        address,
        kind: "accepted-transfer-net-balance",
        balanceSompi: balanceSompi.toString(),
        balanceTkas: sompiToTkas(balanceSompi),
        promotionState: problems.length ? "blocked-review" : "review-state-promoted",
        custodyAction: false,
        problems
      };
    });
}

function addBalance(balances, address, amount) {
  if (!address) return;
  balances.set(address, (balances.get(address) || 0n) + amount);
}

function reduceSwap({ swap, referenceById }) {
  const accepted = referenceById.get(swap.id)?.acceptedIndexed === true;
  const problems = [
    accepted ? "" : "accepted reference missing",
    swap.status === "simulated-fill-ok" ? "" : "min output not met",
    swap.settlementReady === false ? "" : "unexpected settlement-ready flag"
  ].filter(Boolean);

  return {
    id: swap.id,
    kind: "amm-swap",
    txid: swap.acceptedIntentTxid || "",
    acceptedIndexed: accepted,
    inputSymbol: swap.inputSymbol,
    outputSymbol: swap.outputSymbol,
    inputUnits: swap.inputUnits,
    expectedOutputUnits: swap.expectedOutputUnits,
    minOutputUnits: swap.minOutputUnits,
    priceImpactBps: Number(swap.priceImpactBps || 0),
    promotionState: problems.length === 0 ? "review-state-promoted" : "blocked-review",
    custodyAction: false,
    problems
  };
}

function reduceOracle({ price, referenceById }) {
  const accepted = referenceById.get(price.id)?.acceptedIndexed === true;
  const problems = [
    accepted ? "" : "accepted reference missing",
    price.status === "fresh-review-only" ? "" : "stale oracle price"
  ].filter(Boolean);

  return {
    id: price.id,
    kind: "oracle-price",
    txid: price.acceptedUpdateTxid || "",
    acceptedIndexed: accepted,
    symbol: price.symbol,
    priceCents: price.priceCents,
    ageSeconds: Number(price.ageSeconds || 0),
    sourceModelId: price.sourceModelId,
    promotionState: problems.length === 0 ? "review-state-promoted" : "blocked-review",
    custodyAction: false,
    problems
  };
}

function reduceLending({ position, referenceById }) {
  const accepted = referenceById.get(position.id)?.acceptedIndexed === true;
  const problems = [
    accepted ? "" : "accepted reference missing",
    position.status === "healthy-review-only" ? "" : position.status === "blocked-stale-oracle" ? "stale oracle blocks position" : "liquidation review is not executable"
  ].filter(Boolean);

  return {
    id: position.id,
    kind: "lending-position",
    txid: position.acceptedPositionTxid || "",
    acceptedIndexed: accepted,
    collateralSymbol: position.collateralSymbol,
    collateralValueCents: position.collateralValueCents,
    debtCents: position.debtCents,
    healthFactorBps: position.healthFactorBps,
    oraclePriceId: position.oraclePriceId,
    oracleStatus: position.oracleStatus,
    promotionState: problems.length === 0 ? "review-state-promoted" : "blocked-review",
    custodyAction: false,
    problems
  };
}

function reviewDuplicate({ candidate, stateRows }) {
  const matches = stateRows.filter((row) => row.id === candidate.id || row.txid === candidate.txid);
  return {
    id: candidate.id || "",
    txid: candidate.txid || "",
    kind: "duplicate-candidate",
    status: matches.length > 0 ? "blocked" : "not-found",
    reason: matches.length > 0 ? "duplicate scenario reference" : "candidate does not match known reducer row"
  };
}

function reviewMissing({ candidate, referenceById }) {
  const reference = referenceById.get(candidate.id);
  return {
    id: candidate.id || "",
    txid: candidate.txid || "",
    kind: "missing-reference-candidate",
    status: !reference || reference.txid !== candidate.txid || reference.acceptedIndexed !== true ? "blocked" : "unexpectedly-present",
    reason: "missing or mismatched accepted-index reference"
  };
}

function reviewCustodyPromotion({ candidate, stateRows }) {
  const row = stateRows.find((item) => item.id === candidate.id || item.txid === candidate.txid);
  const blocked = !row || candidate.requestedAction === "custody-promotion" || row.custodyAction === false;
  return {
    id: candidate.id || "",
    txid: candidate.txid || "",
    kind: "custody-promotion-candidate",
    requestedAction: candidate.requestedAction || "",
    sourcePromotionState: row?.promotionState || "missing-row",
    status: blocked ? "blocked" : "unexpectedly-promoted",
    reason: blocked
      ? "review state cannot be promoted to custody without external signer and settlement evidence"
      : "custody promotion unexpectedly allowed"
  };
}

function reviewWithdrawal({ candidate, balanceRows }) {
  const row = balanceRows.find((item) => item.address === candidate.address);
  const requestedSompi = BigInt(candidate.amountSompi || 0);
  const balanceSompi = BigInt(row?.balanceSompi || 0);
  const blocked = !row || requestedSompi <= 0n || requestedSompi > balanceSompi || candidate.requestedAction === "withdraw-execute";
  return {
    id: candidate.id || "",
    address: candidate.address || "",
    kind: "withdrawal-candidate",
    requestedAction: candidate.requestedAction || "",
    requestedSompi: requestedSompi.toString(),
    balanceSompi: balanceSompi.toString(),
    status: blocked ? "blocked" : "review-only",
    reason: blocked
      ? "withdrawal cannot execute from reducer balance without signer, settlement, and spend evidence"
      : "withdrawal is review-only; execution still requires a signed accepted spend"
  };
}

function sompiToTkas(sompi) {
  const sign = sompi < 0n ? "-" : "";
  const value = sompi < 0n ? -sompi : sompi;
  const whole = value / 100000000n;
  const fraction = value % 100000000n;
  if (fraction === 0n) return `${sign}${whole}`;
  return `${sign}${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
