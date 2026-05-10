#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
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

  // Build submitPayload for RPC
  const innerTx = signedTx.tx?.inner || signedTx.tx;
  const submitPayloadTx = {
    version: innerTx?.version || 0,
    inputs: (innerTx?.inputs || []).map(input => ({
      previousOutpoint: {
        transactionId: input?.inner?.previousOutpoint?.inner?.transactionId || input?.previousOutpoint?.inner?.transactionId || input?.previousOutpoint?.transactionId,
        index: input?.inner?.previousOutpoint?.inner?.index || input?.previousOutpoint?.inner?.index || input?.previousOutpoint?.index
      },
      signatureScript: input?.inner?.signatureScript || input?.signatureScript || [],
      sequence: String(input?.inner?.sequence || input?.sequence || 0),
      sigOpCount: input?.inner?.sigOpCount || input?.sigOpCount || 1
    })),
    outputs: (innerTx?.outputs || []).map(output => ({
      amount: output?.value || output?.amount,
      scriptPublicKey: {
        version: 0,
        scriptPublicKey: typeof output?.scriptPublicKey === 'string' ? output.scriptPublicKey : (output?.scriptPublicKey?.scriptPublicKey || "")
      }
    })),
    lockTime: String(innerTx?.lockTime || 0),
    subnetworkId: innerTx?.subnetworkId || "0000000000000000000000000000000000000000",
    gas: innerTx?.gas || 0,
    payload: innerTx?.payload || ""
  };

  // For now, just save the signed transaction (no submission)
  console.log(`\n[4/5] Preparing submission...`);
  console.log(`✓ Signed transaction ready for submission`);
  console.log(`  (RPC submission requires TN12 wasm module - will handle in next step)`);

  // Save artifact
  console.log(`\n[5/5] Saving funding transaction artifact...`);
  const artifact = {
    schema: "tn12-escrow-funding-tx/v1",
    network: "kaspa-testnet-12",
    generatedAt: new Date().toISOString(),
    status: "signed-ready-for-submission",

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
      fundingAmountSompi: fundingAmountSompi.toString()
    },

    transaction: {
      id: txid,
      version: 0,
      inputCount: (signedTx.tx?.inputs || []).length,
      outputCount: (signedTx.tx?.outputs || []).length,
      lockTime: signedTx.tx?.lockTime || "0",
      subnetworkId: signedTx.tx?.subnetworkId || "0000000000000000000000000000000000000000",
      gasUsed: signedTx.tx?.gas || 0,
      payloadBytes: (signedTx.tx?.payload || "").length
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

    submitPayload: {
      transaction: submitPayloadTx,
      allowOrphan: true
    },

    signedTransaction: signedTx,

    nextSteps: [
      `1. Submit to TN12: KASPA_WASM_MODULE=<tn12-fork> node scripts/submit-escrow-funding.mjs`,
      `2. Monitor txid ${txid.substring(0, 16)}... on https://tn12.kaspa.stream`,
      `3. Once accepted, escrow UTXO will be at ${txid}:0`,
      `4. Use new UTXO to test settlement flows`
    ],

    nextCommand: `KASPA_WRPC_URL=ws://65.108.107.30:18210 KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa node scripts/submit-escrow-funding.mjs artifacts/escrow-funding-tx.json --submit`
  };

  await mkdir("artifacts", { recursive: true });
  await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

  console.log(`\n✓ Artifact saved: ${outPath}`);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n✓ Transaction built and signed.`);
  console.log(`\nTxid: ${txid}`);
  console.log(`Amount: ${FUNDING_AMOUNT_TKAS} TKAS to escrow covenant`);
  console.log(`Change: ${sompiToTkas(changeSompi)} TKAS back to wallet`);
  console.log(`\nTo submit to TN12, run:`);
  console.log(`  ${artifact.nextCommand}`);

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
  return new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));
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
