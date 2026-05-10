export function buildBatchAssuranceSubmitRunbook({
  settlementDecision = {},
  settlementDrafts = {},
  custodyImports = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const selectedPath = settlementDecision.selectedPath || "blocked";
  const release = settlementDrafts.release || {};
  const refunds = Array.isArray(settlementDrafts.refunds) ? settlementDrafts.refunds : [];
  const releaseAccepted = selectedPath === "release-accepted" || settlementDecision.summary?.releaseAccepted === true;
  const readyImports = Array.isArray(custodyImports.imports)
    ? custodyImports.imports.filter((item) => item.status === "ready" || item.status === "custody-import-ready")
    : [];

  return {
    schema: "tn12-batch-assurance-submit-runbook/v1",
    network: settlementDrafts.network || settlementDecision.network || "kaspa-testnet-12",
    generatedAt,
    status: releaseAccepted ? "release-path-accepted" : selectedPath === "release-review" ? "release-path-review-ready" : `${selectedPath}-review`,
    selectedPath,
    submitNow: false,
    summary: {
      readyImports: readyImports.length,
      releaseDraftPresent: Boolean(release.path),
      refundDrafts: refunds.length,
      mutuallyExclusiveInputs: settlementDecision.summary?.mutuallyExclusiveInputs === true
    },
    releasePath: {
      path: release.path || "",
      transactionId: release.transactionId || "",
      reviewChecks: [
        "recipient output amount matches accepted pledge total minus fee",
        "inputs match the imported 45/35/20 TKAS pledge outputs",
        releaseAccepted ? "release output is accepted on TN12" : "refund drafts are held back if release is submitted"
      ]
    },
    refundPath: {
      paths: refunds.map((refund) => refund.path),
      transactionIds: refunds.map((refund) => refund.transactionId),
      reviewChecks: [
        "each refund spends only its contributor pledge output",
        "release draft is held back if any refund is accepted",
        releaseAccepted ? "refund drafts are non-selected after accepted release" : "all intended refunds are tracked independently"
      ]
    },
    operatorChecklist: [
      "Choose release or refund before any submit.",
      "Run npm run campaign:settlement-decision.",
      "Review the selected signed draft path.",
      "Submit one path manually only after wallet review.",
      "Run npm run tx:verify or targeted accepted-tx verification after submit.",
      "Update checkpoint, test matrix, submit registry, and UI after accepted evidence."
    ]
  };
}
