import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { blake2b } from "blakejs";
import { buildSubmitPayload } from "../src/submitPayload.mjs";

const localWasm = "/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa";
if (!process.env.KASPA_WASM_MODULE && existsSync(localWasm)) {
  process.env.KASPA_WASM_MODULE = localWasm;
}

const { getKaspaWasmRuntime } = await import("../src/kaspaWasmRuntime.mjs");

const sourcePath = process.env.SOURCE_OUTPOINT || "fixtures/FundedWalletOutpoint.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const targetPath = process.env.COORDINATION_TARGET || "artifacts/coordination-covenant-settlement-target.json";
const contractPath = process.env.CONTRACT_ARTIFACT || "artifacts/AssurancePledge.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/coordination-covenant-pledge-funding.json";
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");
const sourceInputComputeBudget = Number(process.env.SOURCE_INPUT_COMPUTE_BUDGET || "10");

const [funding, wallet, target, contractArtifact] = await Promise.all([
  readJson(sourcePath),
  readJson(walletPath),
  readJson(targetPath),
  readJson(contractPath)
]);
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

const requiredOutputs = target.targetV1?.requiredFreshOutputs || [];
if (requiredOutputs.length === 0) {
  throw new Error("Coordination covenant target does not list required fresh outputs.");
}

const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const redeemScript = Uint8Array.from(contractArtifact.script || []);
const contractScript = p2shScriptPublicKey(ScriptPublicKey, redeemScript);
const outputSpecs = requiredOutputs.map((row, index) => {
  const amountSompi = BigInt(row.amountSompi);
  if (amountSompi <= 0n) throw new Error(`Required output ${index} has non-positive amount.`);
  return {
    index,
    pledgeId: row.pledgeId,
    amountSompi,
    amountTkas: row.amountTkas,
    priorScriptType: row.priorScriptType,
    targetScriptType: "covenant",
    scriptPublicKey: contractScript
  };
});
const changeSompi = fundingSompi - outputSpecs.reduce((sum, row) => sum + row.amountSompi, 0n) - minerFeeSompi;
if (changeSompi <= 0n) {
  throw new Error(`Funding source has ${sompiToTkas(fundingSompi)} tKAS, which cannot cover pledge outputs plus fee.`);
}

const sourceScript = scriptPublicKeyFromHex(ScriptPublicKey, funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey);
const input = new TransactionInput({
  previousOutpoint: funding.raw.outpoint,
  signatureScript: "",
  sequence: 0n,
  sigOpCount: 1,
  computeBudget: sourceInputComputeBudget,
  utxo: {
    address: new Address(wallet.address),
    outpoint: funding.raw.outpoint,
    amount: fundingSompi,
    scriptPublicKey: {
      version: 0,
      script: funding.raw.utxoEntry.scriptPublicKey.scriptPublicKey
    },
    blockDaaScore: BigInt(funding.raw.utxoEntry.blockDaaScore),
    isCoinbase: funding.raw.utxoEntry.isCoinbase
  }
});
const tx = new Transaction({
  version: 1,
  inputs: [input],
  outputs: [
    ...outputSpecs.map((row) => new TransactionOutput(row.amountSompi, row.scriptPublicKey)),
    new TransactionOutput(changeSompi, sourceScript)
  ],
  lockTime: 0n,
  subnetworkId: "0000000000000000000000000000000000000000",
  gas: 0n,
  payload: ""
});
tx.populateGenesisCovenants([{ authorizingInput: 0, outputs: outputSpecs.map((row) => row.index) }]);
tx.finalize();

const signed = signTransaction(tx, [new PrivateKey(wallet.privateKey)], true);
const signedTransaction = JSON.parse(signed.serializeToSafeJSON());
const submitPayload = buildSubmitPayload({ tx: signedTransaction });
const covenantOutputs = submitPayload.transaction.outputs
  .slice(0, outputSpecs.length)
  .map((output) => output.covenant || null);
const allOutputsBound = covenantOutputs.every(Boolean);

const artifact = {
  schema: "tn12-coordination-covenant-pledge-funding-draft/v1",
  network: "kaspa-testnet-12",
  status: allOutputsBound ? "signed-covenant-pledges-not-broadcast" : "blocked-covenant-binding-missing",
  warning: "Signed TN12 draft. Submit only after checking the source UTXO is still unspent.",
  sdk: runtime.metadata,
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  contract: {
    name: contractArtifact.contract_name || "AssurancePledge",
    artifactPath: contractPath,
    redeemScriptBytes: redeemScript.length,
    redeemScriptHash: bytesToHex(blake2b(redeemScript, undefined, 32)),
    scriptPublicKey: contractScript.toJSON().script
  },
  outputs: outputSpecs.map((row) => ({
    index: row.index,
    pledgeId: row.pledgeId,
    amountTkas: row.amountTkas,
    amountSompi: row.amountSompi.toString(),
    priorScriptType: row.priorScriptType,
    targetScriptType: row.targetScriptType,
    covenant: covenantOutputs[row.index]
  })),
  change: {
    outputIndex: outputSpecs.length,
    address: wallet.address,
    amountTkas: sompiToTkas(changeSompi),
    amountSompi: changeSompi.toString()
  },
  budget: {
    sourceInputComputeBudget,
    reason: "Version-1 P2PK source input needs compute budget for one signature check."
  },
  minerFeeSompi: minerFeeSompi.toString(),
  transactionId: signed.id,
  signedTransaction,
  submitPayload,
  checks: {
    transactionVersionIsV1: signed.version === 1,
    allPledgeOutputsHaveCovenantBinding: allOutputsBound,
    pledgeOutputCount: outputSpecs.length,
    sourceWalletMatchesFundingAddress: funding.address === wallet.address,
    signatureScriptPresent: Boolean(signed.inputs[0].signatureScript)
  },
  nextAfterAccepted: [
    "Submit through the covenant-preserving wRPC route.",
    "Fetch outputs 0, 1, and 2 as the fresh coordination covenant pledge outpoints.",
    "Build release spends from those outpoints.",
    "Record accepted release evidence before upgrading Coordination beyond target status."
  ]
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);
console.log(`transactionId=${artifact.transactionId}`);
console.log(`pledgeOutputs=${artifact.outputs.length}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function scriptPublicKeyFromHex(ScriptPublicKey, hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function p2shScriptPublicKey(ScriptPublicKey, script) {
  const hash = blake2b(script, undefined, 32);
  return new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}

function sompiToTkas(sompi) {
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
