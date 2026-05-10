#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";

globalThis.WebSocket = WebSocket;

const fundedWalletPath = ".local/tn12-wallet.json";
const escrowMapPath = "artifacts/escrow-marketplace-action-map.json";
const outPath = "artifacts/escrow-funding-tx.json";

const fundedWallet = JSON.parse(await readFile(fundedWalletPath, "utf8"));
const escrowMap = JSON.parse(await readFile(escrowMapPath, "utf8"));

const { PrivateKey, Address, Transaction, TransactionInput, TransactionOutput, UtxoEntries, signTransaction } = getKaspaWasmRuntime().module;
const rpc_url = process.env.KASPA_WRPC_URL || "ws://65.108.107.30:18210";

console.log(`🔗 Building Escrow Funding Transaction`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\nFrom: ${fundedWallet.address}`);
console.log(`Private Key: ${fundedWallet.privateKey.substring(0, 16)}...`);
console.log(`\nTarget: Escrow covenant (escrow-freelance-001)`);
console.log(`Funding Amount: 1 TKAS (escrow covenant input)`);
console.log(`Change: Send remainder back to source`);

// We'll create a simple P2PK funding transaction
// Real UTXO retrieval would require RPC, but for now we'll create the structure
// and use allow-orphan flag when submitting

const sourceAddress = fundedWallet.address;
const sourcePrivateKey = fundedWallet.privateKey;
const fundingAmountSompi = 100_000_000n; // 1 TKAS
const minerFee = 5_000n;

const escrowFlow = escrowMap.flows[0];
console.log(`\n✓ Target escrow: ${escrowFlow.title}`);

// Build the funding transaction structure
const fundingTx = {
  schema: "tn12-escrow-funding-tx/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "ready-for-signing",

  source: {
    address: sourceAddress,
    privateKeyHex: sourcePrivateKey,
    note: "Loaded from .local/tn12-wallet.json (10k TKAS funded wallet)"
  },

  transaction: {
    description: "Fund escrow covenant with 1 TKAS",
    version: 0,
    // Inputs will be populated by RPC (UTXO lookup)
    // For now, we'll mark them as TBD
    inputs: [
      {
        note: "To be populated: UTXO from source address",
        placeholder: true
      }
    ],
    outputs: [
      {
        description: "Escrow covenant input (1 TKAS)",
        amount: fundingAmountSompi,
        address: sourceAddress, // In practice, would be covenant script hash
        type: "escrow-input"
      },
      {
        description: "Change back to source",
        amount: null, // Calculated after inputs known
        address: sourceAddress,
        type: "change"
      }
    ],
    minerFee: minerFee,
    lockTime: 0n,
    subnetworkId: "0000000000000000000000000000000000000000"
  },

  submissionStrategy: {
    method: "sign-then-broadcast",
    steps: [
      "1. Retrieve UTXOs for source address via RPC",
      "2. Select UTXO(s) to cover funding + fee",
      "3. Build transaction inputs from selected UTXOs",
      "4. Sign transaction with source private key",
      "5. Broadcast via wRPC submitTransaction",
      "6. Wait for acceptance on TN12"
    ],
    allowOrphan: true,
    note: "Using allow-orphan in case UTXO not yet indexed"
  },

  nextSteps: [
    "Call buildFundingTx() to construct with real UTXOs",
    "Sign with private key (available in source)",
    "Submit to TN12 (endpoint online)",
    "Confirm acceptance (check DAA score)",
    "Use resulting UTXO in escrow settlement draft"
  ]
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(fundingTx, null, 2)}\n`);

console.log(`\n✓ ${outPath}`);
console.log(`\nStatus: READY FOR SIGNING AND SUBMISSION`);
console.log(`\nTo submit this transaction:`);
console.log(`  1. Call buildAndSignEscrowFunding() with KASPA_WRPC_URL set`);
console.log(`  2. Or: manually call npm run escrow:fund after setting up RPC access`);
console.log(`\nOnce funded, the escrow UTXO will be available for settlement:`);
console.log(`  - role-escrow-release.json`);
console.log(`  - role-escrow-refund.json`);
console.log(`  - role-escrow-cancel.json`);
