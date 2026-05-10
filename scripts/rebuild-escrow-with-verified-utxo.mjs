#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import { PrivateKey, Address, Transaction, TransactionInput, TransactionOutput, UtxoEntries, ScriptPublicKey, SignableTransaction, signTransaction } from "kaspa-wasm";
import { blake2b } from "blakejs";

const wallet = JSON.parse(await readFile(".local/tn12-wallet.json", "utf8"));
const escrowArtifact = JSON.parse(await readFile("artifacts/Escrow.json", "utf8"));

// Correct UTXO that exists on TN12 (verified in wallet query)
const sourceUtxo = {
  txid: "4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801",
  index: 0,
  amount: 9999950000n, // 99.99995 TKAS
  blockDaaScore: 0n
};

const redeemScript = Uint8Array.from(escrowArtifact.script);
const hash = blake2b(redeemScript, undefined, 32);
const escrowScript = new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));

const sourceAddress = new Address(wallet.address);
const sourceScriptPublicKey = new ScriptPublicKey(
  0,
  Uint8Array.from([0x00, 0x20, 0xd7, 0x39, 0xde, 0x4b, 0x3b, 0x61, 0xa8, 0x94, 0xf0, 0x19, 0x88, 0xb6, 0xcf, 0xd0, 0x96, 0x3d, 0x43, 0xd1, 0xb4, 0x0a, 0x78, 0x74, 0x13, 0x66, 0x61, 0x22, 0xa4, 0xf1, 0x2e, 0x0b, 0x60, 0xd5, 0xac])
);

const fundingAmount = 100_000_000n;
const changeAmount = sourceUtxo.amount - fundingAmount - 5_000n;

const tx = new Transaction({
  version: 0,
  inputs: [new TransactionInput({ previousOutpoint: { transactionId: sourceUtxo.txid, index: sourceUtxo.index }, signatureScript: [], sequence: 0n, sigOpCount: 1 })],
  outputs: [new TransactionOutput(fundingAmount, escrowScript), new TransactionOutput(changeAmount, sourceScriptPublicKey)],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: ""
});

tx.finalize();

const privKey = new PrivateKey(wallet.privateKey);

const entries = new UtxoEntries([{ 
  address: sourceAddress, 
  outpoint: { transactionId: sourceUtxo.txid, index: sourceUtxo.index }, 
  utxoEntry: { 
    amount: sourceUtxo.amount, 
    scriptPublicKey: sourceScriptPublicKey, 
    blockDaaScore: sourceUtxo.blockDaaScore, 
    isCoinbase: false 
  }
}]);

const signable = new SignableTransaction(tx, entries);
const signed = signTransaction(signable, [privKey], true);

const artifact = {
  schema: "tn12-escrow-funding-tx/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "signed-ready-for-submission",
  source: {
    address: wallet.address,
    txid: sourceUtxo.txid,
    outputIndex: sourceUtxo.index,
    amountTkas: (Number(sourceUtxo.amount) / 100_000_000).toFixed(8),
    amountSompi: sourceUtxo.amount.toString(),
    blockDaaScore: "0"
  },
  escrow: {
    contract: "Escrow",
    redeemScriptHash: Array.from(hash).map(b => b.toString(16).padStart(2,'0')).join(''),
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
      amountSompi: fundingAmount.toString(),
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
    sompi: "5000",
    tkas: "0.00005"
  },
  signedTransaction: JSON.parse(JSON.stringify(signed)),
  submitPayload: {
    transaction: JSON.parse(JSON.stringify(signed.tx.inner || signed.tx)),
    allowOrphan: true
  },
  nextSteps: [
    "1. Submit to TN12: KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210 KASPA_WRPC_ENCODING=borsh node scripts/submit-escrow-funding.mjs",
    `2. Monitor txid ${tx.id} on https://tn12.kaspa.stream`,
    `3. Once accepted, escrow UTXO will be at ${tx.id}:0`,
    "4. Update fixtures and rebuild settlements"
  ]
};

await writeFile("artifacts/escrow-funding-tx-rebuilt-verified.json", JSON.stringify(artifact, null, 2) + "\n");

console.log("✓ Rebuilt escrow funding transaction with verified UTXO");
console.log(`  Source UTXO: ${sourceUtxo.txid}:${sourceUtxo.index}`);
console.log(`  Amount: 99.99995 TKAS`);
console.log(`  Txid: ${tx.id}`);
console.log(`  Funding: 1 TKAS to escrow covenant`);
console.log(`  Change: ${(Number(changeAmount) / 100_000_000).toFixed(8)} TKAS`);
console.log(`\n✓ Saved to artifacts/escrow-funding-tx-rebuilt-verified.json`);
