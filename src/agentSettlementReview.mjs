export function buildAgentSettlementReview({ settlementDrafts = {}, walletStandardMapping = {}, generatedAt = new Date().toISOString() } = {}) {
  const drafts = Array.isArray(settlementDrafts.drafts) ? settlementDrafts.drafts : [];
  const rows = drafts.map((draft) => {
    const custodyReady = false;
    const reviewerDecisionNeeded = draft.kind === "hold" || draft.status.includes("review");
    return {
      id: draft.id,
      taskId: draft.taskId,
      kind: draft.kind,
      amountTkas: Number(draft.amountTkas || 0),
      recipient: draft.recipient || "",
      acceptedTaskEvidence: Boolean(draft.acceptedTaskTxid),
      reviewerDecisionNeeded,
      custodyReady,
      walletStandardMapped: walletStandardMapping.liveWalletIntegrationReady === true,
      status: custodyReady ? "ready-for-wallet-review" : "needs-custody-source",
      next: custodyReady
        ? "Route through wallet-standard signing and accepted replay."
        : "Attach accepted reward/deposit custody output before release/refund review."
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
