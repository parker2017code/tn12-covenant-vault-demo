#!/usr/bin/env node
/**
 * Monitor TN12 RPC endpoint and auto-retry escrow funding submission
 * when connectivity is restored.
 *
 * Usage: node scripts/monitor-rpc-and-submit.mjs [--interval 30] [--max-retries 100]
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const RPC_URL = process.env.KASPA_WRPC_URL || "ws://65.108.107.30:18210";
const KASPA_MODULE = process.env.KASPA_WASM_MODULE || "/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa";

const args = {
  interval: 30,
  maxRetries: 100,
};

for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === "--interval") args.interval = parseInt(process.argv[i + 1]);
  if (process.argv[i] === "--max-retries") args.maxRetries = parseInt(process.argv[i + 1]);
}

const kaspa = require(KASPA_MODULE);

const artifactPath = path.join(projectRoot, "artifacts/escrow-funding-tx.json");

async function checkEndpoint() {
  try {
    const client = new kaspa.RpcClient(RPC_URL);
    const info = await client.getBlockDagInfo();
    console.log(`[${new Date().toISOString()}] ✓ RPC online, blue score: ${info.virtualSelectedParentBlueScore}`);
    return true;
  } catch (e) {
    console.log(`[${new Date().toISOString()}] ✗ RPC offline: ${e.message?.substring(0, 60) || "unknown error"}`);
    return false;
  }
}

async function submitTransaction() {
  try {
    const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
    const client = new kaspa.RpcClient(RPC_URL);

    console.log(`[${new Date().toISOString()}] Submitting escrow funding TX...`);

    const result = await client.submitTransaction(artifact.signedTransaction);
    console.log(`[${new Date().toISOString()}] ✓ SUCCESS! Transaction submitted.`);
    console.log(`  Result:`, JSON.stringify(result, null, 2));
    return true;
  } catch (e) {
    console.log(`[${new Date().toISOString()}] ✗ Submit failed: ${e.message?.substring(0, 80) || "unknown error"}`);
    return false;
  }
}

async function monitor() {
  console.log(`🔍 RPC Monitor Started`);
  console.log(`   RPC URL: ${RPC_URL}`);
  console.log(`   Artifact: ${artifactPath}`);
  console.log(`   Interval: ${args.interval}s`);
  console.log(`   Max retries: ${args.maxRetries}`);
  console.log();

  let attempts = 0;

  while (attempts < args.maxRetries) {
    attempts++;
    const online = await checkEndpoint();

    if (online) {
      const submitted = await submitTransaction();
      if (submitted) {
        console.log("\n✓ Submission complete. Monitor exiting.");
        process.exit(0);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, args.interval * 1000));
  }

  console.log(`\n✗ Max retries (${args.maxRetries}) reached. Monitor exiting.`);
  process.exit(1);
}

monitor().catch((e) => {
  console.error("Monitor error:", e.message);
  process.exit(1);
});
