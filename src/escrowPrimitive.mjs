export function buildEscrowPrimitive(fixture = {}) {
  const escrows = (fixture.escrows || []).map(normalizeEscrow);
  const byStatus = countBy(escrows, "status");
  const totalTkas = Number(escrows.reduce((total, escrow) => total + escrow.amountTkas, 0).toFixed(8));

  return {
    schema: "tn12-escrow-primitive/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "planner-fixture-not-script-proof",
    summary: {
      total: escrows.length,
      totalTkas,
      byStatus,
      funded: escrows.filter((escrow) => escrow.status === "funded").length,
      needsAction: escrows.filter((escrow) => ["funded", "delivery-disputed"].includes(escrow.status)).length
    },
    escrows: escrows.map((escrow) => ({
      ...escrow,
      nextAction: nextAction(escrow),
      spendPaths: buildSpendPaths(escrow)
    })),
    boundaries: [
      "This is the escrow app-state and transaction-planning surface.",
      "The accepted Escrow.sil proof paths are buyer-controlled release, buyer timeout refund, and buyer+seller cancel.",
      "There is no arbiter-mediated script path in Escrow.sil.",
      "Release, timeout refund, and mutual cancel must be reviewed as exact signed drafts before submit.",
      "Dispute notes are app-layer context unless a separate arbiter script path is added."
    ]
  };
}

function normalizeEscrow(escrow = {}) {
  return {
    escrowId: String(escrow.escrowId || ""),
    title: String(escrow.title || "Escrow"),
    buyer: String(escrow.buyer || ""),
    seller: String(escrow.seller || ""),
    buyerRefundAddress: String(escrow.buyerRefundAddress || ""),
    sellerPayoutAddress: String(escrow.sellerPayoutAddress || ""),
    amountTkas: clampNumber(Number(escrow.amountTkas), 0, 100000000),
    feeTkas: clampNumber(Number(escrow.feeTkas), 0, 100000000),
    timeoutIso: String(escrow.timeoutIso || ""),
    status: String(escrow.status || "draft"),
    proof: String(escrow.proof || ""),
    deliveryHash: String(escrow.deliveryHash || ""),
    notes: String(escrow.notes || "")
  };
}

function buildSpendPaths(escrow) {
  const spendAmountTkas = Math.max(Number((escrow.amountTkas - escrow.feeTkas).toFixed(8)), 0);
  return [
    {
      path: "seller-release",
      status: escrow.status === "funded" ? "available-after-buyer-approval" : "not-ready",
      outputAddress: escrow.sellerPayoutAddress,
      outputTkas: spendAmountTkas,
      requirement: "Buyer approves delivery or app policy marks delivery complete."
    },
    {
      path: "timeout-refund",
      status: escrow.status === "funded" ? "available-after-timeout" : "not-ready",
      outputAddress: escrow.buyerRefundAddress,
      outputTkas: spendAmountTkas,
      requirement: `Timeout passes at ${escrow.timeoutIso}.`
    },
    {
      path: "mutual-cancel",
      status: ["draft", "funded", "delivery-disputed"].includes(escrow.status) ? "planned" : "closed",
      outputAddress: escrow.buyerRefundAddress,
      outputTkas: spendAmountTkas,
      requirement: "Buyer and seller both approve cancel before release."
    }
  ];
}

function nextAction(escrow) {
  if (escrow.status === "draft") return "Build and review funding draft.";
  if (escrow.status === "funded") return "Review seller-release, timeout-refund, and mutual-cancel drafts.";
  if (escrow.status === "delivery-disputed") return "Keep funds locked until cancel/refund/release path is agreed.";
  if (escrow.status === "released") return "Index seller payout as closed escrow.";
  if (escrow.status === "refunded") return "Index buyer refund as closed escrow.";
  return "Inspect escrow status.";
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(number, min), max);
}
