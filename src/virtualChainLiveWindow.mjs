export function summarizeVirtualChainLiveWindow({
  endpointProbe = {},
  request = {},
  response = {},
  error = null,
  sdk = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedBlocks = Array.isArray(response.chainBlockAcceptedTransactions)
    ? response.chainBlockAcceptedTransactions
    : [];
  const transactions = acceptedBlocks.flatMap((block) => Array.isArray(block.acceptedTransactions)
    ? block.acceptedTransactions.map((tx) => ({ block, tx }))
    : []);
  const payloadTransactions = transactions.filter(({ tx }) => Boolean(tx.payload));
  const computeBudgetInputs = transactions.flatMap(({ tx }) => tx.inputs || [])
    .map((input) => ({ input }))
    .filter(({ input }) => input.computeBudget !== undefined && input.computeBudget !== null);
  const removedBlockHashes = Array.isArray(response.removedChainBlockHashes) ? response.removedChainBlockHashes : [];
  const rollbackRows = removedBlockHashes.length;
  const replayTransactions = transactions.map(({ block, tx }, index) => ({
    blockHash: block.chainBlockHeader?.hash || "",
    txid: tx.verboseData?.transactionId || tx.verboseData?.hash || "",
    ordinal: index,
    payloadBytes: tx.payload ? Math.ceil(String(tx.payload).length / 2) : 0
  })).filter((row) => row.txid);
  const replayComputeBudgetInputs = computeBudgetInputs.map(({ input }, index) => ({
    blockHash: transactions.find(({ tx }) => (tx.inputs || []).includes(input))?.block?.chainBlockHeader?.hash || "",
    ordinal: index,
    previousOutpoint: input.previousOutpoint || null,
    sigOpCount: input.sigOpCount ?? null,
    computeBudget: input.computeBudget ?? null
  }));

  const errorMessage = error?.message || error?.toString?.() || "";
  const errorCode = error?.code || "";
  const startHashUnavailable = /cannot find header|header.*not found|block.*not found/i.test(errorMessage);
  const status = errorMessage
    ? startHashUnavailable
      ? "virtual-chain-live-window-start-hash-unavailable"
      : "virtual-chain-live-window-error"
    : acceptedBlocks.length > 0
      ? "virtual-chain-live-window-ready"
      : "virtual-chain-live-window-empty";

  return {
    schema: "tn12-virtual-chain-live-window/v1",
    network: endpointProbe.observed?.dagNetwork || "testnet-12",
    generatedAt,
    status,
    liveReadAttempted: true,
    endpoint: endpointProbe.endpoint || {},
    sdk: {
      package: sdk.package || "",
      version: sdk.version || "",
      source: sdk.source || ""
    },
    request: {
      method: "getVirtualChainFromBlockV2",
      startHash: request.startHash || "",
      startHashSource: request.startHashSource || "getBlockDagInfo.sink",
      minConfirmationCount: Number(request.minConfirmationCount ?? 0),
      dataVerbosityLevel: request.dataVerbosityLevel || "High"
    },
    error: errorMessage ? {
      message: errorMessage,
      code: errorCode,
      startHashUnavailable,
      handling: startHashUnavailable
        ? "Keep the existing rich artifact and run current-tip smoke separately."
        : "Review endpoint, SDK, and request before promoting replay data."
    } : null,
    summary: {
      removedBlocks: rollbackRows,
      addedBlocks: Array.isArray(response.addedChainBlockHashes) ? response.addedChainBlockHashes.length : 0,
      acceptedBlocks: acceptedBlocks.length,
      acceptedTransactions: transactions.length,
      payloadTransactions: payloadTransactions.length,
      computeBudgetInputs: computeBudgetInputs.length,
      firstBlockBlueScore: acceptedBlocks[0]?.chainBlockHeader?.blueScore || "",
      firstBlockDaaScore: acceptedBlocks[0]?.chainBlockHeader?.daaScore || ""
    },
    sample: {
      blockHash: acceptedBlocks[0]?.chainBlockHeader?.hash || "",
      acceptedTransactionIds: replayTransactions.slice(0, 8).map((tx) => tx.txid),
      payloadBytes: payloadTransactions.slice(0, 5).map(({ tx }) => Math.ceil(String(tx.payload || "").length / 2)),
      computeBudgetInputs: replayComputeBudgetInputs.slice(0, 5).map(({ previousOutpoint, sigOpCount, computeBudget }) => ({
        previousOutpoint,
        sigOpCount,
        computeBudget
      }))
    },
    replay: {
      removedBlockHashes,
      acceptedTransactions: replayTransactions,
      computeBudgetInputs: replayComputeBudgetInputs
    },
    replayUse: {
      nextTable: "virtual_chain_windows",
      checkpointRule: "Do not persist this live window as app state until rollback overlap and payload/proof reducers match expected rows.",
      reducerInputs: [
        "removedChainBlockHashes",
        "addedChainBlockHashes",
        "chainBlockAcceptedTransactions.chainBlockHeader",
        "chainBlockAcceptedTransactions.acceptedTransactions"
      ]
    },
    boundaries: [
      "This is one bounded live read, not a durable indexer.",
      "It does not update checkpointed app state.",
      "If a historical start hash is unavailable, keep the existing richer artifact instead of replacing it with a near-tip sample.",
      "The next step is converting this response shape into replay rows with rollback overlap."
    ]
  };
}
