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
      benchmark: "artifacts/full-defi-benchmark.json",
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
    renderRails(railNode, artifacts.benchmark);
    renderFeed(feedNode, recentEvents);
    renderFlow(flowNode, artifacts);
    if (standardsNode) renderStandards(standardsNode, artifacts.standards);
    wireLevelTabs(documentRef);
  } catch (error) {
    summaryNode.innerHTML = `<article><span>Load error</span><strong>Artifact read failed</strong><p>${escapeHtml(error.message)}</p></article>`;
  }
}

function renderSummary(node, { proven, benchmark, index, activity, scheduler, binding }) {
  node.innerHTML = `
    ${metric("Accepted proof txs", proven.acceptedEvidence.proofTransactions + proven.acceptedEvidence.roleSeparatedProofTransactions, "Covenant proof spends and role-separated repeats.")}
    ${metric("Payload events", proven.acceptedEvidence.payloadEvents, "Accepted app-state receipts replayed from TN12.")}
    ${metric("Indexed records", index.summary.total, "Proof, payload, and output evidence in one checkpoint.")}
    ${metric("DeFi lab rails", `${benchmark.summary.completedRails} / ${benchmark.summary.rails}`, "Repo-local rail detail lives in Lab Tools.")}
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
      <h3>Real testnet actions become a replayable app story.</h3>
      <p>Money moved between TN12 wallets. App receipts landed on TN12. The repo reads those accepted records and shows who funded, who deposited, who got paid, and what actions were blocked.</p>
      <p>That is the interesting part: fast public ordering plus small proofs lets an app explain itself without asking you to trust one private database.</p>
    </article>
    <article class="level-card hidden" data-level-panel="crypto">
      <span>Crypto-native</span>
      <h3>Accepted UTXO proofs plus payload-indexed app state.</h3>
      <p>The proof core covers minimal vault, pledge, escrow, auction, and role-separated covenant spends. The app layer adds accepted payloads and real local-key UTXO transfers for deposits, payouts, scheduler intents, bids, execution, and primitive bindings.</p>
      <p>AMM pricing, oracle inputs, liquidation authority, and production custody are separate rails.</p>
    </article>
    <article class="level-card hidden" data-level-panel="builder">
      <span>Builder / reviewer</span>
      <h3>Click txids, then run the gates.</h3>
      <p>Use <code>npm run check:all</code>, <code>npm run check:tn12</code>, and <code>npm run operator:refresh</code>. The canonical maps are <code>docs/AUDIT_MAP.md</code>, <code>docs/PROOF_INDEX.md</code>, <code>docs/TN12_TEST_MATRIX.md</code>, and <code>artifacts/full-defi-benchmark.json</code>.</p>
      <p>Look for the enforcement label on each rail: <code>TN12_ACCEPTED</code>, <code>LOCAL_KEY_CUSTODY_TEST</code>, <code>INDEXER_DERIVED</code>, <code>PLANNER_ONLY</code>, or <code>MAINNET_BLOCKED</code>.</p>
    </article>
  `;
}

function renderRails(node, benchmark) {
  node.innerHTML = benchmark.rails.map((rail) => `
    <article class="${rail.done ? "rail-done" : "rail-open"}">
      <span>${escapeHtml(rail.label)}</span>
      <strong>${escapeHtml(rail.done ? "accepted evidence" : "missing piece")}: ${escapeHtml(rail.title)}</strong>
      <p>${escapeHtml(rail.evidence)}</p>
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

function renderFlow(node, { proven, activity, scheduler, benchmark }) {
  const steps = [
    ["1", "Covenant proof spend", `${proven.acceptedEvidence.proofTransactions + proven.acceptedEvidence.roleSeparatedProofTransactions} accepted proof transactions across core and role-separated paths.`],
    ["2", "Payload receipt", `${proven.acceptedEvidence.payloadEvents} accepted payload events record app intent and status.`],
    ["3", "Custody-adjacent movement", `${activity.summary.acceptedTransferRows} accepted local-key transfers move tKAS across user, pool, and operator roles.`],
    ["4", "Reducer/indexer state", `${scheduler.summary.acceptedIntents} accepted scheduler intent and ${scheduler.summary.acceptedBids} accepted bids feed deterministic state.`],
    ["5", "Lab boundary", `${benchmark.summary.completedRails} of ${benchmark.summary.rails} DeFi lab rails have repo evidence; the rest stay in Lab Tools.`]
  ];
  node.innerHTML = steps.map(([num, title, body]) => `
    <article>
      <span>${escapeHtml(num)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(body)}</p>
    </article>
  `).join("");
}

function renderStandards(node, standards) {
  node.innerHTML = standards.lanes.map((lane) => `
    <article class="rail-open">
      <span>${escapeHtml(lane.status)} · future adapter · ${escapeHtml(lane.standard)}</span>
      <strong>${escapeHtml(lane.label)}</strong>
      <p>${escapeHtml(lane.fit)}</p>
      <p><small>Next: ${escapeHtml(lane.next)}</small></p>
      ${sourceLink(lane.source)}
    </article>
  `).join("");
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
