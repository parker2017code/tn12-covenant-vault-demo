#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import { PrivateKey, Address, Transaction, TransactionInput, TransactionOutput, UtxoEntries, ScriptPublicKey, SignableTransaction, signTransaction } from "kaspa-wasm";
import { blake2b } from "blakejs";

const wallet = JSON.parse(await readFile(".local/tn12-wallet.json", "utf8"));
const escrowArtifact = JSON.parse(await readFile("artifacts/Escrow.json", "utf8"));
const liveUtxos = JSON.parse(await readFile("artifacts/live-wallet-utxos.json", "utf8"));

const selectedUtxo = liveUtxos.selected;
const redeemScript = Uint8Array.from(escrowArtifact.script);
const hash = blake2b(redeemScript, undefined, 32);
const escrowScript = new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));

const sourceAddress = new Address(wallet.address);
const fundingAmount = 100_000_000n;
const changeAmount = BigInt(selectedUtxo.amountSompi) - fundingAmount - 5_000n;

const tx = new Transaction({
  version: 0,
  inputs: [new TransactionInput({ previousOutpoint: { transactionId: selectedUtxo.txid, index: selectedUtxo.index }, signatureScript: [], sequence: 0n, sigOpCount: 1 })],
  outputs: [new TransactionOutput(fundingAmount, escrowScript), new TransactionOutput(changeAmount, sourceAddress.scriptPublicKey)],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: ""
});

tx.finalize();

const privKey = new PrivateKey(wallet.privateKey);
const sourceScript = sourceAddress.scriptPublicKey;

const entries = new UtxoEntries([{ address: sourceAddress, outpoint: { transactionId: selectedUtxo.txid, index: selectedUtxo.index }, utxoEntry: { amount: BigInt(selectedUtxo.amountSompi), scriptPublicKey: sourceScript, blockDaaScore: 0n, isCoinbase: false }}]);

const signable = new SignableTransaction(tx, entries);
const signed = signTransaction(signable, [privKey], true);

const artifact = { schema: "tn12-escrow-funding-tx/v1", network: "kaspa-testnet-12", generatedAt: new Date().toISOString(), status: "signed-ready-for-submission", source: { address: wallet.address, txid: selectedUtxo.txid, outputIndex: selectedUtxo.index, amountTkas: selectedUtxo.amountTkas, amountSompi: selectedUtxo.amountSompi }, escrow: { contract: "Escrow", redeemScriptHash: Array.from(hash).map(b => b.toString(16).padStart(2,'0')).join(''), redeemScriptBytes: redeemScript.length, fundingAmount: 1, fundingAmountSompi: "100000000" }, transaction: { id: tx.id, version: 0, inputCount: 1, outputCount: 2, lockTime: "0", subnetworkId: "0000000000000000000000000000000000000000", gasUsed: 0, payloadBytes: 0 }, signedTransaction: JSON.parse(JSON.stringify(signed)), submitPayload: { transaction: JSON.parse(JSON.stringify(signed.tx.inner)), allowOrphan: true } };

await writeFile("artifacts/escrow-funding-tx-rebuilt.json", JSON.stringify(artifact, null, 2) + "\n");
console.log("✓ Rebuilt escrow funding transaction");
console.log("  Txid: " + tx.id);
console.log("  Source: " + selectedUtxo.txid + ":" + selectedUtxo.index);
console.log("  Funding: 1 TKAS to escrow covenant");
console.log("  Change: " + (Number(changeAmount) / 100_000_000).toFixed(8) + " TKAS");
console.log("\n✓ Saved to artifacts/escrow-funding-tx-rebuilt.json");
