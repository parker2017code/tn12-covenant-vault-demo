export function runProofPageController(renderers) {
  run([
    renderers.renderBuildStatus,
    renderers.renderProvenStatus,
    renderers.renderOperatorPack,
    renderers.renderNextWorkQueue,
    renderers.renderNextTenStatus,
    renderers.renderProofTransactions,
    renderers.renderAcceptedAppState,
    renderers.renderPayloadSubmitReadiness,
    renderers.renderSubmitConsole,
    renderers.renderWalletReview,
    renderers.renderWalletConnector,
    renderers.renderEnforcementMatrix,
    renderers.renderMainnetReadiness,
    renderers.renderDefiSimulationSurface,
    renderers.renderDefiReceiptGuard,
    renderers.renderMasterRoadmap,
    renderers.renderResultsExplorer,
    renderers.renderPlaygroundExplorer
  ]);
}

export function runLabPageController(renderers) {
  organizeLabPage();
  runProofPageController(renderers);
  run([
    renderers.renderVault,
    renderers.renderAssurance,
    renderers.renderManualOutpoint,
    renderers.renderBatchAssuranceCampaign,
    renderers.renderEscrowPrimitive,
    renderers.renderTreasuryVaults,
    renderers.renderCoordinationMarket,
    renderers.renderAccessPassPlanner,
    renderers.renderMainnetReadiness,
    renderers.renderAssetPolicies,
    renderers.renderAuctionIntents,
    renderers.renderDefiBacklog,
    renderers.renderDefiSimulationSurface,
    renderers.renderStableValuePaths,
    renderers.renderStableIssuerRedemptions,
    renderers.renderAgentCommitments,
    renderers.renderProjectPlan,
    renderers.renderMasterRoadmap,
    renderers.renderResearchLibrary,
    renderers.renderSelfServeLaneRunbook,
    renderers.renderUniversalSchedulerWorkbench,
    renderers.renderBuildQueue,
    renderers.renderVaultTemplates,
    renderers.renderAppLab,
    renderers.renderAttestationRegistry,
    renderers.renderPredictionHedgeSimulator,
    renderers.renderMinerSignalResearch,
    renderers.renderSignalPayload,
    renderers.renderPayloadDraftStatus,
    renderers.renderInvoiceApp
  ]);
  openLabDrawerForHash();
}

export function detectPageController(documentRef = document) {
  return documentRef.querySelector("#app-lab") ? "lab" : "proof";
}

function run(renderers) {
  for (const renderer of renderers) {
    if (typeof renderer === "function") renderer();
  }
}

function organizeLabPage(documentRef = document) {
  if (documentRef.body?.dataset.labOrganized === "true") return;
  documentRef.body.dataset.labOrganized = "true";

  const drawers = [
    ["core-notes", "Proof core notes", "Accepted counts, verifier command, and first docs."],
    ["reviewer-path", "Verification route", "Install, local gate, TN12 gate, and refresh command."],
    ["next-ten", "Current build slice", "The active wallet, indexer, and settlement blockers."],
    ["templates", "Vault templates", "Recovery, delayed withdrawal, spending cap, and escrow presets."],
    ["campaigns", "Batch assurance", "Pledge aggregation and release/refund planning."],
    ["enforcement", "Enforcement matrix", "What is script-enforced versus planner or wallet policy."],
    ["escrow", "Escrow primitive", "Buyer/seller release, refund, and cancel paths."],
    ["treasury", "Treasury vaults", "Team vault planning and wallet-policy rows."],
    ["coordination", "Coordination research", "Transparent Stag/Intendo/Pack prototype."],
    ["scheduler-workbench", "Scheduler workbench", "Accepted triggers, bids, solver jobs, and blocked predictions."],
    ["access-passes", "Access passes", "Issuer/indexer coupons, tickets, and memberships."],
    ["mainnet-readiness", "Mainnet readiness", "Mainnet-capable app layers versus TN12-only proofs."],
    ["asset-policies", "Asset policies", "Issuer-indexed and future covenant-native policy shapes."],
    ["build-status", "Artifact map", "Accepted evidence, next work, and research rows."],
    ["proven-status", "Proven status", "Accepted evidence and mainnet-deferred blockers."],
    ["operator-pack", "Refresh pack", "Single refresh path and commands."],
    ["project-plan", "Active build plan", "Accepted evidence, active work, queued work, and research."],
    ["next-queue", "Artifact work order", "Generated work order and source artifacts."],
    ["auction-intents", "Auction intents", "Accepted bids, winner selection, and refund planning."],
    ["defi-backlog", "DeFi backlog", "Research-only rails and accepted-activity hardening."],
    ["agent-commitments", "Agent commitments", "Task offers, proofs, disputes, and settlement review."],
    ["proofs", "Accepted proofs", "Explorer-checkable vault, assurance, escrow, and auction txids."],
    ["indexer", "Indexer records", "Checkpointed app state, payload rows, and replay guards."],
    ["invoices", "Payload receipt app", "Invoice state after accepted payload receipts."],
    ["submit", "Submit console", "Signed draft review, connector checks, and route constraints."],
    ["roadmap", "App map", "Status-labeled app lanes."],
    ["research-library", "Research library", "External examples used only as reference material."],
    ["stack", "Kaspa app stack", "What the lab naturally grows into next."],
    ["app-lab", "Application lanes", "Proof-first app map from Kaspa Explained framing."],
    ["attestations", "Attestation registry", "Signal sources, reputation, and influence rules."],
    ["prediction-hedge", "Prediction simulator", "Attestation-fed review prompts, not trading."]
  ];

  for (const [id, title, detail] of drawers) {
    const section = documentRef.getElementById(id);
    if (!section || section.closest("details.lab-drawer")) continue;
    const details = documentRef.createElement("details");
    details.className = "lab-drawer";
    details.id = `${id}-drawer`;
    const summary = documentRef.createElement("summary");
    summary.innerHTML = `<span>${title}</span><small>${detail}</small>`;
    section.before(details);
    details.append(summary, section);
  }

  window.addEventListener("hashchange", () => openLabDrawerForHash(documentRef));
}

function openLabDrawerForHash(documentRef = document) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = documentRef.getElementById(id);
  const drawer = target?.closest("details.lab-drawer");
  if (drawer) drawer.open = true;
}
