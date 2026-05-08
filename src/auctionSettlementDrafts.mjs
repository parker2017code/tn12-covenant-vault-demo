export function buildAuctionSettlementDrafts({
  auctionState = {},
  walletConnectorRequests = {}
} = {}) {
  const auctions = Array.isArray(auctionState.auctions) ? auctionState.auctions : [];
  const settlementDrafts = auctions.flatMap(buildAuctionDrafts);
  const releaseDrafts = settlementDrafts.filter((draft) => draft.kind === "winner-release");
  const refundDrafts = settlementDrafts.filter((draft) => draft.kind === "loser-refund");

  return {
    schema: "kaspa-auction-settlement-drafts/v1",
    network: auctionState.network || "kaspa-testnet-12",
    status: "planner-settlement-drafts-ready-not-custody",
    summary: {
      auctions: auctions.length,
      drafts: settlementDrafts.length,
      winnerReleaseDrafts: releaseDrafts.length,
      refundDrafts: refundDrafts.length,
      walletConnectorRequestsReady: walletConnectorRequests.status === "connector-submit-requests-ready",
      custodyReadyDrafts: 0
    },
    drafts: settlementDrafts,
    acceptanceCriteria: [
      "A winner release must be based on an accepted bid payload and explicit seller/asset review.",
      "A loser refund must reference the losing accepted bid payload and show the exact refund amount.",
      "No draft can claim custody until bid funds sit in amount-matched accepted outputs or a covenant/escrow path.",
      "The wallet connector must show auction id, bid id, amount, recipient, payload/no-payload status, and route before submit."
    ],
    boundaries: [
      "These are settlement/refund planning records, not signed custody transactions.",
      "Accepted auction payloads prove planner state only.",
      "There is no MEV resistance, bid custody, or atomic asset exchange in this lane yet."
    ]
  };
}

function buildAuctionDrafts(auction) {
  const drafts = [];
  if (auction.winner) {
    drafts.push({
      id: `${auction.auctionId}:winner-release:${auction.winner.bidId}`,
      auctionId: auction.auctionId,
      bidId: auction.winner.bidId,
      kind: "winner-release",
      status: "wallet-review-needed-not-custody",
      fromState: auction.settlementPlan?.status || "unknown",
      amountTkas: auction.winner.amountTkas,
      recipient: auction.seller,
      assetRef: auction.assetRef,
      acceptedBidTxid: auction.winner.acceptedTxid,
      acceptedPlannerEvent: findEvent(auction, auction.winner.bidId, "auction-settlement"),
      next: "Build explicit settlement transaction or payload draft after custody source is defined."
    });
  }
  for (const refund of auction.refunds || []) {
    drafts.push({
      id: `${auction.auctionId}:loser-refund:${refund.bidId}`,
      auctionId: auction.auctionId,
      bidId: refund.bidId,
      kind: "loser-refund",
      status: refund.event ? "accepted-planner-refund-needs-custody" : "wallet-review-needed-not-custody",
      fromState: refund.status,
      amountTkas: refund.amountTkas,
      recipient: refund.bidder,
      acceptedPlannerEvent: refund.event,
      next: "Refund only after a real custody source exists; current accepted event is planner/indexer state."
    });
  }
  if (!drafts.length) {
    drafts.push({
      id: `${auction.auctionId}:no-settlement`,
      auctionId: auction.auctionId,
      kind: "no-winner-yet",
      status: "blocked-no-accepted-winning-bid",
      amountTkas: 0,
      recipient: "",
      next: "Wait for accepted bid payload above reserve or close the auction."
    });
  }
  return drafts;
}

function findEvent(auction, bidId, kind) {
  return (auction.settlementEvents || []).find((event) =>
    event.bidId === bidId && event.kind === kind
  ) || null;
}
