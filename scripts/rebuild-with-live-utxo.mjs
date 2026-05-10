#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import http from "https";
import { PrivateKey, Address, Transaction, TransactionInput, TransactionOutput, UtxoEntries, ScriptPublicKey, SignableTransaction, signTransaction } from "kaspa-wasm";
import { blake2b } from "blakejs";

const walletAddress = "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt";
const sourceUtxoTxid = "4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801";
const sourceUtxoIndex = 0;

console.log(`\n🔗 Rebuilding Escrow Funding with Verified Live UTXO`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

const wallet = JSON.parse(await readFile(".local/tn12-wallet.json", "utf8"));
const escrowArtifact = JSON.parse(await readFile("artifacts/Escrow.json", "utf8"));

// Fetch live UTXO data from REST API
console.log(`[1/4] Fetching live UTXO from TN12...`);
const utxos = await new Promise((resolve, reject) => {
  http.get(`https://api-tn12.kaspa.org/addresses/${walletAddress}/utxos`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
  }).on('error', reject);
});

const selectedUtxo = utxos.find(u => u.outpoint.transactionId === sourceUtxoTxid && u.outpoint.index === sourceUtxoIndex);
if (!selectedUtxo) {
  console.error(`✗ UTXO not found: ${sourceUtxoTxid}:${sourceUtxoIndex}`);
  process.exit(1);
}

const selectedAmount = BigInt(selectedUtxo.utxoEntry.amount);
console.log(`✓ Found verified UTXO on TN12`);
console.log(`  Amount: ${(Number(selectedAmount) / 100_000_000).toFixed(8)} TKAS`);

// Build transaction
console.log(`\n[2/4] Building transaction...`);
const redeemScript = Uint8Array.from(escrowArtifact.script);
const hash = blake2b(redeemScript, undefined, 32);
const escrowScriptPublicKey = new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));

const fundingAmountSompi = 100_000_000n;
const minerFee = 5_000n;
const changeAmount = selectedAmount - fundingAmountSompi - minerFee;

if (changeAmount <= 0n) {
  console.error(`✗ Insufficient balance`);
  process.exit(1);
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
    new TransactionOutput(changeAmount, sourceScriptPublicKey)
  ],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: ""
});

tx.finalize();
console.log(`✓ Transaction built`);
console.log(`  Escrow output (0): 1 TKAS`);
console.log(`  Change output (1): ${(Number(changeAmount) / 100_000_000).toFixed(8)} TKAS`);

// Sign transaction
console.log(`\n[3/4] Signing transaction...`);
const signable = new SignableTransaction(tx, entries);
const privKey = new PrivateKey(wallet.privateKey);
const signed = signTransaction(signable, [privKey], true);

// Convert signed tx to JSON
const signedStr = signed.toString();
const signedObj = JSON.parse(signedStr);

console.log(`✓ Transaction signed: ${tx.id.substring(0, 16)}...`);

// Build submitPayload transaction from the signed structure
const submitPayloadTx = {
  version: signedObj.tx.inner.version,
  inputs: signedObj.tx.inner.inputs.map(inp => ({
    previousOutpoint: {
      transactionId: inp.inner.previousOutpoint.inner.transactionId,
      index: inp.inner.previousOutpoint.inner.index
    },
    signatureScript: inp.inner.signatureScript,
    sequence: String(inp.inner.sequence),
    sigOpCount: inp.inner.sigOpCount
  })),
  outputs: signedObj.tx.inner.outputs.map(out => ({
    amount: out.inner.value,
    scriptPublicKey: {
      version: 0,
      scriptPublicKey: out.inner.scriptPublicKey
    }
  })),
  lockTime: String(signedObj.tx.inner.lockTime),
  subnetworkId: signedObj.tx.inner.subnetworkId,
  gas: signedObj.tx.inner.gas,
  payload: signedObj.tx.inner.payload
};

// Save artifact
console.log(`\n[4/4] Saving artifact...`);
const artifact = {
  schema: "tn12-escrow-funding-tx/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "signed-ready-for-submission",
  source: {
    address: wallet.address,
    txid: sourceUtxoTxid,
    outputIndex: sourceUtxoIndex,
    amountTkas: (Number(selectedAmount) / 100_000_000).toFixed(8),
    amountSompi: selectedAmount.toString(),
    blockDaaScore: selectedUtxo.utxoEntry.blockDaaScore.toString()
  },
  escrow: {
    contract: "Escrow",
    redeemScriptHash: Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(''),
    redeemScriptBytes: redeemScript.length,
    fundingAmount: 1,
    fundingAmountSompi: "100000000"
  },
  transaction: {
    id: tx.id,
    version: 0,
    inputCount: 1,
    outputCount: 2,
    lockTime: "0",
    subnetworkId: "0000000000000000000000000000000000000000",
    gasUsed: 0,
    payloadBytes: 0
  },
  outputs: [
    {
      index: 0,
      description: "Escrow covenant input",
      amountSompi: fundingAmountSompi.toString(),
      amountTkas: 1,
      scriptType: "p2sh"
    },
    {
      index: 1,
      description: "Change back to wallet",
      amountSompi: changeAmount.toString(),
      amountTkas: (Number(changeAmount) / 100_000_000).toFixed(8),
      scriptType: "p2pk"
    }
  ],
  minerFee: {
    sompi: minerFee.toString(),
    tkas: (Number(minerFee) / 100_000_000).toFixed(8)
  },
  signedTransaction: signedObj,
  submitPayload: {
    transaction: submitPayloadTx,
    allowOrphan: true
  }
};

await writeFile("artifacts/escrow-funding-tx.json", JSON.stringify(artifact, null, 2) + "\n");

console.log(`\n✓ Artifact saved to artifacts/escrow-funding-tx.json`);
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Escrow Funding Transaction Ready`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\nTxid: ${tx.id}`);
console.log(`Source UTXO: ${sourceUtxoTxid}:${sourceUtxoIndex}`);
console.log(`Funding: 1 TKAS → Escrow P2SH`);
console.log(`Change: ${(Number(changeAmount) / 100_000_000).toFixed(8)} TKAS → Wallet`);
console.log(`\nTo submit to TN12:`);
console.log(`  KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210 \\`);
console.log(`  KASPA_WRPC_ENCODING=borsh \\`);
console.log(`  KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa \\`);
console.log(`  node scripts/submit-escrow-funding.mjs artifacts/escrow-funding-tx.json --submit`);
