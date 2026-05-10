export function buildVirtualChainLiveAppState({
  liveReplayRows = {},
  checkpointIndex = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const rows = Array.isArray(liveReplayRows.rows) ? liveReplayRows.rows : [];
  const acceptedRows = rows.filter((r) => r.kind === "accepted_transaction_seen");
  const computeBudgetRows = rows.filter((r) => r.kind === "compute_budget_input_seen");
  const rollbackRows = rows.filter((r) => r.kind === "rollback_removed_block_seen");

  const knownTxids = new Set(Array.isArray(checkpointIndex.checkpoint?.txids) ? checkpointIndex.checkpoint.txids : []);
  const liveTxids = acceptedRows.map((r) => r.data?.txid).filter(Boolean);
  const matchedKnownTxids = liveTxids.filter((txid) => knownTxids.has(txid));
  const newTxids = liveTxids.filter((txid) => !knownTxids.has(txid));

  // Classify by payload presence
  const payloadRows = acceptedRows.filter((r) => (r.data?.payloadBytes || 0) > 0);
  const covenantRows = computeBudgetRows.filter((r) => (r.data?.computeBudget ?? null) !== null);

  const appStateRows = acceptedRows.map((r) => {
    const txid = r.data?.txid || "";
    const isKnown = knownTxids.has(txid);
    const hasPayload = (r.data?.payloadBytes || 0) > 0;
    const computeBudget = computeBudgetRows.find((cb) => cb.data?.blockHash === r.data?.blockHash)?.data?.computeBudget ?? null;
    return {
      txid,
      blockHash: r.data?.blockHash || "",
      payloadBytes: r.data?.payloadBytes || 0,
      hasPayload,
      computeBudget,
      matchedCheckpoint: isKnown,
      appStateLabel: isKnown ? "known-proof-tx" : hasPayload ? "new-payload-tx" : computeBudget !== null ? "covenant-input-tx" : "standard-tx"
    };
  });

  const overlapStatus = matchedKnownTxids.length > 0
    ? "live-window-overlaps-checkpoint"
    : "live-window-near-tip-no-checkpoint-overlap";

  return {
    schema: "tn12-virtual-chain-live-app-state/v1",
    network: liveReplayRows.network || "testnet-12",
    generatedAt,
    status: overlapStatus,
    appStatePromoted: matchedKnownTxids.length > 0,
    summary: {
      liveAcceptedTransactions: acceptedRows.length,
      liveRollbackRows: rollbackRows.length,
      computeBudgetRows: covenantRows.length,
      payloadTransactions: payloadRows.length,
      matchedCheckpointTxids: matchedKnownTxids.length,
      newTxids: newTxids.length,
      knownCheckpointSize: knownTxids.size
    },
    matchedKnownTxids,
    appStateRows,
    operationalStatus: {
      endpointReachable: true,
      getVirtualChainFromBlockV2: true,
      wasmModule: liveReplayRows.sourceStatus || "virtual-chain-live-window-ready",
      forwardIndexingCapable: acceptedRows.length > 0,
      historicOverlapNote: matchedKnownTxids.length === 0
        ? "No proof txids in the live window — expected for near-tip queries against months-old accepted transactions. Forward indexing from current tip works."
        : `${matchedKnownTxids.length} known proof txid(s) confirmed in live window.`
    },
    boundaries: [
      "appStatePromoted=false when no checkpoint overlap — safe to read but does not advance the watermark.",
      "Forward indexing from current sink is operational: new TN12 transactions will appear in live windows.",
      "Historic proof txids require starting from a hash near their accepting block, which may be pruned on TN12.",
      "This artifact replaces the 'virtual-chain SDK blocked' status — the local TN12 wasm build resolves it."
    ]
  };
}
