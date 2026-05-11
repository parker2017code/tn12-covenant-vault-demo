import { fetchJson } from "../dataLoader.mjs";
import { escapeHtml } from "../formatters.mjs";

export async function renderPlaygroundExplorer(documentRef = document) {
  const summaryNode = documentRef.querySelector("#playground-summary");
  const rolesNode = documentRef.querySelector("#playground-roles");
  const sessionNode = documentRef.querySelector("#playground-session");
  const actionsNode = documentRef.querySelector("#playground-actions");
  const rulesNode = documentRef.querySelector("#playground-rules");
  const flowNode = documentRef.querySelector("#playground-flow");
  const replaySummaryNode = documentRef.querySelector("#playground-replay-summary");
  const balancesNode = documentRef.querySelector("#playground-balances");
  const blockedNode = documentRef.querySelector("#playground-blocked");
  if (!summaryNode || !rolesNode || !actionsNode || !rulesNode || !flowNode) return;

  try {
    const [plan, actions, reducer, activity, session, funding] = await Promise.all([
      fetchJson("artifacts/playground-plan.json"),
      fetchJson("artifacts/playground-actions.json"),
      fetchJson("artifacts/defi-scenario-reducer.json"),
      fetchJson("artifacts/defi-accepted-activity-ledger.json"),
      fetchJson("artifacts/playground-session.example.json"),
      fetchJson("artifacts/playground-funding-evidence.json")
    ]);
    summaryNode.innerHTML = `
      ${metric("Roles", plan.summary.roles, "Throwaway TN12 session roles.")}
      ${metric("Guided actions", plan.summary.guidedActions, "Real TN12 targets where tooling allows.")}
      ${metric("Payload events available", plan.summary.acceptedPayloadEventsAvailable, "Current accepted receipt evidence.")}
      ${metric("Transfer rows available", plan.summary.acceptedTransferRowsAvailable, "Current local-key custody movement evidence.")}
      ${metric("Shared private keys", plan.summary.sharedWalletPrivateKeys, "Must remain zero.")}
      ${metric("Benchmark", `${plan.summary.benchmarkPercent}%`, "Current repo-local full-DeFi benchmark.")}
    `;
    rolesNode.innerHTML = plan.roles.map((role) => `
      <article>
        <span>${escapeHtml(role.id)} · ${escapeHtml(role.suggestedFundingTkas)} tKAS</span>
        <strong>${escapeHtml(role.label)}</strong>
        <p>${escapeHtml(role.purpose)}</p>
        <small>${escapeHtml(role.privateKeyPolicy)}</small>
      </article>
    `).join("");
    if (sessionNode) {
      sessionNode.innerHTML = `
        <article>
          <span>${escapeHtml(funding.status)} · ${escapeHtml(funding.accepted ? "accepted" : "review")}</span>
          <strong>${escapeHtml(session.summary.fundedRoles)} funded roles</strong>
          <p><code>${escapeHtml(funding.txid)}</code></p>
        </article>
        <article>
          <span>Outputs matched</span>
          <strong>${escapeHtml(funding.outputs.filter((row) => row.matches).length)} / ${escapeHtml(funding.outputs.length)}</strong>
          <p>Each role output matched expected amount and address on TN12.</p>
        </article>
      `;
    }
    actionsNode.innerHTML = actions.actionRows.map((action) => `
      <article>
        <span>${escapeHtml(action.enforcement)} · ${escapeHtml(action.ready ? "ready" : "needs funding")}</span>
        <strong>${escapeHtml(action.label)}</strong>
        <p>${escapeHtml(action.detail)}</p>
      </article>
    `).join("");
    rulesNode.innerHTML = plan.hardRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("");
    flowNode.innerHTML = plan.faucetFlow.map((step, index) => `
      <article>
        <span>${index + 1}</span>
        <strong>${escapeHtml(step)}</strong>
      </article>
    `).join("");
    renderReplay({ replaySummaryNode, balancesNode, blockedNode, reducer, activity, actions });
  } catch (error) {
    summaryNode.innerHTML = `<article><span>Load error</span><strong>Playground plan unavailable</strong><p>${escapeHtml(error.message)}</p></article>`;
  }
}

function renderReplay({ replaySummaryNode, balancesNode, blockedNode, reducer, activity, actions }) {
  if (!replaySummaryNode || !balancesNode || !blockedNode) return;
  replaySummaryNode.innerHTML = `
    ${metric("Accepted transfers", activity.summary.acceptedTransferRows, "Real TN12 transfer rows in the current ledger.")}
    ${metric("Pool net", `${activity.summary.poolNetTkas} TKAS`, "Net accepted movement into the pool role.")}
    ${metric("Balance rows", reducer.summary.balanceRows, "Address-level net deltas from selected transfers.")}
    ${metric("Blocked withdrawals", reducer.negativeRows.filter((row) => row.kind === "withdrawal-candidate").length, "Over-balance or unsigned withdrawal attempts.")}
    ${metric("Ready actions", actions.summary.readyActions, "Guided actions with current public prerequisites.")}
    ${metric("Live product claims", actions.summary.liveProductClaims, "Must stay zero.")}
  `;
  balancesNode.innerHTML = (reducer.state?.balances || []).map((row) => `
    <article>
      <span>${escapeHtml(row.promotionState)}</span>
      <strong>${escapeHtml(row.balanceTkas)} TKAS</strong>
      <p><code>${escapeHtml(row.address)}</code></p>
      ${row.problems?.length ? `<small>${escapeHtml(row.problems.join("; "))}</small>` : ""}
    </article>
  `).join("");
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
