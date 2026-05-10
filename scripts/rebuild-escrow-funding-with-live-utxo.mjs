#!/usr/bin/env node
/**
 * Rebuild Escrow Funding Transaction with Live UTXO
 * 
 * Uses a confirmed spendable UTXO from TN12 REST API to rebuild
 * the escrow funding transaction from scratch.
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  PrivateKey,
  Address,
  Transaction,
  TransactionInput,
  TransactionOutput,
  UtxoEntries,
  ScriptPublicKey,
  SignableTransaction,
  signTransaction
} from "kaspa-wasm";
import { blake2b } from "blakejs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const SOMPI_PER_TKAS = 100_000_000n;
const FUNDING_AMOUNT_TKAS = 1;
const MINER_FEE = 5_000n;

console.log(`\n🔗 Rebuilding Escrow Funding Transaction with Live UTXO`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

try {
  // Load wallet and contract
  const wallet = JSON.parse(await readFile(path.join(projectRoot, ".local/tn12-wallet.json"), "utf8"));
  const escrowArtifact = JSON.parse(await readFile(path.join(projectRoot, "artifacts/Escrow.json"), "utf8"));
  const liveUtxos = JSON.parse(await readFile(path.join(projectRoot, "artifacts/live-wallet-utxos.json"), "utf8"));

  const selectedUtxo = liveUtxos.selected;
  
  console.log(`\nWallet: ${wallet.address.substring(0, 25)}...`);
  console.log(`Selected UTXO: ${selectedUtxo.txid}:${selectedUtxo.index}`);
  console.log(`Available: ${selectedUtxo.amountTkas} TKAS`);
  console.log(`Funding: ${FUNDING_AMOUNT_TKAS} TKAS`);

  const redeemScript = Uint8Array.from(escrowArtifact.script);
  const escrowScriptPublicKey = scriptPublicKeyP2sh(redeemScript);
  const fundingAmountSompi = BigInt(Math.round(FUNDING_AMOUNT_TKAS * Number(SOMPI_PER_TKAS)));
  const changeSompi = BigInt(selectedUtxo.amountSompi) - fundingAmountSompi - MINER_FEE;

  if (changeSompi <= 0n) {
    throw new Error(`Insufficient balance`);
  }

  console.log(`\nTransaction details:`);
  console.log(`  Funding output: ${fundingAmountSompi} sompi`);
  console.log(`  Change output: ${changeSompi} sompi`);
  console.log(`  Miner fee: ${MINER_FEE} sompi`);

  const sourceAddress = new Address(wallet.address);
  
  // Build transaction
  const tx = new Transaction({
    version: 0,
    inputs: [
      new TransactionInput({
        previousOutpoint: {
          transactionId: selectedUtxo.txid,
          index: selectedUtxo.index
        },
        signatureScript: new Uint8Array(),
        sequence: 0n,
        sigOpCount: 1
      })
    ],
    outputs: [
      new TransactionOutput({
        value: fundingAmountSompi,
        scriptPublicKey: escrowScriptPublicKey
      }),
      new TransactionOutput({
        value: changeSompi,
        scriptPublicKey: sourceAddress.scriptPublicKey
      })
    ],
    lockTime: 0n,
    subnetworkId: "0000000000000000000000000000000000000000",
    gasUsed: 0n,
    payload: new Uint8Array()
  });

  tx.finalize();

  console.log(`\nTransaction built:`);
  console.log(`  ID: ${tx.id}`);
  console.log(`  Inputs: 1`);
  console.log(`  Outputs: 2`);

  // Sign transaction
  const privKey = new PrivateKey(wallet.privateKeyHex);
  
  const sourceScriptPubKey = new ScriptPublicKey(0, Uint8Array.from(wallet.scriptPublicKey.scriptPublicKey.match(/../g).map(chunk => Number.parseInt(chunk, 16))));
  
  const entries = new UtxoEntries([{
    address: sourceAddress,
    outpoint: {
      transactionId: selectedUtxo.txid,
      index: selectedUtxo.index
    },
    utxoEntry: {
      amount: BigInt(selectedUtxo.amountSompi),
      scriptPublicKey: sourceScriptPubKey,
      blockDaaScore: 0n,
      isCoinbase: false
    }
  }]);

  const signable = new SignableTransaction(tx, entries);
  const signed = signTransaction(signable, [privKey], true);

  console.log(`\n✓ Transaction signed`);

  // Save artifact
  const artifact = {
    schema: "tn12-escrow-funding-tx/v1",
    network: "kaspa-testnet-12",
    generatedAt: new Date().toISOString(),
    status: "signed-ready-for-submission",
    source: {
      address: wallet.address,
      txid: selectedUtxo.txid,
      outputIndex: selectedUtxo.index,
      amountTkas: selectedUtxo.amountTkas,
      amountSompi: selectedUtxo.amountSompi
    },
    escrow: {
      contract: "Escrow",
      redeemScriptHash: escrowArtifact.scriptHash,
      redeemScriptBytes: escrowArtifact.script.length,
      fundingAmount: FUNDING_AMOUNT_TKAS,
      fundingAmountSompi: String(fundingAmountSompi)
    },
    transaction: {
      id: tx.id,
      version: tx.version,
      inputCount: tx.inputs.length,
      outputCount: tx.outputs.length,
      lockTime: String(tx.lockTime),
      subnetworkId: tx.subnetworkId,
      gasUsed: 0,
      payloadBytes: 0
    },
    signedTransaction: JSON.parse(JSON.stringify(signed)),
    submitPayload: {
      transaction: JSON.parse(JSON.stringify(signed.tx.inner)),
      allowOrphan: true
    }
  };

  await writeFile(path.join(projectRoot, "artifacts/escrow-funding-tx-rebuilt.json"), JSON.stringify(artifact, null, 2) + "\n");

  console.log(`\n✓ Artifact saved: escrow-funding-tx-rebuilt.json`);
  console.log(`  Txid: ${tx.id}`);
  console.log(`  Ready for submission`);

} catch (e) {
  console.error(`\n✗ Error: ${e.message}`);
  process.exit(1);
}

function scriptPublicKeyP2sh(redeemScript) {
  const hash = blake2b(redeemScript, undefined, 32);
  return new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));
}
