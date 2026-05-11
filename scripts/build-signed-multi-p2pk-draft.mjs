import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  Address,
  PrivateKey,
  ScriptPublicKey,
  SignableTransaction,
  Transaction,
  TransactionInput,
  TransactionOutput,
  UtxoEntries,
  signTransaction
} from "kaspa-wasm";
import { decimalTkasToSompi } from "../src/amounts.mjs";
import { buildSubmitPayload } from "../src/submitPayload.mjs";
import { assertSameTn12Address } from "../src/validation/address.mjs";

const SOMPI_PER_TKAS = 100000000n;
const fundingOutpointPath = process.env.FUNDING_OUTPOINT || "fixtures/FundedWalletOutpoint.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/multi-p2pk-transfer.json";
const outputs = JSON.parse(process.env.OUTPUTS_JSON || "[]");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");

if (!Array.isArray(outputs) || outputs.length === 0) {
  throw new Error("OUTPUTS_JSON must be a non-empty array of {label,address,xOnlyPublicKey,amountTkas} rows.");
}

const funding = JSON.parse(await readFile(fundingOutpointPath, "utf8"));
const wallet = JSON.parse(await readFile(walletPath, "utf8"));
assertSameTn12Address(wallet.address, funding.address, "Wallet and funding outpoint addresses");

const sourceScript = scriptPublicKeyFromHex(funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const paymentOutputs = outputs.map((output) => ({
  label: String(output.label || ""),
  address: String(output.address || ""),
  amountTkas: String(output.amountTkas || "0"),
  amountSompi: decimalTkasToSompi(String(output.amountTkas || "0")),
  script: p2pkScriptFromXOnly(String(output.xOnlyPublicKey || ""))
}));
const paymentTotalSompi = paymentOutputs.reduce((total, output) => total + output.amountSompi, 0n);
const changeSompi = fundingSompi - paymentTotalSompi - minerFeeSompi;

if (changeSompi <= 0n) {
  throw new Error(`Multi-output transfer plus miner fee exceeds the fetched UTXO. Current fixture has ${sompiToTkas(fundingSompi)} TKAS; requested ${sompiToTkas(paymentTotalSompi)} TKAS plus ${minerFeeSompi} sompi fee.`);
}

const entries = new UtxoEntries([{
  address: new Address(funding.address),
  outpoint: funding.raw.outpoint,
  utxoEntry: {
    amount: fundingSompi,
    scriptPublicKey: sourceScript,
    blockDaaScore: BigInt(funding.raw.utxoEntry.blockDaaScore),
    isCoinbase: funding.raw.utxoEntry.isCoinbase
  }
}]);
const tx = new Transaction({
  version: 0,
  inputs: [
    new TransactionInput({
      previousOutpoint: funding.raw.outpoint,
      signatureScript: [],
      sequence: 0n,
      sigOpCount: 1
    })
  ],
  outputs: [
    ...paymentOutputs.map((output) => new TransactionOutput(output.amountSompi, output.script)),
    new TransactionOutput(changeSompi, sourceScript)
  ],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: ""
});
tx.finalize();

const signable = new SignableTransaction(tx, entries);
const signed = signTransaction(signable, [new PrivateKey(wallet.privateKey)], true);
const signedJson = parsePossiblyNestedJson(signed.toString());
const artifact = {
  schema: "tn12-signed-multi-p2pk-draft/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  warning: "Local-key TN12 multi-output transfer draft. Do not reuse the same source outpoint after submit.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  outputs: [
    ...paymentOutputs.map((output, index) => ({
      index,
      label: output.label,
      address: output.address,
      amountTkas: output.amountTkas,
      amountSompi: output.amountSompi.toString()
    })),
    {
      index: paymentOutputs.length,
      label: "change",
      address: wallet.address,
      amountTkas: sompiToTkas(changeSompi),
      amountSompi: changeSompi.toString()
    }
  ],
  minerFeeSompi: minerFeeSompi.toString(),
  transactionId: signedJson.tx?.id || signedJson.tx?.inner?.id || null,
  submitPayload: buildSubmitPayload(signedJson),
  signedTransaction: signedJson
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`transactionId=${artifact.transactionId}`);
console.log(`outputs=${paymentOutputs.length}`);

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function p2pkScriptFromXOnly(xOnlyPublicKey) {
  const keyBytes = Uint8Array.from(String(xOnlyPublicKey).match(/../g)?.map((chunk) => Number.parseInt(chunk, 16)) || []);
  if (keyBytes.length !== 32) {
    throw new Error("Each xOnlyPublicKey must be a 32-byte hex public key.");
  }
  return new ScriptPublicKey(0, Uint8Array.from([0x20, ...keyBytes, 0xac]));
}

function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  return parsed;
}
