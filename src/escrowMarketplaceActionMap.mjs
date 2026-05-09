export function buildEscrowMarketplaceActionMap({
  marketplaceFlow = {},
  unsignedTemplates = {},
  walletStandardRequests = {},
  signerValidation = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const flows = Array.isArray(marketplaceFlow.flows) ? marketplaceFlow.flows : [];
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const standardRequests = Array.isArray(walletStandardRequests.requests) ? walletStandardRequests.requests : [];
  const actionTemplates = buildTemplateIndex(templates);
  const mapped = flows.map((flow) => mapFlow({
    flow,
    actionTemplates,
    standardRequests,
    signerValidation
  }));
  const actionRows = mapped.flatMap((flow) => flow.actions);
  const readyRows = actionRows.filter((action) => action.status === "wallet-request-mapped");

  return {
    schema: "tn12-escrow-marketplace-action-map/v1",
    network: marketplaceFlow.network || unsignedTemplates.network || "kaspa-testnet-12",
    generatedAt,
    status: actionRows.length > 0 ? "escrow-action-map-ready" : "escrow-action-map-review",
    summary: {
      flows: mapped.length,
      actions: actionRows.length,
      mappedActions: readyRows.length,
      blockedActions: actionRows.length - readyRows.length,
      liveExternalSignerAccepted: signerValidation.liveExternalSignerAccepted === true
    },
    flows: mapped,
    promotionRule: "An escrow action can become submit-ready only after it maps to a wallet-standard request, external signer validation accepts the return, and accepted virtual-chain replay observes the txid.",
    boundaries: [
      "This maps marketplace actions to existing wallet request candidates; it does not sign or broadcast.",
      "The mapped templates are proof-lab templates, not fresh user custody for these fixture listings.",
      "Needs-funding listings remain blocked until a funded escrow output exists."
    ]
  };
}

function buildTemplateIndex(templates) {
  const byAction = new Map();
  for (const template of templates) {
    const label = String(template.label || "").toLowerCase();
    if (/role-separated escrow release/.test(label)) byAction.set("release", template);
    if (/role-separated escrow refund/.test(label)) byAction.set("timeout-refund", template);
    if (/role-separated escrow cancel/.test(label)) byAction.set("mutual-cancel", template);
  }
  return byAction;
}

function mapFlow({ flow, actionTemplates, standardRequests, signerValidation }) {
  const actionsText = flow.steps?.find((step) => step.id === "select-action")?.detail || "";
  const actions = parseActions(actionsText).map((action) =>
    mapAction({ flow, action, actionTemplates, standardRequests, signerValidation })
  );
  return {
    escrowId: flow.escrowId,
    title: flow.title,
    marketState: flow.marketState,
    state: flow.state,
    actions
  };
}

function mapAction({ flow, action, actionTemplates, standardRequests, signerValidation }) {
  const template = actionTemplates.get(action);
  const standardRequest = template
    ? standardRequests.find((request) => request.sourceRequestId === template.requestId)
    : null;
  const needsFunding = flow.state === "needs-funding";
  const blockers = [
    needsFunding ? "listing needs funding output" : "",
    !template ? "no unsigned template mapped" : "",
    !standardRequest ? "no wallet-standard request mapped" : "",
    signerValidation.liveExternalSignerAccepted !== true ? "external signer accepted result missing" : ""
  ].filter(Boolean);

  return {
    action,
    status: blockers.length === 0 ? "wallet-request-mapped" : "wallet-request-blocked",
    unsignedRequestId: template?.requestId || "",
    walletStandardRequestId: standardRequest?.requestId || "",
    sourceSignedDraftPath: template?.sourceSignedDraftPath || "",
    reviewFingerprint: standardRequest?.reviewFingerprint || "",
    blockers
  };
}

function parseActions(detail) {
  const match = String(detail).match(/Available actions:\s*([^.]*)/);
  if (!match) return [];
  return match[1].split(",").map((item) => item.trim()).filter((item) => item && item !== "none");
}
