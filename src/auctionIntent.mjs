export function buildAuctionIntentPrototype(fixture = {}) {
  const auctions = (fixture.auctions || []).map(normalizeAuction);
  const bids = (fixture.bids || []).map(normalizeBid);
  const auctionsWithState = auctions.map((auction) => {
    const auctionBids = bids.filter((bid) => bid.auctionId === auction.auctionId);
    const acceptedBids = auctionBids.filter((bid) => bid.payloadStatus === "accepted-bid-payload");
    const winner = selectWinner(auction, acceptedBids);
    const refunds = acceptedBids
      .filter((bid) => bid.bidId !== winner?.bidId)
      .map((bid) => ({
        bidId: bid.bidId,
        bidder: bid.bidder,
        amountTkas: bid.amountTkas,
        status: winner ? "refund-planned-after-winner-selection" : "no-winner-yet"
      }));

    return {
      ...auction,
      summary: {
        totalBids: auctionBids.length,
        acceptedBids: acceptedBids.length,
        signedOnlyBids: auctionBids.filter((bid) => bid.payloadStatus !== "accepted-bid-payload").length,
        acceptedTkas: sumTkas(acceptedBids)
      },
      winner,
      refunds,
      settlementPlan: buildSettlementPlan(auction, winner, refunds)
    };
  });

  return {
    schema: "kaspa-auction-intent-prototype/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "accepted-payload-indexer-first-not-mev-resistant",
    summary: {
      auctions: auctions.length,
      bids: bids.length,
      acceptedBidPayloads: bids.filter((bid) => bid.payloadStatus === "accepted-bid-payload").length,
      signedOnlyBids: bids.filter((bid) => bid.payloadStatus !== "accepted-bid-payload").length,
      auctionsWithWinner: auctionsWithState.filter((auction) => auction.winner).length
    },
    auctions: auctionsWithState,
    bids,
    boundaries: [
      "This prototype indexes accepted bid payloads and derives planner-side winner/refund state.",
      "Winner selection is not covenant enforcement and is not MEV resistant.",
      "No asset delivery, bid custody, or atomic exchange is enforced by this lane yet.",
      "Refund and release transactions remain settlement plans until explicit signed drafts or covenant paths exist."
    ]
  };
}

function normalizeAuction(auction = {}) {
  return {
    auctionId: String(auction.auctionId || ""),
    title: String(auction.title || "Auction"),
    seller: String(auction.seller || ""),
    assetRef: String(auction.assetRef || ""),
    reserveTkas: Number(auction.reserveTkas || 0),
    deadlineIso: String(auction.deadlineIso || ""),
    winnerRule: String(auction.winnerRule || "highest-accepted-bid-before-deadline"),
    settlement: String(auction.settlement || "planner-indexer"),
    status: String(auction.status || "draft")
  };
}

function normalizeBid(bid = {}) {
  return {
    bidId: String(bid.bidId || ""),
    auctionId: String(bid.auctionId || ""),
    bidder: String(bid.bidder || ""),
    amountTkas: Number(bid.amountTkas || 0),
    payloadStatus: String(bid.payloadStatus || "signed-not-submitted"),
    acceptedTxid: String(bid.acceptedTxid || ""),
    submittedAtIso: String(bid.submittedAtIso || ""),
    note: String(bid.note || "")
  };
}

function selectWinner(auction, acceptedBids) {
  const eligible = acceptedBids
    .filter((bid) => bid.amountTkas >= auction.reserveTkas)
    .sort((a, b) => {
      if (b.amountTkas !== a.amountTkas) return b.amountTkas - a.amountTkas;
      return a.submittedAtIso.localeCompare(b.submittedAtIso);
    });
  const winner = eligible[0];
  if (!winner) return null;
  return {
    bidId: winner.bidId,
    bidder: winner.bidder,
    amountTkas: winner.amountTkas,
    acceptedTxid: winner.acceptedTxid,
    rule: auction.winnerRule,
    status: "planner-selected-from-accepted-payloads"
  };
}

function buildSettlementPlan(auction, winner, refunds) {
  if (!winner) {
    return {
      status: "no-release-yet",
      release: "No accepted bid meets reserve.",
      refundCount: refunds.length,
      next: "Wait for accepted payloads or close auction after deadline."
    };
  }

  return {
    status: "winner-selected-not-atomic-settlement",
    release: `${winner.amountTkas} TKAS winning bid from ${winner.bidder} for ${auction.assetRef}`,
    refundCount: refunds.length,
    next: "Build explicit settlement and refund drafts; do not claim atomic exchange until those paths exist."
  };
}

function sumTkas(items) {
  return Number(items.reduce((total, item) => total + item.amountTkas, 0).toFixed(8));
}
