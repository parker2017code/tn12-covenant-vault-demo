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

const SOMPI_PER_TKAS = 100000000n;
const funding = await readJson("fixtures/FundedWalletOutpoint.json");
const wallet = await readJson(".local/tn12-wallet.json");
const vaultBucketTkas = Number(process.env.VAULT_BUCKET_TKAS || "100");
const assuranceBucketTkas = Number(process.env.ASSURANCE_BUCKET_TKAS || "500");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");
const vaultSompi = tkasToSompi(vaultBucketTkas);
const assuranceSompi = tkasToSompi(assuranceBucketTkas);
const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const changeSompi = fundingSompi - vaultSompi - assuranceSompi - minerFeeSompi;

if (wallet.address !== funding.address || !wallet.address.startsWith("kaspatest:")) {
  throw new Error("Wallet and funding outpoint must use the same TN12 kaspatest: address.");
}

if (changeSompi <= 0n) {
  throw new Error(`Split buckets plus miner fee exceed the fetched UTXO. Current fixture has ${sompiToTkas(fundingSompi)} TKAS; requested ${vaultBucketTkas + assuranceBucketTkas} TKAS plus ${minerFeeSompi} sompi fee. Lower VAULT_BUCKET_TKAS/ASSURANCE_BUCKET_TKAS or refresh fixtures with npm run utxos:fetch.`);
}

const sourceScript = scriptPublicKeyFromHex(funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
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
    new TransactionOutput(vaultSompi, sourceScript),
    new TransactionOutput(assuranceSompi, sourceScript),
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
const signedTransaction = parsePossiblyNestedJson(signed.toString());
const artifact = {
  schema: "tn12-signed-split-draft/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  warning: "This is the first sensible broadcast candidate. It only splits testnet funds back to the same saved address.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  outputs: [
    { label: "vault bucket", address: wallet.address, amountTkas: vaultBucketTkas, amountSompi: vaultSompi.toString() },
    { label: "assurance bucket", address: wallet.address, amountTkas: assuranceBucketTkas, amountSompi: assuranceSompi.toString() },
    { label: "change", address: wallet.address, amountTkas: sompiToTkas(changeSompi), amountSompi: changeSompi.toString() }
  ],
  minerFeeSompi: minerFeeSompi.toString(),
  transactionId: signedTransaction.tx?.id || signedTransaction.tx?.inner?.id || null,
  submitPayload: buildSubmitPayload(signedTransaction),
  signedTransaction
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile("artifacts/signed-drafts/split-funding.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`artifacts/signed-drafts/split-funding.json transactionId=${artifact.transactionId}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function tkasToSompi(value) {
  return BigInt(Math.round(Number(value) * Number(SOMPI_PER_TKAS)));
}

function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) {
    return whole.toString();
  }
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}
