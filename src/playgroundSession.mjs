export function buildPlaygroundSession({
  plan = {},
  publicAddresses = {},
  txids = [],
  generatedAt = new Date().toISOString()
} = {}) {
  const roles = (plan.roles || []).map((role) => ({
    id: role.id,
    label: role.label,
    address: publicAddresses[role.id] || "",
    fundingTargetTkas: role.suggestedFundingTkas || "0",
    funded: Boolean(publicAddresses[role.id]),
    privateKeyIncluded: false
  }));
  const acceptedTxids = txids.filter((row) => row.accepted === true);

  return {
    schema: "tn12-playground-session/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: roles.length > 0 ? "playground-session-public-state-ready" : "playground-session-empty",
    summary: {
      roles: roles.length,
      fundedRoles: roles.filter((role) => role.funded).length,
      txids: txids.length,
      acceptedTxids: acceptedTxids.length,
      privateKeysIncluded: 0,
      committedSecrets: 0,
      liveProductClaims: 0
    },
    roles,
    txids: txids.map((row) => ({
      label: row.label || "",
      txid: row.txid || "",
      accepted: row.accepted === true,
      enforcement: row.enforcement || "TN12_ACCEPTED_TARGET"
    })),
    exportPolicy: [
      "Export public addresses, labels, requested funding amounts, txids, and accepted status.",
      "Do not export private keys, mnemonics, seeds, local wallet paths, browser storage keys, or signing material.",
      "A session export is useful for replay and support; it is not custody recovery material."
    ]
  };
}
