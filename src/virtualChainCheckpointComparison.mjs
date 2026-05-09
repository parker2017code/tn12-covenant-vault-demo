export function buildVirtualChainCheckpointComparison({
  liveReplayRows = {},
  checkpointIndex = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const checkpointRecords = Array.isArray(checkpointIndex.records) ? checkpointIndex.records : [];
  const checkpointTxids = new Set([
    ...checkpointRecords.map((record) => record.txid || record.transactionId).filter(Boolean),
    ...(Array.isArray(checkpointIndex.checkpoint?.txids) ? checkpointIndex.checkpoint.txids : [])
  ]);
  const acceptedRows = Array.isArray(liveReplayRows.rows)
    ? liveReplayRows.rows.filter((row) => row.kind === "accepted_transaction_seen")
    : [];
  const matchedRows = acceptedRows.filter((row) => checkpointTxids.has(row.data?.txid));
  const overlapReady = matchedRows.length > 0;

  return {
    schema: "tn12-virtual-chain-checkpoint-comparison/v1",
    network: liveReplayRows.network || checkpointIndex.network || "kaspa-testnet-12",
    generatedAt,
    status: overlapReady ? "live-window-overlaps-checkpoint" : "live-window-near-tip-no-checkpoint-overlap",
    appStatePromoted: false,
    summary: {
      checkpointRecords: Number(checkpointIndex.checkpoint?.recordCount || checkpointRecords.length),
      checkpointTxids: checkpointTxids.size,
      liveAcceptedRows: acceptedRows.length,
      matchedCheckpointRows: matchedRows.length,
      liveRollbackRows: Number(liveReplayRows.summary?.rollbackRows || 0),
      overlapReady
    },
    matchedRows: matchedRows.map((row) => ({
      txid: row.data.txid,
      blockHash: row.data.blockHash,
      payloadBytes: row.data.payloadBytes || 0
    })),
    decision: overlapReady
      ? "A replay reducer can compare this live window against known accepted rows before checkpoint promotion."
      : "The live window is reachable but does not overlap the current fixture checkpoint; do not promote app state from it.",
    nextStep: overlapReady
      ? "Run reducer matching across the overlap and persist only deterministic rows."
      : "Start the live reader from a checkpoint-derived block hash or trusted overlap window, not from current sink only.",
    boundaries: [
      "Endpoint and V2 response are working, but app-state promotion still needs overlap or deterministic reducer replay.",
      "No checkpoint watermark is advanced by this artifact."
    ]
  };
}
