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
  const checks = (summary.userChecks || []).slice(0, 4);
  const links = evidenceLinks(summary);
  return `
    <article class="wallet-approval-card">
      <header>
        <span>${escapeHtml(summary.experiment || "")}</span>
        <strong>${escapeHtml(summary.title || summary.id || "")}</strong>
      </header>
      <p>${escapeHtml(summary.plainAction || "")}</p>
      <p class="wallet-approval-decision">${escapeHtml(summary.recommendedWalletDecision || "")}</p>
      <p class="wallet-approval-label">Checks</p>
      <ul>
        ${checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <p class="note">${escapeHtml(summary.refusalPrompts?.length || 0)} reject cases</p>
      ${links.length ? `<p class="note">Evidence: ${links.join(" · ")}</p>` : ""}
    </article>
  `;
}

function evidenceLinks(summary) {
  const links = [];
  const technical = summary.technicalChecks || {};
  if (technical.explorerUrl && technical.spendTxid) {
    links.push(link(technical.explorerUrl, technical.spendTxid));
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
  if (technical.release?.explorerUrl && technical.release?.txid) {
    links.push(link(technical.release.explorerUrl, technical.release.txid, "release"));
  }
  return links;
}

function link(url, txid, prefix = "tx") {
  return `<a href="${escapeHtml(url)}">${escapeHtml(prefix)} ${escapeHtml(shortTxid(txid))}</a>`;
}
