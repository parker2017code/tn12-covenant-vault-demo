export function buildIndexerReplayRun({
  checkpointIndex = {},
  storageSchema = {},
  runAt = checkpointIndex.fetchedAt || new Date().toISOString()
} = {}) {
  const records = checkpointIndex.records || [];
  const payloadRecords = records.filter((record) => record.kind === "payload-event");
  const proofRecords = records.filter((record) => record.kind === "proof-spend");
  const mismatches = records.filter((record) => !record.matched);
  const checkpoint = checkpointIndex.checkpoint || {};
  const rollbackOpen = false;
  const appStateReady = records.length > 0 && mismatches.length === 0 && !rollbackOpen;

  const tables = {
    checkpoint_watermarks: [checkpointWatermark({ checkpointIndex, runAt })],
    accepted_transactions: records.map((record) => acceptedTransactionRow(record, checkpointIndex, runAt)),
    accepted_payload_events: payloadRecords.map(payloadEventRow),
    proof_spend_outputs: proofRecords.map(proofSpendRow),
    rollback_segments: []
  };

  return {
    schema: "tn12-indexer-replay-run/v1",
    network: checkpointIndex.network || storageSchema.network || "kaspa-testnet-12",
    runAt,
    status: appStateReady ? "fixture-replay-ready" : "fixture-replay-review-required",
    source: {
      checkpointKind: checkpoint.kind || "known-txid-public-read-checkpoint",
      storageSchema: storageSchema.schema || "unknown",
      storageSchemaStatus: storageSchema.status || "unknown"
    },
    summary: {
      records: records.length,
      acceptedTransactions: tables.accepted_transactions.length,
      payloadEvents: tables.accepted_payload_events.length,
      proofSpends: tables.proof_spend_outputs.length,
      rollbackSegments: tables.rollback_segments.length,
      mismatches: mismatches.length,
      appStateReady
    },
    tableCounts: Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length])),
    tables,
    reducerReadiness: [
      readiness("invoice", payloadRecords.some((record) => record.lane === "order-receipt")),
      readiness("access-pass", payloadRecords.some((record) => record.lane === "access-pass")),
      readiness("auction", payloadRecords.some((record) => record.lane === "auction")),
      readiness("stable-issuer", payloadRecords.some((record) => record.lane === "stable-issuer")),
      readiness("attestation", payloadRecords.some((record) => record.lane === "attestation")),
      readiness("agent", payloadRecords.some((record) => record.lane === "agent-commitment")),
      readiness("batch-assurance", payloadRecords.some((record) => record.lane === "batch-assurance")),
      readiness("proof-spends", proofRecords.length > 0)
    ],
    next: [
      "Persist these table rows to a local durable store.",
      "Replace known-txid input with a node/RPC virtual-chain reader.",
      "Add UI health around appStateReady, mismatches, and rollback segment count."
    ],
    boundaries: [
      "This is a fixture-backed replay run over the current public-read checkpoint.",
      "It proves reducer/storage shape, not live virtual-chain ingestion.",
      "User-facing state remains blocked if mismatches or rollback segments appear."
    ]
  };
}

function checkpointWatermark({ checkpointIndex, runAt }) {
  const checkpoint = checkpointIndex.checkpoint || {};
  const summary = checkpointIndex.summary || {};
  return {
    id: `${checkpointIndex.network || "kaspa-testnet-12"}:${checkpoint.minAcceptingBlockBlueScore || 0}-${checkpoint.maxAcceptingBlockBlueScore || 0}`,
    network: checkpointIndex.network || "kaspa-testnet-12",
    min_blue_score: checkpoint.minAcceptingBlockBlueScore ?? null,
    max_blue_score: checkpoint.maxAcceptingBlockBlueScore ?? null,
    record_count: Number(summary.total || checkpoint.recordCount || 0),
    payload_event_count: Number(summary.payloadEvents || 0),
    proof_spend_count: Number(summary.proofs || 0),
    mismatch_count: Number(summary.mismatches || 0),
    created_at: runAt
  };
}

function acceptedTransactionRow(record, checkpointIndex, runAt) {
  return {
    txid: record.txid,
    network: checkpointIndex.network || "kaspa-testnet-12",
    accepting_block_blue_score: Number(record.acceptingBlockBlueScore || 0),
    accepting_block_time: Number(record.acceptingBlockTime || 0),
    payload_hex: record.payload?.observedHex || null,
    input_json: null,
    output_json: record.output || { expected: record.expected || null, observed: record.observed || null },
    source: "known-txid-public-read-checkpoint",
    seen_at: runAt
  };
}

function payloadEventRow(record) {
  const payload = record.payload?.decoded?.payload || {};
  return {
    event_id: `${record.lane}:${payload.subject || record.txid}:${payload.value || record.status}`,
    txid: record.txid,
    lane: record.lane,
    payload_kind: payload.kind || null,
    app_id: payload.subject || record.label,
    state: payload.value || record.status,
    matched: Boolean(record.matched && record.payload?.matches && record.output?.matches),
    review_status: record.matched ? "ready" : "review-needed",
    reducer_json: {
      label: record.label,
      evidencePath: record.evidencePath || null,
      payloadBytes: record.payload?.bytes || 0,
      receiptMatches: Boolean(record.receiptMatches)
    }
  };
}

function proofSpendRow(record) {
  return {
    proof_id: `${record.lane}:${record.entrypoint}:${record.txid}`,
    txid: record.txid,
    lane: record.lane,
    entrypoint: record.entrypoint || null,
    source_txid: record.source?.txid || null,
    source_index: record.source?.outputIndex ?? null,
    destination_address: record.expected?.destination || record.observed?.destination || null,
    amount_sompi: record.observed?.amountSompi || record.expected?.amountSompi || null,
    matched_input: Boolean(record.matched),
    matched_output: Boolean(record.matched && record.expected && record.observed)
  };
}

function readiness(lane, ready) {
  return {
    lane,
    status: ready ? "ready-from-fixture-replay" : "not-present-in-current-checkpoint"
  };
}
