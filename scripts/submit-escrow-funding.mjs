#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";

globalThis.WebSocket = WebSocket;

const artifactPath = process.argv[2] || "artifacts/escrow-funding-tx.json";
const shouldSubmit = process.argv.includes("--submit");
const shouldProbe = process.argv.includes("--probe");

const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const rpcModule = getKaspaWasmRuntime().module;
const { RpcClient, Transaction } = rpcModule;
const rpcUrl = process.env.KASPA_WRPC_URL || "ws://65.108.107.30:18210";

console.log(`🔗 Submitting Escrow Funding Transaction to TN12`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\nArtifact: ${artifactPath}`);
console.log(`Status: ${artifact.status}`);
console.log(`Txid: ${artifact.transaction.id.substring(0, 16)}...`);
console.log(`Amount: ${artifact.escrow.fundingAmount} TKAS`);
console.log(`\nRPC URL: ${rpcUrl}`);

if (!shouldSubmit && !shouldProbe) {
  console.log(`\n[DRY-RUN] Add --probe or --submit to proceed`);
  process.exit(0);
}

const rpc = RpcClient.length <= 1
  ? new RpcClient({ url: rpcUrl, encoding: "json", networkId: "testnet-12" })
  : new RpcClient(rpcUrl, "json", "testnet-12");

try {
  await rpc.connect({});
  console.log(`\n✓ Connected to TN12`);

  if (shouldProbe) {
    console.log(`\n[PROBE] Checking endpoint...`);
    const info = await rpc.getInfo();
    console.log(`✓ Endpoint is online`);
    console.log(`  isSynced: ${info.is_synced}`);
    process.exit(0);
  }

  if (shouldSubmit) {
    console.log(`\n[SUBMIT] Sending transaction...`);
    try {
      const submit = artifact.submitPayload?.transaction;

      if (!submit) {
        throw new Error("Artifact missing submitPayload.transaction");
      }

      // Rebuild transaction from submitPayload
      const tx = new Transaction({
        version: Number(submit.version || 0),
        inputs: (submit.inputs || []).map(input => {
          const seq = input.sequence;
          return {
            previousOutpoint: {
              transactionId: input.previousOutpoint.transactionId,
              index: input.previousOutpoint.index
            },
            signatureScript: input.signatureScript || [],
            sequence: typeof seq === 'string' ? BigInt(seq || "0") : (seq != null ? BigInt(seq) : 0n),
            sigOpCount: input.sigOpCount || 1
          };
        }),
        outputs: (submit.outputs || []).map(output => ({
          value: typeof output.amount === 'string' ? BigInt(output.amount) : BigInt(output.amount || 0),
          scriptPublicKey: `${Number(output.scriptPublicKey.version).toString(16).padStart(4, "0")}${output.scriptPublicKey.scriptPublicKey}`
        })),
        lockTime: typeof submit.lockTime === 'string' ? BigInt(submit.lockTime || "0") : BigInt(submit.lockTime || 0),
        subnetworkId: submit.subnetworkId || "0000000000000000000000000000000000000000",
        gas: 0n,
        payload: submit.payload || ""
      });
      tx.finalize();

      console.log(`  Rebuilt TX id: ${tx.id?.substring(0, 16)}...`);
      const response = await rpc.submitTransaction(tx, false, "object");
      console.log(`✓ Transaction submitted`);
      console.log(`  Response type: ${typeof response}`);
      if (response) {
        console.log(`  Response:`, JSON.stringify(response, null, 2));
      }
    } catch (submitErr) {
      console.error(`  Submit error:`, submitErr);
      console.error(`  Error type: ${submitErr?.constructor?.name}`);
      console.error(`  Error message: ${submitErr?.message}`);
      throw submitErr;
    }

    if (response?.transactionId || response?.transaction_id) {
      const submittedTxid = response.transactionId || response.transaction_id;
      console.log(`\n✓ Txid accepted: ${submittedTxid}`);
      console.log(`\nNext steps:`);
      console.log(`1. Monitor on: https://tn12.kaspa.stream/txs/${submittedTxid}`);
      console.log(`2. Once accepted, escrow UTXO will be: ${submittedTxid}:0`);
      console.log(`3. Update RoleEscrowContractOutpoint.json with new UTXO`);
      console.log(`4. Run settlement tests with real covenant UTXO`);
    }
  }

} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
} finally {
  try {
    await rpc.disconnect();
  } catch (e) {
    // ignore
  }
}
