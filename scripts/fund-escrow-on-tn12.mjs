#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";
import { blake2b } from "blakejs";

globalThis.WebSocket = WebSocket;

const SOMPI_PER_TKAS = 100_000_000n;
const FUNDING_AMOUNT_TKAS = 1;
const MINER_FEE = 5_000n;

const walletPath = ".local/tn12-wallet.json";
const escrowArtifactPath = "artifacts/Escrow.json";
const fundedWalletFixturePath = "fixtures/FundedWalletOutpoint.json";
const outPath = "artifacts/escrow-funding-tx.json";

try {
  console.log(`🔗 Building Real Escrow Funding Transaction on TN12`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Load wallet and contract
  const wallet = JSON.parse(await readFile(walletPath, "utf8"));
  const escrowArtifact = JSON.parse(await readFile(escrowArtifactPath, "utf8"));
  const fundedWalletFixture = JSON.parse(await readFile(fundedWalletFixturePath, "utf8"));

  console.log(`\nWallet Address: ${wallet.address}`);
  console.log(`Source UTXO: ${fundedWalletFixture.txid}:${fundedWalletFixture.outputIndex}`);
  console.log(`Available Balance: ${fundedWalletFixture.amountTkas} TKAS`);
  console.log(`\nTarget Contract: Escrow`);
  console.log(`Funding Amount: ${FUNDING_AMOUNT_TKAS} TKAS`);

  // Get wasm runtime
  const { PrivateKey, Address, Transaction, TransactionInput, TransactionOutput, UtxoEntries, ScriptPublicKey, SignableTransaction, signTransaction, RpcClient } = getKaspaWasmRuntime().module;
  const rpcUrl = process.env.KASPA_WRPC_URL || "ws://65.108.107.30:18210";

  console.log(`\nConnecting to TN12 wRPC: ${rpcUrl}`);

  const rpc = RpcClient.length <= 1
    ? new RpcClient({ url: rpcUrl, encoding: "json", networkId: "testnet-12" })
    : new RpcClient(rpcUrl, "json", "testnet-12");

  await rpc.connect({});
  console.log(`✓ Connected to TN12`);

  // Use fixture UTXO data
  console.log(`\n[1/5] Using UTXO from fixture...`);
  const selectedUtxo = fundedWalletFixture.raw;
  const selectedAmount = BigInt(selectedUtxo.utxoEntry.amount);

  console.log(`✓ Selected UTXO with ${sompiToTkas(selectedAmount)} TKAS`);
  console.log(`  DAA Score: ${selectedUtxo.utxoEntry.blockDaaScore}`);

  // Build transaction
  console.log(`\n[2/5] Building transaction...`);

  const redeemScript = Uint8Array.from(escrowArtifact.script);
  const escrowScriptPublicKey = scriptPublicKeyP2sh(redeemScript);
  const fundingAmountSompi = BigInt(Math.round(FUNDING_AMOUNT_TKAS * Number(SOMPI_PER_TKAS)));
  const changeSompi = selectedAmount - fundingAmountSompi - MINER_FEE;

  if (changeSompi <= 0n) {
    throw new Error(`Insufficient balance. Need ${fundingAmountSompi + MINER_FEE} sompi, have ${selectedAmount}`);
  }

  const sourceAddress = new Address(wallet.address);
  const sourceScriptPublicKey = new ScriptPublicKey(
    0,
    Uint8Array.from(selectedUtxo.utxoEntry.scriptPublicKey.scriptPublicKey.match(/../g).map(chunk => Number.parseInt(chunk, 16)))
  );

  const entries = new UtxoEntries([{
    address: sourceAddress,
    outpoint: selectedUtxo.outpoint,
    utxoEntry: {
      amount: selectedAmount,
      scriptPublicKey: sourceScriptPublicKey,
      blockDaaScore: BigInt(selectedUtxo.utxoEntry.blockDaaScore),
      isCoinbase: selectedUtxo.utxoEntry.isCoinbase
    }
  }]);

  const tx = new Transaction({
    version: 0,
    inputs: [
      new TransactionInput({
        previousOutpoint: selectedUtxo.outpoint,
        signatureScript: [],
        sequence: 0n,
        sigOpCount: 1
      })
    ],
    outputs: [
      new TransactionOutput(fundingAmountSompi, escrowScriptPublicKey),
      new TransactionOutput(changeSompi, sourceScriptPublicKey)
    ],
    lockTime: 0n,
    subnetworkId: "0000000000000000000000000000000000000000",
    gas: 0n,
    payload: ""
  });

  tx.finalize();
  console.log(`✓ Transaction built`);
  console.log(`  Escrow output (0): ${sompiToTkas(fundingAmountSompi)} TKAS`);
  console.log(`  Change output (1): ${sompiToTkas(changeSompi)} TKAS`);

  // Sign transaction
  console.log(`\n[3/5] Signing transaction...`);
  const signable = new SignableTransaction(tx, entries);
  const privKey = new PrivateKey(wallet.privateKey);
  const signed = signTransaction(signable, [privKey], true);
  const signedTx = parsePossiblyNestedJson(signed.toString());

  const txid = signedTx.tx?.id || signedTx.tx?.inner?.id || "unknown";
  console.log(`✓ Transaction signed: ${txid.substring(0, 16)}...`);

  // Submit transaction
  console.log(`\n[4/5] Submitting to TN12...`);
  const submitTx = buildSubmitTransaction(signedTx);
  const submitResponse = await rpc.submitTransaction(submitTx, false, "object");
  console.log(`✓ Submitted to TN12`);
  console.log(`  Response type: ${typeof submitResponse}`);

  // Extract response details
  const submittedTxid = submitResponse?.transactionId || submitResponse?.transaction_id || submitResponse;
  if (submittedTxid) {
    console.log(`  Submitted txid: ${String(submittedTxid).substring(0, 16)}...`);
  }

  // Save artifact
  console.log(`\n[5/5] Saving funding transaction artifact...`);
  const artifact = {
    schema: "tn12-escrow-funding-tx/v1",
    network: "kaspa-testnet-12",
    generatedAt: new Date().toISOString(),
    status: "submitted-awaiting-acceptance",

    source: {
      address: wallet.address,
      txid: selectedUtxo.outpoint.transactionId,
      outputIndex: selectedUtxo.outpoint.index,
      amountTkas: fundedWalletFixture.amountTkas,
      amountSompi: selectedAmount.toString(),
      blockDaaScore: selectedUtxo.utxoEntry.blockDaaScore
    },

    escrow: {
      contract: "Escrow",
      redeemScriptHash: bytesToHex(blake2b(redeemScript, undefined, 32)),
      redeemScriptBytes: redeemScript.length,
      fundingAmount: FUNDING_AMOUNT_TKAS,
      fundingAmountSompi: fundingAmountSompi.toString(),
      scriptPublicKey: escrowScriptPublicKey.toHex?.() || "unknown"
    },

    transaction: {
      id: txid,
      version: 0,
      inputCount: signedTx.tx.inputs.length,
      outputCount: signedTx.tx.outputs.length,
      lockTime: signedTx.tx.lockTime,
      subnetworkId: signedTx.tx.subnetworkId,
      gasUsed: signedTx.tx.gas || 0,
      payloadBytes: signedTx.tx.payload?.length || 0
    },

    outputs: [
      {
        index: 0,
        description: "Escrow covenant input",
        amountSompi: fundingAmountSompi.toString(),
        amountTkas: FUNDING_AMOUNT_TKAS,
        scriptType: "p2sh"
      },
      {
        index: 1,
        description: "Change back to wallet",
        amountSompi: changeSompi.toString(),
        amountTkas: sompiToTkas(changeSompi),
        scriptType: "p2pk"
      }
    ],

    minerFee: {
      sompi: MINER_FEE.toString(),
      tkas: sompiToTkas(MINER_FEE)
    },

    submissionResult: submitResponse,

    nextSteps: [
      `1. Monitor txid ${txid.substring(0, 16)}... on TN12 testnet`,
      `2. Once accepted, escrow UTXO will be at ${txid}:0`,
      `3. Use escrow UTXO to build settlement drafts (release/refund/cancel)`,
      `4. Submit settlement transactions to execute escrow action`
    ],

    useTheseOutpoints: {
      escrowContractOutput: {
        txid: txid,
        index: 0,
        description: "Use this in RoleEscrowContractOutpoint.json for settlement testing"
      }
    }
  };

  await mkdir("artifacts", { recursive: true });
  await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

  console.log(`\n✓ Artifact saved: ${outPath}`);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\nFunding transaction submitted to TN12.`);
  console.log(`Expected escrow UTXO: ${txid}:0`);
  console.log(`Submitted Amount: ${FUNDING_AMOUNT_TKAS} TKAS`);
  console.log(`\nStatus: AWAITING_ACCEPTANCE`);
  console.log(`\nCheck acceptance at: https://tn12.kaspa.stream/transactions/${txid}`);

  await rpc.disconnect();

} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}

function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function scriptPublicKeyP2sh(redeemScript) {
  const hash = blake2b(redeemScript, undefined, 32);
  return new (getKaspaWasmRuntime().module.ScriptPublicKey)(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(byte => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}

function buildSubmitTransaction(signedTx) {
  return signedTx.tx || signedTx;
}
