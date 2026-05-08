export function buildIndexerStorageSchema({
  replayPlan = {},
  checkpointIndex = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const checkpoint = replayPlan.currentCheckpoint || {};
  const recordCount = Number(checkpoint.recordCount || checkpointIndex.summary?.total || 0);
  const payloadEvents = Number(checkpoint.payloadEvents || checkpointIndex.summary?.payloadEvents || 0);
  const proofSpends = Number(checkpoint.proofSpends || checkpointIndex.summary?.proofs || 0);

  return {
    schema: "tn12-indexer-storage-schema/v1",
    network: replayPlan.network || checkpointIndex.network || "kaspa-testnet-12",
    generatedAt,
    status: recordCount > 0 ? "storage-schema-ready" : "storage-schema-needs-checkpoint",
    sourceCheckpoint: {
      recordCount,
      payloadEvents,
      proofSpends,
      minAcceptingBlockBlueScore: checkpoint.minAcceptingBlockBlueScore ?? null,
      maxAcceptingBlockBlueScore: checkpoint.maxAcceptingBlockBlueScore ?? null,
      replayPlanStatus: replayPlan.status || "unknown"
    },
    tables: [
      table("checkpoint_watermarks", "One row per trusted replay boundary.", [
        field("id", "text", "primary key, usually network plus blue-score range"),
        field("network", "text", "kaspa-testnet-12 for this repo"),
        field("min_blue_score", "integer", "lowest accepted record blue score in this checkpoint"),
        field("max_blue_score", "integer", "highest accepted record blue score in this checkpoint"),
        field("record_count", "integer", "accepted record count after reducer matching"),
        field("payload_event_count", "integer", "matched accepted payload events"),
        field("proof_spend_count", "integer", "matched accepted proof spends"),
        field("mismatch_count", "integer", "must be 0 before app state is ready"),
        field("created_at", "datetime", "when this checkpoint row was generated")
      ], ["network,max_blue_score"]),
      table("accepted_transactions", "Raw accepted transaction facts needed for replay.", [
        field("txid", "text", "primary key"),
        field("network", "text", "network id"),
        field("accepting_block_blue_score", "integer", "ordering and rollback watermark"),
        field("accepting_block_time", "integer", "node supplied accepted time"),
        field("payload_hex", "text nullable", "raw payload bytes when present"),
        field("input_json", "json", "inputs as fetched or normalized"),
        field("output_json", "json", "outputs as fetched or normalized"),
        field("source", "text", "known-txid fixture, virtual-chain reader, or wallet submit"),
        field("seen_at", "datetime", "first replay observation")
      ], ["network,accepting_block_blue_score", "payload_hex"]),
      table("accepted_payload_events", "Decoded app events derived only from accepted transactions.", [
        field("event_id", "text", "primary key, stable app event id"),
        field("txid", "text", "foreign key accepted_transactions.txid"),
        field("lane", "text", "invoice, access-pass, auction, stable-issuer, attestation, agent, batch-assurance"),
        field("payload_kind", "text", "decoded payload kind"),
        field("app_id", "text", "invoice id, pass id, auction id, task id, or campaign id"),
        field("state", "text", "derived event state"),
        field("matched", "boolean", "payload bytes and expected output matched"),
        field("review_status", "text", "ready, review-needed, stale, duplicate, disputed"),
        field("reducer_json", "json", "lane-specific reducer result")
      ], ["lane,app_id", "txid"]),
      table("proof_spend_outputs", "Accepted covenant proof spend evidence.", [
        field("proof_id", "text", "primary key, stable proof label or txid"),
        field("txid", "text", "foreign key accepted_transactions.txid"),
        field("lane", "text", "vault, assurance, escrow, role-vault, role-assurance, role-escrow"),
        field("entrypoint", "text", "contract entrypoint"),
        field("source_txid", "text", "spent contract outpoint txid"),
        field("source_index", "integer", "spent contract outpoint index"),
        field("destination_address", "text", "expected P2PK destination"),
        field("amount_sompi", "integer", "matched output amount"),
        field("matched_input", "boolean", "previous P2SH output matched expected source"),
        field("matched_output", "boolean", "expected destination and amount matched")
      ], ["lane,entrypoint", "source_txid,source_index"]),
      table("rollback_segments", "Rollback/replay windows that stop stale app state from being served.", [
        field("segment_id", "text", "primary key"),
        field("network", "text", "network id"),
        field("from_blue_score", "integer", "first affected blue score"),
        field("to_blue_score", "integer", "last affected blue score"),
        field("reason", "text", "blue-score regression, missing txid, or virtual-chain reorg"),
        field("status", "text", "open, replaying, resolved"),
        field("affected_txids_json", "json", "txids marked stale before replay"),
        field("created_at", "datetime", "when rollback was detected"),
        field("resolved_at", "datetime nullable", "when replay restored matched app state")
      ], ["network,status", "from_blue_score,to_blue_score"])
    ],
    reducerOrder: [
      "Load accepted transactions into append-only storage.",
      "Decode payload events from stored payload bytes.",
      "Match proof spends against previous outputs and expected destinations.",
      "Apply lane reducers for invoice, access-pass, auction, stable-issuer, attestation, agent, and batch-assurance state.",
      "Publish app state only when checkpoint mismatch count is zero and rollback_segments has no open rows."
    ],
    invariants: [
      "Derived app state never depends on submitted txids alone.",
      "Payload state requires accepted transaction payload bytes and matched expected output.",
      "Proof state requires accepted spend, matched P2SH input, and matched P2PK output.",
      "A lower blue-score watermark or missing prior txid opens a rollback segment.",
      "Open rollback segments block user-facing ready state for affected lanes."
    ],
    nextImplementationSteps: [
      "Write a fixture-backed replay runner against this schema.",
      "Add a virtual-chain reader adapter after the storage/reducer contract is stable.",
      "Expose checkpoint lag, mismatch count, and rollback status in the browser control surface."
    ],
    boundaries: [
      "This is the storage contract for the durable indexer, not a database migration that has been applied.",
      "It does not require a local full node.",
      "It preserves the current public TN12 evidence counts while preparing for replay."
    ]
  };
}

function table(name, purpose, fields, indexes) {
  return { name, purpose, fields, indexes };
}

function field(name, type, purpose) {
  return { name, type, purpose };
}
