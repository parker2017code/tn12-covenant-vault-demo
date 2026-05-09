export function buildVirtualChainLiveReplayRows({
  liveWindow = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const source = liveWindow.sample || {};
  const acceptedIds = Array.isArray(source.acceptedTransactionIds) ? source.acceptedTransactionIds : [];
  const payloadBytes = Array.isArray(source.payloadBytes) ? source.payloadBytes : [];
  const computeBudgetInputs = Array.isArray(source.computeBudgetInputs) ? source.computeBudgetInputs : [];
  const blockHash = source.blockHash || "";
  const removedBlocks = Number(liveWindow.summary?.removedBlocks || 0);
  const rows = [
    row("virtual_chain_window", {
      id: `${liveWindow.network || "testnet-12"}:${liveWindow.request?.startHash || "unknown"}`,
      network: liveWindow.network || "testnet-12",
      method: liveWindow.request?.method || "getVirtualChainFromBlockV2",
      startHash: liveWindow.request?.startHash || "",
      minConfirmationCount: Number(liveWindow.request?.minConfirmationCount || 0),
      dataVerbosityLevel: liveWindow.request?.dataVerbosityLevel || "High",
      removedBlocks,
      addedBlocks: Number(liveWindow.summary?.addedBlocks || 0),
      acceptedBlocks: Number(liveWindow.summary?.acceptedBlocks || 0),
      acceptedTransactions: Number(liveWindow.summary?.acceptedTransactions || 0)
    }),
    ...acceptedIds.map((txid, index) => row("accepted_transaction_seen", {
      id: `${blockHash}:${txid}`,
      blockHash,
      txid,
      ordinal: index,
      payloadBytes: payloadBytes[index] || 0
    })),
    ...computeBudgetInputs.map((input, index) => row("compute_budget_input_seen", {
      id: `${blockHash}:compute-budget:${index}`,
      blockHash,
      ordinal: index,
      previousOutpoint: input.previousOutpoint || null,
      sigOpCount: input.sigOpCount ?? null,
      computeBudget: input.computeBudget ?? null
    })),
    ...Array.from({ length: removedBlocks }, (_, index) => row("rollback_removed_block_seen", {
      id: `${liveWindow.request?.startHash || "unknown"}:removed:${index}`,
      ordinal: index
    }))
  ];

  return {
    schema: "tn12-virtual-chain-live-replay-rows/v1",
    network: liveWindow.network || "testnet-12",
    generatedAt,
    status: rows.length > 1 ? "virtual-chain-live-replay-rows-ready" : "virtual-chain-live-replay-rows-empty",
    sourceStatus: liveWindow.status || "",
    appStatePromoted: false,
    summary: {
      rows: rows.length,
      acceptedTransactionRows: rows.filter((item) => item.kind === "accepted_transaction_seen").length,
      computeBudgetRows: rows.filter((item) => item.kind === "compute_budget_input_seen").length,
      rollbackRows: rows.filter((item) => item.kind === "rollback_removed_block_seen").length,
      payloadRows: rows.filter((item) => item.data?.payloadBytes > 0).length
    },
    rows,
    promotionGate: [
      "Replay a trusted overlap from the last persisted checkpoint.",
      "Apply removed-chain rows before added-chain rows.",
      "Match payload bytes and proof outpoints against reducers.",
      "Persist only after app-state rows are deterministic across the overlap."
    ],
    boundaries: [
      "These are live-window replay rows, not the durable app-state checkpoint.",
      "They intentionally keep appStatePromoted=false until rollback overlap and reducer matching are implemented."
    ]
  };
}

function row(kind, data) {
  return { kind, data };
}
