export function buildWalletExternalSignerResultTemplate({
  roundtripPlan = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const rows = Array.isArray(roundtripPlan.rows) ? roundtripPlan.rows : [];
  const recommended = new Set(roundtripPlan.recommendedOrder || []);
  const templates = rows.map((row) => ({
    id: `${row.requestId}:external-signer-return`,
    status: "pending-external-signer",
    requestId: row.requestId,
    label: row.label,
    recommendedFirstPass: recommended.has(row.requestId),
    reviewFingerprint: row.reviewFingerprint,
    transactionId: row.expectedTransactionIdAfterSigning,
    payloadBytes: Number(row.payloadBytes || 0),
    inputBudgetReport: budgetTemplate(row),
    signedTransaction: "",
    signerName: "",
    signerVersion: "",
    userAction: "not-yet-performed",
    route: row.payloadBytes > 0 ? "payload-preserving-wrpc" : "json-wrpc",
    notes: [
      "Fill signedTransaction only after an external signer returns the exact reviewed transaction.",
      "Do not change reviewFingerprint, payloadBytes, transactionId, sigOpCount, or computeBudget to make validation pass.",
      "After submit, accepted virtual-chain replay must match before app-state promotion."
    ]
  }));

  return {
    schema: "tn12-wallet-external-signer-result-template/v1",
    network: roundtripPlan.network || "kaspa-testnet-12",
    generatedAt,
    status: templates.length > 0 ? "external-signer-result-template-ready" : "external-signer-result-template-empty",
    summary: {
      templates: templates.length,
      recommendedFirstPass: templates.filter((row) => row.recommendedFirstPass).length,
      payloadTemplates: templates.filter((row) => row.payloadBytes > 0).length,
      computeBudgetTemplates: templates.filter((row) =>
        row.inputBudgetReport.some((input) => input.computeBudget !== null && input.computeBudget !== undefined)
      ).length
    },
    templates,
    results: templates,
    validationCommand: "WALLET_STANDARD_SIGNER_RESULTS=artifacts/wallet-external-signer-result-template.json npm run wallet:standard-signer-validation",
    boundaries: [
      "This is a current-field template for a future signer return, not a signer result.",
      "It intentionally leaves signedTransaction and signer metadata blank.",
      "It should be regenerated from the roundtrip plan when wallet request fingerprints change."
    ]
  };
}

function budgetTemplate(row = {}) {
  const required = Array.isArray(row.requiredPreservation) ? row.requiredPreservation : [];
  const computeBudget = Number(row.computeBudgetInputs || 0) > 0 ? 30 : null;
  const sigOpCount = required.some((item) => /sigOpCount/.test(item)) && computeBudget === null ? 1 : null;
  return [
    {
      inputIndex: 0,
      sigOpCount,
      computeBudget
    }
  ];
}
