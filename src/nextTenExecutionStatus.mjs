export function buildNextTenExecutionStatus({
  checkpoint = {},
  receiptGuard = {},
  walletRoundtrip = {},
  signerValidation = {},
  signerSim = {},
  liveAppState = {},
  durableReplayGuard = {},
  submitLedger = {},
  defiLoop = {},
  signerResearch = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const durablePromotionReady = durableReplayGuard.summary?.promotionReady === true;
  const signerPathReady = signerResearch.status === "external-signer-path-ready-for-wallet-approval"
    || signerResearch.status === "external-signer-path-accepted";
  const tasks = [
    task("external-signer-defi-receipt", "External signer roundtrip for one DeFi receipt", 5, signerTaskReady(walletRoundtrip, signerValidation, "payload-receipt")),
    task("external-signer-covenant-spend", "External signer roundtrip for one covenant spend", 4, signerTaskReady(walletRoundtrip, signerValidation, "covenant-spend")),
    task("durable-live-indexer-promotion", "Durable live indexer promotion", 5, durablePromotionReady ? "completed" : liveAppState.appStatePromoted ? "overlap-ready-needs-promotion-guard" : "ready-not-promoted"),
    task("multi-wallet-receipt-ui", "Receipt app v1 UI: multi-wallet receipts panel", 3, Number(checkpoint.summary?.payloadEvents || 0) >= 30 ? "completed" : "needs-receipts"),
    task("wallet-submit-ledger-new-receipts", "Wallet submit result ledger for the new receipts", 2, Number(submitLedger.summary?.payloadRows || 0) >= 29 ? "completed" : "needs-ledger-refresh"),
    task("fresh-covenant-wallet-standard-flow", "Fresh escrow/covenant spend with current wallet-standard flow", 4, Number(walletRoundtrip.summary?.computeBudgetRequests || 0) >= 1 ? "prepared-not-live-signed" : "needs-compute-budget-request"),
    task("negative-replay-promotion-tests", "Negative replay/promotion tests for duplicate/stale receipts", 3, receiptGuard.status === "defi-receipt-replay-guard-ready" ? "completed" : "needs-negative-guard"),
    task("defi-v1-operator-runbook", "Batch operator runbook for DeFi v1", 2, defiLoop.status === "repeatable-live-receipt-loop-ready" ? "completed" : "needs-loop-artifact"),
    task("main-dashboard-cleanup", "Main app dashboard cleanup", 3, Number(checkpoint.summary?.total || 0) >= 42 ? "completed" : "needs-dashboard-counts"),
    task("ci-pages-verification", "Commit CI/Pages verification after each major slice", 2, signerPathReady ? "local-gates-ready" : "needs-signer-research")
  ];
  const completed = tasks.filter((item) => item.status === "completed").length;
  const blocked = tasks.filter((item) => /blocked|not-live-signed|ready-not-promoted/.test(item.status)).length;

  return {
    schema: "tn12-next-ten-execution-status/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: completed >= 6 ? "next-ten-execution-status-ready" : "next-ten-execution-status-review",
    summary: {
      tasks: tasks.length,
      completed,
      blocked,
      totalPotentialGainPercent: tasks.reduce((sum, item) => sum + item.estimatedGainPercent, 0),
      realizedGainPercent: tasks
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + item.estimatedGainPercent, 0),
      externalSignerStillRequired: tasks.some((item) => /external-signer/.test(item.id) && item.status !== "completed")
    },
    tasks,
    currentCompletionEstimate: {
      before: "42-45%",
      afterLocalSlice: durablePromotionReady ? "50-53%" : "47-50%",
      afterRealExternalSigner: "57-62%"
    },
    blockers: [
      "A real no-local-key external wallet signature is still required before external-signer tasks can be marked completed.",
      "Browser/OpenClaw/KasWare should be used only for that signer pass, not for local gates.",
      "Durable live promotion is gated by deterministic replay, rollback matching, and live removed-block evidence, not by checkpoint fixtures alone."
    ]
  };
}

function task(id, title, estimatedGainPercent, status) {
  return { id, title, estimatedGainPercent, status };
}

function signerTaskReady(roundtrip, validation, kind) {
  const rows = Array.isArray(roundtrip.rows) ? roundtrip.rows : [];
  const hasRequest = rows.some((row) => row.kind === kind);
  const hasPending = Array.isArray(validation.validations)
    && validation.validations.some((row) => row.status === "pending-external-signer");
  if (!hasRequest) return "needs-request";
  if (validation.liveExternalSignerAccepted) return "completed";
  return hasPending ? "blocked-needs-user-wallet-signature" : "prepared-not-live-signed";
}
