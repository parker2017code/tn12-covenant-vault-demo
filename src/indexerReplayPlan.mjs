export function buildIndexerReplayPlan({
  checkpointIndex = {},
  persistedCheckpoint = {}
} = {}) {
  const checkpoint = checkpointIndex.checkpoint || {};
  const summary = checkpointIndex.summary || {};
  const records = checkpointIndex.records || [];
  const payloadRecords = records.filter((record) => record.kind === "payload-event");
  const proofRecords = records.filter((record) => record.kind === "proof-spend");
  const laneCount = Array.isArray(summary.lanes) ? summary.lanes.length : 0;
  const ready = checkpointIndex.status === "accepted-index-fully-matched"
    && persistedCheckpoint.status === "persisted-checkpoint-ready";

  return {
    schema: "tn12-indexer-replay-plan/v1",
    network: checkpointIndex.network || "kaspa-testnet-12",
    status: ready ? "durable-indexer-plan-ready" : "durable-indexer-plan-needs-review",
    currentCheckpoint: {
      kind: checkpoint.kind || "unknown",
      recordCount: Number(summary.total || checkpoint.recordCount || records.length || 0),
      proofSpends: Number(summary.proofs || proofRecords.length || 0),
      payloadEvents: Number(summary.payloadEvents || payloadRecords.length || 0),
      matched: Number(summary.matched || 0),
      mismatches: Number(summary.mismatches || 0),
      laneCount,
      minAcceptingBlockBlueScore: checkpoint.minAcceptingBlockBlueScore ?? null,
      maxAcceptingBlockBlueScore: checkpoint.maxAcceptingBlockBlueScore ?? null,
      persistedStatus: persistedCheckpoint.status || "not-built",
      rollbackDetected: Boolean(persistedCheckpoint.summary?.rollbackDetected)
    },
    target: {
      status: "node-rpc-replay-indexer-not-built",
      source: "getVirtualChainFromBlockV2 or equivalent node/RPC virtual-chain feed",
      dataVerbosity: "High",
      storage: [
        "checkpoint_watermarks",
        "accepted_transactions",
        "accepted_payload_events",
        "proof_spend_outputs",
        "rollback_segments"
      ],
      replayGuarantee: "Rebuild derived app state from the last trusted blue-score watermark after any rollback."
    },
    buildOrder: [
      step("storage-schema", "Define append-only checkpoint and transaction tables.", "next"),
      step("virtual-chain-reader", "Read accepted transaction ids and block blue scores from a node/RPC feed.", "next"),
      step("payload-proof-decoder", "Reuse the current payload and proof matching rules against stored transactions.", "next"),
      step("rollback-replay", "On rollback, mark affected rows stale and rebuild app state from the previous trusted checkpoint.", "next"),
      step("ui-health-surface", "Expose last checkpoint, lag, rollback status, and mismatch count in the app.", "later")
    ],
    acceptanceCriteria: [
      "A replay run can rebuild the same 33 accepted records now covered by `npm run check:tn12`.",
      "The indexer stores the txid, accepting block blue score, payload bytes, output data, and matched reducer status.",
      "A lower blue-score watermark or missing previous txid blocks derived app state until replay finishes.",
      "Payload app state remains tied to matched accepted payload bytes, not submitted txids alone.",
      "The current public-read checkpoint remains valid evidence while the node/RPC replay backend is not built."
    ],
    boundaries: [
      "This is an implementation plan for durable indexing, not a live node subscription.",
      "It does not change accepted proof or payload counts.",
      "It keeps local-node setup optional until a durable backend slice is explicitly built."
    ]
  };
}

function step(id, detail, status) {
  return { id, status, detail };
}
