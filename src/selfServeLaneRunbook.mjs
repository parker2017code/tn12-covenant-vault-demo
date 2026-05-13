export function buildSelfServeLaneRunbook({
  provenStatus,
  playgroundPlan,
  acceptedActivity,
  benchmark,
  batchAssurance,
  escrowActionMap,
  coordinationMarket,
  walletRequests,
  accessPasses,
  auctionIntents,
  agentCommitments,
  generatedAt = new Date().toISOString()
}) {
  const lanes = [
    lane({
      id: "live-playground",
      title: "TN12 playground flow",
      status: "play-now",
      stackLayer: "money-rail",
      uiTarget: "playground.html",
      availableNow: [
        `${num(playgroundPlan?.summary?.roles)} fresh role wallets`,
        `${num(playgroundPlan?.summary?.guidedActions)} guided actions`,
        `${num(acceptedActivity?.summary?.acceptedTransferRows)} accepted transfer rows`
      ],
      runSteps: [
        "Open TN12 Playground.",
        "Copy a role address or txid.",
        "Open the explorer link and compare it to replayed balances."
      ],
      evidence: [
        "artifacts/playground-plan.json",
        "artifacts/playground-session.example.json",
        "artifacts/defi-accepted-activity-ledger.json"
      ],
      openRail: [
        "Fresh user-run sessions need wallet/faucet funding and explicit replay after submit."
      ],
      commands: ["npm run playground:wallets", "npm run playground:funding-draft", "npm run playground:session"]
    }),
    lane({
      id: "payload-invoices",
      title: "Payload receipt invoices",
      status: "play-now",
      stackLayer: "money-rail",
      uiTarget: "lab.html#invoices",
      availableNow: [
        `${num(provenStatus?.acceptedEvidence?.payloadEvents)} accepted app receipt events`,
        "paid, refunded, and error invoice states",
        "payload byte matching through JSON wRPC evidence"
      ],
      runSteps: [
        "Create or inspect a receipt payload.",
        "Submit through the payload-preserving wRPC route.",
        "Promote invoice state only after accepted txid and payload match."
      ],
      evidence: [
        "fixtures/InvoiceReceipts.json",
        "artifacts/payload-submit-readiness.json",
        "artifacts/checkpointed-accepted-index.json"
      ],
      openRail: [
        "Public REST submit did not preserve payload bytes in this test.",
        "User-wallet signing is the next public-user submit rail."
      ],
      commands: ["npm run invoice:registry", "npm run payload:readiness", "npm run indexer:checkpoint"]
    }),
    lane({
      id: "vault-policy",
      title: "Vault policy",
      status: "design-now",
      stackLayer: "covenant-primitive",
      uiTarget: "lab.html#designer",
      availableNow: [
        "owner/recovery artifact builder",
        "accepted delayed-withdrawal and recovery proof paths",
        "clear planner-only guardian and spend-cap labels"
      ],
      runSteps: [
        "Enter separate owner and recovery addresses.",
        "Review the policy ID and script-enforced boundary.",
        "Use wallet-standard handoff before any user-funded spend."
      ],
      evidence: [
        "contracts/DelayedRecoveryVault.sil",
        "fixtures/AcceptedProofTransactions.json",
        "docs/TN12_TEST_MATRIX.md"
      ],
      openRail: [
        "Guardian enforcement needs explicit script branches or indexer-gated wallet refusal."
      ],
      commands: ["npm run tx:verify", "npm run enforcement:matrix"]
    }),
    lane({
      id: "assurance-funding",
      title: "Assurance funding",
      status: "play-next",
      stackLayer: "covenant-primitive",
      uiTarget: "lab.html#assurance",
      availableNow: [
        `${num(batchAssurance?.summary?.acceptedCount)} accepted pledge outputs`,
        `${num(batchAssurance?.summary?.acceptedTkas)} TKAS accepted toward the batch target`,
        batchAssurance?.summary?.releaseStatus || "release planner state"
      ],
      runSteps: [
        "Review individual pledge release/refund rules.",
        "Import accepted pledge outputs into the campaign view.",
        "Choose exactly one release or refund path before submit."
      ],
      evidence: [
        "artifacts/batch-assurance-campaign.json",
        "artifacts/batch-assurance-submit-runbook.json",
        "artifacts/batch-assurance-settlement-decision.json"
      ],
      openRail: [
        "Campaign target aggregation needs one pooled script-enforced contract or a stricter indexer/wallet gate."
      ],
      commands: ["npm run campaign:state", "npm run campaign:custody", "npm run campaign:submit-runbook"]
    }),
    lane({
      id: "escrow-marketplace",
      title: "Escrow / freelance",
      status: "play-next",
      stackLayer: "covenant-primitive",
      uiTarget: "lab.html#escrow",
      availableNow: [
        `${num(escrowActionMap?.summary?.actions)} marketplace actions mapped`,
        `${num(escrowActionMap?.summary?.simValidatedActions)} actions pass simulated wallet validation`,
        "accepted release, DAA refund, and mutual cancel proof paths"
      ],
      runSteps: [
        "Pick a buyer/seller job flow.",
        "Review release, refund, and cancel actions.",
        "Export the wallet request and replay accepted settlement before promotion."
      ],
      evidence: [
        "artifacts/escrow-marketplace-demo.json",
        "artifacts/escrow-marketplace-flow.json",
        "artifacts/escrow-marketplace-action-map.json"
      ],
      openRail: [
        "Live public-user escrow needs external wallet signing and dispute UX."
      ],
      commands: ["npm run escrow:marketplace", "npm run escrow:flow", "npm run escrow:action-map"]
    }),
    lane({
      id: "access-passes",
      title: "Access passes",
      status: "play-now",
      stackLayer: "app-state",
      uiTarget: "lab.html#access-passes",
      availableNow: [
        `${num(accessPasses?.summary?.totalPasses)} pass types`,
        `${num(accessPasses?.summary?.acceptedRedemptions)} accepted redemption`,
        "issuer review and duplicate/expiry gates"
      ],
      runSteps: [
        "Pick a ticket, coupon, or membership.",
        "Attach accepted redemption evidence.",
        "Require issuer review before off-chain access is granted."
      ],
      evidence: [
        "artifacts/access-pass-planner.json",
        "artifacts/access-pass-issuer-review.json",
        "artifacts/access-pass-gates.json"
      ],
      openRail: [
        "This is issuer/indexer state, not native ticket enforcement."
      ],
      commands: ["npm run access:passes", "npm run access:issuer-review", "npm run check:access-pass"]
    }),
    lane({
      id: "auction-intents",
      title: "Auction and intents",
      status: "play-now",
      stackLayer: "based-app-prototype",
      uiTarget: "lab.html#auction-intents",
      availableNow: [
        `${num(auctionIntents?.summary?.acceptedBidPayloads)} accepted bid payloads`,
        `${num(auctionIntents?.summary?.acceptedSettlementEvents)} accepted settlement-planning events`,
        `${num(auctionIntents?.summary?.auctionsWithWinner)} winner selected by planner`
      ],
      runSteps: [
        "Review accepted bid payloads.",
        "Check winner and loser refund planning.",
        "Do not claim atomic exchange until custody settlement exists."
      ],
      evidence: [
        "artifacts/auction-intents.json",
        "artifacts/auction-settlement-drafts.json",
        "artifacts/auction-custody-review.json"
      ],
      openRail: [
        "Winner selection is planner/indexer state until explicit settlement/refund spends are accepted."
      ],
      commands: ["npm run auction:intents", "npm run auction:settlement-drafts", "npm run auction:custody-review"]
    }),
    lane({
      id: "defi-lab",
      title: "Pool-style lab checks",
      status: "research-play",
      stackLayer: "based-app-prototype",
      uiTarget: "lab.html#defi-backlog",
      availableNow: [
        `${num(benchmark?.summary?.completedRails)} of ${num(benchmark?.summary?.rails)} lab rails have repo evidence`,
        `${num(acceptedActivity?.summary?.poolDeposits)} pool deposits and ${num(acceptedActivity?.summary?.poolPayouts)} payouts accepted`,
        "replay guards and blocked custody rows"
      ],
      runSteps: [
        "Replay accepted local-key transfers.",
        "Inspect reducer balances and blocked withdrawals.",
        "Treat AMM/lending/liquidation as simulation until custody rails exist."
      ],
      evidence: [
        "artifacts/full-defi-benchmark.json",
        "artifacts/defi-artifact-manifest.json",
        "artifacts/defi-scenario-reducer.json"
      ],
      openRail: [
        "AMM custody, lending custody, liquidation, oracle inputs, and user-wallet signing still need separate rules."
      ],
      commands: ["npm run defi:refresh", "npm run defi:accepted-activity", "npm run defi:reducer"]
    }),
    lane({
      id: "coordination-stag",
      title: "Coordination / Stag",
      status: "research-play",
      stackLayer: "based-app-prototype",
      uiTarget: "lab.html#coordination",
      availableNow: [
        `${num(coordinationMarket?.summary?.stags)} stags`,
        `${num(coordinationMarket?.summary?.intendos)} transparent intendos`,
        `${num(coordinationMarket?.summary?.satisfiablePacks)} satisfiable pack`
      ],
      runSteps: [
        "Inspect transparent intendos and packs.",
        "Review the qualifying subset.",
        "Build exact settlement drafts before stronger execution language."
      ],
      evidence: [
        "artifacts/coordination-market-prototype.json",
        "artifacts/coordination-market-settlement-brief.json"
      ],
      openRail: [
        "Privacy, shared capital, composition, and settlement still need separate rules."
      ],
      commands: ["npm run coordination:market", "npm run coordination:settlement-brief"]
    }),
    lane({
      id: "agent-commitments",
      title: "Agent commitments",
      status: "play-next",
      stackLayer: "based-app-prototype",
      uiTarget: "lab.html#agent-commitments",
      availableNow: [
        `${num(agentCommitments?.summary?.tasks)} task rows`,
        `${num(agentCommitments?.summary?.acceptedPayloads)} accepted payloads`,
        `${num(agentCommitments?.summary?.acceptedLifecycleEvents)} accepted lifecycle events`
      ],
      runSteps: [
        "Pick a task offer.",
        "Review proof, dispute, release, or refund status.",
        "Require wallet review before payout."
      ],
      evidence: [
        "artifacts/agent-commitments.json",
        "artifacts/agent-settlement-drafts.json",
        "artifacts/agent-settlement-review.json"
      ],
      openRail: [
        "Settlement needs explicit sponsor or wallet action."
      ],
      commands: ["npm run agent:commitments", "npm run agent:settlement-drafts", "npm run agent:settlement-review"]
    }),
    lane({
      id: "user-wallet-handoff",
      title: "Use your own wallet",
      status: "required-rail",
      stackLayer: "product-rail",
      uiTarget: "lab.html#submit",
      availableNow: [
        `${num(walletRequests?.summary?.mappedRequests)} mapped request candidates`,
        `${num(walletRequests?.summary?.payloadRequests)} payload request candidate`,
        `${num(walletRequests?.summary?.computeBudgetRequests)} compute-budget request candidate`
      ],
      runSteps: [
        "Open wallet-standard requests.",
        "Review exact fields in your wallet.",
        "Return signed bytes and validate fingerprint, payload, route, and approval."
      ],
      evidence: [
        "artifacts/wallet-standard-requests.json",
        "artifacts/wallet-external-signer-result-template.json",
        "artifacts/wallet-standard-signer-validation.json"
      ],
      openRail: [
        "This validates request/return metadata; it does not yet prove a public wallet signed and submitted."
      ],
      commands: ["npm run wallet:standard-requests", "npm run wallet:external-signer-template", "npm run wallet:standard-signer-validation"]
    }),
    lane({
      id: "funding",
      title: "Get and verify tKAS",
      status: "start-here",
      stackLayer: "product-rail",
      uiTarget: "lab.html#funding",
      availableNow: [
        "faucet-directed funding path",
        "manual outpoint importer",
        "TN12 explorer verification"
      ],
      runSteps: [
        "Create or paste a kaspatest address.",
        "Use the TN12 faucet or your own funded testnet wallet.",
        "Paste txid, output index, amount, and explorer URL before building a spend."
      ],
      evidence: [
        "artifacts/live-wallet-utxos.json",
        "artifacts/tn12-defi-v1-current-outpoint.json",
        "docs/TN12_TEST_MATRIX.md"
      ],
      openRail: [
        "The repo cannot automate faucet requests when the faucet host challenges the shell."
      ],
      commands: ["npm run address", "npm run utxos:fetch"]
    })
  ];

  return {
    schema: "tn12-self-serve-lane-runbook/v1",
    network: "kaspa-testnet-12",
    status: "self-serve-lane-runbook-ready",
    generatedAt,
    summary: {
      lanes: lanes.length,
      playNow: lanes.filter((item) => item.status === "play-now").length,
      playNext: lanes.filter((item) => item.status === "play-next").length,
      researchPlay: lanes.filter((item) => item.status === "research-play").length,
      requiredRails: lanes.filter((item) => item.status === "required-rail").length,
      moneyRails: lanes.filter((item) => item.stackLayer === "money-rail").length,
      covenantPrimitives: lanes.filter((item) => item.stackLayer === "covenant-primitive").length,
      basedAppPrototypes: lanes.filter((item) => item.stackLayer === "based-app-prototype").length,
      liveProductClaims: 0,
      sharedPrivateKeys: 0
    },
    stackRule: "Kaspa app work should move from fast money rails, to covenant money-control primitives, to based-app prototypes that need richer state anchored by Kaspa ordering, commitments, proofs, or settlement. ZK is one verification path for based apps, not the definition of every based app.",
    userRule: "A lane is public-ready only when a user can fund, review, sign or hand off signing, submit where tooling allows, and replay accepted evidence without sharing private keys.",
    lanes
  };
}

function lane({ id, title, status, stackLayer, uiTarget, availableNow, runSteps, evidence, openRail, commands }) {
  return {
    id,
    title,
    status,
    stackLayer,
    uiTarget,
    availableNow: availableNow.filter(Boolean),
    runSteps,
    evidence,
    openRail,
    commands
  };
}

function num(value) {
  return value ?? 0;
}
