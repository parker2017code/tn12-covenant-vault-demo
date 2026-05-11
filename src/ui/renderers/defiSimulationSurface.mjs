import { fetchJson } from "../dataLoader.mjs";
import { escapeHtml } from "../formatters.mjs";

export async function renderDefiSimulationSurface(documentRef = document) {
  const summaryNode = documentRef.querySelector("#defi-simulation-summary");
  const listNode = documentRef.querySelector("#defi-simulation-list");
  if (!summaryNode || !listNode) return;

  try {
    const [planner, scenario, reducer, advanced, multiWallet, acceptedActivity, scheduler, manifest] = await Promise.all([
      fetchJson("artifacts/defi-planner-simulation.json"),
      fetchJson("artifacts/defi-scenario-simulation.json"),
      fetchJson("artifacts/defi-scenario-reducer.json"),
      fetchJson("artifacts/defi-advanced-simulation.json"),
      fetchJson("artifacts/defi-multi-wallet-scenario-pack.json"),
      fetchJson("artifacts/defi-accepted-activity-ledger.json"),
      fetchJson("artifacts/scheduler-intent-registry.json"),
      fetchJson("artifacts/defi-artifact-manifest.json")
    ]);

    summaryNode.innerHTML = `
      <article><span>Manifest</span><strong>${escapeHtml(manifest.summary.readyArtifacts)}/${escapeHtml(manifest.summary.artifacts)}</strong></article>
      <article><span>Planner lanes</span><strong>${escapeHtml(planner.summary.lanes)}</strong></article>
      <article><span>Scenario refs</span><strong>${escapeHtml(scenario.summary.acceptedReferencesIndexed)}/${escapeHtml(scenario.summary.acceptedReferences)}</strong></article>
      <article><span>Reducer state</span><strong>${escapeHtml(reducer.summary.promotedReviewRows)} review</strong></article>
      <article><span>Advanced blocks</span><strong>${escapeHtml(advanced.summary.ammBlockedActions + advanced.summary.oracleBlockedCases + advanced.summary.lendingBlocked)}</strong></article>
      <article><span>Accepted transfers</span><strong>${escapeHtml(acceptedActivity.summary.acceptedTransferRows)}</strong></article>
      <article><span>Scheduler intents</span><strong>${escapeHtml(scheduler.summary.acceptedIntents)}</strong></article>
      <article><span>Pool net</span><strong>${escapeHtml(acceptedActivity.summary.poolNetTkas)} TKAS</strong></article>
      <article><span>Wallet roles</span><strong>${escapeHtml(multiWallet.summary.roles)}</strong></article>
      <article><span>External signer claims</span><strong>${escapeHtml(multiWallet.summary.externalSignerClaims)}</strong></article>
    `;

    listNode.innerHTML = "";
    const cards = [
      {
        status: manifest.status,
        title: "DeFi artifact manifest",
        body: `${manifest.summary.readyArtifacts}/${manifest.summary.artifacts} artifacts ready; ${manifest.summary.problems} problems; ${manifest.summary.secretFindings} secret findings.`,
        foot: "npm run defi:manifest"
      },
      {
        status: acceptedActivity.status,
        title: "Accepted TN12 activity ledger",
        body: `${acceptedActivity.summary.acceptedTransferRows} accepted transfer rows; ${acceptedActivity.summary.poolDeposits} pool deposits; ${acceptedActivity.summary.poolPayouts} pool payouts; pool net ${acceptedActivity.summary.poolNetTkas} TKAS.`,
        foot: "npm run defi:accepted-activity"
      },
      {
        status: scheduler.status,
        title: "Scheduler intent registry",
        body: `${scheduler.summary.acceptedIntents} accepted trigger intent; ${scheduler.summary.eligibleTriggers} eligible trigger; ${scheduler.summary.protocolSchedulerClaims} protocol-scheduler claims.`,
        foot: "npm run scheduler:intents"
      },
      {
        status: planner.status,
        title: "Planner-only market logic",
        body: `${planner.summary.simulationReadyLanes} lanes checked; ${planner.summary.blockedLiveLanes} live-product lanes blocked.`,
        foot: "npm run defi:simulation"
      },
      {
        status: scenario.status,
        title: "Scenario math",
        body: `${scenario.summary.executableSwapSimulations} swap math row ok; ${scenario.summary.slippageBlockedSwaps} min-output block; ${scenario.summary.lendingPositions} lending positions.`,
        foot: "npm run defi:scenario"
      },
      {
        status: reducer.status,
        title: "Reducer promotion guard",
        body: `${reducer.summary.promotedReviewRows} review rows promoted; ${reducer.summary.blockedScenarioRows} scenario rows blocked; ${reducer.summary.custodyPromotions} custody promotions.`,
        foot: "npm run defi:reducer"
      },
      {
        status: advanced.status,
        title: "Advanced hardening",
        body: `${advanced.summary.ammActions} AMM actions; ${advanced.summary.oracleFailureCases} oracle cases; ${advanced.summary.lendingSweeps} lending sweeps.`,
        foot: "npm run defi:advanced"
      },
      {
        status: multiWallet.status,
        title: "Multi-wallet scenario pack",
        body: `${multiWallet.summary.acceptedIndexedRoles}/${multiWallet.summary.roles} roles indexed; ${multiWallet.summary.actualWalletAddresses} observed wallet addresses; no external-signer claim.`,
        foot: "npm run defi:multi-wallet"
      }
    ];

    for (const card of cards) {
      const article = documentRef.createElement("article");
      article.className = "defi-card";
      article.innerHTML = `
        <span>${escapeHtml(card.status)}</span>
        <strong>${escapeHtml(card.title)}</strong>
        <p>${escapeHtml(card.body)}</p>
        <small>${escapeHtml(card.foot)}</small>
      `;
      listNode.append(article);
    }
  } catch (error) {
    summaryNode.textContent = `DeFi accepted-activity surface unavailable: ${error.message}`;
  }
}
