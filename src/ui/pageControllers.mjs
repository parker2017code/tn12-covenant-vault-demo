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
}

export function detectPageController(documentRef = document) {
  return documentRef.querySelector("#app-lab") ? "lab" : "proof";
}

function run(renderers) {
  for (const renderer of renderers) {
    if (typeof renderer === "function") renderer();
  }
}
