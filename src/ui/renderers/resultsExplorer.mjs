import { fetchJson, fetchJsonMap } from "../dataLoader.mjs";
import { escapeHtml, shortTxid } from "../formatters.mjs";

export async function renderResultsExplorer(documentRef = document) {
  const summaryNode = documentRef.querySelector("#results-summary");
  const levelNode = documentRef.querySelector("#knowledge-levels");
  const railNode = documentRef.querySelector("#results-rails");
  const feedNode = documentRef.querySelector("#results-feed");
  const flowNode = documentRef.querySelector("#results-flow");
  const standardsNode = documentRef.querySelector("#standards-adapters");
  if (!summaryNode || !levelNode || !railNode || !feedNode || !flowNode) return;

  try {
    const artifacts = await fetchJsonMap({
      proven: "artifacts/proven-status.json",
      labChecks: "artifacts/full-defi-benchmark.json",
      index: "artifacts/checkpointed-accepted-index.json",
      activity: "artifacts/defi-accepted-activity-ledger.json",
      scheduler: "artifacts/scheduler-intent-registry.json",
      binding: "artifacts/scheduler-covenant-binding.json",
      standards: "artifacts/standards-adapter-backlog.json",
      payloadEvents: "fixtures/PayloadEventEvidence.json"
    });
    const recentEvents = await loadRecentEvents(artifacts.payloadEvents.events || []);

    renderSummary(summaryNode, artifacts);
    renderKnowledgeLevels(levelNode);
    renderRails(railNode, artifacts.labChecks);
    renderFeed(feedNode, recentEvents);
    renderFlow(flowNode, artifacts);
    if (standardsNode) renderStandards(standardsNode, artifacts.standards);
    wireLevelTabs(documentRef);
  } catch (error) {
    summaryNode.innerHTML = `<article><span>Load error</span><strong>Artifact read failed</strong><p>${escapeHtml(error.message)}</p></article>`;
  }
}

function renderSummary(node, { proven, labChecks, index, activity, scheduler, binding }) {
  node.innerHTML = `
    ${metric("Accepted proof transactions", proven.acceptedEvidence.proofTransactions + proven.acceptedEvidence.roleSeparatedProofTransactions, "Nine core proof/funding/settlement rows plus seven role-separated repeats.")}
    ${metric("Accepted app receipts", proven.acceptedEvidence.payloadEvents, "App data written into accepted TN12 transactions. Replay can read it; the receipt alone is not custody settlement.")}
    ${metric("Checkpointed records", index.summary.total, "Accepted proof, output, and payload rows replayed into app state.")}
    ${metric("Pool-style lab checks", `${labChecks.summary.completedRails} / ${labChecks.summary.rails} rails`, "Research checks with repo evidence, not production DeFi.")}
    ${metric("Accepted transfers", activity.summary.acceptedTransferRows, "Local-key custody movement across pool and user roles.")}
    ${metric("Scheduler rows", scheduler.summary.acceptedBids + scheduler.summary.executedTriggers + binding.summary.readyBindings, "Intent, bids, execution, and covenant-binding rows.")}
  `;
}

function renderKnowledgeLevels(node) {
  node.innerHTML = `
    <div class="level-tabs" role="tablist" aria-label="Explanation level">
      <button type="button" data-level-tab="beginner" aria-selected="true">Beginner</button>
      <button type="button" data-level-tab="crypto">Crypto-native</button>
      <button type="button" data-level-tab="builder">Builder</button>
    </div>
    <article class="level-card" data-level-panel="beginner">
      <span>Plain English</span>
      <h3>Accepted testnet actions become replayable app state.</h3>
      <p>Money moved between TN12 wallets. App receipts landed on TN12. The repo reads those accepted records and shows who funded, who deposited, who got paid, and what actions were blocked.</p>
      <p>That is the interesting part: fast public ordering plus small proofs lets an app explain itself without asking you to trust one private database.</p>
    </article>
    <article class="level-card hidden" data-level-panel="crypto">
      <span>Crypto-native</span>
      <h3>Accepted UTXO proofs plus payload-indexed app state.</h3>
      <p>The proof core covers minimal vault, pledge, escrow, auction, and role-separated covenant spends. The app layer adds accepted payloads and real local-key UTXO transfers for deposits, payouts, scheduler intents, bids, execution, and primitive bindings.</p>
      <p>AMM pricing, oracle inputs, liquidation authority, and production custody are separate paths.</p>
    </article>
    <article class="level-card hidden" data-level-panel="builder">
      <span>Builder</span>
      <h3>Open txids, then run the gates.</h3>
      <p>Use <code>npm run check:all</code>, <code>npm run check:tn12</code>, and <code>npm run demo:operator-refresh</code>. Install with <code>npm ci</code> first. These commands verify or rebuild local evidence; they do not broadcast. The proof docs are <code>docs/AUDIT_MAP.md</code>, <code>docs/PROOF_INDEX.md</code>, and <code>docs/TN12_TEST_MATRIX.md</code>. Pool-style lab details live in <code>artifacts/full-defi-benchmark.json</code>.</p>
      <p>The public page keeps labels plain. The artifact files keep the exact enforcement classes for builders.</p>
    </article>
  `;
}

function renderRails(node, benchmark) {
  node.innerHTML = benchmark.rails.map((rail) => `
    <article class="${rail.done ? "rail-done" : "rail-open"}">
      <span>${escapeHtml(publicRailLabel(rail.label, rail.done))}</span>
      <strong>${escapeHtml(rail.done ? "Verified" : "Next piece")}: ${escapeHtml(publicRailTitle(rail.title))}</strong>
      <p>${escapeHtml(publicRailEvidence(rail.evidence))}</p>
    </article>
  `).join("");
}

function renderFeed(node, events) {
  node.innerHTML = events.map((event) => `
    <article>
      <span>${escapeHtml(event.value || event.status || "accepted")}</span>
      <strong>${escapeHtml(event.subject || event.label)}</strong>
      <p>${escapeHtml(event.label)} · ${txLink(event.txid)}</p>
    </article>
  `).join("");
}

function renderFlow(node, { proven, activity, scheduler, labChecks }) {
  const steps = [
    ["1", "Covenant proof spend", `${proven.acceptedEvidence.proofTransactions + proven.acceptedEvidence.roleSeparatedProofTransactions} accepted proof transactions across core and role-separated paths.`],
    ["2", "App receipt", `${proven.acceptedEvidence.payloadEvents} accepted app receipt events record app intent and status.`],
    ["3", "Custody-adjacent movement", `${activity.summary.acceptedTransferRows} accepted local-key transfers move tKAS across user, pool, and operator roles.`],
    ["4", "Replay/indexer state", `${scheduler.summary.acceptedIntents} accepted scheduler intent and ${scheduler.summary.acceptedBids} accepted bids feed deterministic state.`],
    ["5", "Lab boundary", `${labChecks.summary.completedRails} of ${labChecks.summary.rails} pool-style lab checks have repo evidence; the rest stays in Lab Tools.`]
  ];
  node.innerHTML = steps.map(([num, title, body]) => `
    <article>
      <span>${escapeHtml(num)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(body)}</p>
    </article>
  `).join("");
}

function publicRailLabel(label, done) {
  const labels = {
    TN12_ACCEPTED: "accepted on TN12",
    LOCAL_KEY_CUSTODY_TEST: "accepted testnet transfers",
    INDEXER_DERIVED: "replayed from accepted records",
    MAINNET_BLOCKED: "not mainnet-ready",
    PLANNER_ONLY: "lab model only"
  };
  return labels[label] || (done ? "verified" : "next");
}

function publicRailTitle(title) {
  return String(title)
    .replace("Covenant primitives accepted on TN12", "Covenant spend examples")
    .replace("Accepted app-state payload ledger", "App receipts")
    .replace("Accepted app receipt ledger", "App receipts")
    .replace("Multi-wallet local-key custody movement", "Multi-wallet testnet transfers")
    .replace("Scheduler intent, bids, and execution receipts", "Scheduler receipts")
    .replace("Scheduler-to-covenant proof binding", "Scheduler proof reference")
    .replace("Deterministic indexer replay and duplicate guards", "Replay and duplicate checks")
    .replace("External signer round trip", "User-wallet signing")
    .replace("Live removed-block rollback evidence", "Live rollback check")
    .replace("AMM/lending/liquidation custody execution", "AMM, lending, and liquidation settlement")
    .replace("Mainnet covenant activation and production wallet/indexer review", "Mainnet activation and production review");
}

function publicRailEvidence(evidence) {
  return String(evidence)
    .replace("Vault, pledge, escrow, auction, and role-separated proof rows are accepted.", "Vault, pledge, escrow, auction, and role-separated examples have accepted TN12 records.")
    .replace("40 payload events are accepted and replayed.", "40 app receipt events are accepted and replayed.")
    .replace("40 app receipt events are accepted and replayed.", "40 app receipt events are accepted and replayed.")
    .replace("Accepted scheduler payloads feed deterministic trigger and bid reducers.", "Accepted scheduler receipts feed deterministic trigger and bid state.")
    .replace("Accepted binding payload references an accepted covenant proof row.", "One accepted binding receipt references an accepted covenant proof row.")
    .replace("Fixture replay, overlap, duplicate, and rollback-match guards pass locally.", "Replay, duplicate, overlap, and rollback-match checks pass locally.")
    .replace("A real wallet must sign bytes and return a verifiable accepted txid.", "A user wallet still needs to sign a request, submit it, and return an accepted txid.")
    .replace("Promotion stays blocked until live removed-block evidence is captured.", "Live removed-block evidence still needs to be captured before this is treated as production replay behavior.")
    .replace("Pricing, oracle truth, autonomous pool custody, liquidations, and risk engine execution are not script-enforced.", "Pricing, oracle inputs, pool custody, liquidations, and risk execution still need separate settlement rules.")
    .replace("TN12 evidence does not prove mainnet activation or production custody readiness.", "TN12 evidence does not prove mainnet activation or production custody.");
}

function renderStandards(node, standards) {
  node.innerHTML = standards.lanes.map((lane) => `
    <article class="rail-open">
      <span>${escapeHtml(publicAdapterStatus(lane.status))} · adapter idea · ${escapeHtml(publicAdapterText(lane.standard))}</span>
      <strong>${escapeHtml(publicAdapterText(lane.label))}</strong>
      <p>${escapeHtml(publicAdapterText(lane.fit))}</p>
      <p><small>Next: ${escapeHtml(publicAdapterText(lane.next))}</small></p>
      ${sourceLink(lane.source)}
    </article>
  `).join("");
}

function publicAdapterStatus(status) {
  const labels = {
    BUILDABLE_NEXT: "buildable next",
    ADAPTER_ONLY: "metadata mapping",
    TOCCATA_TRACK: "future protocol track",
    MAINNET_READINESS_BLOCKER: "needs wallet signing"
  };
  return labels[status] || String(status).toLowerCase().replaceAll("_", " ");
}

function publicAdapterText(value) {
  return String(value || "")
    .replace(/Unsigned request \/ external signer convention/gi, "User-wallet request convention")
    .replace(/External signer round trip/gi, "User-wallet signing")
    .replace(/external signer/gi, "user wallet")
    .replace(/external wallet/gi, "user wallet")
    .replace(/external signing/gi, "user-wallet signing")
    .replace(/Mainnet readiness blocker/gi, "needs wallet signing")
    .replace(/real user wallet signs/gi, "a user wallet signs")
    .replace(/real wallet signs/gi, "a user wallet signs");
}

async function loadRecentEvents(events) {
  const recent = events.slice(-10);
  return Promise.all(recent.map(async (event) => {
    const evidence = await fetchJson(event.outPath);
    const payload = evidence.payload?.decoded?.payload || {};
    return {
      label: event.label,
      txid: evidence.txid,
      status: evidence.status,
      subject: payload.subject || evidence.invoiceId,
      value: payload.value || evidence.value
    };
  }));
}

function wireLevelTabs(documentRef) {
  for (const button of documentRef.querySelectorAll("[data-level-tab]")) {
    button.addEventListener("click", () => {
      const level = button.dataset.levelTab;
      for (const item of documentRef.querySelectorAll("[data-level-tab]")) {
        item.setAttribute("aria-selected", String(item === button));
      }
      for (const panel of documentRef.querySelectorAll("[data-level-panel]")) {
        panel.classList.toggle("hidden", panel.dataset.levelPanel !== level);
      }
    });
  }
}

function metric(label, value, detail) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(detail)}</p></article>`;
}

function txLink(txid) {
  return `<a href="https://tn12.kaspa.stream/transactions/${escapeHtml(txid)}" target="_blank" rel="noreferrer"><code>${escapeHtml(shortTxid(String(txid)))}</code></a>`;
}

function sourceLink(source) {
  const value = String(source || "");
  if (!value) return "";
  if (value.startsWith("http")) {
    return `<p><a href="${escapeHtml(value)}" target="_blank" rel="noreferrer">external reference</a></p>`;
  }
  if (/^(artifacts|fixtures|docs|src|scripts)\//.test(value)) {
    return `<p><a href="${escapeHtml(value)}">repo source</a></p>`;
  }
  return `<p><code>${escapeHtml(value)}</code></p>`;
}
