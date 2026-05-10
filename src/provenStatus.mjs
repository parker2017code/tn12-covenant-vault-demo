export function buildProvenStatus({
  checkpoint = {},
  proofEvidence = {},
  roleProofEvidence = {},
  signerValidation = {},
  durableReplayGuard = {},
  auctionCustodyReview = {},
  agentSettlementReview = {},
  nextTenStatus = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const blockers = [
    signerValidation.liveExternalSignerAccepted === true ? "" : "external signer accepted result missing",
    durableReplayGuard.summary?.promotionReady === true ? "" : "live removed-block rollback evidence missing",
    Number(auctionCustodyReview.summary?.custodyReadyRows || 0) > 0 ? "" : "auction custody source not amount-matched",
    Number(agentSettlementReview.summary?.custodyReadyRows || 0) > 0 ? "" : "agent settlement custody source missing"
  ].filter(Boolean);

  return {
    schema: "tn12-proven-status/v1",
    network: checkpoint.network || "kaspa-testnet-12",
    generatedAt,
    status: blockers.length === 0 ? "all-current-rails-promotable" : "proof-core-ready-product-blocked",
    currentPercent: nextTenStatus.currentCompletionEstimate?.afterLocalSlice || "47-50%",
    afterExternalSignerPercent: nextTenStatus.currentCompletionEstimate?.afterRealExternalSigner || "57-62%",
    acceptedEvidence: {
      checkpointRecords: Number(checkpoint.summary?.total || 0),
      matchedRecords: Number(checkpoint.summary?.matched || 0),
      proofTransactions: Number(proofEvidence.summary?.accepted || 0),
      roleSeparatedProofTransactions: Number(roleProofEvidence.summary?.accepted || 0),
      payloadEvents: Number(checkpoint.summary?.payloadEvents || 0),
      outputEvidence: Number(checkpoint.summary?.outputEvidence || 0)
    },
    readiness: {
      externalSignerAccepted: signerValidation.liveExternalSignerAccepted === true,
      localReplayReady: durableReplayGuard.summary?.localPromotionReady === true,
      liveRollbackObserved: durableReplayGuard.summary?.liveRollbackObserved === true,
      durablePromotionReady: durableReplayGuard.summary?.promotionReady === true,
      auctionCustodyEvidenceRows: Number(auctionCustodyReview.summary?.custodyEvidenceRows || 0),
      auctionCustodyReadyRows: Number(auctionCustodyReview.summary?.custodyReadyRows || 0),
      agentReviewEvidenceReadyRows: Number(agentSettlementReview.summary?.reviewEvidenceReadyRows || 0),
      agentCustodyReadyRows: Number(agentSettlementReview.summary?.custodyReadyRows || 0),
      nextTenCompleted: Number(nextTenStatus.summary?.completed || 0),
      nextTenRealizedGainPercent: Number(nextTenStatus.summary?.realizedGainPercent || 0)
    },
    blockers,
    nextActions: [
      "Run one real external signer round trip.",
      "Capture a live removed-block rollback window.",
      "Create amount-matched auction custody source rows.",
      "Create agent reward/deposit custody source rows."
    ],
    boundaries: [
      "Accepted TN12 evidence is not mainnet readiness.",
      "Planner payloads are not custody.",
      "Local replay readiness is not live removed-block evidence.",
      "No-local-key signing is not proven until a real external signer returns signed transaction bytes."
    ]
  };
}
