export function buildTreasuryRoleReview({ constrainedSpends = {}, generatedAt = new Date().toISOString() } = {}) {
  const drafts = Array.isArray(constrainedSpends.drafts) ? constrainedSpends.drafts : [];
  const rows = drafts.map((draft) => ({
    id: draft.id,
    vaultId: draft.vaultId,
    kind: draft.kind,
    amountTkas: Number(draft.amountTkas || 0),
    recipient: draft.recipient || "",
    policyStatus: draft.status,
    roleKeySeparated: false,
    sourceUtxoAttached: false,
    readyForSubmit: false,
    next: "Attach exact source UTXO, role signer, and wallet-standard request."
  }));

  return {
    schema: "tn12-treasury-role-review/v1",
    network: constrainedSpends.network || "kaspa-testnet-12",
    generatedAt,
    status: "treasury-role-review-ready",
    summary: {
      drafts: rows.length,
      payrollDrafts: rows.filter((row) => row.kind === "payroll").length,
      delayedWithdrawalDrafts: rows.filter((row) => row.kind === "delayed-large-withdrawal").length,
      roleSeparatedRows: rows.filter((row) => row.roleKeySeparated).length,
      sourceUtxoRows: rows.filter((row) => row.sourceUtxoAttached).length
    },
    rows,
    boundaries: [
      "Treasury payroll/caps currently run as wallet-policy planning.",
      "Delayed withdrawal and recovery have TN12 proof primitives; team governance is the next layer.",
      "Submit after role keys and exact source UTXOs are attached."
    ]
  };
}
