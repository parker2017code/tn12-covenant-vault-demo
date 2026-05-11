export function buildPlaygroundPlan({
  acceptedActivity = {},
  provenStatus = {},
  benchmark = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const roles = [
    role("operator", "Operator / receipt submitter", "2", "Submits payload receipts and starts guided scenarios."),
    role("pool", "Pool wallet", "25", "Receives deposits and sends small payouts under local-key test control."),
    role("user-a", "User A / swapper", "10", "Funds a deposit and receives a payout."),
    role("user-b", "User B / lender", "10", "Funds a deposit and requests a withdrawal review."),
    role("executor", "Executor / scheduler bidder", "2", "Submits bid and execution receipts."),
    role("reviewer", "Reviewer / oracle reporter", "2", "Submits review-only oracle or risk rows.")
  ];
  const actions = [
    action("generate-session-wallets", "Create fresh TN12 role wallets", "LOCAL_ONLY", "Generate new kaspatest addresses; never commit private keys."),
    action("faucet-fund-roles", "Fund roles with faucet tKAS", "USER_FUNDED_TN12", "Show copy buttons and minimum tKAS amounts for each role."),
    action("submit-payload-receipt", "Submit an app receipt", "TN12_ACCEPTED_TARGET", "Broadcast a payload receipt and verify the txid/payload bytes."),
    action("submit-pool-deposit", "Move tKAS into pool role", "LOCAL_KEY_CUSTODY_TEST", "Create an accepted transfer from a user role to pool."),
    action("submit-pool-payout", "Move tKAS from pool role", "LOCAL_KEY_CUSTODY_TEST", "Create an accepted payout transfer from pool to user."),
    action("replay-ledger", "Replay accepted txids", "INDEXER_DERIVED", "Reduce proof, receipt, and transfer rows into balances and state."),
    action("attempt-bad-withdrawal", "Try impossible withdrawal", "REJECTED_BY_REDUCER", "Block over-balance or unsigned execution attempts before promotion.")
  ];
  const accepted = provenStatus.acceptedEvidence || {};

  return {
    schema: "tn12-playground-plan/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "playground-plan-ready",
    target: "real-tn12-session-playground",
    summary: {
      roles: roles.length,
      guidedActions: actions.length,
      acceptedPayloadEventsAvailable: Number(accepted.payloadEvents || 0),
      acceptedTransferRowsAvailable: Number(acceptedActivity.summary?.acceptedTransferRows || 0),
      benchmarkPercent: Number(benchmark.currentPercent || 0),
      sharedWalletPrivateKeys: 0,
      committedSecrets: 0,
      mainnetClaims: 0,
      liveProductClaims: 0
    },
    roles,
    actions,
    faucetFlow: [
      "Generate fresh session wallets for each role.",
      "Display only kaspatest addresses and requested faucet amounts.",
      "User funds addresses through the TN12 faucet or their own TN12 wallet.",
      "The playground fetches UTXOs and enables only actions with sufficient confirmed testnet funds.",
      "Each submitted action writes an artifact row with txid, accepted status, payload match, and replay result."
    ],
    hardRules: [
      "Never expose or reuse repo private keys as public playground wallets.",
      "Do not commit session wallet secrets, mnemonics, seeds, or private keys.",
      "Every positive app action should produce an accepted TN12 txid where network/tooling allows.",
      "Reducer-only rows must stay labeled INDEXER_DERIVED or PLANNER_ONLY.",
      "No mainnet, production custody, external-signer, AMM, lending, liquidation, or oracle-truth claim is allowed from playground activity alone."
    ],
    nextImplementation: [
      "Add playground.html with role wallet generation and faucet checklist.",
      "Add playground session export/import with public addresses and txids only.",
      "Add submit helpers for payload receipts, pool deposits, pool payouts, scheduler bids, and proof bindings.",
      "Add replay panel showing accepted txids, balances, rejected duplicate rows, and blocked withdrawal attempts.",
      "Add cleanup/reset that drops session secrets from browser storage or .local files."
    ]
  };
}

function role(id, label, suggestedFundingTkas, purpose) {
  return {
    id,
    label,
    network: "kaspa-testnet-12",
    suggestedFundingTkas,
    purpose,
    privateKeyPolicy: "session-only-not-committed"
  };
}

function action(id, label, enforcement, detail) {
  return { id, label, enforcement, detail };
}
