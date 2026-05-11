import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";

const {
  Address,
  PrivateKey,
  ScriptPublicKey,
  SignableTransaction,
  Transaction,
  TransactionInput,
  TransactionOutput,
  UtxoEntries,
  createInputSignature,
  signTransaction
} = getKaspaWasmRuntime().module;
import { buildSubmitPayload } from "../src/submitPayload.mjs";
import { decimalTkasToSompi } from "../src/amounts.mjs";
import {
  buildSignalPayloadArtifact,
  encodeSignalPayloadBytes
} from "../src/signalPayload.mjs";

const SOMPI_PER_TKAS = 100000000n;
const fundingOutpointPath = process.env.FUNDING_OUTPOINT || "fixtures/FundedWalletOutpoint.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/payload-receipt-self-send.json";
const amountTkas = String(process.env.AMOUNT_TKAS || "1");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");
const amountSompi = decimalTkasToSompi(amountTkas);

const funding = JSON.parse(await readFile(fundingOutpointPath, "utf8"));
const wallet = JSON.parse(await readFile(walletPath, "utf8"));
const receipt = buildSignalPayloadArtifact({
  kind: process.env.SIGNAL_KIND,
  subject: process.env.SIGNAL_SUBJECT,
  value: process.env.SIGNAL_VALUE,
  note: process.env.SIGNAL_NOTE
});
const payloadBytes = encodeSignalPayloadBytes(receipt.payload);

if (wallet.address !== funding.address || !wallet.address.startsWith("kaspatest:")) {
  throw new Error("Wallet and funding outpoint must use the same TN12 kaspatest: address.");
}

const address = new Address(wallet.address);
const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const changeSompi = fundingSompi - amountSompi - minerFeeSompi;

if (changeSompi <= 0n) {
  throw new Error(`Payload receipt amount plus miner fee exceed the fetched UTXO. Current fixture has ${sompiToTkas(fundingSompi)} TKAS; requested ${amountTkas} TKAS plus ${minerFeeSompi} sompi fee.`);
}

const sourceScript = scriptPublicKeyFromHex(funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
const entries = new UtxoEntries([{
  address,
  outpoint: funding.raw.outpoint,
  utxoEntry: {
    amount: fundingSompi,
    scriptPublicKey: sourceScript,
    blockDaaScore: BigInt(funding.raw.utxoEntry.blockDaaScore),
    isCoinbase: funding.raw.utxoEntry.isCoinbase
  }
}]);
const inputArgs = {
  previousOutpoint: funding.raw.outpoint,
  signatureScript: [],
  sequence: 0n,
  sigOpCount: 1
};

if (typeof SignableTransaction !== "function") {
  inputArgs.utxo = entries.items[0];
}

const tx = new Transaction({
  version: 0,
  inputs: [new TransactionInput(inputArgs)],
  outputs: [
    new TransactionOutput(amountSompi, sourceScript),
    new TransactionOutput(changeSompi, sourceScript)
  ],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: payloadBytes
});
tx.finalize();

const signedTransaction = signP2pkTransaction({ tx, entries, privateKey: wallet.privateKey });
const submitPayload = buildSubmitPayload(signedTransaction);

const artifact = {
  schema: "tn12-signed-payload-receipt-draft/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  requiresPayloadSubmitSupport: true,
  warning: "This signed draft carries transaction payload bytes. Use the verified TN12 JSON wRPC route; the public REST submit route has dropped payload bytes.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  payment: {
    to: wallet.address,
    amountTkas,
    amountSompi: amountSompi.toString(),
    changeTkas: sompiToTkas(changeSompi),
    changeSompi: changeSompi.toString(),
    minerFeeSompi: minerFeeSompi.toString()
  },
  receipt,
  transactionId: signedTransaction.tx?.id || signedTransaction.tx?.inner?.id || null,
  submitPayload,
  signedTransaction
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`transactionId=${artifact.transactionId}`);
console.log(`payloadBytes=${receipt.encoded.bytes}`);

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) {
    return whole.toString();
  }
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}

function signP2pkTransaction({ tx, entries, privateKey }) {
  if (typeof SignableTransaction === "function") {
    const signable = new SignableTransaction(tx, entries);
    const signed = signTransaction(signable, [new PrivateKey(privateKey)], true);
    return parsePossiblyNestedJson(signed.toString());
  }

  const signature = createInputSignature(tx, 0, new PrivateKey(privateKey));
  tx.inputs[0].signatureScript = hexToBytes(signature);
  tx.finalize();
  return { tx: normalizeRuntimeTransaction(tx) };
}

function normalizeRuntimeTransaction(tx) {
  return {
    version: Number(tx.version || 0),
    inputs: tx.inputs.map((input) => {
      const inputJson = input.toJSON();
      return {
        previousOutpoint: input.previousOutpoint.toJSON(),
        signatureScript: inputJson.signatureScript,
        sequence: normalizeNumber(inputJson.sequence),
        sigOpCount: Number(inputJson.sigOpCount || 0)
      };
    }),
    outputs: tx.outputs.map((output) => {
      const outputJson = output.toJSON();
      const scriptPublicKey = output.scriptPublicKey.toJSON();
      return {
        value: normalizeNumber(outputJson.value),
        scriptPublicKey: `${Number(scriptPublicKey.version).toString(16).padStart(4, "0")}${scriptPublicKey.script}`
      };
    }),
    lockTime: normalizeNumber(tx.lockTime),
    subnetworkId: tx.subnetworkId,
    gas: normalizeNumber(tx.gas),
    payload: tx.payload,
    id: tx.id
  };
}

function normalizeNumber(value) {
  return typeof value === "bigint" ? value.toString() : value;
}

function hexToBytes(hex) {
  return Uint8Array.from(String(hex).match(/../g).map((chunk) => Number.parseInt(chunk, 16)));
}
