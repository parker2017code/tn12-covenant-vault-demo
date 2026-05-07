export function buildPersistedCheckpointGuard({
  currentIndex = {},
  previousSnapshot = null,
  sourcePath = "artifacts/checkpointed-accepted-index.json",
  persistedAt = currentIndex.fetchedAt || new Date().toISOString()
} = {}) {
  const current = normalizeCheckpoint(currentIndex);
  const previous = previousSnapshot ? normalizeSnapshot(previousSnapshot) : null;
  const missingTxids = previous
    ? previous.txids.filter((txid) => !current.txids.includes(txid))
    : [];
  const addedTxids = previous
    ? current.txids.filter((txid) => !previous.txids.includes(txid))
    : current.txids;
  const blueScoreRegression = Number.isFinite(previous?.maxBlueScore)
    && Number.isFinite(current.maxBlueScore)
    && current.maxBlueScore < previous.maxBlueScore;
  const mismatches = Number(currentIndex.summary?.mismatches || 0);
  const rollbackDetected = blueScoreRegression || missingTxids.length > 0;
  const ready = current.recordCount > 0 && mismatches === 0 && !rollbackDetected;

  return {
    schema: "tn12-persisted-checkpoint-guard/v1",
    network: currentIndex.network || "kaspa-testnet-12",
    status: ready ? "persisted-checkpoint-ready" : "rollback-review-required",
    sourcePath,
    persistedAt,
    summary: {
      recordCount: current.recordCount,
      matched: Number(currentIndex.summary?.matched || 0),
      mismatches,
      addedTxids: addedTxids.length,
      missingTxids: missingTxids.length,
      blueScoreRegression,
      rollbackDetected
    },
    current,
    previous,
    rollback: {
      detected: rollbackDetected,
      reason: rollbackReason({ blueScoreRegression, missingTxids }),
      action: rollbackDetected
        ? "Stop serving derived app state from this checkpoint, reload records from the last trusted blue-score range, and rebuild affected app state."
        : "No rollback detected against the previous persisted checkpoint."
    },
    addedTxids,
    missingTxids,
    boundaries: [
      "This artifact is a persistence guard over the generated checkpoint, not a live node subscription.",
      "It checks blue-score regression and missing txids before the UI treats the checkpoint as ready.",
      "A production indexer still needs node/RPC virtual-chain events, durable storage, and rollback replay."
    ]
  };
}

function normalizeCheckpoint(index) {
  const checkpoint = index.checkpoint || {};
  const txids = (checkpoint.txids || []).map(String);

  return {
    kind: checkpoint.kind || "known-txid-public-read-checkpoint",
    recordCount: Number(checkpoint.recordCount || txids.length || index.summary?.total || 0),
    minBlueScore: finiteOrNull(checkpoint.minAcceptingBlockBlueScore),
    maxBlueScore: finiteOrNull(checkpoint.maxAcceptingBlockBlueScore),
    txids
  };
}

function normalizeSnapshot(snapshot) {
  if (snapshot.current) return snapshot.current;
  return normalizeCheckpoint(snapshot);
}

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function rollbackReason({ blueScoreRegression, missingTxids }) {
  if (blueScoreRegression) return "Current checkpoint blue score is below the previous persisted watermark.";
  if (missingTxids.length) return "Current checkpoint is missing txids that existed in the previous persisted checkpoint.";
  return "No rollback condition found.";
}
