export function buildBatchAssuranceOperatorDecision({
  decisionFixture = {},
  settlementDecision = {},
  settlementDrafts = {},
  walletSignerValidation = {},
  checkpointComparison = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const decision = decisionFixture.decision || {};
  const selectedPath = settlementDecision.selectedPath === "release-accepted"
    ? "release-accepted"
    : decision.selectedPath || "hold-review";
  const walletReady = walletSignerValidation.liveExternalSignerAccepted === true;
  const checkpointOverlapReady = checkpointComparison.summary?.overlapReady === true;
  const releaseAccepted = settlementDecision.summary?.releaseAccepted === true || selectedPath === "release-accepted";
  const releaseReady = settlementDecision.summary?.releaseReady === true;
  const refundReady = settlementDecision.summary?.refundReady === true;
  const submitNow = !releaseAccepted && decision.submitNow === true && walletReady && checkpointOverlapReady;
  const blockers = [
    !releaseAccepted && !walletReady ? "external signer accepted result missing" : "",
    !checkpointOverlapReady ? "live indexer checkpoint overlap missing" : "",
    selectedPath === "release-review" && !releaseReady ? "release draft not ready" : "",
    selectedPath === "refund-review" && !refundReady ? "refund drafts not ready" : ""
  ].filter(Boolean);
  const status = releaseAccepted
    ? "operator-release-accepted"
    : submitNow ? "operator-submit-ready" : "operator-hold-review";

  return {
    schema: "tn12-batch-assurance-operator-decision/v1",
    network: settlementDecision.network || decisionFixture.network || "kaspa-testnet-12",
    generatedAt,
    campaignId: decisionFixture.campaignId || settlementDrafts.campaign?.id || "",
    status,
    selectedPath,
    submitNow,
    operatorReason: releaseAccepted
      ? "Release path is already accepted on TN12; hold refund alternates as non-selected."
      : decision.reason || "",
    summary: {
      walletReady,
      checkpointOverlapReady,
      releaseAccepted,
      releaseReady,
      refundReady,
      mutuallyExclusiveInputs: settlementDecision.summary?.mutuallyExclusiveInputs === true,
      blockers: blockers.length
    },
    selectedDrafts: selectedDraftSummary({ selectedPath, settlementDrafts }),
    blockers,
    requiredBeforeSubmit: decisionFixture.requiredBeforeSubmit || [],
    decisionRule: "Hold by default unless the selected path, external signer validation, checkpoint-overlap replay, and mutually exclusive post-submit update plan are all ready.",
    boundaries: [
      "This is an operator decision artifact; it does not broadcast.",
      "Holding accepted pledge outputs is a valid decision when wallet/indexer rails are still being hardened.",
      "If a future submit happens, the alternate mutually exclusive path must be marked unavailable after accepted evidence."
    ]
  };
}

function selectedDraftSummary({ selectedPath, settlementDrafts }) {
  if (selectedPath === "release-review" || selectedPath === "release-accepted") {
    return [settlementDrafts.release || {}].filter((draft) => draft.path).map(summary);
  }
  if (selectedPath === "refund-review") {
    return (settlementDrafts.refunds || []).map(summary);
  }
  return [];
}

function summary(draft) {
  return {
    kind: draft.kind || "",
    pledgeId: draft.pledgeId || null,
    path: draft.path || "",
    transactionId: draft.transactionId || "",
    outputTkas: draft.outputTkas || []
  };
}
