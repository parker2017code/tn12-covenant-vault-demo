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
    action("custody-requirements", "Batch assurance now names the exact amount-matched pledge outputs needed before custody settlement.", "batch-assurance"),
    action("indexer-replay-plan", "The accepted-index replay plan defines storage, virtual-chain reader, reducers, rollback replay, and health surface.", "payload-invoice"),
    action("based-rollup-scout", "The scout artifact records that current TN12 work does not use an L2, while core-migratable based rollups remain worth tracking for later.", "defi-research")
  ];

  const wip = [
    laneItem(byId, "submit-console", "Wallet submit package is built; the live no-local-key connector remains WIP."),
    laneItem(byId, "batch-assurance", "Next work is real accepted pledge-output transactions for the amounts listed in the custody requirements."),
    laneItem(byId, "miner-pool-signals", "Source signature review now gates influence; reputation thresholds still need hardening."),
    laneItem(byId, "treasury-vaults", "Turn policy templates into constrained spend drafts with role separation.")
  ];

  const next = [
    action("pledge-output-drafts", "Build wallet-reviewable pledge output drafts for 45, 35, and 20 TKAS.", "batch-assurance"),
    action("indexer-storage-schema", "Create the first durable replay storage schema and fixture-backed replay runner.", "payload-invoice"),
    action("covenant-negative-tests", "Add wrong-signer and wrong-script-argument checks for accepted proof lanes.", "escrow"),
    action("attestation-reputation", "Add reputation thresholds and signer provenance before signals affect more app lanes.", "miner-pool-signals"),
    action("wallet-connector-submit", "Wire the wallet-submit package into a live no-local-key wallet flow.", "submit-console"),
    action("rollup-bridge-brief", "Map entry, transfer, exit, claim, proof, and state-root responsibilities from core and core-adjacent references.", "defi-research")
  ];

  const later = [
    laneItem(byId, "simple-assets", "Keep issuer-indexed policy state separate from future covenant-native assets."),
    laneItem(byId, "coordination-markets", "Transparent settlement drafts can come before opacity or capital multiplexing claims."),
    laneItem(byId, "zk-anchor-readiness", "Define public inputs, roots, anchors, and trust model before bridge/oracle/vProg claims."),
    action("native-assets-and-stables", "Track stable-value and native-asset work as issuer/indexer or future protocol lanes until rails exist.", "defi-research"),
    action("vprog-forward-compat", "Keep L1 covenant, based-rollup, native-asset, ICC, and vProg assumptions separated until each interface is testable.", "defi-research"),
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
    currentPrinciple: "Positive app-state claims need accepted TN12 evidence; planner, wallet-policy, and research lanes stay labeled.",
    focusVerticals: [
      "Invoice/receipt: accepted transaction app state.",
      "Escrow/assurance: TN12 covenant proof app.",
      "Attestation/agent/prediction: research-to-app bridge."
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
      "Builder-facing examples for app-state payloads, attestations, issuer-indexed assets, based-rollup scouting, and future native rails."
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
