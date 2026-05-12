export function buildTreasuryRecurringCaps({
  spendCaps = {},
  underCapEvidence = {}
} = {}) {
  const baseline = (spendCaps.scenarios || []).find((scenario) => scenario.label === "baseline") || {};
  const overCap = (spendCaps.scenarios || []).find((scenario) => scenario.label === "over-cap-payroll") || {};
  const dailyCapTkas = Number(baseline.dailyCapTkas || 0);
  const acceptedAmountTkas = Number(underCapEvidence.payment?.amountTkas || 0);
  const spentBeforeTkas = Number(spendCaps.windowState?.spentBeforeTkas || 0);
  const spentAfterTkas = Number((spentBeforeTkas + acceptedAmountTkas).toFixed(8));
  const remainingAfterTkas = Number(Math.max(dailyCapTkas - spentAfterTkas, 0).toFixed(8));
  const proposedSecondSpendTkas = Number(spendCaps.windowState?.proposedSecondSpendTkas || 60);
  const acceptedUnderCap = underCapEvidence.status === "accepted-transfer-matched"
    && underCapEvidence.accepted === true
    && acceptedAmountTkas > 0
    && acceptedAmountTkas <= dailyCapTkas;
  const overCapBlocked = overCap.draftStatus === "blocked-policy-check"
    && overCap.withinDailyCap === false
    && overCap.withinBalance === true;
  const cumulativeSecondSpendBlocked = spentAfterTkas + proposedSecondSpendTkas > dailyCapTkas;

  return {
    schema: "tn12-treasury-recurring-caps/v1",
    network: underCapEvidence.network || spendCaps.network || "kaspa-testnet-12",
    status: acceptedUnderCap && overCapBlocked
      ? "local-wallet-recurring-cap-evidence-ready"
      : "recurring-cap-needs-review",
    summary: {
      dailyCapTkas,
      spentAfterTkas,
      remainingAfterTkas,
      acceptedUnderCapTxs: acceptedUnderCap ? 1 : 0,
      blockedOverCapRows: overCapBlocked ? 1 : 0,
      blockedCumulativeRows: cumulativeSecondSpendBlocked ? 1 : 0,
      scriptEnforcedRows: 0,
      walletPolicyRows: 3
    },
    window: {
      id: "treasury-core-team:2026-05-12",
      status: acceptedUnderCap && cumulativeSecondSpendBlocked
        ? "cap-window-policy-ready"
        : "cap-window-needs-review",
      dailyCapTkas,
      spentBeforeTkas,
      acceptedSpendTkas: acceptedAmountTkas,
      spentAfterTkas,
      remainingAfterTkas,
      proposedSecondSpendTkas,
      secondSpendAllowed: !cumulativeSecondSpendBlocked,
      secondSpendStatus: cumulativeSecondSpendBlocked
        ? "blocked-by-cumulative-window"
        : "wallet-review-needed"
    },
    positive: {
      label: "under-cap payroll spend",
      amountTkas: acceptedAmountTkas,
      capTkas: dailyCapTkas,
      status: acceptedUnderCap ? "accepted-on-tn12-under-cap" : "needs-review",
      txid: underCapEvidence.txid || "",
      explorerUrl: underCapEvidence.explorerUrl || "",
      from: underCapEvidence.source?.address || "",
      to: underCapEvidence.payment?.to || "",
      acceptingBlockBlueScore: underCapEvidence.acceptingBlockBlueScore ?? null
    },
    negative: {
      label: "over-cap payroll draft",
      amountTkas: 100,
      capTkas: dailyCapTkas,
      status: overCapBlocked ? "blocked-by-wallet-policy" : "needs-review",
      reason: "The draft fits source balance but exceeds the daily cap."
    },
    cumulativeNegative: {
      label: "second spend in same window",
      amountTkas: proposedSecondSpendTkas,
      spentAfterAcceptedTkas: spentAfterTkas,
      capTkas: dailyCapTkas,
      status: cumulativeSecondSpendBlocked ? "blocked-by-cumulative-window" : "wallet-review-needed",
      reason: "The first accepted spend leaves too little room for the proposed second spend."
    },
    promotionRule: "Promote recurring caps only after the accepted spend, cap window state, and blocked over-cap row are checked together.",
    boundaries: [
      "This proves a local-wallet TN12 under-cap spend and a blocked over-cap policy row.",
      "It does not prove script-enforced recurring limits yet.",
      "The next hardening step is an active cap-window artifact that prevents multiple accepted spends from exceeding the window."
    ]
  };
}
