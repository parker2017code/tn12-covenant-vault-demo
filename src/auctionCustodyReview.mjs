export function buildAuctionCustodyReview({
  settlementDrafts = {},
  walletStandardMapping = {},
  custodySources = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const drafts = Array.isArray(settlementDrafts.drafts) ? settlementDrafts.drafts : [];
  const sources = Array.isArray(custodySources.sources) ? custodySources.sources : [];
  const rows = drafts.map((draft) => buildReviewRow({ draft, sources, walletStandardMapping }));

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
      custodyEvidenceRows: rows.filter((row) => row.custodySourcePresent).length,
      amountMatchedRows: rows.filter((row) => row.amountMatched).length,
      custodyReadyRows: rows.filter((row) => row.custodyReady).length
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
      "Accepted settlement proof is useful only when it matches the planner row amount and recipient.",
      "Next rails are amount-matched custody, asset delivery, ordering, and wallet/replay checks.",
      "Submit after custody source rows are amount-matched and wallet-reviewed."
    ]
  };
}

function buildReviewRow({ draft, sources, walletStandardMapping }) {
  const matchingSources = sources.filter((source) =>
    source.auctionId === draft.auctionId
    && source.bidId === draft.bidId
    && source.kind === draft.kind
  );
  const custodySource = matchingSources.find((source) =>
    Number(source.amountTkas || 0) === Number(draft.amountTkas || 0)
    && String(source.recipient || "") === String(draft.recipient || "")
  ) || matchingSources[0] || null;
  const amountMatched = Boolean(custodySource) && Number(custodySource.amountTkas || 0) === Number(draft.amountTkas || 0);
  const recipientMatched = Boolean(custodySource) && String(custodySource.recipient || "") === String(draft.recipient || "");
  const custodyReady = Boolean(custodySource) && amountMatched && recipientMatched;

  return {
    id: draft.id,
    auctionId: draft.auctionId,
    bidId: draft.bidId || "",
    kind: draft.kind,
    amountTkas: Number(draft.amountTkas || 0),
    recipient: draft.recipient || "",
    plannerEvidencePresent: Boolean(draft.acceptedBidTxid || draft.acceptedPlannerEvent),
    custodySourcePresent: Boolean(custodySource),
    custodySource: custodySource ? summarizeSource(custodySource) : null,
    amountMatched,
    recipientMatched,
    custodyReady,
    walletStandardMapped: walletStandardMapping.liveWalletIntegrationReady === true,
    status: custodyReady ? "custody-source-ready-needs-wallet" : custodySource ? "custody-evidence-present-not-matched" : "needs-custody-source",
    next: custodyReady
      ? "Review with an external signer route before any submit."
      : custodySource ? "Create an amount-matched custody source for this planner row before submit." : "Attach accepted bid custody outputs or an escrow/covenant source before settlement/refund review."
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
