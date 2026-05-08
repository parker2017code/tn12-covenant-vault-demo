export function buildEscrowMarketplaceDemo({
  escrowRegistry = {},
  walletConnectorRequests = {},
  proofEvidence = {}
} = {}) {
  const escrows = Array.isArray(escrowRegistry.escrows) ? escrowRegistry.escrows : [];
  const proofSummary = summarizeEscrowProofs(proofEvidence);
  const listings = escrows.map((escrow) => buildListing({ escrow, proofSummary }));
  const actionable = listings.filter((listing) => listing.actionState !== "needs-funding").length;

  return {
    schema: "tn12-escrow-marketplace-demo/v1",
    network: escrowRegistry.network || proofEvidence.network || "kaspa-testnet-12",
    status: "marketplace-demo-plan-ready",
    summary: {
      listings: listings.length,
      actionable,
      needsFunding: listings.filter((listing) => listing.actionState === "needs-funding").length,
      disputed: listings.filter((listing) => listing.marketState === "disputed").length,
      acceptedEscrowProofs: proofSummary.acceptedEscrowProofs,
      walletConnectorRequestsReady: walletConnectorRequests.status === "connector-submit-requests-ready",
      walletConnectorRequestCount: Number(walletConnectorRequests.summary?.requests || 0)
    },
    listings,
    appSurfaces: [
      {
        surface: "buyer-dashboard",
        actions: ["fund", "approve-release", "request-refund", "mutual-cancel"],
        requiredRail: "wallet connector exact transaction review"
      },
      {
        surface: "seller-dashboard",
        actions: ["submit-delivery-hash", "request-release", "accept-cancel"],
        requiredRail: "accepted payload or signed message evidence"
      },
      {
        surface: "public-proof-page",
        actions: ["show-funded-status", "show-accepted-release-or-refund", "show-dispute-boundary"],
        requiredRail: "durable indexer replay and proof evidence"
      }
    ],
    proofModel: {
      currentAcceptedProofs: proofSummary.labels,
      claimAllowed: "The repo has accepted TN12 escrow release, timeout refund, and mutual-cancel proof paths.",
      claimNotAllowed: "The marketplace fixture itself is not a live escrow marketplace and does not custody user funds."
    },
    nextBuilds: [
      {
        id: "escrow-marketplace-ui-panel",
        status: "ready",
        detail: "Render these listings and action states in the existing app shell without changing proof claims."
      },
      {
        id: "fresh-escrow-funding-output",
        status: "needed-before-submit",
        detail: "Fund a fresh expendable TN12 escrow output before any new rejection or marketplace spend tests."
      },
      {
        id: "wallet-connector-spend-review",
        status: "blocked-on-wallet-adapter",
        detail: "Move release/refund/cancel review from local signed drafts into no-local-key wallet requests."
      }
    ],
    boundaries: [
      "This artifact is a marketplace demo contract between app state, wallet review, and proof evidence.",
      "It does not submit or sign any transaction.",
      "Dispute handling is app-layer state until an arbiter path or explicit mutual-cancel path is selected.",
      "Mainnet use requires wallet integration, production indexing, audits, and mainnet-compatible covenant tooling."
    ]
  };
}

function buildListing({ escrow, proofSummary }) {
  const paths = Array.isArray(escrow.spendPaths) ? escrow.spendPaths : [];
  const releasePath = paths.find((path) => path.path === "seller-release") || {};
  const refundPath = paths.find((path) => path.path === "timeout-refund") || {};
  const cancelPath = paths.find((path) => path.path === "mutual-cancel") || {};
  const marketState = escrow.status === "delivery-disputed"
    ? "disputed"
    : escrow.status === "funded"
      ? "funded-awaiting-action"
      : "draft";

  return {
    escrowId: escrow.escrowId,
    title: escrow.title,
    buyer: escrow.buyer,
    seller: escrow.seller,
    amountTkas: escrow.amountTkas,
    feeTkas: escrow.feeTkas,
    marketState,
    actionState: escrow.status === "draft" ? "needs-funding" : "wallet-review-needed",
    deliveryHash: escrow.deliveryHash,
    timeoutIso: escrow.timeoutIso,
    primaryActions: [
      {
        action: "release",
        enabled: releasePath.status === "available-after-buyer-approval",
        outputAddress: releasePath.outputAddress || escrow.sellerPayoutAddress,
        outputTkas: releasePath.outputTkas ?? null
      },
      {
        action: "timeout-refund",
        enabled: refundPath.status === "available-after-timeout",
        outputAddress: refundPath.outputAddress || escrow.buyerRefundAddress,
        outputTkas: refundPath.outputTkas ?? null
      },
      {
        action: "mutual-cancel",
        enabled: cancelPath.status === "planned",
        outputAddress: cancelPath.outputAddress || escrow.buyerRefundAddress,
        outputTkas: cancelPath.outputTkas ?? null
      }
    ],
    acceptedProofBackdrop: proofSummary.acceptedEscrowProofs >= 3
      ? "release-refund-cancel-paths-accepted"
      : "proof-review-needed",
    next: escrow.nextAction || "Review escrow state."
  };
}

function summarizeEscrowProofs(proofEvidence) {
  const escrowProofs = (proofEvidence.proofs || []).filter((proof) =>
    proof.lane === "escrow" && proof.accepted === true
  );

  return {
    acceptedEscrowProofs: escrowProofs.length,
    labels: escrowProofs.map((proof) => proof.label)
  };
}
