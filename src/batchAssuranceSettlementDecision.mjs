export function buildBatchAssuranceSettlementDecision({
  settlementDrafts = {},
  custodyRequirements = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const release = settlementDrafts.release || {};
  const refunds = Array.isArray(settlementDrafts.refunds) ? settlementDrafts.refunds : [];
  const custodyReady = custodyRequirements.status === "custody-requirements-satisfied";
  const releaseReady = release.status === "signed-not-broadcast" && custodyReady;
  const refundReady = refunds.length > 0 && refunds.every((refund) => refund.status === "signed-not-broadcast") && custodyReady;
  const selectedPath = releaseReady ? "release-review" : refundReady ? "refund-review" : "blocked";

  return {
    schema: "tn12-batch-assurance-settlement-decision/v1",
    network: settlementDrafts.network || custodyRequirements.network || "kaspa-testnet-12",
    generatedAt,
    status: selectedPath === "blocked" ? "settlement-decision-blocked" : "settlement-decision-ready",
    selectedPath,
    submitNow: false,
    summary: {
      custodyReady,
      releaseReady,
      refundReady,
      refundDrafts: refunds.length,
      mutuallyExclusiveInputs: true
    },
    releaseReview: {
      path: release.path || "",
      transactionId: release.transactionId || "",
      inputCount: Number(release.inputCount || 0),
      outputTkas: release.outputTkas || [],
      recommendation: releaseReady ? "primary review path because target pledge outputs are amount-matched" : "blocked"
    },
    refundReview: {
      paths: refunds.map((refund) => refund.path),
      transactionIds: refunds.map((refund) => refund.transactionId),
      recommendation: refundReady ? "alternate path only if release is intentionally rejected or deadline/refund policy is selected" : "blocked"
    },
    operatorDecision: [
      "Review release and refund as mutually exclusive alternatives.",
      "Do not submit both paths because they spend the same accepted pledge outputs.",
      "If release is submitted, mark individual refunds unavailable after acceptance.",
      "If refunds are submitted, submit all intended individual refunds and mark release unavailable after the first accepted spend."
    ],
    boundaries: [
      "This artifact chooses a review path; it does not broadcast.",
      "The current scripts spend accepted P2PK pledge outputs, not pooled covenant aggregation.",
      "A production assurance product still needs wallet UX, cancellation/refund policy, and pooled covenant rules."
    ]
  };
}
