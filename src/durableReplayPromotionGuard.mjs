export function buildDurableReplayPromotionGuard({
  checkpointIndex = {},
  fixtureReplay = {},
  liveReplayRows = {},
  liveAppState = {},
  rollbackTests = [],
  generatedAt = new Date().toISOString()
} = {}) {
  const checkpointTxids = new Set(Array.isArray(checkpointIndex.checkpoint?.txids) ? checkpointIndex.checkpoint.txids : []);
  const liveRows = Array.isArray(liveReplayRows.rows) ? liveReplayRows.rows : [];
  const acceptedRows = liveRows.filter((row) => row.kind === "accepted_transaction_seen");
  const rollbackRows = liveRows.filter((row) => row.kind === "rollback_removed_block_seen");
  const liveTxids = acceptedRows.map((row) => row.data?.txid).filter(Boolean);
  const matchedCheckpointTxids = liveTxids.filter((txid) => checkpointTxids.has(txid));
  const duplicateLiveTxids = duplicates(liveTxids);
  const rollbackReviews = rollbackTests.map(reviewRollbackTest);

  const deterministicReducerReplay = fixtureReplay.summary?.appStateReady === true
    && Number(fixtureReplay.summary?.mismatches || 0) === 0
    && Number(fixtureReplay.summary?.rollbackSegments || 0) === 0
    && Number(fixtureReplay.summary?.records || 0) === Number(checkpointIndex.summary?.total || 0);
  const liveOverlapReady = matchedCheckpointTxids.length > 0
    && liveReplayRows.summary?.fullAcceptedReplay === true
    && liveAppState.status === "live-window-overlaps-checkpoint";
  const duplicateFree = duplicateLiveTxids.length === 0;
  const rollbackMatchingReady = rollbackReviews.length > 0
    && rollbackReviews.every((review) => review.status === "rollback-match-ready");
  const liveRollbackObserved = rollbackRows.length > 0;
  const promotionReady = deterministicReducerReplay
    && liveOverlapReady
    && duplicateFree
    && rollbackMatchingReady;

  return {
    schema: "tn12-durable-replay-promotion-guard/v1",
    network: checkpointIndex.network || liveReplayRows.network || "kaspa-testnet-12",
    generatedAt,
    status: promotionReady ? "durable-replay-promotion-guard-ready" : "durable-replay-promotion-guard-review",
    summary: {
      checkpointTxids: checkpointTxids.size,
      fixtureReplayRecords: Number(fixtureReplay.summary?.records || 0),
      fixtureReplayMismatches: Number(fixtureReplay.summary?.mismatches || 0),
      liveAcceptedTransactions: liveTxids.length,
      matchedCheckpointTxids: matchedCheckpointTxids.length,
      rollbackRows: rollbackRows.length,
      duplicateLiveTxids: duplicateLiveTxids.length,
      rollbackTests: rollbackReviews.length,
      deterministicReducerReplay,
      liveOverlapReady,
      duplicateFree,
      rollbackMatchingReady,
      liveRollbackObserved,
      promotionReady
    },
    matchedCheckpointTxids,
    duplicateLiveTxids,
    rollbackReviews,
    promotionRule: "Promote accepted app state only when fixture replay is deterministic, live replay overlaps a known checkpoint, duplicate txids are absent, and rollback matching has passed.",
    boundaries: [
      "This is a promotion guard over existing replay artifacts; it does not fetch a new live window.",
      "Rollback matching is locally tested here. A future live window with removed blocks should be recorded separately when TN12 provides one.",
      "External wallet signing remains a separate blocker."
    ]
  };
}

function reviewRollbackTest(test = {}) {
  const before = Array.isArray(test.before) ? test.before : [];
  const removed = new Set(Array.isArray(test.removedTxids) ? test.removedTxids : []);
  const added = Array.isArray(test.added) ? test.added : [];
  const expected = Array.isArray(test.expectedFinalTxids) ? test.expectedFinalTxids : [];
  const finalTxids = [...before.filter((txid) => !removed.has(txid)), ...added];
  const uniqueFinalTxids = [...new Set(finalTxids)];
  const matchesExpected = expected.length === uniqueFinalTxids.length
    && expected.every((txid, index) => uniqueFinalTxids[index] === txid);

  return {
    id: test.id || "",
    removedTxids: [...removed],
    addedTxids: added,
    finalTxids: uniqueFinalTxids,
    expectedFinalTxids: expected,
    status: matchesExpected ? "rollback-match-ready" : "rollback-match-review"
  };
}

function duplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}
