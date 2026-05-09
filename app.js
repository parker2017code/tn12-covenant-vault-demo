import {
  DEFAULT_ASSURANCE,
  buildAssuranceArtifact,
  buildAssuranceLifecycle,
  normalizeAssurance,
  validateAssurance
} from "./src/assuranceContract.mjs";
import {
  DEFAULT_POLICY,
  buildLifecycle,
  buildPolicyArtifact,
  normalizePolicy,
  policyId,
  validatePolicy
} from "./src/vaultPolicy.mjs";
import {
  DEFAULT_MANUAL_OUTPOINT,
  buildManualOutpointArtifact,
  normalizeManualOutpoint
} from "./src/manualOutpoint.mjs";
import {
  DEFAULT_SIGNAL_PAYLOAD,
  buildSignalPayloadArtifact
} from "./src/signalPayload.mjs";
import { buildAttestationRegistry } from "./src/attestationSignal.mjs";
import { buildAttestationReputationThresholds } from "./src/attestationReputationThresholds.mjs";
import { buildInvoiceRegistry } from "./src/invoiceReceipt.mjs";
import { buildSubmitConsoleRegistry } from "./src/submitConsole.mjs";
import { buildResearchLibrary } from "./src/appResearch.mjs";
import { buildBatchAssuranceState } from "./src/batchAssurance.mjs";
import { buildBatchAssuranceCustodyDrafts } from "./src/batchAssuranceCustodyDrafts.mjs";
import { buildEnforcementMatrix } from "./src/enforcementMatrix.mjs";
import { buildEscrowPrimitive } from "./src/escrowPrimitive.mjs";
import { buildTreasuryVaultRegistry } from "./src/treasuryVault.mjs";
import { buildPayloadSubmitReadiness } from "./src/payloadSubmitReadiness.mjs";
import { buildCoordinationMarketPrototype } from "./src/coordinationMarket.mjs";
import { buildCoordinationMarketSettlementBrief } from "./src/coordinationMarketSettlementBrief.mjs";
import { buildAccessPassPlanner } from "./src/accessPassPlanner.mjs";
import { buildMainnetReadiness } from "./src/mainnetReadiness.mjs";
import { buildAssetPolicyRegistry } from "./src/assetPolicy.mjs";
import { buildAuctionIntentPrototype } from "./src/auctionIntent.mjs";
import { buildDefiResearchBacklog } from "./src/defiBacklog.mjs";
import { buildPredictionHedgeSimulator } from "./src/predictionHedgeSimulator.mjs";
import { buildStableValuePathRegistry } from "./src/stableValuePaths.mjs";
import { buildStableIssuerRedemptionState } from "./src/stableIssuerRedemption.mjs";
import { buildAgentCommitmentBoard } from "./src/agentCommitments.mjs";
import { buildProjectStatus } from "./src/buildStatus.mjs";
import { buildProjectPlan } from "./src/projectPlan.mjs";
import { buildNextWorkQueue } from "./src/nextWorkQueue.mjs";

const form = document.querySelector("#policy-form");
const assuranceForm = document.querySelector("#assurance-form");
const signalForm = document.querySelector("#signal-form");
const policyIdNode = document.querySelector("#policy-id");
const issuesNode = document.querySelector("#issues");
const artifactNode = document.querySelector("#artifact");
const lifecycleNode = document.querySelector("#lifecycle");
const assuranceIssuesNode = document.querySelector("#assurance-issues");
const assuranceArtifactNode = document.querySelector("#assurance-artifact");
const assuranceLifecycleNode = document.querySelector("#assurance-lifecycle");
const assuranceProgressNode = document.querySelector("#assurance-progress");
const assuranceProgressTextNode = document.querySelector("#assurance-progress-text");
const proofListNode = document.querySelector("#proof-list");
const proofStatusNode = document.querySelector("#proof-status");
const indexerSummaryNode = document.querySelector("#indexer-summary");
const indexerPersistenceNode = document.querySelector("#indexer-persistence");
const indexerRecordsNode = document.querySelector("#indexer-records");
const receiptEventsNode = document.querySelector("#receipt-events");
const invoiceSummaryNode = document.querySelector("#invoice-summary");
const invoiceListNode = document.querySelector("#invoice-list");
const invoiceDraftNode = document.querySelector("#invoice-draft");
const payloadReadinessNode = document.querySelector("#payload-readiness");
const submitSummaryNode = document.querySelector("#submit-summary");
const submitDraftsNode = document.querySelector("#submit-drafts");
const walletReviewNode = document.querySelector("#wallet-review");
const walletConnectorNode = document.querySelector("#wallet-connector");
const researchSummaryNode = document.querySelector("#research-summary");
const researchCandidatesNode = document.querySelector("#research-candidates");
const campaignSummaryNode = document.querySelector("#campaign-summary");
const campaignPlansNode = document.querySelector("#campaign-plans");
const campaignCustodyNode = document.querySelector("#campaign-custody");
const campaignPledgesNode = document.querySelector("#campaign-pledges");
const enforcementSummaryNode = document.querySelector("#enforcement-summary");
const enforcementFeaturesNode = document.querySelector("#enforcement-features");
const escrowSummaryNode = document.querySelector("#escrow-summary");
const escrowListNode = document.querySelector("#escrow-list");
const treasurySummaryNode = document.querySelector("#treasury-summary");
const treasuryListNode = document.querySelector("#treasury-list");
const coordinationSummaryNode = document.querySelector("#coordination-summary");
const coordinationPacksNode = document.querySelector("#coordination-packs");
const accessSummaryNode = document.querySelector("#access-summary");
const accessListNode = document.querySelector("#access-list");
const mainnetSummaryNode = document.querySelector("#mainnet-summary");
const mainnetComponentsNode = document.querySelector("#mainnet-components");
const assetSummaryNode = document.querySelector("#asset-summary");
const assetListNode = document.querySelector("#asset-list");
const auctionSummaryNode = document.querySelector("#auction-summary");
const auctionListNode = document.querySelector("#auction-list");
const defiSummaryNode = document.querySelector("#defi-summary");
const defiListNode = document.querySelector("#defi-list");
const stableSummaryNode = document.querySelector("#stable-summary");
const stableListNode = document.querySelector("#stable-list");
const stableIssuerSummaryNode = document.querySelector("#stable-issuer-summary");
const stableIssuerListNode = document.querySelector("#stable-issuer-list");
const agentSummaryNode = document.querySelector("#agent-summary");
const agentListNode = document.querySelector("#agent-list");
const buildStatusSummaryNode = document.querySelector("#build-status-summary");
const buildStatusLanesNode = document.querySelector("#build-status-lanes");
const projectPlanSummaryNode = document.querySelector("#project-plan-summary");
const projectPlanNextNode = document.querySelector("#project-plan-next");
const projectPlanVisionNode = document.querySelector("#project-plan-vision");
const nextQueueSummaryNode = document.querySelector("#next-queue-summary");
const nextQueueTopNode = document.querySelector("#next-queue-top");
const nextQueueTasksNode = document.querySelector("#next-queue-tasks");
const buildQueueNode = document.querySelector("#build-queue");
const masterRoadmapNode = document.querySelector("#master-roadmap");
const vaultTemplatesNode = document.querySelector("#vault-templates");
const appLanesNode = document.querySelector("#app-lanes");
const attestationSummaryNode = document.querySelector("#attestation-summary");
const attestationSourcesNode = document.querySelector("#attestation-sources");
const attestationSignalsNode = document.querySelector("#attestation-signals");
const predictionSummaryNode = document.querySelector("#prediction-summary");
const predictionMarketsNode = document.querySelector("#prediction-markets");
const predictionSuggestionsNode = document.querySelector("#prediction-suggestions");
const signalChannelsNode = document.querySelector("#signal-channels");
const signalArtifactNode = document.querySelector("#signal-artifact");
const payloadDraftStatusNode = document.querySelector("#payload-draft-status");
const manualFields = {
  address: document.querySelector("#manual-address"),
  txid: document.querySelector("#manual-txid"),
  outputIndex: document.querySelector("#manual-output-index"),
  amountTkas: document.querySelector("#manual-amount"),
  explorerUrl: document.querySelector("#manual-explorer-url")
};
const manualIssuesNode = document.querySelector("#manual-issues");
const manualArtifactNode = document.querySelector("#manual-artifact");
const manualOutputPickerNode = document.querySelector("#manual-output-picker");
const copyButton = document.querySelector("#copy-artifact");
const copyAssuranceButton = document.querySelector("#copy-assurance");
const copyManualButton = document.querySelector("#copy-manual-artifact");
const copySignalButton = document.querySelector("#copy-signal");
const fetchManualTxButton = document.querySelector("#fetch-manual-tx");
const refreshProofsButton = document.querySelector("#refresh-proofs");
const resetButton = document.querySelector("#reset-policy");
const resetAssuranceButton = document.querySelector("#reset-assurance");
const resetSignalButton = document.querySelector("#reset-signal");

for (const [key, value] of Object.entries(DEFAULT_POLICY)) {
  const input = form.elements[key];
  if (input) input.value = value;
}

for (const [key, value] of Object.entries(DEFAULT_ASSURANCE)) {
  const input = assuranceForm.elements[key];
  if (input) input.value = value;
}

for (const [key, value] of Object.entries(DEFAULT_SIGNAL_PAYLOAD)) {
  const input = signalForm.elements[key];
  if (input) input.value = value;
}

manualFields.address.value = DEFAULT_MANUAL_OUTPOINT.address;
manualFields.txid.value = DEFAULT_MANUAL_OUTPOINT.txid;
manualFields.outputIndex.value = DEFAULT_MANUAL_OUTPOINT.outputIndex;
manualFields.amountTkas.value = DEFAULT_MANUAL_OUTPOINT.amountTkas;
manualFields.explorerUrl.value = DEFAULT_MANUAL_OUTPOINT.explorerUrl;

form.addEventListener("input", renderVault);
assuranceForm.addEventListener("input", renderAssurance);
signalForm.addEventListener("input", renderSignalPayload);
for (const input of Object.values(manualFields)) {
  input.addEventListener("input", renderManualOutpoint);
}
resetButton.addEventListener("click", () => {
  for (const [key, value] of Object.entries(DEFAULT_POLICY)) {
    const input = form.elements[key];
    if (input) input.value = value;
  }
  renderVault();
});
resetAssuranceButton.addEventListener("click", () => {
  for (const [key, value] of Object.entries(DEFAULT_ASSURANCE)) {
    const input = assuranceForm.elements[key];
    if (input) input.value = value;
  }
  renderAssurance();
});
resetSignalButton.addEventListener("click", () => {
  for (const [key, value] of Object.entries(DEFAULT_SIGNAL_PAYLOAD)) {
    const input = signalForm.elements[key];
    if (input) input.value = value;
  }
  renderSignalPayload();
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(artifactNode.textContent);
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy JSON";
  }, 1200);
});

copyAssuranceButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(assuranceArtifactNode.textContent);
  copyAssuranceButton.textContent = "Copied";
  setTimeout(() => {
    copyAssuranceButton.textContent = "Copy JSON";
  }, 1200);
});

copyManualButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(manualArtifactNode.textContent);
  copyManualButton.textContent = "Copied";
  setTimeout(() => {
    copyManualButton.textContent = "Copy JSON";
  }, 1200);
});

copySignalButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(signalArtifactNode.textContent);
  copySignalButton.textContent = "Copied";
  setTimeout(() => {
    copySignalButton.textContent = "Copy JSON";
  }, 1200);
});

fetchManualTxButton.addEventListener("click", fetchManualTransactionOutputs);
refreshProofsButton.addEventListener("click", () => verifyProofTransactions({ forceRemote: true }));

renderVault();
renderAssurance();
renderManualOutpoint();
renderBatchAssuranceCampaign();
renderEnforcementMatrix();
renderEscrowPrimitive();
renderTreasuryVaults();
renderCoordinationMarket();
renderAccessPassPlanner();
renderMainnetReadiness();
renderAssetPolicies();
renderAuctionIntents();
renderDefiBacklog();
renderStableValuePaths();
renderStableIssuerRedemptions();
renderAgentCommitments();
renderBuildStatus();
renderNextWorkQueue();
renderProofTransactions();
renderAcceptedAppState();
renderInvoiceApp();
renderPayloadSubmitReadiness();
renderSubmitConsole();
renderWalletReview();
renderWalletConnector();
renderMasterRoadmap();
renderResearchLibrary();
renderBuildQueue();
renderVaultTemplates();
renderAppLab();
renderAttestationRegistry();
renderPredictionHedgeSimulator();
renderMinerSignalResearch();
renderSignalPayload();
renderPayloadDraftStatus();

async function renderVault() {
  const data = Object.fromEntries(new FormData(form).entries());
  const policy = normalizePolicy(data);
  const id = await policyId(policy);
  const issues = validatePolicy(policy);
  const artifact = buildPolicyArtifact(policy, id);

  policyIdNode.textContent = id;
  artifactNode.textContent = JSON.stringify(artifact, null, 2);
  issuesNode.innerHTML = "";
  lifecycleNode.innerHTML = "";

  const issueItems = issues.length
    ? issues
    : ["Policy shape is valid. Repo scripts have TN12 proof spends; this browser form still only designs artifacts."];

  for (const issue of issueItems) {
    const item = document.createElement("li");
    item.textContent = issue;
    issuesNode.append(item);
  }

  for (const step of buildLifecycle(policy)) {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${escapeHtml(step.name)}</strong><span>${escapeHtml(step.actor)}</span><p>${escapeHtml(step.detail)}</p>`;
    lifecycleNode.append(item);
  }
}

function renderAssurance() {
  const data = Object.fromEntries(new FormData(assuranceForm).entries());
  const contract = normalizeAssurance(data);
  const issues = validateAssurance(contract);
  const artifact = buildAssuranceArtifact(contract);
  const progressPercent = Math.min(Math.round(artifact.state.progress * 100), 100);

  assuranceProgressNode.value = progressPercent;
  assuranceProgressTextNode.textContent = `${progressPercent}% funded; ${artifact.state.remainingTkas} TKAS remaining`;
  assuranceArtifactNode.textContent = JSON.stringify(artifact, null, 2);
  assuranceIssuesNode.innerHTML = "";
  assuranceLifecycleNode.innerHTML = "";

  const issueItems = issues.length
    ? issues
    : ["Assurance shape is valid. Repo scripts have TN12 pledge release/refund proofs; campaign aggregation is still planner-side."];

  for (const issue of issueItems) {
    const item = document.createElement("li");
    item.textContent = issue;
    assuranceIssuesNode.append(item);
  }

  for (const step of buildAssuranceLifecycle(contract)) {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${escapeHtml(step.name)}</strong><span>${escapeHtml(step.actor)}</span><p>${escapeHtml(step.detail)}</p>`;
    assuranceLifecycleNode.append(item);
  }
}

function renderManualOutpoint() {
  const artifact = buildManualOutpointArtifact(normalizeManualOutpoint({
    address: manualFields.address.value,
    txid: manualFields.txid.value,
    outputIndex: manualFields.outputIndex.value,
    amountTkas: manualFields.amountTkas.value,
    explorerUrl: manualFields.explorerUrl.value
  }));
  const issues = artifact.issues.length ? artifact.issues : [artifact.nextNeeded];

  manualArtifactNode.textContent = JSON.stringify(artifact, null, 2);
  manualIssuesNode.innerHTML = "";
  for (const issue of issues) {
    const item = document.createElement("li");
    item.textContent = issue;
    manualIssuesNode.append(item);
  }
}

async function renderProofTransactions() {
  if (!proofListNode) return;

  try {
    const response = await fetch("fixtures/AcceptedProofTransactions.json", { cache: "no-store" });
    const data = await response.json();
    proofListNode.innerHTML = "";

    for (const proof of data.transactions) {
      const article = document.createElement("article");
      article.className = "proof-card";
      article.innerHTML = `
        <span>${escapeHtml(proof.lane)} / ${escapeHtml(proof.entrypoint)}</span>
        <strong>${escapeHtml(proof.label)}</strong>
        <a href="https://tn12.kaspa.stream/txs/${escapeHtml(proof.txid)}" target="_blank" rel="noreferrer">${escapeHtml(shortTxid(proof.txid))}</a>
        <p>${escapeHtml(sompiToTkas(BigInt(proof.amountSompi)))} TKAS to saved address</p>
        <small data-proof-status="${escapeHtml(proof.txid)}">Fixture loaded</small>
      `;
      proofListNode.append(article);
    }
    verifyProofTransactions({ forceRemote: false });
  } catch (error) {
    proofListNode.textContent = `Proof fixture unavailable: ${error.message}`;
  }
}

async function renderBatchAssuranceCampaign() {
  if (!campaignSummaryNode || !campaignPlansNode || !campaignPledgesNode) return;

  try {
    const response = await fetch("fixtures/BatchAssuranceCampaign.json", { cache: "no-store" });
    const fixture = await response.json();
    const campaign = buildBatchAssuranceState(fixture);
    const custodyResponse = await fetch("artifacts/batch-assurance-custody-drafts.json", { cache: "no-store" });
    const custodyDrafts = await custodyResponse.json();
    const requirementsResponse = await fetch("artifacts/batch-assurance-custody-requirements.json", { cache: "no-store" });
    const custodyRequirements = await requirementsResponse.json();
    const operatorResponse = await fetch("artifacts/batch-assurance-operator-decision.json", { cache: "no-store" });
    const operatorDecision = await operatorResponse.json();
    campaignSummaryNode.innerHTML = `
      <article><span>Accepted</span><strong>${escapeHtml(campaign.summary.acceptedTkas)} / ${escapeHtml(campaign.summary.targetTkas)}</strong></article>
      <article><span>Progress</span><strong>${escapeHtml(Math.round(campaign.summary.acceptedProgress * 100))}%</strong></article>
      <article><span>Pledges</span><strong>${escapeHtml(campaign.summary.acceptedCount)} / ${escapeHtml(campaign.summary.pledgeCount)}</strong></article>
      <article><span>Review</span><strong>${escapeHtml(campaign.summary.rejectedCount)} held</strong></article>
      <article><span>Release</span><strong>${escapeHtml(campaign.summary.releaseStatus)}</strong></article>
    `;

    campaignPlansNode.innerHTML = `
      <article>
        <span>${escapeHtml(campaign.releasePlan.status)}</span>
        <strong>Release plan</strong>
        <p>${escapeHtml(campaign.releasePlan.next)}</p>
        <small>${escapeHtml(campaign.releasePlan.acceptedInputCount)} accepted inputs; ${escapeHtml(campaign.releasePlan.remainingAcceptedTkas)} TKAS remaining.</small>
      </article>
      <article>
        <span>${escapeHtml(campaign.refundPlan.status)}</span>
        <strong>Refund plan</strong>
        <p>${escapeHtml(campaign.refundPlan.refundCount)} accepted pledge refunds can be planned after ${escapeHtml(campaign.refundPlan.deadlineIso)} if the target is not met.</p>
        <small>Refunds stay per contributor until a pooled design is explicit.</small>
      </article>
    `;

    if (campaignCustodyNode) {
      const custodySatisfied = custodyRequirements.status === "custody-requirements-satisfied";
      campaignCustodyNode.innerHTML = `
        <article>
          <span>${escapeHtml(custodyDrafts.status)}</span>
          <strong>${escapeHtml(custodyDrafts.summary.eligibleInputCount)} custody inputs ready</strong>
          <p>${escapeHtml(custodyDrafts.summary.blockedInputCount)} planner inputs are blocked from custody settlement.</p>
          <small>${escapeHtml(custodyDrafts.releaseDraft.status)}</small>
        </article>
        <article>
          <span>${escapeHtml(custodyRequirements.status)}</span>
          <strong>${custodySatisfied
            ? `${escapeHtml(custodyRequirements.summary.readyCount)} matched pledge outputs`
            : `${escapeHtml(custodyRequirements.summary.missingMatchedTkas)} TKAS still needs matched custody`}</strong>
          <p>${custodySatisfied
            ? "Settlement drafts are signed-not-broadcast; choose release or refund explicitly before submit."
            : `${escapeHtml(custodyRequirements.summary.blockedCount)} accepted pledge-output references must be replaced before release.`}</p>
          <small>${escapeHtml(custodyRequirements.nextBuilds[0]?.detail || "Review the custody settlement path next.")}</small>
        </article>
        <article>
          <span>${escapeHtml(operatorDecision.status)}</span>
          <strong>${escapeHtml(operatorDecision.selectedPath)}</strong>
          <p>${escapeHtml(operatorDecision.operatorReason)}</p>
          <small>${escapeHtml(operatorDecision.blockers.join("; ") || operatorDecision.decisionRule)}</small>
        </article>
      `;
    }

    campaignPledgesNode.innerHTML = "";
    for (const pledge of campaign.pledges) {
      const article = document.createElement("article");
      article.className = "campaign-card";
      article.innerHTML = `
        <span>${escapeHtml(pledge.status)}</span>
        <strong>${escapeHtml(pledge.pledgeId)}</strong>
        <p>${escapeHtml(pledge.amountTkas)} TKAS from ${escapeHtml(pledge.contributor)}</p>
        <small>${escapeHtml(pledge.review.status)}; ${escapeHtml(pledge.note)}</small>
      `;
      campaignPledgesNode.append(article);
    }
  } catch (error) {
    campaignSummaryNode.textContent = `Campaign state unavailable: ${error.message}`;
  }
}

async function renderEnforcementMatrix() {
  if (!enforcementSummaryNode || !enforcementFeaturesNode) return;

  try {
    const response = await fetch("fixtures/EnforcementMatrix.json", { cache: "no-store" });
    const fixture = await response.json();
    const matrix = buildEnforcementMatrix(fixture);
    enforcementSummaryNode.innerHTML = `
      <article><span>Features</span><strong>${escapeHtml(matrix.summary.total)}</strong></article>
      <article><span>Script</span><strong>${escapeHtml(matrix.summary.contractEnforced)}</strong></article>
      <article><span>Not script</span><strong>${escapeHtml(matrix.summary.notScriptEnforced)}</strong></article>
      <article><span>Status</span><strong>claim audit</strong></article>
    `;

    enforcementFeaturesNode.innerHTML = "";
    for (const feature of matrix.features) {
      const article = document.createElement("article");
      article.className = "enforcement-card";
      article.innerHTML = `
        <span>${escapeHtml(feature.enforcement)} / ${escapeHtml(feature.lane)}</span>
        <strong>${escapeHtml(feature.name)}</strong>
        <p>${escapeHtml(feature.currentSurface)}</p>
        <small>${escapeHtml(feature.nextHardeningStep)}</small>
      `;
      enforcementFeaturesNode.append(article);
    }
  } catch (error) {
    enforcementSummaryNode.textContent = `Enforcement matrix unavailable: ${error.message}`;
  }
}

async function renderEscrowPrimitive() {
  if (!escrowSummaryNode || !escrowListNode) return;

  try {
    const response = await fetch("fixtures/EscrowPrimitives.json", { cache: "no-store" });
    const fixture = await response.json();
    const registry = buildEscrowPrimitive(fixture);
    escrowSummaryNode.innerHTML = `
      <article><span>Escrows</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>TKAS</span><strong>${escapeHtml(registry.summary.totalTkas)}</strong></article>
      <article><span>Funded</span><strong>${escapeHtml(registry.summary.funded)}</strong></article>
      <article><span>Action</span><strong>${escapeHtml(registry.summary.needsAction)}</strong></article>
    `;

    escrowListNode.innerHTML = "";
    for (const escrow of registry.escrows) {
      const article = document.createElement("article");
      article.className = "escrow-card";
      article.innerHTML = `
        <span>${escapeHtml(escrow.status)}</span>
        <strong>${escapeHtml(escrow.title)}</strong>
        <p>${escapeHtml(escrow.amountTkas)} TKAS from ${escapeHtml(escrow.buyer)} to ${escapeHtml(escrow.seller)}</p>
        <small>${escapeHtml(escrow.nextAction)}</small>
      `;
      escrowListNode.append(article);
    }

    const actionMapResponse = await fetch("artifacts/escrow-marketplace-action-map.json", { cache: "no-store" });
    if (actionMapResponse.ok) {
      const actionMap = await actionMapResponse.json();
      const mappedRequests = actionMap.flows
        ?.flatMap((flow) => flow.actions || [])
        .map((action) => action.walletStandardRequestId)
        .filter(Boolean) || [];
      const article = document.createElement("article");
      article.className = "escrow-card";
      article.innerHTML = `
        <span>${escapeHtml(actionMap.status)}</span>
        <strong>Marketplace action map</strong>
        <p>${escapeHtml(actionMap.summary.actions)} actions; ${escapeHtml(actionMap.summary.blockedActions)} blocked until external signer validation and accepted replay.</p>
        <small>${escapeHtml(mappedRequests.join(" / ") || "wallet-standard request not mapped")}</small>
      `;
      escrowListNode.append(article);
    }
  } catch (error) {
    escrowSummaryNode.textContent = `Escrow registry unavailable: ${error.message}`;
  }
}

async function renderTreasuryVaults() {
  if (!treasurySummaryNode || !treasuryListNode) return;

  try {
    const response = await fetch("fixtures/TreasuryVaults.json", { cache: "no-store" });
    const fixture = await response.json();
    const registry = buildTreasuryVaultRegistry(fixture);
    treasurySummaryNode.innerHTML = `
      <article><span>Vaults</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>Balance</span><strong>${escapeHtml(registry.summary.totalBalanceTkas)}</strong></article>
      <article><span>Payroll</span><strong>${escapeHtml(registry.summary.plannedPayrollTkas)}</strong></article>
      <article><span>Recovery</span><strong>${escapeHtml(registry.summary.recoveryReady)}</strong></article>
    `;

    treasuryListNode.innerHTML = "";
    for (const vault of registry.vaults) {
      const article = document.createElement("article");
      article.className = "treasury-card";
      article.innerHTML = `
        <span>${escapeHtml(vault.status)}</span>
        <strong>${escapeHtml(vault.name)}</strong>
        <p>${escapeHtml(vault.balanceTkas)} TKAS balance; ${escapeHtml(vault.dailyCapTkas)} TKAS daily cap.</p>
        <small>${escapeHtml(vault.nextAction)}</small>
      `;
      treasuryListNode.append(article);
    }
  } catch (error) {
    treasurySummaryNode.textContent = `Treasury registry unavailable: ${error.message}`;
  }
}

async function renderCoordinationMarket() {
  if (!coordinationSummaryNode || !coordinationPacksNode) return;

  try {
    const [response, briefResponse] = await Promise.all([
      fetch("fixtures/CoordinationMarketPrototype.json", { cache: "no-store" }),
      fetch("fixtures/CoordinationMarketSettlementBrief.json", { cache: "no-store" })
    ]);
    const fixture = await response.json();
    const briefFixture = await briefResponse.json();
    const prototype = buildCoordinationMarketPrototype(fixture);
    const settlementBrief = buildCoordinationMarketSettlementBrief({ fixture: briefFixture, coordinationPrototype: prototype });
    coordinationSummaryNode.innerHTML = `
      <article><span>Stags</span><strong>${escapeHtml(prototype.summary.stags)}</strong></article>
      <article><span>Intendos</span><strong>${escapeHtml(prototype.summary.intendos)}</strong></article>
      <article><span>Packs</span><strong>${escapeHtml(prototype.summary.packs)}</strong></article>
      <article><span>Satisfiable</span><strong>${escapeHtml(prototype.summary.satisfiablePacks)}</strong></article>
      <article><span>Routes</span><strong>${escapeHtml(settlementBrief.summary.settlementRoutes)}</strong></article>
    `;

    coordinationPacksNode.innerHTML = "";
    for (const pack of prototype.packs) {
      const article = document.createElement("article");
      article.className = "coordination-card";
      article.innerHTML = `
        <span>${escapeHtml(pack.solver.status)}</span>
        <strong>${escapeHtml(pack.packId)}</strong>
        <p>${escapeHtml(pack.signedIntendoCount)} signed intendos; ${escapeHtml(pack.committedTkas)} TKAS transparent committed amount.</p>
        <small>${escapeHtml(pack.hunt.next)}</small>
      `;
      coordinationPacksNode.append(article);
    }
    const briefArticle = document.createElement("article");
    briefArticle.className = "coordination-card";
    briefArticle.innerHTML = `
      <span>${escapeHtml(settlementBrief.status)}</span>
      <strong>${escapeHtml(settlementBrief.appBrief.title)}</strong>
      <p>${escapeHtml(settlementBrief.summary.qualifyingIntendos)} qualifying intendos; ${escapeHtml(settlementBrief.summary.qualifyingTkas)} TKAS transparent route amount.</p>
      <small>${escapeHtml(settlementBrief.nonProductionBoundary[1])}</small>
    `;
    coordinationPacksNode.append(briefArticle);
  } catch (error) {
    coordinationSummaryNode.textContent = `Coordination market prototype unavailable: ${error.message}`;
  }
}

async function renderAccessPassPlanner() {
  if (!accessSummaryNode || !accessListNode) return;

  try {
    const response = await fetch("fixtures/AccessPassPlanner.json", { cache: "no-store" });
    const fixture = await response.json();
    const planner = buildAccessPassPlanner(fixture);
    accessSummaryNode.innerHTML = `
      <article><span>Passes</span><strong>${escapeHtml(planner.summary.totalPasses)}</strong></article>
      <article><span>Issued</span><strong>${escapeHtml(planner.summary.totalIssued)}</strong></article>
      <article><span>Redeemed</span><strong>${escapeHtml(planner.summary.acceptedRedemptions)}</strong></article>
      <article><span>Review</span><strong>${escapeHtml(planner.summary.duplicateRedemptions + planner.summary.missingAcceptedTxids)}</strong></article>
    `;

    accessListNode.innerHTML = "";
    for (const pass of planner.passes) {
      const article = document.createElement("article");
      article.className = "access-card";
      article.innerHTML = `
        <span>${escapeHtml(pass.state)} / ${escapeHtml(pass.category)}</span>
        <strong>${escapeHtml(pass.name)}</strong>
        <p>${escapeHtml(pass.claim)}</p>
        <small>${escapeHtml(pass.redeemed)} redeemed; ${escapeHtml(pass.remaining)} remaining; ${escapeHtml(pass.enforcement)}.</small>
      `;
      accessListNode.append(article);
    }
  } catch (error) {
    accessSummaryNode.textContent = `Access pass planner unavailable: ${error.message}`;
  }
}

async function renderMainnetReadiness() {
  if (!mainnetSummaryNode || !mainnetComponentsNode) return;

  try {
    const response = await fetch("fixtures/MainnetReadiness.json", { cache: "no-store" });
    const fixture = await response.json();
    const readiness = buildMainnetReadiness(fixture);
    mainnetSummaryNode.innerHTML = `
      <article><span>Mainnet paths</span><strong>${escapeHtml(readiness.summary.mainnetCapable)}</strong></article>
      <article><span>TN12/Toccata</span><strong>${escapeHtml(readiness.summary.tn12Only)}</strong></article>
      <article><span>Research</span><strong>${escapeHtml(readiness.summary.researchOnly)}</strong></article>
      <article><span>Local only</span><strong>${escapeHtml(readiness.summary.localOnly)}</strong></article>
    `;

    mainnetComponentsNode.innerHTML = "";
    for (const component of readiness.components) {
      const article = document.createElement("article");
      article.className = "mainnet-card";
      article.innerHTML = `
        <span>${escapeHtml(component.readiness)}</span>
        <strong>${escapeHtml(component.name)}</strong>
        <p>${escapeHtml(component.why)}</p>
        <small>${escapeHtml(component.next)}</small>
      `;
      mainnetComponentsNode.append(article);
    }
  } catch (error) {
    mainnetSummaryNode.textContent = `Mainnet readiness unavailable: ${error.message}`;
  }
}

async function renderAssetPolicies() {
  if (!assetSummaryNode || !assetListNode) return;

  try {
    const response = await fetch("fixtures/SimpleAssetPolicies.json", { cache: "no-store" });
    const fixture = await response.json();
    const registry = buildAssetPolicyRegistry(fixture);
    assetSummaryNode.innerHTML = `
      <article><span>Policies</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>Covenant</span><strong>${escapeHtml(registry.summary.covenantNative)}</strong></article>
      <article><span>Issuer</span><strong>${escapeHtml(registry.summary.issuerIndexed)}</strong></article>
      <article><span>Recovery</span><strong>${escapeHtml(registry.summary.recoveryEnabled)}</strong></article>
    `;

    assetListNode.innerHTML = "";
    for (const policy of registry.policies) {
      const article = document.createElement("article");
      article.className = "asset-card";
      article.innerHTML = `
        <span>${escapeHtml(policy.enforcement)}</span>
        <strong>${escapeHtml(policy.name)}</strong>
        <p>${escapeHtml(policy.supplyCap)} cap; lifecycle ${escapeHtml(policy.lifecycle.join(" -> "))}</p>
        <small>${escapeHtml(policy.risk)}</small>
      `;
      assetListNode.append(article);
    }
  } catch (error) {
    assetSummaryNode.textContent = `Asset policy registry unavailable: ${error.message}`;
  }
}

async function renderBuildStatus() {
  if (!buildStatusSummaryNode || !buildStatusLanesNode) return;

  try {
    const response = await fetch("fixtures/BuildStatus.json", { cache: "no-store" });
    const fixture = await response.json();
    const status = buildProjectStatus(fixture);
    const plan = buildProjectPlan(fixture);
    buildStatusSummaryNode.innerHTML = `
      <article><span>Bases</span><strong>${escapeHtml(status.summary.builtBases)}</strong></article>
      <article><span>Next</span><strong>${escapeHtml(status.summary.nextBuilds)}</strong></article>
      <article><span>Blocked</span><strong>${escapeHtml(status.summary.blocked)}</strong></article>
      <article><span>Research</span><strong>${escapeHtml(status.summary.research)}</strong></article>
    `;

    buildStatusLanesNode.innerHTML = "";
    for (const lane of status.lanes) {
      const article = document.createElement("article");
      article.className = "build-status-card";
      article.innerHTML = `
        <span>${escapeHtml(lane.order)} / ${escapeHtml(lane.status)}</span>
        <strong>${escapeHtml(lane.name)}</strong>
        <p>${escapeHtml(lane.enforcement)}; ${escapeHtml(lane.readiness)}; proof ${escapeHtml(lane.proof)}.</p>
        <small>${escapeHtml(lane.next)}</small>
      `;
      buildStatusLanesNode.append(article);
    }

    if (projectPlanSummaryNode && projectPlanNextNode && projectPlanVisionNode) {
      projectPlanSummaryNode.innerHTML = `
        <article><span>Done</span><strong>${escapeHtml(plan.summary.done)}</strong></article>
        <article><span>WIP</span><strong>${escapeHtml(plan.summary.wip)}</strong></article>
        <article><span>Next</span><strong>${escapeHtml(plan.summary.next)}</strong></article>
        <article><span>Later</span><strong>${escapeHtml(plan.summary.later)}</strong></article>
      `;
      projectPlanNextNode.innerHTML = "";
      for (const item of plan.next) {
        const article = document.createElement("article");
        article.className = "build-status-card";
        article.innerHTML = `
          <span>${escapeHtml(item.laneId)}</span>
          <strong>${escapeHtml(item.id)}</strong>
          <p>${escapeHtml(item.detail)}</p>
        `;
        projectPlanNextNode.append(article);
      }
      projectPlanVisionNode.innerHTML = plan.longTermVision
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }
  } catch (error) {
    buildStatusSummaryNode.textContent = `Build status unavailable: ${error.message}`;
  }
}

async function renderNextWorkQueue() {
  if (!nextQueueSummaryNode || !nextQueueTopNode || !nextQueueTasksNode) return;

  try {
    const response = await fetch("fixtures/NextWorkQueue.json", { cache: "no-store" });
    const fixture = await response.json();
    const queue = buildNextWorkQueue(fixture);
    nextQueueSummaryNode.innerHTML = `
      <article><span>Done</span><strong>${escapeHtml(queue.summary.done)}</strong></article>
      <article><span>WIP</span><strong>${escapeHtml(queue.summary.wip)}</strong></article>
      <article><span>Roadmap</span><strong>${escapeHtml(queue.summary.roadmap)}</strong></article>
      <article><span>Tasks</span><strong>${escapeHtml(queue.summary.tasks)}</strong></article>
    `;

    nextQueueTopNode.innerHTML = "";
    for (const task of queue.tasks.slice(0, 5)) {
      const article = document.createElement("article");
      article.className = "build-status-card priority-card";
      article.innerHTML = `
        <span>${escapeHtml(task.rank)} / ${escapeHtml(task.importance)}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.why)}</p>
        <small>${escapeHtml(task.definitionOfDone)}</small>
      `;
      nextQueueTopNode.append(article);
    }

    nextQueueTasksNode.innerHTML = "";
    for (const task of queue.tasks) {
      const article = document.createElement("article");
      article.className = "build-status-card compact-card";
      article.innerHTML = `
        <span>${escapeHtml(task.rank)} / ${escapeHtml(task.lane)}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.startWith.slice(0, 2).join(" | "))}</p>
      `;
      nextQueueTasksNode.append(article);
    }
  } catch (error) {
    nextQueueSummaryNode.textContent = `Next work queue unavailable: ${error.message}`;
  }
}

async function renderAuctionIntents() {
  if (!auctionSummaryNode || !auctionListNode) return;

  try {
    const response = await fetch("fixtures/AuctionIntentPrototype.json", { cache: "no-store" });
    const fixture = await response.json();
    const prototype = buildAuctionIntentPrototype(fixture);
    auctionSummaryNode.innerHTML = `
      <article><span>Auctions</span><strong>${escapeHtml(prototype.summary.auctions)}</strong></article>
      <article><span>Bids</span><strong>${escapeHtml(prototype.summary.bids)}</strong></article>
      <article><span>Accepted</span><strong>${escapeHtml(prototype.summary.acceptedBidPayloads)}</strong></article>
      <article><span>Settlement events</span><strong>${escapeHtml(prototype.summary.acceptedSettlementEvents || 0)}</strong></article>
      <article><span>Winners</span><strong>${escapeHtml(prototype.summary.auctionsWithWinner)}</strong></article>
    `;

    auctionListNode.innerHTML = "";
    for (const auction of prototype.auctions) {
      const article = document.createElement("article");
      article.className = "auction-card";
      article.innerHTML = `
        <span>${escapeHtml(auction.settlement)} / ${escapeHtml(auction.status)}</span>
        <strong>${escapeHtml(auction.title)}</strong>
        <p>${escapeHtml(auction.winner ? `${auction.winner.bidder} wins at ${auction.winner.amountTkas} TKAS` : "No accepted bid meets reserve yet.")}</p>
        <small>${escapeHtml(`${auction.settlementPlan.next} Accepted planner events: ${auction.settlementEvents?.length || 0}.`)}</small>
      `;
      auctionListNode.append(article);
    }

    const custodyResponse = await fetch("artifacts/auction-custody-review.json", { cache: "no-store" });
    if (custodyResponse.ok) {
      const custody = await custodyResponse.json();
      const article = document.createElement("article");
      article.className = "auction-card";
      article.innerHTML = `
        <span>${escapeHtml(custody.status)}</span>
        <strong>Auction custody review</strong>
        <p>${escapeHtml(custody.summary.drafts)} settlement rows; ${escapeHtml(custody.summary.custodyReadyRows)} custody-ready.</p>
        <small>${escapeHtml(custody.requiredBeforeSubmit.join(" | "))}</small>
      `;
      auctionListNode.append(article);
    }
  } catch (error) {
    auctionSummaryNode.textContent = `Auction intent prototype unavailable: ${error.message}`;
  }
}

async function renderDefiBacklog() {
  if (!defiSummaryNode || !defiListNode) return;

  try {
    const response = await fetch("fixtures/DefiResearchBacklog.json", { cache: "no-store" });
    const fixture = await response.json();
    const backlog = buildDefiResearchBacklog(fixture);
    defiSummaryNode.innerHTML = `
      <article><span>Briefs</span><strong>${escapeHtml(backlog.summary.total)}</strong></article>
      <article><span>Research</span><strong>${escapeHtml(backlog.summary.researchOnly)}</strong></article>
      <article><span>Later</span><strong>${escapeHtml(backlog.summary.prototypeLater)}</strong></article>
      <article><span>Missing rails</span><strong>${escapeHtml(backlog.summary.missingRailCount)}</strong></article>
    `;

    defiListNode.innerHTML = "";
    for (const brief of backlog.briefs) {
      const article = document.createElement("article");
      article.className = "defi-card";
      article.innerHTML = `
        <span>${escapeHtml(brief.status)} / ${escapeHtml(brief.earliestKaspaLane)}</span>
        <strong>${escapeHtml(brief.name)}</strong>
        <p>${escapeHtml(brief.firstSafeArtifact)}</p>
        <small>${escapeHtml(brief.missingRails.slice(0, 4).join(", "))}</small>
      `;
      defiListNode.append(article);
    }
  } catch (error) {
    defiSummaryNode.textContent = `DeFi backlog unavailable: ${error.message}`;
  }
}

async function renderStableValuePaths() {
  if (!stableSummaryNode || !stableListNode) return;

  try {
    const response = await fetch("fixtures/StableValuePaths.json", { cache: "no-store" });
    const fixture = await response.json();
    const registry = buildStableValuePathRegistry(fixture);
    stableSummaryNode.innerHTML = `
      <article><span>Paths</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>Build now</span><strong>${escapeHtml(registry.summary.buildableNow)}</strong></article>
      <article><span>Research</span><strong>${escapeHtml(registry.summary.researchOnly)}</strong></article>
      <article><span>Missing rails</span><strong>${escapeHtml(registry.summary.missingRailCount)}</strong></article>
    `;

    stableListNode.innerHTML = "";
    for (const path of registry.paths) {
      const article = document.createElement("article");
      article.className = "defi-card";
      article.innerHTML = `
        <span>${escapeHtml(path.status)} / ${escapeHtml(path.earliestKaspaLane)}</span>
        <strong>${escapeHtml(path.name)}</strong>
        <p>${escapeHtml(path.firstSafeArtifact)}</p>
        <small>${escapeHtml(path.missingRails.slice(0, 4).join(", "))}</small>
      `;
      stableListNode.append(article);
    }
  } catch (error) {
    stableSummaryNode.textContent = `Stable-value paths unavailable: ${error.message}`;
  }
}

async function renderStableIssuerRedemptions() {
  if (!stableIssuerSummaryNode || !stableIssuerListNode) return;

  try {
    const response = await fetch("fixtures/StableIssuerRedemptions.json", { cache: "no-store" });
    const fixture = await response.json();
    const state = buildStableIssuerRedemptionState(fixture);
    stableIssuerSummaryNode.innerHTML = `
      <article><span>Issued</span><strong>${escapeHtml(state.summary.acceptedIssuedDisplay)}</strong></article>
      <article><span>Redeemed</span><strong>${escapeHtml(state.summary.acceptedRedeemedDisplay)}</strong></article>
      <article><span>Outstanding</span><strong>${escapeHtml(state.summary.acceptedOutstandingDisplay)}</strong></article>
      <article><span>Signed-only</span><strong>${escapeHtml(state.summary.signedOnlyRedemptions)}</strong></article>
    `;

    stableIssuerListNode.innerHTML = "";
    for (const redemption of state.redemptions) {
      const article = document.createElement("article");
      article.className = "defi-card";
      article.innerHTML = `
        <span>${escapeHtml(redemption.accepted ? "accepted" : "signed-only")} / ${escapeHtml(redemption.holder)}</span>
        <strong>${escapeHtml(redemption.recordId)}</strong>
        <p>${escapeHtml(redemption.memo)}</p>
        <small>${escapeHtml(redemption.acceptedTxid || "missing accepted txid")}</small>
      `;
      stableIssuerListNode.append(article);
    }
  } catch (error) {
    stableIssuerSummaryNode.textContent = `Stable issuer state unavailable: ${error.message}`;
  }
}

async function renderAgentCommitments() {
  if (!agentSummaryNode || !agentListNode) return;

  try {
    const response = await fetch("fixtures/AgentCommitments.json", { cache: "no-store" });
    const fixture = await response.json();
    const board = buildAgentCommitmentBoard(fixture);
    agentSummaryNode.innerHTML = `
      <article><span>Tasks</span><strong>${escapeHtml(board.summary.tasks)}</strong></article>
      <article><span>Proofs</span><strong>${escapeHtml(board.summary.proofSubmitted)}</strong></article>
      <article><span>Disputed</span><strong>${escapeHtml(board.summary.disputed)}</strong></article>
      <article><span>Accepted payloads</span><strong>${escapeHtml(board.summary.acceptedPayloads)}</strong></article>
      <article><span>Lifecycle events</span><strong>${escapeHtml(board.summary.acceptedLifecycleEvents || 0)}</strong></article>
    `;

    agentListNode.innerHTML = "";
    for (const task of board.tasks) {
      const article = document.createElement("article");
      article.className = "agent-card";
      article.innerHTML = `
        <span>${escapeHtml(task.state)}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.rewardTkas)} TKAS reward for ${escapeHtml(task.agent)}</p>
        <small>${escapeHtml(`${task.settlementPlan.next} Accepted lifecycle events: ${task.lifecycleEvents?.length || 0}.`)}</small>
      `;
      agentListNode.append(article);
    }

    const reviewResponse = await fetch("artifacts/agent-settlement-review.json", { cache: "no-store" });
    if (reviewResponse.ok) {
      const review = await reviewResponse.json();
      const article = document.createElement("article");
      article.className = "agent-card";
      article.innerHTML = `
        <span>${escapeHtml(review.status)}</span>
        <strong>Agent settlement review</strong>
        <p>${escapeHtml(review.summary.releaseRows)} release; ${escapeHtml(review.summary.refundRows)} refund; ${escapeHtml(review.summary.holdRows)} hold; ${escapeHtml(review.summary.custodyReadyRows)} custody-ready.</p>
        <small>${escapeHtml(review.boundaries.join(" | "))}</small>
      `;
      agentListNode.append(article);
    }
  } catch (error) {
    agentSummaryNode.textContent = `Agent commitment board unavailable: ${error.message}`;
  }
}

async function verifyProofTransactions({ forceRemote }) {
  if (!proofListNode) return;

  try {
    const response = await fetch("fixtures/AcceptedProofTransactions.json", { cache: "no-store" });
    const data = await response.json();
    if (proofStatusNode) {
      proofStatusNode.textContent = forceRemote ? "Checking TN12 API..." : "Checking accepted status...";
    }

    for (const proof of data.transactions) {
      const status = proofListNode.querySelector(`[data-proof-status="${cssEscape(proof.txid)}"]`);
      if (status) status.textContent = "Checking...";
      const tx = await fetchTn12Transaction(proof.txid);
      const output = tx.outputs?.find((item) => Number(item.index) === 0);
      const amountMatches = output && String(output.amount) === proof.amountSompi;
      const addressMatches = output?.script_public_key_address === proof.destination;

      if (status) {
        status.textContent = tx.is_accepted && amountMatches && addressMatches
          ? `Accepted at blue score ${tx.accepting_block_blue_score}`
          : "Mismatch; inspect API response";
        status.className = tx.is_accepted && amountMatches && addressMatches ? "ok" : "bad";
      }
    }

    if (proofStatusNode) {
      proofStatusNode.textContent = "All proof cards refreshed from TN12 API.";
    }
  } catch (error) {
    if (proofStatusNode) {
      proofStatusNode.textContent = `Remote verification unavailable: ${error.message}`;
    }
  }
}

async function renderAcceptedAppState() {
  if (!indexerSummaryNode || !indexerRecordsNode || !receiptEventsNode) return;

  try {
    const [stateResponse, checkpointResponse, persistenceResponse, replayPlanResponse, virtualRunResponse] = await Promise.all([
      fetch("fixtures/AcceptedAppState.json", { cache: "no-store" }),
      fetch("artifacts/checkpointed-accepted-index.json", { cache: "no-store" }),
      fetch("artifacts/persisted-checkpoint-guard.json", { cache: "no-store" }),
      fetch("artifacts/indexer-replay-plan.json", { cache: "no-store" }),
      fetch("artifacts/virtual-chain-ingestion-run.json", { cache: "no-store" })
    ]);
    const state = await stateResponse.json();
    const checkpoint = await checkpointResponse.json();
    const persistence = await persistenceResponse.json();
    const replayPlan = await replayPlanResponse.json();
    const virtualRun = await virtualRunResponse.json();
    const summary = state.summary;
    const checkpointSummary = checkpoint.summary || {};
    indexerSummaryNode.innerHTML = `
      <article><span>Indexed</span><strong>${escapeHtml(checkpointSummary.total ?? summary.total)}</strong></article>
      <article><span>Accepted</span><strong>${escapeHtml(checkpointSummary.accepted ?? summary.accepted)}</strong></article>
      <article><span>Matched</span><strong>${escapeHtml(checkpointSummary.matched ?? summary.matched)}</strong></article>
      <article><span>Payloads</span><strong>${escapeHtml(checkpointSummary.payloadEvents ?? summary.receipts ?? 0)}</strong></article>
      <article><span>Checkpoint</span><strong>${escapeHtml(checkpoint.checkpoint?.maxAcceptingBlockBlueScore ?? "pending")}</strong></article>
    `;
    if (indexerPersistenceNode) {
      indexerPersistenceNode.innerHTML = `
        <article>
          <span>${escapeHtml(persistence.status)}</span>
          <strong>${escapeHtml(persistence.summary.recordCount)} persisted records</strong>
          <p>Rollback detected: ${escapeHtml(persistence.summary.rollbackDetected)}</p>
          <small>${escapeHtml(persistence.rollback.action)}</small>
        </article>
        <article>
          <span>${escapeHtml(replayPlan.status)}</span>
          <strong>${escapeHtml(replayPlan.target.status)}</strong>
          <p>${escapeHtml(replayPlan.currentCheckpoint.recordCount)} records must replay from ${escapeHtml(replayPlan.target.source)}.</p>
          <small>${escapeHtml(replayPlan.buildOrder[0]?.detail || "Define durable indexer storage next.")}</small>
        </article>
        <article>
          <span>${escapeHtml(virtualRun.status)}</span>
          <strong>${escapeHtml(virtualRun.summary.virtualChainRows)} virtual-chain rows</strong>
          <p>${escapeHtml(virtualRun.summary.walletCandidateRows)} wallet-submit candidates stay pending until accepted.</p>
          <small>${escapeHtml(virtualRun.nextReaderAdapter.promoteRule)}</small>
        </article>
      `;
    }
    indexerRecordsNode.innerHTML = "";

    const proofRecords = (checkpoint.records || []).filter((record) => record.kind === "proof-spend");
    for (const record of proofRecords.length ? proofRecords : state.records) {
      const article = document.createElement("article");
      article.className = "indexer-card";
      article.innerHTML = `
        <span>${escapeHtml(record.lane)} / ${escapeHtml(record.entrypoint)}</span>
        <strong>${escapeHtml(record.label)}</strong>
        <a href="${escapeHtml(record.explorerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(shortTxid(record.txid))}</a>
        <p>${escapeHtml(record.status)} at blue score ${escapeHtml(record.acceptingBlockBlueScore ?? "unknown")}</p>
        <small>${escapeHtml(sompiToTkas(BigInt(record.expected.amountSompi)))} TKAS to ${escapeHtml(shortAddress(record.expected.destination))}</small>
      `;
      indexerRecordsNode.append(article);
    }

    const receipts = (checkpoint.records || []).filter((record) => record.kind === "payload-event");
    receiptEventsNode.innerHTML = "";
    if (!receipts.length) {
      receiptEventsNode.innerHTML = `
        <article>
          <span>${escapeHtml(state.appState?.receipts?.status || "payload-receipt-indexer-next")}</span>
          <strong>No accepted payload receipts yet</strong>
          <p>${escapeHtml(state.appState?.receipts?.next || "Submit and verify one payload transaction before claiming receipt events.")}</p>
        </article>
      `;
      return;
    }

    for (const event of receipts) {
      const article = document.createElement("article");
      article.className = "receipt-card";
      const payload = event.payload?.decoded?.payload || event.receipt?.payload || {};
      article.innerHTML = `
        <span>${escapeHtml(event.lane)}</span>
        <strong>${escapeHtml(payload.kind || event.lane)} / ${escapeHtml(payload.value || event.status)}</strong>
        <p>${escapeHtml(payload.subject || event.label)}</p>
        <small>${escapeHtml(shortTxid(event.txid))}</small>
      `;
      receiptEventsNode.append(article);
    }
  } catch (error) {
    indexerSummaryNode.textContent = `Indexer snapshot unavailable: ${error.message}`;
  }
}

async function renderInvoiceApp() {
  if (!invoiceSummaryNode || !invoiceListNode || !invoiceDraftNode) return;

  try {
    const response = await fetch("fixtures/InvoiceReceipts.json", { cache: "no-store" });
    const fixture = await response.json();
    const registry = buildInvoiceRegistry(fixture);
    invoiceSummaryNode.innerHTML = `
      <article><span>Total</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>Paid</span><strong>${escapeHtml(registry.summary.paid)}</strong></article>
      <article><span>Refunded</span><strong>${escapeHtml(registry.summary.refunded)}</strong></article>
      <article><span>Errors</span><strong>${escapeHtml(registry.summary.errors)}</strong></article>
      <article><span>Draft</span><strong>${escapeHtml(registry.summary.draft)}</strong></article>
      <article><span>Review</span><strong>${escapeHtml(registry.summary.review)}</strong></article>
      <article><span>TKAS</span><strong>${escapeHtml(registry.summary.totalTkas)}</strong></article>
    `;

    invoiceListNode.innerHTML = "";
    for (const invoice of registry.invoices) {
      const article = document.createElement("article");
      article.className = "invoice-card";
      article.innerHTML = `
        <span>${escapeHtml(invoice.status)}</span>
        <strong>${escapeHtml(invoice.invoice.invoiceId)}</strong>
        <p>${escapeHtml(invoice.invoice.amountTkas)} TKAS to ${escapeHtml(invoice.invoice.merchant)}</p>
        <small>${escapeHtml(invoice.appState)}${invoice.receiptReviews.length ? ` ${escapeHtml(invoice.receiptReviews.length)} receipt review.` : ""}${invoice.refundReviews.length ? ` ${escapeHtml(invoice.refundReviews.length)} refund review.` : ""}${invoice.errorRecords.length ? ` ${escapeHtml(invoice.errorRecords.length)} error review.` : ""}</small>
      `;
      invoiceListNode.append(article);
    }

    try {
      const draftResponse = await fetch("artifacts/signed-drafts/payload-receipt-self-send.json", { cache: "no-store" });
      const draft = await draftResponse.json();
      invoiceDraftNode.innerHTML = `
        <article>
          <span>${escapeHtml(draft.status)}</span>
          <strong>${escapeHtml(shortTxid(draft.transactionId))}</strong>
          <p>${escapeHtml(draft.receipt.payload.kind)} / ${escapeHtml(draft.receipt.payload.subject)}</p>
          <small>${escapeHtml(draft.receipt.encoded.bytes)} payload bytes; accepted through TN12 JSON wRPC, with REST submit kept blocked.</small>
        </article>
      `;
    } catch (error) {
      invoiceDraftNode.innerHTML = `
        <article>
          <span>draft-needed</span>
          <strong>Run npm run tx:payload</strong>
          <p>${escapeHtml(error.message)}</p>
        </article>
      `;
    }
  } catch (error) {
    invoiceSummaryNode.textContent = `Invoice registry unavailable: ${error.message}`;
  }
}

async function renderPayloadSubmitReadiness() {
  if (!payloadReadinessNode) return;

  try {
    const response = await fetch("artifacts/payload-submit-readiness.json", { cache: "no-store" });
    const artifact = await response.json();
    const readiness = buildPayloadSubmitReadiness(artifact);
    payloadReadinessNode.innerHTML = `
      <article>
        <span>${escapeHtml(readiness.status)}</span>
        <strong>Payload submit readiness</strong>
        <p>${escapeHtml(readiness.next)}</p>
        <small>submit payload field: ${escapeHtml(readiness.checks.submitTxModelHasPayload)}; fetched tx payload field: ${escapeHtml(readiness.checks.fetchedTxModelHasPayload)}; observed preserve: ${escapeHtml(readiness.checks.restSubmitPayloadPreserved)}</small>
      </article>
    `;
  } catch (error) {
    payloadReadinessNode.innerHTML = `
      <article>
        <span>readiness-needed</span>
        <strong>Run npm run payload:readiness</strong>
        <p>${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}

async function renderSubmitConsole() {
  if (!submitSummaryNode || !submitDraftsNode) return;

  try {
    const manifestResponse = await fetch("fixtures/SubmitConsoleDrafts.json", { cache: "no-store" });
    const manifest = await manifestResponse.json();
    const artifactsByPath = {};
    await Promise.all((manifest.drafts || []).map(async (draft) => {
      const response = await fetch(draft.path, { cache: "no-store" });
      artifactsByPath[draft.path] = await response.json();
    }));
    const registry = buildSubmitConsoleRegistry(manifest, artifactsByPath);

    submitSummaryNode.innerHTML = `
      <article><span>Drafts</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>Payload</span><strong>${escapeHtml(registry.summary.payloadDrafts)}</strong></article>
      <article><span>Gated</span><strong>${escapeHtml(registry.summary.payloadSubmitGated)}</strong></article>
      <article><span>Status</span><strong>review</strong></article>
    `;

    submitDraftsNode.innerHTML = "";
    for (const draft of registry.drafts) {
      const article = document.createElement("article");
      article.className = "submit-card";
      article.innerHTML = `
        <span>${escapeHtml(draft.status)}</span>
        <strong>${escapeHtml(draft.label)}</strong>
        <p>${escapeHtml(shortTxid(draft.transactionId || "unknown00000000"))}</p>
        <p>${escapeHtml(draft.description)}</p>
        <small>${escapeHtml(draft.counts.inputs)} input; ${escapeHtml(draft.counts.outputs)} outputs; ${escapeHtml(draft.counts.payloadBytes)} payload bytes; ${escapeHtml(draft.totals.outputTkas)} TKAS out</small>
        <pre>${escapeHtml(draft.submit.dryRunCommand)}
${escapeHtml(draft.submit.submitCommand)}</pre>
      `;
      submitDraftsNode.append(article);
    }
  } catch (error) {
    submitSummaryNode.textContent = `Submit console unavailable: ${error.message}`;
  }
}

async function renderWalletReview() {
  if (!walletReviewNode) return;

  try {
    const response = await fetch("artifacts/wallet-review-readiness.json", { cache: "no-store" });
    const review = await response.json();
    walletReviewNode.innerHTML = `
      <article>
        <span>${escapeHtml(review.status)}</span>
        <strong>${escapeHtml(review.summary.ready)} / ${escapeHtml(review.summary.total)} drafts ready</strong>
        <p>${escapeHtml(review.summary.payloadRouteReady)} payload drafts require the payload-preserving route.</p>
        <small>${escapeHtml(review.summary.registrySecretFields)} serialized secret fields in the published registry.</small>
      </article>
    `;
  } catch (error) {
    walletReviewNode.textContent = `Wallet review readiness unavailable: ${error.message}`;
  }
}

async function renderWalletConnector() {
  if (!walletConnectorNode) return;

  try {
    const [readinessResponse, packageResponse, requestResponse, adapterResponse, ledgerResponse, standardResponse, signerValidationResponse] = await Promise.all([
      fetch("artifacts/wallet-connector-readiness.json", { cache: "no-store" }),
      fetch("artifacts/wallet-submit-package.json", { cache: "no-store" }),
      fetch("artifacts/wallet-connector-submit-requests.json", { cache: "no-store" }),
      fetch("artifacts/wallet-connector-adapter-run.json", { cache: "no-store" }),
      fetch("artifacts/wallet-connector-submit-ledger.json", { cache: "no-store" }),
      fetch("artifacts/wallet-standard-requests.json", { cache: "no-store" }),
      fetch("artifacts/wallet-standard-signer-validation.json", { cache: "no-store" })
    ]);
    const readiness = await readinessResponse.json();
    const submitPackage = await packageResponse.json();
    const requests = await requestResponse.json();
    const adapterRun = await adapterResponse.json();
    const ledger = await ledgerResponse.json();
    const standard = await standardResponse.json();
    const signerValidation = await signerValidationResponse.json();
    const capabilities = (readiness.requiredWalletCapabilities || [])
      .map((capability) => `${capability.id}: ${capability.status}`)
      .join("; ");

    walletConnectorNode.innerHTML = `
      <article>
        <span>${escapeHtml(readiness.status)}</span>
        <strong>${escapeHtml(readiness.summary.drafts)} drafts, ${escapeHtml(readiness.summary.payloadDrafts)} payload drafts</strong>
        <p>${escapeHtml(submitPackage.status)}: ${escapeHtml(submitPackage.summary.ready)} wallet-submit intents ready.</p>
        <small>${escapeHtml(capabilities)}</small>
      </article>
      <article>
        <span>${escapeHtml(adapterRun.status)}</span>
        <strong>${escapeHtml(adapterRun.summary.reviewReady)} review sessions, ${escapeHtml(adapterRun.summary.submitBroadcasts)} broadcasts</strong>
        <p>${escapeHtml(requests.summary.payloadRequests)} payload requests and ${escapeHtml(requests.summary.computeBudgetRequests)} compute-budget requests must preserve exact fields.</p>
        <small>${escapeHtml(adapterRun.boundaries[1])}</small>
      </article>
      <article>
        <span>${escapeHtml(standard.status)}</span>
        <strong>${escapeHtml(standard.summary.mappedRequests)} wallet-standard request candidates</strong>
        <p>${escapeHtml(standard.summary.payloadRequests)} payload round trip and ${escapeHtml(standard.summary.computeBudgetRequests)} v1 compute-budget round trip are mapped for external signing.</p>
        <small>${escapeHtml(standard.boundaries[0])}</small>
      </article>
      <article>
        <span>${escapeHtml(signerValidation.status)}</span>
        <strong>${escapeHtml(signerValidation.summary.pending)} pending signer returns, ${escapeHtml(signerValidation.summary.negativeCasesCaught)} negative cases caught</strong>
        <p>Returned signer rows must preserve review fingerprint, payload bytes, txid, route, explicit approval, and input budget fields.</p>
        <small>${escapeHtml(signerValidation.boundaries[0])}</small>
      </article>
      <article>
        <span>${escapeHtml(ledger.status)}</span>
        <strong>${escapeHtml(ledger.summary.acceptedEvidence)} accepted evidence rows, ${escapeHtml(ledger.summary.pendingWalletSubmit)} pending wallet-submit candidates</strong>
        <p>${escapeHtml(ledger.summary.broadcastsByThisArtifact)} broadcasts by this artifact; app state still waits for virtual-chain accepted evidence.</p>
        <small>${escapeHtml(ledger.boundaries[1])}</small>
      </article>
    `;
  } catch (error) {
    walletConnectorNode.textContent = `Wallet connector readiness unavailable: ${error.message}`;
  }
}

async function renderPayloadDraftStatus() {
  if (!payloadDraftStatusNode) return;

  try {
    const response = await fetch("artifacts/signed-drafts/payload-receipt-self-send.json", { cache: "no-store" });
    const draft = await response.json();
    payloadDraftStatusNode.innerHTML = `
      <article>
        <span>${escapeHtml(draft.status)}</span>
        <strong>${escapeHtml(shortTxid(draft.transactionId))}</strong>
        <p>${escapeHtml(draft.receipt.encoded.bytes)} payload bytes; accepted through TN12 JSON wRPC. Do not use the public REST route for payload receipts.</p>
        <small>${escapeHtml(draft.receipt.payload.kind)} / ${escapeHtml(draft.receipt.payload.subject)}</small>
      </article>
    `;
  } catch (error) {
    payloadDraftStatusNode.innerHTML = `
      <article>
        <span>draft-needed</span>
        <strong>Run npm run tx:payload</strong>
        <p>${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}

async function renderBuildQueue() {
  if (!buildQueueNode) return;

  try {
    const response = await fetch("fixtures/EcosystemBuildQueue.json", { cache: "no-store" });
    const data = await response.json();
    buildQueueNode.innerHTML = "";

    for (const item of data.items) {
      const article = document.createElement("article");
      article.className = "queue-card";
      article.innerHTML = `
        <span>${escapeHtml(item.lane)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.why)}</p>
        <small>${escapeHtml(item.next)}</small>
      `;
      buildQueueNode.append(article);
    }
  } catch (error) {
    buildQueueNode.textContent = `Build queue unavailable: ${error.message}`;
  }
}

async function renderMasterRoadmap() {
  if (!masterRoadmapNode) return;

  try {
    const response = await fetch("fixtures/MasterAppRoadmap.json", { cache: "no-store" });
    const data = await response.json();
    masterRoadmapNode.innerHTML = "";

    for (const lane of data.lanes) {
      const article = document.createElement("article");
      article.className = "roadmap-card";
      article.innerHTML = `
        <span>${escapeHtml(lane.order)} / ${escapeHtml(lane.status)}</span>
        <strong>${escapeHtml(lane.name)}</strong>
        <p>${escapeHtml(lane.summary)}</p>
        <small>${escapeHtml(lane.firstProof)}</small>
      `;
      masterRoadmapNode.append(article);
    }
  } catch (error) {
    masterRoadmapNode.textContent = `Master roadmap unavailable: ${error.message}`;
  }
}

async function renderResearchLibrary() {
  if (!researchSummaryNode || !researchCandidatesNode) return;

  try {
    const response = await fetch("fixtures/CrossChainResearchLibrary.json", { cache: "no-store" });
    const fixture = await response.json();
    const library = buildResearchLibrary(fixture);
    researchSummaryNode.innerHTML = `
      <article><span>Candidates</span><strong>${escapeHtml(library.summary.total)}</strong></article>
      <article><span>Build now</span><strong>${escapeHtml(library.summary.buildNow)}</strong></article>
      <article><span>Research</span><strong>${escapeHtml(library.summary.researchOnly)}</strong></article>
      <article><span>Status</span><strong>mapped</strong></article>
    `;

    researchCandidatesNode.innerHTML = "";
    for (const candidate of library.candidates) {
      const article = document.createElement("article");
      article.className = "research-card";
      article.innerHTML = `
        <span>${escapeHtml(candidate.kaspaLane)} / ${escapeHtml(candidate.priority)}</span>
        <strong>${escapeHtml(candidate.name)}</strong>
        <p>${escapeHtml(candidate.pmfSignal)}</p>
        <small>${escapeHtml(candidate.kaspaBuild)}</small>
        <a href="${escapeHtml(candidate.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(candidate.category)}</a>
      `;
      researchCandidatesNode.append(article);
    }
  } catch (error) {
    researchSummaryNode.textContent = `Research library unavailable: ${error.message}`;
  }
}

async function renderAppLab() {
  if (!appLanesNode) return;

  try {
    const response = await fetch("fixtures/KaspaAppLab.json", { cache: "no-store" });
    const data = await response.json();
    appLanesNode.innerHTML = "";

    for (const lane of data.lanes) {
      const article = document.createElement("article");
      article.className = "app-lane-card";
      article.innerHTML = `
        <span>${escapeHtml(lane.status)}</span>
        <strong>${escapeHtml(lane.name)}</strong>
        <p>${escapeHtml(lane.buildNow)}</p>
        <small>${escapeHtml(lane.baseWork)}</small>
      `;
      appLanesNode.append(article);
    }
  } catch (error) {
    appLanesNode.textContent = `App lab unavailable: ${error.message}`;
  }
}

async function renderMinerSignalResearch() {
  if (!signalChannelsNode) return;

  try {
    const response = await fetch("fixtures/MinerSignalResearch.json", { cache: "no-store" });
    const data = await response.json();
    signalChannelsNode.innerHTML = "";

    for (const channel of data.channels) {
      const article = document.createElement("article");
      article.className = "signal-card";
      article.innerHTML = `
        <span>${escapeHtml(channel.status)}</span>
        <strong>${escapeHtml(channel.name)}</strong>
        <p>${escapeHtml(channel.whatItMeans)}</p>
        <small>${escapeHtml(channel.constraint)}</small>
      `;
      signalChannelsNode.append(article);
    }
  } catch (error) {
    signalChannelsNode.textContent = `Signal research unavailable: ${error.message}`;
  }
}

async function renderAttestationRegistry() {
  if (!attestationSummaryNode || !attestationSourcesNode || !attestationSignalsNode) return;

  try {
    const response = await fetch("fixtures/AttestationSignals.json", { cache: "no-store" });
    const fixture = await response.json();
    const registry = buildAttestationRegistry(fixture);
    attestationSummaryNode.innerHTML = `
      <article><span>Total</span><strong>${escapeHtml(registry.summary.total)}</strong></article>
      <article><span>Verified</span><strong>${escapeHtml(registry.summary.verified)}</strong></article>
      <article><span>Signatures</span><strong>${escapeHtml(registry.summary.signatureVerified)}</strong></article>
      <article><span>Influence</span><strong>${escapeHtml(registry.summary.influenceReady)}</strong></article>
      <article><span>Channels</span><strong>${escapeHtml(registry.summary.channels.length)}</strong></article>
    `;

    attestationSourcesNode.innerHTML = "";
    for (const source of registry.sources) {
      const article = document.createElement("article");
      article.className = "attestation-card";
      article.innerHTML = `
        <span>${escapeHtml(source.sourceType)}</span>
        <strong>${escapeHtml(source.source)}</strong>
        <p>Reputation ${escapeHtml(source.reputationScore)}; verified ${escapeHtml(source.verified)} of ${escapeHtml(source.submitted)}.</p>
        <small>${escapeHtml(source.signatureVerified)} signature verified; ${escapeHtml(source.influenceReady)} influence-ready.</small>
      `;
      attestationSourcesNode.append(article);
    }

    attestationSignalsNode.innerHTML = "";
    for (const signal of registry.signals) {
      const article = document.createElement("article");
      article.className = "attestation-card";
      article.innerHTML = `
        <span>${escapeHtml(signal.status)} / ${escapeHtml(signal.channel)}</span>
        <strong>${escapeHtml(signal.claim)}</strong>
        <p>${escapeHtml(signal.marketUse)}</p>
        <small>${escapeHtml(signal.portfolioUse)} Signature ${escapeHtml(signal.signatureReview.status)}; influence ${escapeHtml(signal.influenceReady ? "ready" : "blocked")}.</small>
      `;
      attestationSignalsNode.append(article);
    }
  } catch (error) {
    attestationSummaryNode.textContent = `Attestation registry unavailable: ${error.message}`;
  }
}

async function renderPredictionHedgeSimulator() {
  if (!predictionSummaryNode || !predictionMarketsNode || !predictionSuggestionsNode) return;

  try {
    const [fixtureResponse, attestationResponse] = await Promise.all([
      fetch("fixtures/PredictionHedgeSimulator.json", { cache: "no-store" }),
      fetch("fixtures/AttestationSignals.json", { cache: "no-store" })
    ]);
    const fixture = await fixtureResponse.json();
    const attestationFixture = await attestationResponse.json();
    const attestationRegistry = buildAttestationRegistry(attestationFixture);
    const attestationThresholds = buildAttestationReputationThresholds({ attestationRegistry });
    const simulator = buildPredictionHedgeSimulator({ fixture, attestationRegistry, attestationThresholds });

    predictionSummaryNode.innerHTML = `
      <article><span>Markets</span><strong>${escapeHtml(simulator.summary.markets)}</strong></article>
      <article><span>Positions</span><strong>${escapeHtml(simulator.summary.positions)}</strong></article>
      <article><span>Signals</span><strong>${escapeHtml(simulator.summary.verifiedSignalInputs)}</strong></article>
      <article><span>Reviews</span><strong>${escapeHtml(simulator.summary.reviewSuggestions)}</strong></article>
    `;

    predictionMarketsNode.innerHTML = "";
    for (const market of simulator.markets) {
      const article = document.createElement("article");
      article.className = "prediction-card";
      const acceptedEventText = market.acceptedEvent?.txid
        ? `Accepted event ${shortTxid(market.acceptedEvent.txid)}.`
        : "No accepted event payload.";
      article.innerHTML = `
        <span>${escapeHtml(market.status)}</span>
        <strong>${escapeHtml(market.name)}: ${escapeHtml(market.simulatedProbability)}%</strong>
        <p>${escapeHtml(market.userQuestion)}</p>
        <small>${escapeHtml(market.verifiedSignalInputs)} verified inputs; ${escapeHtml(market.thresholdAllowedSignalInputs)} threshold-allowed; ${escapeHtml(market.thresholdBlockedSignalInputs)} threshold-blocked. ${escapeHtml(acceptedEventText)}</small>
      `;
      predictionMarketsNode.append(article);
    }

    predictionSuggestionsNode.innerHTML = "";
    for (const suggestion of simulator.suggestions) {
      const article = document.createElement("article");
      article.className = "prediction-card";
      const acceptedReviewText = suggestion.acceptedReview?.txid
        ? `Accepted review ${shortTxid(suggestion.acceptedReview.txid)}.`
        : "No accepted review payload.";
      article.innerHTML = `
        <span>${escapeHtml(suggestion.status)}</span>
        <strong>${escapeHtml(suggestion.positionId)}: risk ${escapeHtml(suggestion.riskScore)}</strong>
        <p>${escapeHtml(suggestion.action)}</p>
        <small>${escapeHtml(suggestion.reason || "No matching market.")} ${escapeHtml(acceptedReviewText)}</small>
      `;
      predictionSuggestionsNode.append(article);
    }
  } catch (error) {
    predictionSummaryNode.textContent = `Prediction hedge simulator unavailable: ${error.message}`;
  }
}

function renderSignalPayload() {
  if (!signalForm || !signalArtifactNode) return;
  const data = Object.fromEntries(new FormData(signalForm).entries());
  const artifact = buildSignalPayloadArtifact(data);
  signalArtifactNode.textContent = JSON.stringify(artifact, null, 2);
}

async function renderVaultTemplates() {
  if (!vaultTemplatesNode) return;

  try {
    const response = await fetch("fixtures/VaultTemplates.json", { cache: "no-store" });
    const data = await response.json();
    vaultTemplatesNode.innerHTML = "";

    for (const template of data.templates) {
      const article = document.createElement("article");
      article.className = "template-card";
      article.innerHTML = `
        <span>${escapeHtml(template.status)}</span>
        <strong>${escapeHtml(template.name)}</strong>
        <p>${escapeHtml(template.summary)}</p>
        <small>${escapeHtml(template.nextBuild)}</small>
        <button type="button">Apply</button>
      `;
      article.querySelector("button").addEventListener("click", () => applyVaultTemplate(template));
      vaultTemplatesNode.append(article);
    }
  } catch (error) {
    vaultTemplatesNode.textContent = `Vault templates unavailable: ${error.message}`;
  }
}

function applyVaultTemplate(template) {
  for (const [key, value] of Object.entries(template.settings)) {
    const input = form.elements[key];
    if (input) input.value = value;
  }
  renderVault();
  document.querySelector("#designer")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function fetchManualTransactionOutputs() {
  const txid = manualFields.txid.value.trim();
  manualOutputPickerNode.innerHTML = "";

  if (!/^[a-fA-F0-9]{32,128}$/.test(txid)) {
    manualOutputPickerNode.textContent = "Paste a TN12 transaction ID before fetching outputs.";
    return;
  }

  fetchManualTxButton.disabled = true;
  fetchManualTxButton.textContent = "Fetching...";

  try {
    const tx = await fetchTn12Transaction(txid);
    const outputs = tx.outputs || [];
    if (!outputs.length) {
      manualOutputPickerNode.textContent = "No outputs returned for that transaction.";
      return;
    }

    for (const output of outputs) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "output-choice";
      button.textContent = `#${output.index} ${sompiToTkas(BigInt(output.amount))} TKAS ${output.script_public_key_type}`;
      button.addEventListener("click", () => {
        manualFields.outputIndex.value = output.index;
        manualFields.amountTkas.value = sompiToTkas(BigInt(output.amount));
        manualFields.address.value = output.script_public_key_address || manualFields.address.value;
        manualFields.explorerUrl.value = `https://tn12.kaspa.stream/txs/${txid}`;
        renderManualOutpoint();
      });
      manualOutputPickerNode.append(button);
    }
  } catch (error) {
    manualOutputPickerNode.textContent = `Could not fetch transaction: ${error.message}`;
  } finally {
    fetchManualTxButton.disabled = false;
    fetchManualTxButton.textContent = "Fetch outputs";
  }
}

async function fetchTn12Transaction(txid) {
  const response = await fetch(`https://api-tn12.kaspa.org/transactions/${txid}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function shortTxid(txid) {
  return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
}

function shortAddress(address) {
  return `${address.slice(0, 18)}...${address.slice(-8)}`;
}

function sompiToTkas(sompi) {
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function cssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(value);
  return String(value).replaceAll('"', '\\"');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
