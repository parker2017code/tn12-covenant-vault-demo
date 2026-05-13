import { fetchJson } from "./src/ui/dataLoader.mjs";
import { escapeHtml, shortTxid } from "./src/ui/formatters.mjs";

const node = document.querySelector("#wallet-approval-cards");

if (node) {
  renderWalletApprovalCards().catch((error) => {
    node.innerHTML = `<p class="note">Wallet summaries unavailable: ${escapeHtml(error.message)}</p>`;
  });
}

async function renderWalletApprovalCards() {
  const artifact = await fetchJson("artifacts/wallet-approval-summaries.json");
  const summaries = Array.isArray(artifact.summaries) ? artifact.summaries : [];
  node.innerHTML = summaries.map(renderCard).join("");
}

function renderCard(summary) {
  const checks = publicChecks(summary);
  const links = evidenceLinks(summary);
  return `
    <article class="wallet-approval-card">
      <header>
        <span>${escapeHtml(cardLabel(summary.experiment))}</span>
        <strong>${escapeHtml(summary.title || summary.id || "")}</strong>
      </header>
      <p>${escapeHtml(publicAction(summary))}</p>
      <p class="wallet-approval-decision">${escapeHtml(decisionText(summary.recommendedWalletDecision))}</p>
      <p class="wallet-approval-label">What the wallet should show</p>
      <ul>
        ${checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      ${links.length ? `<p class="note">Evidence: ${links.slice(0, 2).join(" · ")}</p>` : ""}
    </article>
  `;
}

function cardLabel(experiment = "") {
  const labels = {
    "recurring-cap-proof": "Budget rule",
    "sibling-authorized-asset-proof": "Controlled asset",
    "mux-worker-proof": "Step workflow",
    "scheduler-receipt-evidence": "Scheduled payout",
    "coordination-release-evidence": "Group payment",
    "vault-negative-checks": "Blocked withdrawals"
  };
  return labels[experiment] || experiment || "Wallet review";
}

function publicChecks(summary) {
  const experiment = summary.experiment || "";
  const checks = summary.userChecks || [];
  const byPrefix = (prefix) => checks.find((item) => item.startsWith(prefix));
  const blocked = `${summary.refusalPrompts?.length || 0} blocked cases are listed in the artifact.`;
  const publicByExperiment = {
    "recurring-cap-proof": [
      byPrefix("Amount:") || "Amount is shown before signing.",
      byPrefix("Cap:") || "Budget cap is shown before signing.",
      byPrefix("Next spent in window:") || "Next budget state is shown.",
      blocked
    ],
    "sibling-authorized-asset-proof": [
      "Required controller input is shown before signing.",
      "Asset state change is shown before signing.",
      "Wrong or missing controller attempts are blocked locally.",
      blocked
    ],
    "mux-worker-proof": [
      "Current step and next role are shown before signing.",
      "Timeout and recovery path are shown before signing.",
      "Accepted return path is linked as evidence.",
      blocked
    ],
    "scheduler-receipt-evidence": [
      byPrefix("Payout amount:") || "Payout amount is shown before signing.",
      "Recipient is shown before signing.",
      "Accepted intent, bid, and execution evidence are linked.",
      blocked
    ],
    "coordination-release-evidence": [
      "Release amount and recipient are shown before signing.",
      "Release and refund evidence use separate fresh pledge sets.",
      "Group selection remains replay-derived.",
      blocked
    ],
    "vault-negative-checks": [
      "Accepted good path is linked.",
      "Wrong destination and missing relock attempts are blocked locally.",
      "Over-cap and stale reset attempts are blocked locally.",
      blocked
    ]
  };
  return publicByExperiment[experiment] || checks.slice(0, 4);
}

function publicAction(summary) {
  const labels = {
    "recurring-cap-proof": "Spend from a capped budget, then lock the remaining money back into the next budget state.",
    "sibling-authorized-asset-proof": "Move a controlled asset only when the required controller input is part of the same transaction.",
    "mux-worker-proof": "Move a step through small roles, return safely, and recover if a role stalls.",
    "scheduler-receipt-evidence": "Release a scheduled payout after the accepted evidence matches the rule.",
    "coordination-release-evidence": "Release a group payment after enough qualifying pledges are visible.",
    "vault-negative-checks": "Review the withdrawals this vault path refuses before treating it as safe to automate."
  };
  return labels[summary.experiment] || summary.plainAction || "";
}

function decisionText(decision = "") {
  const labels = {
    "approve-if-user-initiated": "Approve only if this is the action you meant to take",
    "reject-invalid-attempts": "Reject these invalid attempts",
    reject: "Reject"
  };
  return labels[decision] || decision;
}

function evidenceLinks(summary) {
  const links = [];
  const technical = summary.technicalChecks || {};
  if (technical.explorerUrl && technical.spendTxid) {
    links.push(link(technical.explorerUrl, technical.spendTxid));
  }
  if (technical.postResetSpend?.explorerUrl && technical.postResetSpend?.txid) {
    links.push(link(technical.postResetSpend.explorerUrl, technical.postResetSpend.txid, "post-reset"));
  }
  if (technical.selectedCandidate?.explorerUrl && technical.selectedCandidate?.txid) {
    links.push(link(technical.selectedCandidate.explorerUrl, technical.selectedCandidate.txid, "owner"));
  }
  if (technical.acceptedStrike?.explorerUrl && technical.acceptedStrike?.txid) {
    links.push(link(technical.acceptedStrike.explorerUrl, technical.acceptedStrike.txid, "strike"));
  }
  for (const key of ["normalWorkerReturn", "timeoutSettlement", "workerBSettlement"]) {
    const item = technical[key] || {};
    if (item.explorerUrl && item.txid) {
      links.push(link(item.explorerUrl, item.txid, key.replace(/[A-Z]/g, (char) => ` ${char.toLowerCase()}`)));
    }
  }
  if (technical.funding?.explorerUrl && technical.funding?.txid) {
    links.push(link(technical.funding.explorerUrl, technical.funding.txid, "funding"));
  }
  if (technical.refundFunding?.explorerUrl && technical.refundFunding?.txid) {
    links.push(link(technical.refundFunding.explorerUrl, technical.refundFunding.txid, "refund funding"));
  }
  if (technical.release?.explorerUrl && technical.release?.txid) {
    links.push(link(technical.release.explorerUrl, technical.release.txid, "release"));
  }
  for (const item of (technical.releases || []).slice(0, 3)) {
    if (item.explorerUrl && item.txid) {
      links.push(link(item.explorerUrl, item.txid, item.pledgeId || "release"));
    }
  }
  for (const item of (technical.refunds || []).slice(0, 3)) {
    if (item.explorerUrl && item.txid) {
      links.push(link(item.explorerUrl, item.txid, item.pledgeId || "refund"));
    }
  }
  if (technical.acceptedBackbone?.resetTxid) {
    const txid = technical.acceptedBackbone.resetTxid;
    links.push(link(`https://tn12.kaspa.stream/transactions/${txid}`, txid, "reset"));
  }
  return links;
}

function link(url, txid, prefix = "tx") {
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(prefix)} ${escapeHtml(shortTxid(txid))}</a>`;
}
