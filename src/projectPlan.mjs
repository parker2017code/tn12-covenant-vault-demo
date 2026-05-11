export function buildProjectPlan(fixture = {}) {
  const lanes = fixture.lanes || [];
  const byId = new Map(lanes.map((lane) => [lane.id, lane]));

  const done = [
    laneItem(byId, "escrow", "Seven accepted covenant proof spends are verified through `npm run check:tn12`."),
    laneItem(byId, "payload-invoice", "Accepted payload events prove paid, refund, and error state; the durable replay plan is defined."),
    laneItem(byId, "access-passes", "Accepted redemption payload state is indexed with duplicate safeguards."),
    laneItem(byId, "auction-intents", "Accepted bid and planner payloads prove indexer-side auction state."),
    laneItem(byId, "ai-agent-commitments", "Accepted task, proof, dispute, release, and hold payloads prove lifecycle state."),
    laneItem(byId, "defi-research", "Prediction/hedge review payloads are accepted while settlement remains out of scope."),
    action("custody-requirements", "Batch assurance names the exact amount-matched pledge outputs needed before custody settlement.", "batch-assurance"),
    action("accepted-pledge-outputs", "TN12 accepted the 45/35/20 TKAS batch-assurance pledge outputs and the custody import gate now matches those accepted outpoints.", "batch-assurance"),
    action("indexer-replay-plan", "The accepted-index replay plan defines storage, virtual-chain reader, reducers, rollback replay, and health surface.", "payload-invoice"),
    action("indexer-storage-schema", "The durable indexer storage contract now defines checkpoint, transaction, payload event, proof spend, and rollback tables.", "payload-invoice"),
    action("indexer-fixture-replay", "The fixture-backed replay run now materializes checkpoint, accepted transaction, payload event, proof spend, and rollback rows from the current checkpoint.", "payload-invoice"),
    action("based-app-prototypes", "DeFi reducers, auction/intents, coordination/Stag, and agent commitments now form the based-app prototype lane.", "defi-research"),
    action("covenant-adversarial-map", "Local adversarial coverage now maps selector, output lock, amount, time-lock, input-mass, role-separation, and script-mapping gaps for seven proof paths.", "escrow"),
    action("role-separated-fixtures", "Role-separated public constructor fixtures and compiled scripts are ready for the next proof pass without mutating historical accepted-proof artifacts.", "escrow"),
    action("role-separated-funding", "Accepted role-separated funding created fresh vault, assurance, and escrow P2SH outputs in one transaction.", "escrow"),
    action("role-separated-spend-drafts", "Role-separated spend drafts now use distinct owner/recovery, contributor/recipient, and buyer/seller keys from the accepted role-separated outputs.", "escrow"),
    action("role-separated-accepted-spends", "TN12 accepted all seven role-separated positive paths: vault recovery/withdrawal, assurance release/refund, and escrow release/refund/cancel.", "escrow"),
    action("role-separated-invalid-candidates", "Local review candidates now map wrong signer, wrong selector, wrong output lock, wrong amount, bad lock shape, and single-party cancel mutations before any TN12 rejection attempt.", "escrow"),
    action("batch-settlement-release", "TN12 accepted the 3-pledge batch-assurance release; refund drafts are non-selected alternates for that spent pledge set.", "batch-assurance")
  ];

  const wip = [
    laneItem(byId, "submit-console", "Wallet submit package is built; the live no-local-key connector remains WIP."),
    laneItem(byId, "batch-assurance", "Accepted pledge outputs and the accepted release are indexed; refund drafts stay non-selected for that pledge set."),
    laneItem(byId, "miner-pool-signals", "Source signature review now gates influence; reputation thresholds still need hardening."),
    laneItem(byId, "treasury-vaults", "Turn policy templates into constrained spend drafts with role separation.")
  ];

  const next = [
    action("batch-alternate-path-cleanup", "Keep release acceptance, refund non-selection, checkpoint replay, and operator status synchronized.", "batch-assurance"),
    action("indexer-virtual-chain-reader", "Replace known-txid checkpoint input with a node/RPC virtual-chain reader feeding the replay tables.", "payload-invoice"),
    action("attestation-reputation", "Add reputation thresholds and signer provenance before signals affect more app lanes.", "miner-pool-signals"),
    action("wallet-connector-submit", "Wire the wallet-submit package into a live no-local-key wallet flow.", "submit-console"),
    action("based-app-vertical", "Turn one based-app prototype into a user-run flow: fund, submit, replay, block invalid action.", "defi-research")
  ];

  const later = [
    laneItem(byId, "simple-assets", "Keep issuer-indexed policy state separate from future covenant-native assets."),
    laneItem(byId, "coordination-markets", "Transparent settlement drafts can come before opacity or capital multiplexing claims."),
    laneItem(byId, "zk-anchor-readiness", "Define public inputs, roots, anchors, and trust model before bridge/oracle/vProg claims."),
    action("native-assets-and-stables", "Track stable-value and native-asset work as issuer/indexer or future protocol lanes until rails exist.", "defi-research"),
    action("vprog-forward-compat", "Keep L1 covenant, based-app, native-asset, ICC, and vProg assumptions separated until each interface is testable.", "defi-research"),
    action("marketplace-escrow", "Turn accepted escrow release/refund into a user-facing commerce workflow after wallet submit improves.", "escrow")
  ];

  return {
    schema: "tn12-project-plan/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: "active-operator-plan",
    summary: {
      done: done.length,
      wip: wip.length,
      next: next.length,
      later: later.length
    },
    currentPrinciple: "Use direct labels: money rail, covenant primitive, based-app prototype, wallet policy, or later vProg work.",
    focusVerticals: [
      "Invoice/receipt: accepted transaction app state.",
      "Escrow/assurance: TN12 covenant proof app.",
      "Based-app prototypes: DeFi, coordination, auctions, agents, and app-state reducers."
    ],
    done,
    wip,
    next,
    later,
    operatingChecks: [
      "Run `npm run check:all` before committing code or UI changes.",
      "Run `npm run check:tn12` before claiming accepted TN12 proof or payload state.",
      "Keep REST submit no-payload results historical for payload receipts.",
      "Do not expose `.local/tn12-wallet.json` or private key material."
    ],
    longTermVision: [
      "A wallet-reviewed Kaspa app console that can submit exact payload and covenant drafts without local keys.",
      "A durable accepted-transaction indexer with rollback replay instead of known-txid fixture reads.",
      "Covenant-backed escrow, vault, assurance, and treasury flows that remain TN12-labeled until mainnet tooling is ready.",
      "Builder-facing examples for app-state payloads, attestations, issuer-indexed assets, based-app prototypes, and future native rails."
    ]
  };
}

function laneItem(byId, id, detail) {
  const lane = byId.get(id) || {};
  return {
    laneId: id,
    name: lane.name || id,
    status: lane.status || "planned",
    enforcement: lane.enforcement || "unknown",
    readiness: lane.readiness || "unknown",
    proof: lane.proof || "none",
    detail,
    next: lane.next || ""
  };
}

function action(id, detail, laneId) {
  return {
    id,
    laneId,
    detail
  };
}
