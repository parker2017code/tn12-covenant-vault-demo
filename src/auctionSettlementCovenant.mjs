// Auction Settlement Covenant Builder
// Extends escrow pattern: highest-bidder acts as "buyer", seller as "seller"
// Winner: Bidder signs payment, seller signs release

export function buildAuctionSettlementCovenant({
  auctionId = "auction-001",
  sellerKey = Buffer.alloc(32, 0x01),
  highestBidderKey = Buffer.alloc(32, 0x02),
  reservePriceSompi = 10000000n,
  bidAmountSompi = 50000000n,
  endBlockDaa = 8055346
} = {}) {
  // Validation
  if (bidAmountSompi < reservePriceSompi) {
    throw new Error("Bid amount must meet or exceed reserve price");
  }

  const auctionCovenant = {
    schema: "tn12-auction-settlement-covenant/v1",
    auctionId,
    contractType: "AuctionSettlement",
    roles: {
      seller: sellerKey.toString("hex"),
      highestBidder: highestBidderKey.toString("hex")
    },
    parameters: {
      reservePriceSompi: String(reservePriceSompi),
      bidAmountSompi: String(bidAmountSompi),
      endBlockDaa,
      reserveMet: bidAmountSompi >= reservePriceSompi
    },
    settlement: {
      winner: "highestBidder",
      winnerAmount: String(bidAmountSompi),
      sellerPayout: String(bidAmountSompi),
      status: "pending-settlement"
    },
    locks: {
      buyerOutput: {
        recipient: highestBidderKey.toString("hex"),
        amount: String(bidAmountSompi - 5000n),
        purpose: "item-receipt-to-bidder"
      },
      sellerOutput: {
        recipient: sellerKey.toString("hex"),
        amount: String(bidAmountSompi),
        purpose: "payout-to-seller"
      }
    },
    note: "Auction settlement reuses escrow pattern: bidder=buyer, seller=seller, highest-bid=acceptance"
  };

  return auctionCovenant;
}

export function buildAuctionSettlementValidation({
  covenant = {},
  submittedBidAmount = 0n,
  currentBlockDaa = 0
} = {}) {
  const validations = {
    reservePriceMet: submittedBidAmount >= BigInt(covenant.parameters?.reservePriceSompi || 0),
    auctionClosed: currentBlockDaa >= (covenant.parameters?.endBlockDaa || 0),
    rolesSeparated: covenant.roles?.seller !== covenant.roles?.highestBidder,
    outputsLocked: covenant.locks?.buyerOutput && covenant.locks?.sellerOutput,
    valid: true
  };

  if (!validations.reservePriceMet) {
    validations.errors = ["Reserve price not met"];
    validations.valid = false;
  }

  if (!validations.auctionClosed) {
    validations.errors = ["Auction still open"];
    validations.valid = false;
  }

  if (!validations.rolesSeparated) {
    validations.errors = ["Seller and bidder keys not separated"];
    validations.valid = false;
  }

  return validations;
}
