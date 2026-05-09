export function buildWalletConnectorImplementationSlice({
  walletMapping = {},
  unsignedTemplates = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const payloadTemplates = templates.filter((template) => template.payload?.present);
  const computeBudgetTemplates = templates.filter((template) => Number(template.preservation?.computeBudgetInputs || 0) > 0);

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
      payloadTemplates: payloadTemplates.length,
      computeBudgetTemplates: computeBudgetTemplates.length,
      liveWalletIntegrationReady: walletMapping.liveWalletIntegrationReady === true
    },
    implementationSteps: [
      step("field-map", "Map repo unsigned-template fields into the selected partial transaction shape.", "wallet-standard adapter"),
      step("payload-roundtrip", "Sign one payload receipt through an external signer and compare txid, payload bytes, and outputs.", "accepted payload receipt"),
      step("compute-budget-roundtrip", "Sign one v1 covenant spend and compare computeBudget fields after signing.", "accepted or rejected TN12 evidence"),
      step("result-validation", "Feed the returned txid into the existing submit-result validator and virtual-chain replay.", "promotion or review row")
    ],
    requiredPreservation: walletMapping.requiredFieldMap || [],
    acceptanceRule: "First success is one external-signed payload receipt accepted and replayed; covenant signing follows after computeBudget preservation is proven."
  };
}

function step(id, action, output) {
  return { id, action, output };
}
