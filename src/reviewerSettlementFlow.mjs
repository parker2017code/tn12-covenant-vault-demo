export function buildReviewerSettlementFlow({
  fundingEvidence = {},
  session = {},
  reducer = {},
  liveWindow = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedTxids = (session.txids || []).filter((row) => row.accepted === true);
  const matchedFundingOutputs = (fundingEvidence.outputs || []).filter((row) => row.matches === true);
  const hasFreshFunding = fundingEvidence.accepted === true
    && fundingEvidence.status === "accepted-transfer-matched"
    && matchedFundingOutputs.length >= 6;
  const hasSessionReplay = Number(session.summary?.acceptedTxids || 0) >= 4
    && Number(reducer.summary?.balanceRows || 0) > 0
    && Number(reducer.summary?.blockedNegativeRows || 0) > 0;
  const historicalStartHashGuarded = [
    "virtual-chain-live-window-start-hash-unavailable",
    "virtual-chain-live-window-ready"
  ].includes(liveWindow.status);

  return {
    schema: "tn12-reviewer-settlement-flow/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: hasFreshFunding && hasSessionReplay
      ? "reviewer-settlement-flow-ready"
      : "reviewer-settlement-flow-review",
    summary: {
      freshFundingAccepted: hasFreshFunding,
      matchedFundingOutputs: matchedFundingOutputs.length,
      acceptedSessionTxids: acceptedTxids.length,
      replayedBalanceRows: Number(reducer.summary?.balanceRows || 0),
      blockedNegativeRows: Number(reducer.summary?.blockedNegativeRows || 0),
      historicalStartHashGuarded,
      userWalletRequired: false,
      privateKeysIncluded: 0
    },
    reviewerRun: [
      {
        step: 1,
        label: "Install",
        command: "npm ci",
        writes: []
      },
      {
        step: 2,
        label: "Verify accepted proof and replay fixtures",
        command: "npm run check:tn12 && npm run defi:accepted-activity && npm run defi:reducer",
        writes: [
          "artifacts/checkpointed-accepted-index.json",
          "artifacts/defi-accepted-activity-ledger.json",
          "artifacts/defi-scenario-reducer.json"
        ]
      },
      {
        step: 3,
        label: "Review live multi-wallet evidence",
        command: "open artifacts/playground-funding-20260512-evidence.json",
        writes: []
      },
      {
        step: 4,
        label: "Repeat with fresh tKAS",
        command: "PLAYGROUND_DIR=.local/reviewer-playground npm run playground:wallets -- --force && PLAYGROUND_DIR=.local/reviewer-playground npm run playground:funding-draft",
        writes: [
          ".local/reviewer-playground/wallets.public.json",
          ".local/reviewer-playground/wallets.private.json",
          ".local/reviewer-playground/funding-draft.json"
        ]
      },
      {
        step: 5,
        label: "Submit only after review",
        command: "node scripts/submit-signed-draft.mjs .local/reviewer-playground/funding-draft.json --submit",
        writes: [
          "TN12 txid"
        ]
      }
    ],
    acceptedEvidence: {
      fundingTxid: fundingEvidence.txid || "",
      fundingExplorerUrl: fundingEvidence.explorerUrl || "",
      sessionTxids: acceptedTxids.map((row) => ({
        label: row.label,
        txid: row.txid
      }))
    },
    promotionRule: "A reviewer flow is usable when the funding tx is accepted, outputs match role addresses, replay reduces accepted rows into balances, and invalid withdrawal rows stay blocked.",
    boundaries: [
      "This is a testnet reviewer run.",
      "It uses local throwaway keys unless a user-wallet signer is plugged in later.",
      "No mainnet funds, custody claim, or audit claim is made.",
      "A submit command broadcasts real TN12 testnet money."
    ]
  };
}
