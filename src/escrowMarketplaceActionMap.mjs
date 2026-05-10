export function buildEscrowMarketplaceActionMap({
  marketplaceFlow = {},
  unsignedTemplates = {},
  walletStandardRequests = {},
  signerValidation = {},
  signerSim = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const flows = Array.isArray(marketplaceFlow.flows) ? marketplaceFlow.flows : [];
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const standardRequests = Array.isArray(walletStandardRequests.requests) ? walletStandardRequests.requests : [];
  const actionTemplates = buildTemplateIndex(templates);
  const simPassedIds = buildSimPassedSet(signerSim);
  const mapped = flows.map((flow) => mapFlow({
    flow,
    actionTemplates,
    standardRequests,
    signerValidation,
    simPassedIds
  }));
  const actionRows = mapped.flatMap((flow) => flow.actions);
  const readyRows = actionRows.filter((action) => action.status === "wallet-request-mapped");
  const simValidatedRows = actionRows.filter((action) => action.status === "sim-validated");

  return {
    schema: "tn12-escrow-marketplace-action-map/v1",
    network: marketplaceFlow.network || unsignedTemplates.network || "kaspa-testnet-12",
    generatedAt,
    status: actionRows.length > 0 ? "escrow-action-map-ready" : "escrow-action-map-review",
    summary: {
      flows: mapped.length,
      actions: actionRows.length,
      mappedActions: readyRows.length,
      simValidatedActions: simValidatedRows.length,
      blockedActions: actionRows.filter((a) => !["wallet-request-mapped", "sim-validated"].includes(a.status)).length,
      liveExternalSignerAccepted: signerValidation.liveExternalSignerAccepted === true,
      simRoundtripPassed: signerSim.status === "sim-roundtrip-all-passed"
    },
    flows: mapped,
    promotionRule: "An escrow action can become submit-ready only after it maps to a wallet-standard request, external signer validation accepts the return, and accepted virtual-chain replay observes the txid.",
    simNote: simValidatedRows.length > 0
      ? `${simValidatedRows.length} action(s) sim-validated: protocol structure confirmed, SIGNED_NOT_BROADCAST. Live external signer required for full promotion.`
      : "No sim validation yet.",
    boundaries: [
      "This maps marketplace actions to existing wallet request candidates; it does not sign or broadcast.",
      "sim-validated means local roundtrip simulation passed — not a live external wallet acceptance.",
      "The mapped templates are proof-lab templates, not fresh user custody for these fixture listings.",
      "Needs-funding listings remain blocked until a funded escrow output exists."
    ]
  };
}

function buildSimPassedSet(signerSim) {
  const passed = new Set();
  for (const result of signerSim.results || []) {
    if (result.roundtripStatus === "sim-roundtrip-passed") {
      passed.add(result.requestId);
    }
  }
  return passed;
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

function mapFlow({ flow, actionTemplates, standardRequests, signerValidation, simPassedIds }) {
  const actionsText = flow.steps?.find((step) => step.id === "select-action")?.detail || "";
  const actions = parseActions(actionsText).map((action) =>
    mapAction({ flow, action, actionTemplates, standardRequests, signerValidation, simPassedIds })
  );
  return {
    escrowId: flow.escrowId,
    title: flow.title,
    marketState: flow.marketState,
    state: flow.state,
    actions
  };
}

function mapAction({ flow, action, actionTemplates, standardRequests, signerValidation, simPassedIds }) {
  const template = actionTemplates.get(action);
  const standardRequest = template
    ? standardRequests.find((request) => request.sourceRequestId === template.requestId)
    : null;
  const needsFunding = flow.state === "needs-funding";
  const simPassed = template && standardRequest ? simPassedIds.has(standardRequest.requestId) : false;
  const liveSignerReady = signerValidation.liveExternalSignerAccepted === true;

  const hardBlockers = [
    needsFunding ? "listing needs funding output" : "",
    !template ? "no unsigned template mapped" : "",
    !standardRequest ? "no wallet-standard request mapped" : ""
  ].filter(Boolean);

  const softBlockers = [
    !liveSignerReady && !simPassed ? "external signer accepted result missing" : "",
    !liveSignerReady && simPassed ? "sim-validated only — live external signer still required for submission" : ""
  ].filter(Boolean);

  const status = hardBlockers.length === 0
    ? liveSignerReady
      ? "wallet-request-mapped"
      : simPassed
        ? "sim-validated"
        : "wallet-request-blocked"
    : "wallet-request-blocked";

  return {
    action,
    status,
    unsignedRequestId: template?.requestId || "",
    walletStandardRequestId: standardRequest?.requestId || "",
    sourceSignedDraftPath: template?.sourceSignedDraftPath || "",
    reviewFingerprint: standardRequest?.reviewFingerprint || "",
    blockers: [...hardBlockers, ...softBlockers]
  };
}

function parseActions(detail) {
  const match = String(detail).match(/Available actions:\s*([^.]*)/);
  if (!match) return [];
  return match[1].split(",").map((item) => item.trim()).filter((item) => item && item !== "none");
}
