export function buildVirtualChainIngestionPlan({
  replayPlan = {},
  storageSchema = {},
  submitRequests = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const checkpoint = replayPlan.currentCheckpoint || {};
  const tables = storageSchema.tables || [];
  const hasStorage = tables.some((table) => table.name === "accepted_transactions")
    && tables.some((table) => table.name === "rollback_segments");
  const requestCount = Number(submitRequests.summary?.requests || 0);
  const ready = replayPlan.status === "durable-indexer-plan-ready"
    && storageSchema.status === "storage-schema-ready"
    && hasStorage
    && requestCount > 0;

  return {
    schema: "tn12-virtual-chain-ingestion-plan/v1",
    network: replayPlan.network || storageSchema.network || "kaspa-testnet-12",
    generatedAt,
    status: ready ? "virtual-chain-ingestion-contract-ready" : "virtual-chain-ingestion-contract-blocked",
    sourceCheckpoint: {
      recordCount: Number(checkpoint.recordCount || 0),
      payloadEvents: Number(checkpoint.payloadEvents || 0),
      proofSpends: Number(checkpoint.proofSpends || 0),
      minAcceptingBlockBlueScore: checkpoint.minAcceptingBlockBlueScore ?? null,
      maxAcceptingBlockBlueScore: checkpoint.maxAcceptingBlockBlueScore ?? null
    },
    readerContract: {
      source: "getVirtualChainFromBlockV2 or equivalent node/RPC virtual-chain feed",
      dataVerbosity: "High",
      cursor: {
        type: "blue-score-watermark",
        startFrom: checkpoint.maxAcceptingBlockBlueScore ?? null,
        persistTo: "checkpoint_watermarks.max_blue_score"
      },
      requiredTransactionFields: [
        "txid",
        "is_accepted",
        "accepting_block_blue_score",
        "accepting_block_time",
        "payload",
        "inputs",
        "outputs"
      ],
      optionalWalletSubmitFeed: requestCount > 0
        ? "Wallet connector submit results can be inserted as candidate txids, but app state still waits for accepted virtual-chain confirmation."
        : "No wallet submit feed is available yet."
    },
    storageWrites: [
      writeStep("accepted_transactions", "Insert accepted tx rows with payload, inputs, outputs, blue score, and source=virtual-chain-reader."),
      writeStep("accepted_payload_events", "Decode payload bytes only after accepted transaction storage succeeds."),
      writeStep("proof_spend_outputs", "Resolve proof spends against previous outputs and expected destination/amount rules."),
      writeStep("checkpoint_watermarks", "Commit a new watermark only after reducers report zero mismatches."),
      writeStep("rollback_segments", "Open a segment if the feed reports removed txids, lower blue-score watermarks, or missing previous checkpoint txids.")
    ],
    rollbackPolicy: {
      openWhen: [
        "new max blue score is lower than the persisted max",
        "previous checkpoint txids disappear from the virtual-chain window",
        "accepted tx payload bytes differ from stored payload bytes",
        "proof spend previous output no longer resolves"
      ],
      whileOpen: [
        "mark affected app events review_status=stale",
        "block user-facing ready state for affected lanes",
        "replay from the previous trusted checkpoint",
        "resolve only after mismatch_count is zero"
      ]
    },
    acceptanceCriteria: [
      "A virtual-chain replay can reproduce the current accepted payload fixture replay.",
      "Wallet-submitted txids do not become app state until seen as accepted by the reader.",
      "Rollback segments block affected lane readiness.",
      "Payload and proof reducers reuse the existing matched-byte and matched-output rules."
    ],
    nextImplementationFiles: [
      "src/virtualChainReader.mjs",
      "scripts/run-virtual-chain-indexer.mjs",
      "artifacts/virtual-chain-ingestion-run.json"
    ],
    boundaries: [
      "This is the durable ingestion contract and adapter shape, not a live node subscription.",
      "It does not require local kaspad and does not change accepted proof or payload counts.",
      "The next code step is implementing a reader against a configured public or hosted TN12 node/RPC endpoint."
    ]
  };
}

function writeStep(table, detail) {
  return { table, detail };
}
