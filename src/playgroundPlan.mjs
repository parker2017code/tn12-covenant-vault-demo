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
      benchmarkRails: `${Number(benchmark.summary?.completedRails || 0)} / ${Number(benchmark.summary?.rails || 0)}`,
      sharedWalletPrivateKeys: 0,
      committedSecrets: 0,
      mainnetClaims: 0,
      liveProductClaims: 0
    },
    roles,
    actions,
    startHere: [
      quickstart(
        "observe",
        "Watch accepted TN12 money move",
        "No wallet needed.",
        "Open the four txids, compare the explorer records to the replay balances, then inspect blocked withdrawals.",
        "#activity",
        "Open accepted txs"
      ),
      quickstart(
        "faucet",
        "Run with fresh faucet wallets",
        "Needs TN12 tKAS.",
        "Generate session wallets, fund only public kaspatest addresses, submit tiny transfers, then replay the accepted txids.",
        "#flow",
        "Open run path"
      ),
      quickstart(
        "own-wallet",
        "Bring your own external wallet",
        "No repo private keys.",
        "Export a request, review exact fields in your wallet, return signed bytes, validate the fingerprint, submit, then replay.",
        "#wallet",
        "Open wallet handoff"
      ),
      quickstart(
        "extend",
        "Build a based-app lane",
        "Start from accepted evidence.",
        "Use the same loop for DeFi reducers, coordination packs, auctions, access passes, or agent commitments.",
        "lab.html#product-map",
        "Open builder map"
      )
    ],
    ownWalletFlow: [
      "Pick a lane and export the unsigned wallet-standard request.",
      "Review network, inputs, outputs, fees, payload bytes, compute budget, and human intent.",
      "Sign outside the repo with a TN12-capable wallet or signer.",
      "Return the signed transaction or signer-result artifact.",
      "Run signer validation before any submit.",
      "Submit through the field-preserving route required by that lane.",
      "Replay accepted txid evidence before the UI promotes app state."
    ],
    faucetFlow: [
      "Generate fresh session wallets for each role.",
      "Display only kaspatest addresses and requested faucet amounts.",
      "User funds addresses through the TN12 faucet or their own TN12 wallet.",
      "The playground fetches UTXOs and enables only actions with sufficient confirmed testnet funds.",
      "Each submitted action writes an artifact row with txid, accepted status, payload match, and replay result."
    ],
    commonSense: [
      "Use fresh session wallets; keep repo private keys out of public playground flows.",
      "Keep session wallet secrets, mnemonics, seeds, and private keys out of commits.",
      "When tooling allows a positive app action, back it with an accepted TN12 txid.",
      "Label reducer-only rows as indexer-derived or planner-only.",
      "Treat mainnet, production custody, external signing, AMMs, lending, liquidation, and oracle truth as separate rails."
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

function quickstart(id, title, requirement, detail, href, cta) {
  return { id, title, requirement, detail, href, cta };
}
