export function buildVirtualChainIngestionRun({
  ingestionPlan = {},
  checkpointIndex = {},
  submitRequests = {},
  runAt = checkpointIndex.fetchedAt || new Date().toISOString()
} = {}) {
  const records = Array.isArray(checkpointIndex.records) ? checkpointIndex.records : [];
  const checkpoint = checkpointIndex.checkpoint || {};
  const windowRows = records.map((record) => virtualChainRow({ record, checkpointIndex, runAt }));
  const candidateRows = (submitRequests.requests || []).slice(0, 10).map(candidateSubmitRow);
  const rollbackRows = buildRollbackRows({ ingestionPlan, checkpointIndex, windowRows });
  const acceptedRows = windowRows.filter((row) => row.accepted);
  const payloadRows = acceptedRows.filter((row) => row.payloadBytes > 0);
  const proofRows = acceptedRows.filter((row) => row.kind === "proof-spend");

  return {
    schema: "tn12-virtual-chain-ingestion-run/v1",
    network: checkpointIndex.network || ingestionPlan.network || "kaspa-testnet-12",
    runAt,
    status: rollbackRows.length === 0 && records.length > 0
      ? "fixture-virtual-chain-run-ready"
      : "fixture-virtual-chain-run-review",
    source: {
      mode: "fixture-window-from-current-checkpoint",
      targetReader: ingestionPlan.readerContract?.source || "getVirtualChainFromBlockV2",
      startBlueScore: checkpoint.minAcceptingBlockBlueScore ?? null,
      endBlueScore: checkpoint.maxAcceptingBlockBlueScore ?? null
    },
    summary: {
      virtualChainRows: windowRows.length,
      acceptedRows: acceptedRows.length,
      payloadRows: payloadRows.length,
      proofRows: proofRows.length,
      walletCandidateRows: candidateRows.length,
      rollbackRows: rollbackRows.length,
      appStateReady: rollbackRows.length === 0 && acceptedRows.length === records.length
    },
    tables: {
      virtual_chain_window: windowRows,
      wallet_submit_candidates: candidateRows,
      rollback_segments: rollbackRows
    },
    nextReaderAdapter: {
      env: "TN12_VIRTUAL_CHAIN_URL",
      cursorField: "blue-score-watermark",
      requiredVerbosity: ingestionPlan.readerContract?.dataVerbosity || "High",
      promoteRule: "Only promote a wallet candidate after the virtual-chain window reports the same txid as accepted with matching payload/output rules."
    },
    boundaries: [
      "This is a fixture-backed virtual-chain ingestion run shaped like the future live reader.",
      "It does not open a node subscription and does not add accepted evidence.",
      "Wallet-submitted candidates remain candidates until accepted by the virtual-chain reader."
    ]
  };
}

function virtualChainRow({ record, checkpointIndex, runAt }) {
  return {
    txid: record.txid,
    network: checkpointIndex.network || "kaspa-testnet-12",
    kind: record.kind || "accepted-transaction",
    lane: record.lane || "unknown",
    accepted: record.accepted === true,
    matched: record.matched === true,
    acceptingBlockBlueScore: Number(record.acceptingBlockBlueScore || 0),
    acceptingBlockTime: Number(record.acceptingBlockTime || 0),
    payloadBytes: Number(record.payload?.bytes || 0),
    outputMatched: Boolean(record.output?.matches ?? record.matched),
    source: "checkpoint-fixture-as-virtual-chain-window",
    seenAt: runAt
  };
}

function candidateSubmitRow(request) {
  return {
    requestId: request.requestId,
    txid: request.transaction?.id || "",
    path: request.path,
    route: request.route,
    payloadBytes: Number(request.payload?.bytes || 0),
    state: "candidate-only",
    promoteWhen: "accepted virtual-chain row with matching txid and payload/output checks"
  };
}

function buildRollbackRows({ checkpointIndex, windowRows }) {
  const expectedTxids = new Set(checkpointIndex.checkpoint?.txids || []);
  const observedTxids = new Set(windowRows.map((row) => row.txid));
  const missing = [...expectedTxids].filter((txid) => !observedTxids.has(txid));
  if (missing.length === 0) return [];
  return [{
    reason: "checkpoint txids missing from virtual-chain window",
    missingTxids: missing,
    reviewStatus: "open"
  }];
}
