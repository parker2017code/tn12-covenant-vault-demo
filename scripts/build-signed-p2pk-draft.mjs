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
import { buildSubmitPayload } from "../src/submitPayload.mjs";
import { decimalTkasToSompi } from "../src/amounts.mjs";
import { assertSameTn12Address } from "../src/validation/address.mjs";

const SOMPI_PER_TKAS = 100000000n;
const fundingOutpointPath = process.env.FUNDING_OUTPOINT || "fixtures/FundedWalletOutpoint.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/self-send-p2pk.json";
const amountTkas = String(process.env.AMOUNT_TKAS || "1");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");
const amountSompi = decimalTkasToSompi(amountTkas);

const funding = JSON.parse(await readFile(fundingOutpointPath, "utf8"));
const wallet = JSON.parse(await readFile(walletPath, "utf8"));

assertSameTn12Address(wallet.address, funding.address, "Wallet and funding outpoint addresses");

const address = new Address(wallet.address);
const destinationAddress = process.env.DESTINATION_ADDRESS || wallet.address;
const destinationXOnlyPublicKey = process.env.DESTINATION_XONLY_PUBLIC_KEY || wallet.xOnlyPublicKey || "";
const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const changeSompi = fundingSompi - amountSompi - minerFeeSompi;

if (changeSompi <= 0n) {
  throw new Error(`P2PK draft amount plus miner fee exceed the fetched UTXO. Current fixture has ${sompiToTkas(fundingSompi)} TKAS; requested ${amountTkas} TKAS plus ${minerFeeSompi} sompi fee.`);
}

const sourceScript = scriptPublicKeyFromHex(funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
const destinationScript = p2pkScriptFromXOnly(destinationXOnlyPublicKey);
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
    new TransactionOutput(amountSompi, destinationScript),
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
  schema: "tn12-signed-p2pk-draft/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  warning: "This artifact is a local signed draft. It has not been submitted to TN12.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  payment: {
    to: destinationAddress,
    amountTkas,
    amountSompi: amountSompi.toString(),
    changeTkas: sompiToTkas(changeSompi),
    changeSompi: changeSompi.toString(),
    minerFeeSompi: minerFeeSompi.toString()
  },
  transactionId: signedJson.tx?.id || signedJson.tx?.inner?.id || null,
  signedTransaction: signedJson,
  submitPayload: buildSubmitPayload(signedJson)
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`transactionId=${artifact.transactionId}`);

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function p2pkScriptFromXOnly(xOnlyPublicKey) {
  const keyBytes = Uint8Array.from(String(xOnlyPublicKey).match(/../g)?.map((chunk) => Number.parseInt(chunk, 16)) || []);
  if (keyBytes.length !== 32) {
    throw new Error("DESTINATION_XONLY_PUBLIC_KEY must be a 32-byte hex public key for destination P2PK funding.");
  }
  return new ScriptPublicKey(0, Uint8Array.from([0x20, ...keyBytes, 0xac]));
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
