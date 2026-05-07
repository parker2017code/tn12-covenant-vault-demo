export function buildTreasuryVaultRegistry(fixture = {}) {
  const vaults = (fixture.vaults || []).map(normalizeVault);
  const byStatus = countBy(vaults, "status");
  const totalBalanceTkas = Number(vaults.reduce((total, vault) => total + vault.balanceTkas, 0).toFixed(8));
  const plannedPayrollTkas = Number(vaults.reduce((total, vault) => {
    return total + vault.payroll.reduce((sum, payment) => sum + payment.amountTkas, 0);
  }, 0).toFixed(8));

  return {
    schema: "tn12-treasury-vault-registry/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "planner-policy-before-extra-script-paths",
    summary: {
      total: vaults.length,
      totalBalanceTkas,
      plannedPayrollTkas,
      byStatus,
      largeWithdrawalsPending: vaults.reduce((count, vault) => count + vault.largeWithdrawals.length, 0),
      recoveryReady: vaults.filter((vault) => vault.recoveryAddress.startsWith("kaspatest:")).length
    },
    vaults: vaults.map((vault) => ({
      ...vault,
      checks: buildChecks(vault),
      nextAction: nextAction(vault)
    })),
    boundaries: [
      "This registry is treasury policy and wallet-review state.",
      "The current TN12 script proof covers delayed withdrawal and recovery primitives, not full payroll governance.",
      "Spend caps and payroll templates are planner/wallet policy until script or indexer enforcement is added.",
      "Team roles here are labels for review UX, not multisig consensus enforcement."
    ]
  };
}

function normalizeVault(vault = {}) {
  return {
    vaultId: String(vault.vaultId || ""),
    name: String(vault.name || "Treasury vault"),
    status: String(vault.status || "draft"),
    balanceTkas: clampNumber(Number(vault.balanceTkas), 0, 100000000),
    dailyCapTkas: clampNumber(Number(vault.dailyCapTkas), 0, 100000000),
    largeWithdrawalDelayHours: clampNumber(Number(vault.largeWithdrawalDelayHours), 1, 8760),
    recoveryAddress: String(vault.recoveryAddress || ""),
    roles: {
      owner: String(vault.roles?.owner || ""),
      reviewer: String(vault.roles?.reviewer || ""),
      recovery: String(vault.roles?.recovery || "")
    },
    payroll: (vault.payroll || []).map(normalizePayment),
    largeWithdrawals: (vault.largeWithdrawals || []).map(normalizeWithdrawal),
    notes: String(vault.notes || "")
  };
}

function normalizePayment(payment = {}) {
  return {
    paymentId: String(payment.paymentId || ""),
    recipient: String(payment.recipient || ""),
    amountTkas: clampNumber(Number(payment.amountTkas), 0, 100000000),
    cadence: String(payment.cadence || "one-time"),
    status: String(payment.status || "draft")
  };
}

function normalizeWithdrawal(withdrawal = {}) {
  return {
    withdrawalId: String(withdrawal.withdrawalId || ""),
    recipient: String(withdrawal.recipient || ""),
    amountTkas: clampNumber(Number(withdrawal.amountTkas), 0, 100000000),
    requestedAtIso: String(withdrawal.requestedAtIso || ""),
    availableAfterIso: String(withdrawal.availableAfterIso || ""),
    status: String(withdrawal.status || "draft")
  };
}

function buildChecks(vault) {
  const payrollTotal = Number(vault.payroll.reduce((total, payment) => total + payment.amountTkas, 0).toFixed(8));
  const overDailyCap = vault.payroll.some((payment) => payment.amountTkas > vault.dailyCapTkas);
  const largeWithdrawalOverCap = vault.largeWithdrawals.some((withdrawal) => withdrawal.amountTkas > vault.dailyCapTkas);

  return {
    payrollTotal,
    payrollWithinBalance: payrollTotal <= vault.balanceTkas,
    payrollWithinDailyCap: !overDailyCap,
    largeWithdrawalReviewRequired: largeWithdrawalOverCap,
    recoveryAddressValidShape: vault.recoveryAddress.startsWith("kaspatest:")
  };
}

function nextAction(vault) {
  if (vault.status === "draft") return "Review treasury roles and funding source before signing.";
  if (vault.largeWithdrawals.length) return "Review delayed large withdrawal drafts and recovery path before submit.";
  if (vault.payroll.length) return "Review payroll outputs against cap and balance.";
  return "Keep vault policy synced with accepted transaction state.";
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
