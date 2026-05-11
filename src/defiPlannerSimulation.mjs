const DEFAULT_LANES = [
  {
    id: "amm",
    label: "AMM / swap pool",
    categoryIds: ["dex-amm"],
    briefIds: ["swap-intent-board", "amm-pool-research"],
    oracleModelIds: ["onchain-dclob-ground-truth", "cex-weighted-median"],
    nextArtifact: "Constant-product simulator plus accepted swap-intent receipt registry.",
    simulationChecks: [
      "reserve math",
      "price impact",
      "slippage warning",
      "LP-share accounting sketch",
      "MEV/order caveat"
    ],
    blockedBy: [
      "enforced shared pool state",
      "asset/liquidity model",
      "min-output enforcement",
      "LP share custody",
      "ordering/MEV policy"
    ]
  },
  {
    id: "lending",
    label: "Collateral lending",
    categoryIds: ["lending"],
    briefIds: ["lending-risk-dashboard"],
    oracleModelIds: ["cex-weighted-median", "signed-reporter-attestation"],
    nextArtifact: "Position-health simulator with accepted risk-update receipts.",
    simulationChecks: [
      "collateral ratio",
      "borrow limit",
      "health factor",
      "stale-price pause",
      "liquidation threshold"
    ],
    blockedBy: [
      "collateral custody model",
      "price oracle challenge policy",
      "liquidation authority",
      "borrow accounting",
      "repayment settlement"
    ]
  },
  {
    id: "liquidation",
    label: "Liquidation / closeout",
    categoryIds: ["lending"],
    briefIds: ["lending-risk-dashboard", "insurance-protection"],
    oracleModelIds: ["cex-weighted-median", "arbitrage-simulated-fair-price", "signed-reporter-attestation"],
    nextArtifact: "Liquidation decision simulator with pause/reject cases.",
    simulationChecks: [
      "stale oracle rejection",
      "minimum collateral shortfall",
      "liquidator reward estimate",
      "pause-on-dispute rule",
      "operator-review receipt"
    ],
    blockedBy: [
      "custody-moving authority",
      "oracle dispute window",
      "liquidator incentive model",
      "partial closeout accounting",
      "rollback-safe promotion rule"
    ]
  },
  {
    id: "oracle",
    label: "Oracle source and failure handling",
    categoryIds: ["perps-prediction"],
    briefIds: ["prediction-hedge-simulator", "derivatives-options"],
    oracleModelIds: ["cex-weighted-median", "arbitrage-simulated-fair-price", "signed-reporter-attestation", "miner-rtd-sampling"],
    nextArtifact: "Archived source-update payload format plus stale/challenge tests.",
    simulationChecks: [
      "source freshness",
      "reporter coverage",
      "manipulation model",
      "stale-data pause",
      "human-review boundary"
    ],
    blockedBy: [
      "canonical truth source",
      "signer set",
      "challenge policy",
      "stale-feed fail-close rule",
      "custody integration"
    ]
  },
  {
    id: "settlement",
    label: "Settlement / replay promotion",
    categoryIds: ["dex-amm", "lending", "perps-prediction", "bridge-source-chain"],
    briefIds: ["swap-intent-board", "stable-value-unit", "portfolio-automation"],
    oracleModelIds: ["source-chain-anchor", "onchain-dclob-ground-truth"],
    nextArtifact: "Replay reducer over accepted receipts plus failed-promotion fixtures.",
    simulationChecks: [
      "accepted receipt replay",
      "duplicate rejection",
      "stale outpoint rejection",
      "wallet result validation",
      "rollback fixture"
    ],
    blockedBy: [
      "external signer roundtrip",
      "live rollback evidence",
      "production indexer persistence",
      "custody/security review",
      "mainnet covenant activation"
    ]
  }
];

export function buildDefiPlannerSimulation({
  backlog = {},
  missingRails = {},
  oracleMatrix = {},
  acceptedIndex = {},
  walletValidation = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const briefs = Array.isArray(backlog.briefs) ? backlog.briefs : [];
  const categories = Array.isArray(missingRails.categories) ? missingRails.categories : [];
  const oracleModels = Array.isArray(oracleMatrix.models) ? oracleMatrix.models : [];
  const acceptedSummary = acceptedIndex.summary || {};
  const walletSummary = walletValidation.summary || {};
  const lanes = DEFAULT_LANES.map((lane) =>
    buildLane({ lane, briefs, categories, oracleModels, acceptedSummary, walletSummary })
  );
  const negativeCases = buildNegativeCases(lanes);

  return {
    schema: "tn12-defi-planner-simulation/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "planner-only-defi-simulation-ready",
    enforcement: "PLANNER_ONLY",
    summary: {
      lanes: lanes.length,
      simulationReadyLanes: lanes.filter((lane) => lane.simulationReady).length,
      liveProductClaims: 0,
      custodyReadyLanes: lanes.filter((lane) => lane.custodyReady).length,
      scriptEnforcedLanes: lanes.filter((lane) => lane.scriptEnforced).length,
      blockedLiveLanes: lanes.filter((lane) => lane.liveProductBlocked).length,
      acceptedRecordsUsed: Number(acceptedSummary.total || 0),
      acceptedPayloadEventsUsed: Number(acceptedSummary.payloadEvents || 0),
      acceptedProofSpendsUsed: Number(acceptedSummary.proofs || 0),
      walletPromotions: Number(walletSummary.liveWalletPromotions || 0),
      negativeCases: negativeCases.length,
      blockedNegativeCases: negativeCases.filter((item) => item.status === "blocked").length
    },
    inputs: {
      backlogStatus: String(backlog.status || ""),
      missingRailsStatus: String(missingRails.status || ""),
      oracleMatrixStatus: String(oracleMatrix.status || ""),
      acceptedIndexStatus: String(acceptedIndex.status || ""),
      walletValidationStatus: String(walletValidation.status || "")
    },
    lanes,
    negativeCases,
    promotionRule: [
      "A lane can leave PLANNER_ONLY only after wallet requests, signer return, submit result, accepted txid replay, and indexer promotion all validate the same intent.",
      "A custody-moving DeFi lane also needs oracle stale/challenge policy, liquidity/risk limits, security review, rollback handling, and explicit script-enforced versus indexer-derived semantics.",
      "Accepted payload receipts can prove ordering and replay inputs; they do not prove custody, liquidity, oracle truth, or mainnet readiness by themselves."
    ],
    boundaries: [
      "This is a DeFi planner simulation over existing TN12 evidence and local artifacts.",
      "It does not create a live AMM, lending market, liquidation bot, oracle, bridge, or custody product.",
      "It is useful for testing app-state reducers, wallet-review surfaces, negative cases, and promotion rules before a real external signer or production indexer exists."
    ]
  };
}

function buildLane({ lane, briefs, categories, oracleModels, acceptedSummary, walletSummary }) {
  const categoryRows = categories.filter((category) => lane.categoryIds.includes(category.id));
  const briefRows = briefs.filter((brief) => lane.briefIds.includes(brief.id));
  const oracleRows = oracleModels.filter((model) => lane.oracleModelIds.includes(model.id));
  const categoryMissingRails = categoryRows.flatMap((category) =>
    category.questions.map((question) => question.missingRail).filter(Boolean)
  );
  const briefMissingRails = briefRows.flatMap((brief) => brief.missingRails || []);
  const oracleMissingRails = oracleRows.flatMap((model) => model.missingRails || []);
  const missingRailSet = unique([
    ...lane.blockedBy,
    ...categoryMissingRails,
    ...briefMissingRails,
    ...oracleMissingRails
  ]);
  const doNotClaim = unique(categoryRows.flatMap((category) => category.doNotClaim || []));

  return {
    id: lane.id,
    label: lane.label,
    status: "simulation-only-blocked-live-product",
    enforcement: "PLANNER_ONLY",
    simulationReady: true,
    liveProductBlocked: true,
    custodyReady: false,
    scriptEnforced: false,
    indexerState: acceptedSummary.total ? "accepted-records-replayable-from-fixtures" : "no-accepted-index-input",
    walletState: walletSummary.liveWalletPromotions
      ? "unexpected-live-wallet-promotion"
      : "wallet-results-validated-no-live-wallet-promotion",
    acceptedInputs: {
      records: Number(acceptedSummary.total || 0),
      payloadEvents: Number(acceptedSummary.payloadEvents || 0),
      proofs: Number(acceptedSummary.proofs || 0)
    },
    checks: lane.simulationChecks,
    nextArtifact: lane.nextArtifact,
    sourceBriefs: briefRows.map((brief) => ({
      id: brief.id,
      firstSafeArtifact: brief.firstSafeArtifact,
      status: brief.status
    })),
    sourceCategories: categoryRows.map((category) => ({
      id: category.id,
      smallestHonestPrototype: category.smallestHonestPrototype,
      status: category.status
    })),
    oracleModels: oracleRows.map((model) => ({
      id: model.id,
      lane: model.currentKaspaLane,
      riskLevel: model.riskLevel,
      custodyReady: Boolean(model.custodyReady)
    })),
    missingRails: missingRailSet,
    cannotClaim: unique([
      ...doNotClaim,
      "live custody",
      "production DeFi",
      "mainnet readiness",
      "oracle truth",
      "external wallet signing proven"
    ])
  };
}

function buildNegativeCases(lanes) {
  return lanes.map((lane) => ({
    id: `${lane.id}-live-product-overclaim`,
    claim: `${lane.label} is live on TN12 as a custody-moving DeFi product.`,
    status: "blocked",
    reason: [
      "Lane is PLANNER_ONLY.",
      "Custody-ready and script-enforced flags are false.",
      "Accepted payload/indexer evidence is not the same as live DeFi settlement."
    ],
    requiredBeforePromotion: lane.missingRails.slice(0, 6)
  }));
}

function unique(items) {
  return [...new Set(items.map((item) => String(item)).filter(Boolean))].sort();
}
