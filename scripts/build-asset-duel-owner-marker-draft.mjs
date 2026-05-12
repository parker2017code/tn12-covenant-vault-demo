import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { buildSubmitPayload } from "../src/submitPayload.mjs";

const localWasm = "/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa";
if (!process.env.KASPA_WASM_MODULE && existsSync(localWasm)) {
  process.env.KASPA_WASM_MODULE = localWasm;
}

const { getKaspaWasmRuntime } = await import("../src/kaspaWasmRuntime.mjs");

const SOMPI_PER_TKAS = 100000000n;
const sourcePath = process.env.SOURCE_OUTPOINT || "fixtures/FundedWalletOutpoint.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/asset-duel-owner-marker-genesis.json";
const amountTkas = process.env.AMOUNT_TKAS || "1";
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");
const sourceInputComputeBudget = Number(process.env.SOURCE_INPUT_COMPUTE_BUDGET || "10");

const funding = await readJson(sourcePath);
const wallet = await readJson(walletPath);
const runtime = getKaspaWasmRuntime();
const {
  Address,
  PrivateKey,
  ScriptPublicKey,
  Transaction,
  TransactionInput,
  TransactionOutput,
  signTransaction
} = runtime.module;

if (funding.address !== wallet.address) {
  throw new Error(`Funding source address ${funding.address} does not match wallet address ${wallet.address}.`);
}

const amountSompi = tkasToSompi(amountTkas);
const sourceSompi = BigInt(funding.raw.utxoEntry.amount);
const changeSompi = sourceSompi - amountSompi - minerFeeSompi;
if (changeSompi <= 0n) throw new Error("Funding source cannot cover owner marker plus fee.");

const sourceScript = scriptPublicKeyFromHex(ScriptPublicKey, funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
const ownerMarkerScript = sourceScript;
const input = new TransactionInput({
  previousOutpoint: funding.raw.outpoint,
  signatureScript: "",
  sequence: 0n,
  sigOpCount: 1,
  computeBudget: sourceInputComputeBudget,
  utxo: {
    address: new Address(wallet.address),
    outpoint: funding.raw.outpoint,
    amount: sourceSompi,
    scriptPublicKey: { version: 0, script: funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey },
    blockDaaScore: BigInt(funding.raw.utxoEntry.blockDaaScore),
    isCoinbase: funding.raw.utxoEntry.isCoinbase
  }
});
const tx = new Transaction({
  version: 1,
  inputs: [input],
  outputs: [
    new TransactionOutput(amountSompi, ownerMarkerScript),
    new TransactionOutput(changeSompi, sourceScript)
  ],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: ""
});
tx.populateGenesisCovenants([{ authorizingInput: 0, outputs: [0] }]);
tx.finalize();
const signed = signTransaction(tx, [new PrivateKey(wallet.privateKey)], true);
const signedTransaction = JSON.parse(signed.serializeToSafeJSON());
const submitPayload = buildSubmitPayload({ tx: signedTransaction });
const covenant = submitPayload.transaction.outputs[0].covenant || null;

const artifact = {
  schema: "tn12-asset-duel-owner-marker-genesis-draft/v1",
  network: "kaspa-testnet-12",
  status: covenant ? "signed-covenant-genesis-not-broadcast" : "blocked-covenant-binding-missing",
  warning: "Signed TN12 owner-marker draft. It creates a one-time wallet P2PK sibling covenant input for Asset Duel.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  ownerMarker: {
    outputIndex: 0,
    amountTkas,
    amountSompi: amountSompi.toString(),
    scriptPublicKey: ownerMarkerScript.toJSON().script,
    address: wallet.address,
    covenant
  },
  change: {
    outputIndex: 1,
    address: wallet.address,
    amountTkas: sompiToTkas(changeSompi),
    amountSompi: changeSompi.toString()
  },
  transactionId: signed.id,
  signedTransaction,
  submitPayload,
  checks: {
    transactionVersionIsV1: signed.version === 1,
    output0HasCovenantBinding: Boolean(covenant),
    output0ScriptMatchesWalletP2pk: submitPayload.transaction.outputs[0].scriptPublicKey.scriptPublicKey === funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey,
    signatureScriptPresent: Boolean(signed.inputs[0].signatureScript)
  }
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);
console.log(`transactionId=${artifact.transactionId}`);
console.log(`covenantId=${artifact.ownerMarker.covenant?.covenantId || "missing"}`);

async function readJson(path) { return JSON.parse(await readFile(path, "utf8")); }
function tkasToSompi(value) {
  const [whole, fraction = ""] = String(value).split(".");
  return BigInt(whole) * SOMPI_PER_TKAS + BigInt((fraction.padEnd(8, "0").slice(0, 8) || "0"));
}
function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
function scriptPublicKeyFromHex(ScriptPublicKey, hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}
