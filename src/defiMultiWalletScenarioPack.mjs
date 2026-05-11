export function buildDefiMultiWalletScenarioPack({
  scenario = {},
  reducer = {},
  advanced = {},
  receiptGuard = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const references = Array.isArray(scenario.acceptedReferences) ? scenario.acceptedReferences : [];
  const stateRows = [
    ...(reducer.state?.swaps || []),
    ...(reducer.state?.oraclePrices || []),
    ...(reducer.state?.lendingPositions || [])
  ];
  const receiptWallets = new Map((receiptGuard.acceptedReceipts || []).flatMap((receipt) => [
    [receipt.subject,
    {
      walletAddress: receipt.walletAddress || "",
      receiptTxid: receipt.txid || "",
      receiptValue: receipt.value || ""
    }],
    [receipt.txid,
    {
      walletAddress: receipt.walletAddress || "",
      receiptTxid: receipt.txid || "",
      receiptValue: receipt.value || ""
    }]
  ]));
  const roles = buildRoles({ references, stateRows, receiptWallets });
  const blockedRows = [
    ...(reducer.negativeRows || []),
    ...stateRows.filter((row) => row.promotionState === "blocked-review").map((row) => ({
      id: row.id,
      kind: row.kind,
      status: "blocked",
      reason: row.problems?.join("; ") || "blocked review row"
    }))
  ];

  return {
    schema: "tn12-defi-multi-wallet-scenario-pack/v1",
    network: scenario.network || "kaspa-testnet-12",
    generatedAt,
    status: roles.length >= 4
      && roles.every((role) => role.acceptedIndexed)
      && blockedRows.length >= 4
      ? "multi-wallet-scenario-pack-ready-local-keys"
      : "multi-wallet-scenario-pack-review",
    enforcement: "INDEXER_DERIVED",
    summary: {
      roles: roles.length,
      acceptedIndexedRoles: roles.filter((role) => role.acceptedIndexed).length,
      reviewStatePromotedRoles: roles.filter((role) => role.promotionState === "review-state-promoted").length,
      blockedRows: blockedRows.length,
      advancedAmmBlockedActions: Number(advanced.summary?.ammBlockedActions || 0),
      advancedOracleBlockedCases: Number(advanced.summary?.oracleBlockedCases || 0),
      advancedLendingBlocked: Number(advanced.summary?.lendingBlocked || 0),
      localKeySignedReceipts: Number(receiptGuard.summary?.acceptedReceipts || 0),
      actualWalletAddresses: new Set(roles.map((role) => role.walletAddress).filter((address) => /^kaspatest:/.test(address))).size,
      externalSignerClaims: 0,
      custodyActions: 0,
      liveProductClaims: 0
    },
    roles,
    blockedRows,
    operatorChecklist: [
      "Review each role's accepted txid in the checkpoint index before using it in app state.",
      "Treat review-state-promoted rows as dashboard state only, not settlement or custody.",
      "Block custody-moving actions until external signer, accepted submit result, and replay promotion all match.",
      "Keep local-key receipt evidence separate from external-wallet evidence."
    ],
    boundaries: [
      "This pack groups accepted TN12 references into wallet-like roles, but it does not prove external wallet signing.",
      "Roles are scenario actors over existing accepted receipts and reducer rows.",
      "No role here can move custody, operate a live AMM, liquidate a borrower, or assert oracle truth."
    ]
  };
}

function buildRoles({ references, stateRows, receiptWallets }) {
  return [
    role({
      id: "wallet-a-swapper",
      label: "Wallet A swap intent",
      scenarioId: "swap-ok-001",
      references,
      stateRows,
      receiptWallets,
      action: "swap-intent-review"
    }),
    role({
      id: "wallet-b-lender",
      label: "Wallet B lending position",
      scenarioId: "lend-safe-001",
      references,
      stateRows,
      receiptWallets,
      action: "lending-health-review"
    }),
    role({
      id: "wallet-c-oracle-reporter",
      label: "Wallet C oracle reporter",
      scenarioId: "oracle-fresh-tkas",
      references,
      stateRows,
      receiptWallets,
      action: "oracle-update-review"
    }),
    role({
      id: "wallet-d-risk-reviewer",
      label: "Wallet D risk reviewer",
      scenarioId: "lend-liquidation-review-001",
      references,
      stateRows,
      receiptWallets,
      action: "liquidation-review-blocked"
    })
  ];
}

function role({ id, label, scenarioId, references, stateRows, receiptWallets, action }) {
  const reference = references.find((item) => item.id === scenarioId) || {};
  const state = stateRows.find((item) => item.id === scenarioId) || {};
  const receipt = receiptWallets.get(reference.txid) || receiptWallets.get(state.txid) || receiptWallets.get(scenarioId) || {};
  return {
    id,
    label,
    scenarioId,
    action,
    txid: reference.txid || state.txid || receipt.receiptTxid || "",
    acceptedIndexed: reference.acceptedIndexed === true,
    promotionState: state.promotionState || "not-reduced",
    stateKind: state.kind || "scenario-reference",
    walletAddress: receipt.walletAddress || "scenario-role-no-wallet-address",
    localKeyEvidence: Boolean(receipt.receiptTxid),
    externalSignerEvidence: false,
    custodyReady: false,
    reviewProblems: state.problems || []
  };
}
