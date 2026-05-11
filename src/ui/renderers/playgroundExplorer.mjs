import { fetchJson } from "../dataLoader.mjs";
import { escapeHtml, shortAddress, shortTxid } from "../formatters.mjs";

export async function renderPlaygroundExplorer(documentRef = document) {
  const summaryNode = documentRef.querySelector("#playground-summary");
  const levelsNode = documentRef.querySelector("#playground-levels");
  const rolesNode = documentRef.querySelector("#playground-roles");
  const sessionNode = documentRef.querySelector("#playground-session");
  const activityStripNode = documentRef.querySelector("#playground-activity-strip");
  const txMapNode = documentRef.querySelector("#playground-tx-map");
  const actionsNode = documentRef.querySelector("#playground-actions");
  const rulesNode = documentRef.querySelector("#playground-rules");
  const flowNode = documentRef.querySelector("#playground-flow");
  const replaySummaryNode = documentRef.querySelector("#playground-replay-summary");
  const sessionBalancesNode = documentRef.querySelector("#playground-session-balances");
  const balancesNode = documentRef.querySelector("#playground-balances");
  const blockedNode = documentRef.querySelector("#playground-blocked");
  if (!summaryNode || !rolesNode || !actionsNode || !rulesNode || !flowNode) return;

  try {
    const [plan, actions, reducer, activity, session, funding, deposit, secondDeposit, payout] = await Promise.all([
      fetchJson("artifacts/playground-plan.json"),
      fetchJson("artifacts/playground-actions.json"),
      fetchJson("artifacts/defi-scenario-reducer.json"),
      fetchJson("artifacts/defi-accepted-activity-ledger.json"),
      fetchJson("artifacts/playground-session.example.json"),
      fetchJson("artifacts/playground-funding-evidence.json"),
      fetchJson("artifacts/playground-user-a-pool-deposit-evidence.json"),
      fetchJson("artifacts/playground-user-b-pool-deposit-evidence.json"),
      fetchJson("artifacts/playground-pool-user-b-payout-evidence.json")
    ]);
    summaryNode.innerHTML = `
      ${metric("Roles", plan.summary.roles, "Throwaway TN12 session roles.")}
      ${metric("Guided actions", plan.summary.guidedActions, "Real TN12 targets where tooling allows.")}
      ${metric("Payload events available", plan.summary.acceptedPayloadEventsAvailable, "Current accepted receipt evidence.")}
      ${metric("Transfer rows available", plan.summary.acceptedTransferRowsAvailable, "Current local-key custody movement evidence.")}
      ${metric("Shared private keys", plan.summary.sharedWalletPrivateKeys, "Must remain zero.")}
      ${metric("Benchmark", `${plan.summary.benchmarkPercent}%`, "Current repo-local full-DeFi benchmark.")}
    `;
    if (levelsNode) renderLevels(levelsNode, { activity, session, funding, deposit, secondDeposit, payout });
    if (activityStripNode) renderActivityStrip(activityStripNode, { funding, deposit, secondDeposit, payout, reducer, activity });
    const sessionRoleMap = new Map((session.roles || []).map((role) => [role.id, role]));
    rolesNode.innerHTML = plan.roles.map((role) => {
      const sessionRole = sessionRoleMap.get(role.id) || {};
      const address = role.address || sessionRole.address || "";
      return `
      <article>
        <span>${escapeHtml(role.id)} · ${escapeHtml(role.suggestedFundingTkas)} tKAS</span>
        <strong>${escapeHtml(role.label)}</strong>
        <p>${escapeHtml(role.purpose)}</p>
        ${addressChip(address)}
        <small>${escapeHtml(role.privateKeyPolicy)}</small>
      </article>
    `;
    }).join("");
    if (sessionNode) {
      sessionNode.innerHTML = `
        <article class="playground-flow-card">
          <span>${escapeHtml(funding.status)} · ${escapeHtml(funding.accepted ? "accepted" : "review")}</span>
          <strong>${escapeHtml(session.summary.fundedRoles)} funded roles</strong>
          <p>${txLink(funding.txid)}</p>
        </article>
        <article class="playground-flow-card">
          <span>Outputs matched</span>
          <strong>${escapeHtml(funding.outputs.filter((row) => row.matches).length)} / ${escapeHtml(funding.outputs.length)}</strong>
          <p>Each role output matched expected amount and address on TN12.</p>
        </article>
        <article class="playground-flow-card">
          <span>${escapeHtml(deposit.status)} · ${escapeHtml(deposit.accepted ? "accepted" : "review")}</span>
          <strong>${escapeHtml(deposit.payment.amountTkas)} TKAS pool deposit</strong>
          <p>${txLink(deposit.txid)}</p>
        </article>
        <article class="playground-flow-card">
          <span>${escapeHtml(secondDeposit.status)} · ${escapeHtml(secondDeposit.accepted ? "accepted" : "review")}</span>
          <strong>${escapeHtml(secondDeposit.payment.amountTkas)} TKAS second deposit</strong>
          <p>${txLink(secondDeposit.txid)}</p>
        </article>
        <article class="playground-flow-card">
          <span>${escapeHtml(payout.status)} · ${escapeHtml(payout.accepted ? "accepted" : "review")}</span>
          <strong>${escapeHtml(payout.payment.amountTkas)} TKAS pool payout</strong>
          <p>${txLink(payout.txid)}</p>
        </article>
        <article class="playground-flow-card flow-wide">
          <span>What happened</span>
          <strong>fund roles -> two deposits -> payout -> replay balances</strong>
          <p>These are accepted TN12 transfers. The reducer turns them into review state and blocks withdrawals that lack signer/spend evidence.</p>
        </article>
      `;
    }
    if (txMapNode) renderTxMap(txMapNode, { funding, deposit, secondDeposit, payout });
    wireCopyButtons(documentRef);
    actionsNode.innerHTML = actions.actionRows.map((action) => `
      <article>
        <span>${escapeHtml(action.enforcement)} · ${escapeHtml(action.ready ? "ready" : "needs funding")}</span>
        <strong>${escapeHtml(action.label)}</strong>
        <p>${escapeHtml(action.detail)}</p>
      </article>
    `).join("");
    rulesNode.innerHTML = plan.commonSense.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("");
    flowNode.innerHTML = plan.faucetFlow.map((step, index) => `
      <article>
        <span>${index + 1}</span>
        <strong>${escapeHtml(step)}</strong>
      </article>
    `).join("");
    renderReplay({ replaySummaryNode, sessionBalancesNode, balancesNode, blockedNode, reducer, activity, actions, deposit, secondDeposit, payout });
    wireCopyButtons(documentRef);
  } catch (error) {
    summaryNode.innerHTML = `<article><span>Load error</span><strong>Playground plan unavailable</strong><p>${escapeHtml(error.message)}</p></article>`;
  }
}

function renderLevels(node, { activity, session, funding, deposit, secondDeposit, payout }) {
  node.innerHTML = `
    <article>
      <span>Beginner</span>
      <strong>Money moved between test wallets.</strong>
      <p>One accepted tx funded the roles. Then user A sent ${escapeHtml(deposit.payment.amountTkas)} tKAS to the pool, user B sent ${escapeHtml(secondDeposit.payment.amountTkas)} tKAS to the pool, and the pool sent ${escapeHtml(payout.payment.amountTkas)} tKAS to user B.</p>
    </article>
    <article>
      <span>Crypto-curious</span>
      <strong>UTXO transfers became replayable app state.</strong>
      <p>The txids are accepted on TN12. The app reads those accepted rows and derives balances without pretending the reducer controls custody.</p>
    </article>
    <article>
      <span>Kaspa-native</span>
      <strong>Fast mined ordering plus constrained evidence.</strong>
      <p>The chain supplies ordering and accepted transaction evidence. The repo layers role labels, receipts, reducers, and blocked-promotion rules on top.</p>
    </article>
    <article>
      <span>Reviewer</span>
      <strong>${escapeHtml(session.summary.acceptedTxids)} accepted session txs, ${escapeHtml(activity.summary.acceptedTransferRows)} transfer rows.</strong>
      <p>Check ${txLink(funding.txid)}, ${txLink(deposit.txid)}, ${txLink(secondDeposit.txid)}, and ${txLink(payout.txid)} directly on the TN12 explorer.</p>
    </article>
  `;
}

function renderActivityStrip(node, { funding, deposit, secondDeposit, payout, reducer, activity }) {
  const poolBalance = (reducer.state?.balances || []).find((row) => row.address === payout.source.address);
  const userB = (reducer.state?.balances || []).find((row) => row.address === payout.payment.to);
  const rows = [
    {
      label: "Fund",
      amount: "51 tKAS",
      detail: "6 role wallets",
      txid: funding.txid,
      tone: "hot"
    },
    {
      label: "Deposit",
      amount: `${deposit.payment.amountTkas} tKAS`,
      detail: "User A -> pool",
      txid: deposit.txid,
      tone: "go"
    },
    {
      label: "Deposit",
      amount: `${secondDeposit.payment.amountTkas} tKAS`,
      detail: "User B -> pool",
      txid: secondDeposit.txid,
      tone: "go"
    },
    {
      label: "Payout",
      amount: `${payout.payment.amountTkas} tKAS`,
      detail: "Pool -> User B",
      txid: payout.txid,
      tone: "go"
    },
    {
      label: "Replay",
      amount: `${activity.summary.acceptedTransferRows} rows`,
      detail: `pool net ${poolBalance?.balanceTkas || activity.summary.poolNetTkas} tKAS; User B +${userB?.balanceTkas || payout.payment.amountTkas}`,
      txid: "",
      tone: "cool"
    }
  ];
  node.innerHTML = rows.map((row, index) => `
    <article class="activity-card activity-${escapeHtml(row.tone)}">
      <span>${escapeHtml(String(index + 1))}</span>
      <strong>${escapeHtml(row.label)}</strong>
      <p class="activity-amount">${escapeHtml(row.amount)}</p>
      <p>${escapeHtml(row.detail)}</p>
      ${row.txid ? `<p>${txLink(row.txid)}</p>` : "<p>Reducer state below.</p>"}
    </article>
  `).join("");
}

function renderTxMap(node, { funding, deposit, secondDeposit, payout }) {
  const rows = [
    ["1", "Fund roles", "Operator source", "Six session wallets", funding.txid],
    ["2", "Deposit", "User A", "Pool", deposit.txid],
    ["3", "Deposit", "User B", "Pool", secondDeposit.txid],
    ["4", "Payout", "Pool", "User B", payout.txid],
    ["5", "Replay", "Accepted txids", "Balances + blocked withdrawals", ""]
  ];
  node.innerHTML = rows.map(([step, title, from, to, txid]) => `
    <article>
      <span>${escapeHtml(step)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(from)} -> ${escapeHtml(to)}</p>
      ${txid ? `<p>${txLink(txid)}</p>` : "<p>Reducer output below.</p>"}
    </article>
  `).join("");
}

function renderReplay({ replaySummaryNode, sessionBalancesNode, balancesNode, blockedNode, reducer, activity, actions, deposit, secondDeposit, payout }) {
  if (!replaySummaryNode || !balancesNode || !blockedNode) return;
  replaySummaryNode.innerHTML = `
    ${metric("Accepted transfers", activity.summary.acceptedTransferRows, "Real TN12 transfer rows in the current ledger.")}
    ${metric("Pool net", `${activity.summary.poolNetTkas} TKAS`, "Net accepted movement into the pool role.")}
    ${metric("Balance rows", reducer.summary.balanceRows, "Address-level net deltas from selected transfers.")}
    ${metric("Blocked withdrawals", reducer.negativeRows.filter((row) => row.kind === "withdrawal-candidate").length, "Over-balance or unsigned withdrawal attempts.")}
    ${metric("Ready actions", actions.summary.readyActions, "Guided actions with current public prerequisites.")}
    ${metric("Live product claims", actions.summary.liveProductClaims, "Must stay zero.")}
  `;
  if (sessionBalancesNode) {
    const sessionAddresses = [
      ["Pool", payout.source.address],
      ["User A", deposit.source.address],
      ["User B", payout.payment.to]
    ];
    const balances = reducer.state?.balances || [];
    sessionBalancesNode.innerHTML = sessionAddresses.map(([label, address]) => {
      const row = balances.find((item) => item.address === address);
      return `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(row?.balanceTkas || "0")} TKAS</strong>
          ${addressChip(address)}
        </article>
      `;
    }).join("");
  }
  const balances = reducer.state?.balances || [];
  const [featured, remaining] = [
    balances.filter((row) => row.promotionState === "review-state-promoted" && Number(row.balanceTkas) >= 0),
    balances.filter((row) => row.promotionState !== "review-state-promoted" || Number(row.balanceTkas) < 0)
  ];
  balancesNode.innerHTML = featured.map((row) => `
    <article>
      <span>${escapeHtml(row.promotionState)}</span>
      <strong>${escapeHtml(row.balanceTkas)} TKAS</strong>
      ${addressChip(row.address)}
      ${row.problems?.length ? `<small>${escapeHtml(row.problems.join("; "))}</small>` : ""}
    </article>
  `).join("") + `
    <details class="full-ledger">
      <summary>Show blocked and negative balance rows (${escapeHtml(remaining.length)})</summary>
      <div class="results-feed full-ledger-grid">
        ${remaining.map((row) => `
          <article>
            <span>${escapeHtml(row.promotionState)}</span>
            <strong>${escapeHtml(row.balanceTkas)} TKAS</strong>
            ${addressChip(row.address)}
            ${row.problems?.length ? `<small>${escapeHtml(row.problems.join("; "))}</small>` : ""}
          </article>
        `).join("")}
      </div>
    </details>
  `;
  blockedNode.innerHTML = (reducer.negativeRows || []).map((row) => `
    <article>
      <span>${escapeHtml(row.kind)} · ${escapeHtml(row.status)}</span>
      <strong>${escapeHtml(row.id || row.txid || row.address)}</strong>
      <p>${escapeHtml(row.reason)}</p>
    </article>
  `).join("");
}

function metric(label, value, detail) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(detail)}</p></article>`;
}

function txLink(txid) {
  return `<a href="https://tn12.kaspa.stream/transactions/${escapeHtml(txid)}" target="_blank" rel="noreferrer"><code>${escapeHtml(shortTxid(String(txid || "")))}</code></a>`;
}

function addressChip(address) {
  const value = String(address || "");
  return `
    <p class="address-chip">
      <a href="https://tn12.kaspa.stream/addresses/${escapeHtml(value)}" target="_blank" rel="noreferrer" title="${escapeHtml(value)}"><code>${escapeHtml(shortAddress(value))}</code></a>
      <button type="button" data-copy="${escapeHtml(value)}" aria-label="Copy ${escapeHtml(shortAddress(value))}">Copy</button>
    </p>
  `;
}

function wireCopyButtons(documentRef) {
  for (const button of documentRef.querySelectorAll("[data-copy]")) {
    if (button.dataset.copyBound === "true") continue;
    button.dataset.copyBound = "true";
    button.addEventListener("click", async () => {
      if (!navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(button.dataset.copy || "");
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1100);
    });
  }
}
