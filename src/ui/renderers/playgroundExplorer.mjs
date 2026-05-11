import { fetchJson } from "../dataLoader.mjs";
import { escapeHtml } from "../formatters.mjs";

export async function renderPlaygroundExplorer(documentRef = document) {
  const summaryNode = documentRef.querySelector("#playground-summary");
  const rolesNode = documentRef.querySelector("#playground-roles");
  const actionsNode = documentRef.querySelector("#playground-actions");
  const rulesNode = documentRef.querySelector("#playground-rules");
  const flowNode = documentRef.querySelector("#playground-flow");
  if (!summaryNode || !rolesNode || !actionsNode || !rulesNode || !flowNode) return;

  try {
    const plan = await fetchJson("artifacts/playground-plan.json");
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
    actionsNode.innerHTML = plan.actions.map((action) => `
      <article>
        <span>${escapeHtml(action.enforcement)}</span>
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
  } catch (error) {
    summaryNode.innerHTML = `<article><span>Load error</span><strong>Playground plan unavailable</strong><p>${escapeHtml(error.message)}</p></article>`;
  }
}

function metric(label, value, detail) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(detail)}</p></article>`;
}
