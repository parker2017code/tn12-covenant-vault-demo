export function buildTreasuryConstrainedSpends({
  treasuryRegistry = {},
  walletConnectorRequests = {}
} = {}) {
  const vaults = Array.isArray(treasuryRegistry.vaults) ? treasuryRegistry.vaults : [];
  const drafts = vaults.flatMap(buildVaultDrafts);

  return {
    schema: "tn12-treasury-constrained-spends/v1",
    network: treasuryRegistry.network || "kaspa-testnet-12",
    status: "treasury-spend-drafts-ready-wallet-policy",
    summary: {
      vaults: vaults.length,
      drafts: drafts.length,
      payrollDrafts: drafts.filter((draft) => draft.kind === "payroll").length,
      delayedWithdrawalDrafts: drafts.filter((draft) => draft.kind === "delayed-large-withdrawal").length,
      blockedDrafts: drafts.filter((draft) => draft.status.startsWith("blocked")).length,
      walletConnectorRequestsReady: walletConnectorRequests.status === "connector-submit-requests-ready"
    },
    drafts,
    acceptanceCriteria: [
      "Payroll drafts must fit within balance and per-payment daily cap.",
      "Large withdrawals above daily cap must remain delayed until availableAfterIso.",
      "Recovery addresses must be testnet-shaped before any draft leaves review.",
      "Wallet review must show vault id, role labels, recipient, amount, delay state, and cap result."
    ],
    boundaries: [
      "These are wallet-policy spend drafts, not full treasury governance enforcement.",
      "Current accepted TN12 vault proofs cover recovery and delayed withdrawal primitives only.",
      "Team roles are review labels until role-separated script or multisig-like enforcement is added."
    ]
  };
}

function buildVaultDrafts(vault) {
  const drafts = [];
  for (const payment of vault.payroll || []) {
    const blocked = payment.amountTkas > vault.dailyCapTkas || payment.amountTkas > vault.balanceTkas;
    drafts.push({
      id: `${vault.vaultId}:payroll:${payment.paymentId}`,
      vaultId: vault.vaultId,
      kind: "payroll",
      status: blocked ? "blocked-policy-check" : "wallet-review-needed",
      paymentId: payment.paymentId,
      recipient: payment.recipient,
      amountTkas: payment.amountTkas,
      cadence: payment.cadence,
      checks: {
        withinDailyCap: payment.amountTkas <= vault.dailyCapTkas,
        withinBalance: payment.amountTkas <= vault.balanceTkas,
        recoveryAddressValidShape: vault.checks?.recoveryAddressValidShape === true
      },
      next: blocked ? "Resolve cap or balance issue before wallet review." : "Build exact wallet-reviewed payment transaction."
    });
  }
  for (const withdrawal of vault.largeWithdrawals || []) {
    drafts.push({
      id: `${vault.vaultId}:large-withdrawal:${withdrawal.withdrawalId}`,
      vaultId: vault.vaultId,
      kind: "delayed-large-withdrawal",
      status: withdrawal.status === "delay-window" ? "delay-window-review" : "wallet-review-needed",
      withdrawalId: withdrawal.withdrawalId,
      recipient: withdrawal.recipient,
      amountTkas: withdrawal.amountTkas,
      requestedAtIso: withdrawal.requestedAtIso,
      availableAfterIso: withdrawal.availableAfterIso,
      checks: {
        aboveDailyCap: withdrawal.amountTkas > vault.dailyCapTkas,
        withinBalance: withdrawal.amountTkas <= vault.balanceTkas,
        delayRequired: withdrawal.amountTkas > vault.dailyCapTkas
      },
      next: "Do not submit until delay state and accepted source output are reviewed."
    });
  }
  return drafts;
}
