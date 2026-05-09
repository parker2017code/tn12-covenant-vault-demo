export function summarizeVirtualChainLiveWindow({
  endpointProbe = {},
  request = {},
  response = {},
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
    .filter((input) => input.computeBudget !== undefined && input.computeBudget !== null);
  const rollbackRows = Array.isArray(response.removedChainBlockHashes) ? response.removedChainBlockHashes.length : 0;

  return {
    schema: "tn12-virtual-chain-live-window/v1",
    network: endpointProbe.observed?.dagNetwork || "testnet-12",
    generatedAt,
    status: acceptedBlocks.length > 0 ? "virtual-chain-live-window-ready" : "virtual-chain-live-window-empty",
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
      minConfirmationCount: Number(request.minConfirmationCount ?? 0),
      dataVerbosityLevel: request.dataVerbosityLevel || "High"
    },
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
      acceptedTransactionIds: transactions.slice(0, 8).map(({ tx }) =>
        tx.verboseData?.transactionId || tx.verboseData?.hash || ""
      ).filter(Boolean),
      payloadBytes: payloadTransactions.slice(0, 5).map(({ tx }) => Math.ceil(String(tx.payload || "").length / 2)),
      computeBudgetInputs: computeBudgetInputs.slice(0, 5).map((input) => ({
        previousOutpoint: input.previousOutpoint || null,
        sigOpCount: input.sigOpCount ?? null,
        computeBudget: input.computeBudget ?? null
      }))
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
      "The next step is converting this response shape into replay rows with rollback overlap."
    ]
  };
}
