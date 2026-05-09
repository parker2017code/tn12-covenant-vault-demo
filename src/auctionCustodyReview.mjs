export function buildAuctionCustodyReview({ settlementDrafts = {}, walletStandardMapping = {}, generatedAt = new Date().toISOString() } = {}) {
  const drafts = Array.isArray(settlementDrafts.drafts) ? settlementDrafts.drafts : [];
  const rows = drafts.map((draft) => ({
    id: draft.id,
    auctionId: draft.auctionId,
    bidId: draft.bidId || "",
    kind: draft.kind,
    amountTkas: Number(draft.amountTkas || 0),
    recipient: draft.recipient || "",
    plannerEvidencePresent: Boolean(draft.acceptedBidTxid || draft.acceptedPlannerEvent),
    custodySourcePresent: false,
    walletStandardMapped: walletStandardMapping.liveWalletIntegrationReady === true,
    status: "needs-custody-source",
    next: "Attach accepted bid custody outputs or an escrow/covenant source before settlement/refund review."
  }));

  return {
    schema: "kaspa-auction-custody-review/v1",
    network: settlementDrafts.network || "kaspa-testnet-12",
    generatedAt,
    status: "auction-custody-review-ready",
    summary: {
      drafts: rows.length,
      winnerReleaseDrafts: rows.filter((row) => row.kind === "winner-release").length,
      refundDrafts: rows.filter((row) => row.kind === "loser-refund").length,
      plannerEvidenceRows: rows.filter((row) => row.plannerEvidencePresent).length,
      custodyReadyRows: rows.filter((row) => row.custodySourcePresent).length
    },
    rows,
    requiredBeforeSubmit: [
      "accepted bid custody source",
      "winner asset delivery rule",
      "loser refund source output",
      "wallet-standard signing route",
      "accepted virtual-chain replay after submit"
    ],
    boundaries: [
      "Accepted auction payloads are planner/indexer evidence.",
      "Next rails are custody, asset delivery, ordering, and wallet/replay checks.",
      "Submit after custody source rows exist."
    ]
  };
}
