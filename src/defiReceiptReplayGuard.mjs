export function buildDefiReceiptReplayGuard({
  receiptEvidence = [],
  staleCandidates = [],
  duplicateCandidates = [],
  generatedAt = new Date().toISOString()
} = {}) {
  const receipts = receiptEvidence.map(normalizeReceipt).filter((receipt) => receipt.txid);
  const accepted = receipts.filter((receipt) => receipt.accepted && receipt.payloadMatches);
  const duplicateKeys = countBy(duplicateCandidates.map((candidate) =>
    `${candidate.subject || ""}:${candidate.walletAddress || ""}:${candidate.txid || ""}`
  ));
  const duplicateReviews = duplicateCandidates.map((candidate) => ({
    ...candidate,
    status: duplicateKeys.get(`${candidate.subject || ""}:${candidate.walletAddress || ""}:${candidate.txid || ""}`) > 1
      ? "duplicate-receipt-review"
      : "unique-receipt"
  }));
  const staleReviews = staleCandidates.map((candidate) => ({
    ...candidate,
    status: receipts.some((receipt) => receipt.txid === candidate.txid)
      ? "known-receipt"
      : "stale-or-unknown-receipt-review"
  }));
  const negativeCasesCaught = duplicateReviews.filter((row) => row.status === "duplicate-receipt-review").length
    + staleReviews.filter((row) => row.status === "stale-or-unknown-receipt-review").length;
  const wallets = new Set(accepted.map((receipt) => receipt.walletAddress).filter(Boolean));

  return {
    schema: "tn12-defi-receipt-replay-guard/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: accepted.length >= 4 && wallets.size >= 3 && negativeCasesCaught >= 2
      ? "defi-receipt-replay-guard-ready"
      : "defi-receipt-replay-guard-review",
    summary: {
      acceptedReceipts: accepted.length,
      wallets: wallets.size,
      duplicateReviews: duplicateReviews.filter((row) => row.status === "duplicate-receipt-review").length,
      staleReviews: staleReviews.filter((row) => row.status === "stale-or-unknown-receipt-review").length,
      negativeCasesCaught
    },
    acceptedReceipts: accepted,
    duplicateReviews,
    staleReviews,
    promotionRule: "Promote a DeFi receipt only when the tx is accepted, payload bytes match the signed draft, the subject is expected, and the txid/outpoint is not stale or duplicated.",
    boundaries: [
      "This is an indexer/replay guard, not wallet signing evidence.",
      "Synthetic duplicate and stale rows are local negative cases; accepted positive receipts still come from TN12 evidence artifacts.",
      "A receipt can support product state only after this guard and the checkpointed index both pass."
    ]
  };
}

function normalizeReceipt(evidence = {}) {
  const payload = evidence.payload?.decoded?.payload || {};
  const outputAddress = evidence.output?.expected?.destination || evidence.output?.observed?.address || evidence.output?.actual?.address || "";
  return {
    txid: evidence.txid || "",
    subject: payload.subject || "",
    value: payload.value || "",
    walletAddress: outputAddress,
    accepted: Boolean(evidence.accepted),
    payloadMatches: Boolean(evidence.payload?.matches && evidence.receiptMatches),
    outputMatches: Boolean(evidence.output?.matches),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}
