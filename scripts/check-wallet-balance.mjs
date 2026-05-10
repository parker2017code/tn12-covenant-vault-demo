#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";

globalThis.WebSocket = WebSocket;

const walletPath = process.env.WALLET_PATH || ".local/tn12-wallet.json";
const wallet = JSON.parse(await readFile(walletPath, "utf8"));

const { RpcClient } = getKaspaWasmRuntime().module;
const rpcUrl = process.env.KASPA_WRPC_URL || "ws://65.108.107.30:18210";

console.log(`Checking wallet balance...`);
console.log(`Wallet path: ${walletPath}`);
console.log(`Address: ${wallet.address}`);
console.log(`RPC URL: ${rpcUrl}`);

const rpc = RpcClient.length <= 1
  ? new RpcClient({ url: rpcUrl, encoding: "json", networkId: "testnet-12" })
  : new RpcClient(rpcUrl, "json", "testnet-12");

try {
  await rpc.connect({});
  console.log(`✓ Connected`);

  // Try simple RPC call first
  console.log(`\nTrying getInfo()...`);
  const info = await rpc.getInfo();
  console.log(`✓ getInfo: is_synced=${info.is_synced}`);

  // Try getBalance
  console.log(`\nTrying getBalance()...`);
  const balance = await rpc.getBalance({ address: wallet.address });
  console.log(`✓ Balance: ${balance}`);

} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);
} finally {
  try {
    await rpc.disconnect();
  } catch (e) {
    // ignore
  }
}
