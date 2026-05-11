export function buildAgentSettlementReview({
  settlementDrafts = {},
  walletStandardMapping = {},
  custodySources = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const drafts = Array.isArray(settlementDrafts.drafts) ? settlementDrafts.drafts : [];
  const sources = Array.isArray(custodySources.sources) ? custodySources.sources : [];
  const rows = drafts.map((draft) => {
    const custodySource = sources.find((source) =>
      source.taskId === draft.taskId
      && source.kind === draft.kind
    ) || null;
    const amountMatched = Boolean(custodySource) && Number(custodySource.amountTkas || 0) === Number(draft.amountTkas || 0);
    const recipientMatched = Boolean(custodySource) && String(custodySource.recipient || "") === String(draft.recipient || "");
    const acceptedPlannerEvent = Boolean(draft.acceptedPlannerEvent);
    const acceptedCompletionEvidence = Boolean(draft.acceptedProofTxid);
    const acceptedDisputeEvidence = Boolean(draft.acceptedDisputeTxid);
    const reviewerDecisionNeeded = draft.kind === "hold" || draft.status.includes("review");
    const releaseReviewReady = draft.kind === "release"
      && Boolean(draft.acceptedTaskTxid)
      && acceptedCompletionEvidence
      && acceptedPlannerEvent;
    const holdReviewReady = draft.kind === "hold"
      && Boolean(draft.acceptedTaskTxid)
      && acceptedDisputeEvidence
      && acceptedPlannerEvent;
    const refundReviewReady = draft.kind === "refund"
      && Boolean(draft.acceptedTaskTxid)
      && acceptedPlannerEvent;
    const reviewEvidenceReady = releaseReviewReady || holdReviewReady || refundReviewReady;
    const custodyReady = reviewEvidenceReady && Boolean(custodySource) && amountMatched && recipientMatched;
    return {
      id: draft.id,
      taskId: draft.taskId,
      kind: draft.kind,
      amountTkas: Number(draft.amountTkas || 0),
      recipient: draft.recipient || "",
      acceptedTaskEvidence: Boolean(draft.acceptedTaskTxid),
      acceptedCompletionEvidence,
      acceptedDisputeEvidence,
      acceptedPlannerEvent,
      reviewEvidenceReady,
      reviewerDecisionNeeded,
      custodySourcePresent: Boolean(custodySource),
      custodySource: custodySource ? summarizeSource(custodySource) : null,
      amountMatched,
      recipientMatched,
      custodyReady,
      walletStandardMapped: walletStandardMapping.liveWalletIntegrationReady === true,
      status: custodyReady ? "custody-source-ready-needs-wallet" : reviewEvidenceReady ? `${draft.kind}-review-evidence-ready-needs-custody` : "needs-accepted-review-evidence",
      next: custodyReady
        ? "Route through wallet-standard signing and accepted replay."
        : reviewEvidenceReady ? "Attach accepted reward/deposit custody output before release/refund submit." : "Add accepted task, proof/dispute, and planner evidence before custody review."
    };
  });

  return {
    schema: "kaspa-agent-settlement-review/v1",
    network: settlementDrafts.network || "kaspa-testnet-12",
    generatedAt,
    status: "agent-settlement-review-ready",
    summary: {
      drafts: rows.length,
      releaseRows: rows.filter((row) => row.kind === "release").length,
      refundRows: rows.filter((row) => row.kind === "refund").length,
      holdRows: rows.filter((row) => row.kind === "hold").length,
      reviewEvidenceReadyRows: rows.filter((row) => row.reviewEvidenceReady).length,
      releaseReviewReadyRows: rows.filter((row) => row.kind === "release" && row.reviewEvidenceReady).length,
      holdReviewReadyRows: rows.filter((row) => row.kind === "hold" && row.reviewEvidenceReady).length,
      custodyEvidenceRows: rows.filter((row) => row.custodySourcePresent).length,
      amountMatchedRows: rows.filter((row) => row.amountMatched).length,
      custodyReadyRows: rows.filter((row) => row.custodyReady).length,
      reviewerDecisionRows: rows.filter((row) => row.reviewerDecisionNeeded).length
    },
    rows,
    boundaries: [
      "Reviewer policy scores proof quality.",
      "Settlement review needs custody source, reviewer decision, wallet standard, and accepted replay.",
      "Dispute holds stay held until reviewed."
    ]
  };
}

function summarizeSource(source) {
  return {
    id: source.id || "",
    sourceType: source.sourceType || "",
    fundingTxid: source.fundingTxid || "",
    settlementTxid: source.settlementTxid || "",
    amountTkas: Number(source.amountTkas || 0),
    recipient: source.recipient || "",
    status: source.status || ""
  };
}
