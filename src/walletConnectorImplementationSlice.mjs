export function buildWalletConnectorImplementationSlice({
  walletMapping = {},
  unsignedTemplates = {},
  standardRequests = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const requests = Array.isArray(standardRequests.requests) ? standardRequests.requests : [];
  const payloadTemplates = templates.filter((template) => template.payload?.present);
  const computeBudgetTemplates = templates.filter((template) => Number(template.preservation?.computeBudgetInputs || 0) > 0);
  const payloadRequest = requests.find((request) => request.payload?.present || request.body?.transaction?.payload?.present);
  const computeBudgetRequest = requests.find((request) => Number(request.preservation?.computeBudgetInputs || 0) > 0);

  return {
    schema: "tn12-wallet-connector-implementation-slice/v1",
    network: unsignedTemplates.network || walletMapping.network || "kaspa-testnet-12",
    generatedAt,
    status: "wallet-connector-implementation-slice-ready",
    selectedStandard: walletMapping.selectedCandidate || "pskb-pskt",
    firstUserFlow: "payload-receipt-unsigned-sign",
    secondUserFlow: "v1-compute-budget-contract-sign",
    summary: {
      unsignedTemplates: templates.length,
      standardRequests: requests.length,
      payloadTemplates: payloadTemplates.length,
      computeBudgetTemplates: computeBudgetTemplates.length,
      liveWalletIntegrationReady: walletMapping.liveWalletIntegrationReady === true
    },
    implementationSteps: [
      step(
        "field-map",
        requests.length > 0
          ? "Use the wallet-standard request candidates as the adapter input shape."
          : "Map repo unsigned-template fields into the selected partial transaction shape.",
        "wallet-standard adapter"
      ),
      step("payload-roundtrip", "Sign one payload receipt through an external signer and compare txid, payload bytes, and outputs.", "accepted payload receipt"),
      step("compute-budget-roundtrip", "Sign one v1 covenant spend and compare computeBudget fields after signing.", "accepted or rejected TN12 evidence"),
      step("result-validation", "Feed the returned txid into the existing submit-result validator and virtual-chain replay.", "promotion or review row")
    ],
    firstRoundTripRequest: payloadRequest ? {
      requestId: payloadRequest.requestId,
      sourceSignedDraftPath: payloadRequest.sourceSignedDraftPath,
      reviewFingerprint: payloadRequest.reviewFingerprint
    } : null,
    covenantRoundTripRequest: computeBudgetRequest ? {
      requestId: computeBudgetRequest.requestId,
      sourceSignedDraftPath: computeBudgetRequest.sourceSignedDraftPath,
      reviewFingerprint: computeBudgetRequest.reviewFingerprint
    } : null,
    requiredPreservation: walletMapping.requiredFieldMap || [],
    acceptanceRule: "First success is one external-signed payload receipt accepted and replayed; covenant signing follows after computeBudget preservation is proven."
  };
}

function step(id, action, output) {
  return { id, action, output };
}
