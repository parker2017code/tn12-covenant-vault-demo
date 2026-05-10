#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";

globalThis.WebSocket = WebSocket;

const network = process.env.KASPA_NETWORK || "testnet-12";
const outPath = process.env.OUT || "artifacts/virtual-chain-live-window.json";
const blockHashStart = process.env.BLOCK_HASH || null;
const includeTransactions = process.env.INCLUDE_TXS === "true";

const { RpcClient } = getKaspaWasmRuntime().module;
const rpcClient = new RpcClient({ networkId: network });

console.log(`Fetching virtual chain from TN12 local wasm module...`);
console.log(`  Network: ${network}`);
console.log(`  Start block: ${blockHashStart || "DAG tip (default)"}`);

try {
  const result = blockHashStart
    ? await rpcClient.getVirtualChainFromBlockV2({ blockHash: blockHashStart, includeTransactions })
    : await rpcClient.getVirtualChainFromBlockV2({ includeTransactions });

  // Transform to our row format for compatibility with buildVirtualChainLiveAppState
  const acceptedTxs = (result.acceptedTransactionIds || []).map((txid, idx) => ({
    kind: "accepted_transaction_seen",
    index: idx,
    data: {
      txid,
      payloadBytes: includeTransactions ? (result.transactions?.[idx]?.payload?.length || 0) : 0,
      blockHash: result.acceptingBlockHash || ""
    }
  }));

  const liveWindow = {
    schema: "tn12-virtual-chain-live-window/v1",
    network,
    generatedAt: new Date().toISOString(),
    url: "local-wasm-module-getVirtualChainFromBlockV2",
    sourceStatus: "getVirtualChainFromBlockV2-success",
    acceptingBlockHash: result.acceptingBlockHash,
    acceptingBlockBlueScore: result.acceptingBlockBlueScore,
    chainLength: result.chainLength,
    removals: result.removedTransactionIds?.length || 0,
    rows: acceptedTxs,
    summary: {
      totalAcceptedInWindow: acceptedTxs.length,
      totalRemovals: result.removedTransactionIds?.length || 0,
      includesTransactionData: includeTransactions
    }
  };

  await mkdir("artifacts", { recursive: true });
  await writeFile(outPath, `${JSON.stringify(liveWindow, null, 2)}\n`);

  console.log(`✓ ${outPath}`);
  console.log(`  Accepted transactions: ${acceptedTxs.length}`);
  console.log(`  Accepting block blue score: ${result.acceptingBlockBlueScore}`);
  console.log(`  Removals in this window: ${result.removedTransactionIds?.length || 0}`);
  console.log(`  Status: ready for live-app-state indexing`);
} catch (err) {
  console.error(`✗ Failed to fetch virtual chain:`, err.message);
  process.exit(1);
}
