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
import { blake2b } from "blakejs";
import { buildSubmitPayload } from "../src/submitPayload.mjs";

const SOMPI_PER_TKAS = 100000000n;
const sourcePath = process.env.ROLE_FUNDING_SOURCE || "fixtures/FundedWalletOutpoint.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/role-separated-funding.json";
const artifactDir = process.env.ROLE_CONTRACT_ARTIFACT_DIR || "artifacts/role-separated";
const funding = await readJson(sourcePath);
const wallet = await readJson(".local/tn12-wallet.json");
const contracts = [
  {
    label: "role-separated vault",
    lane: "role-vault-funding",
    amountTkas: Number(process.env.ROLE_VAULT_FUNDING_TKAS || "25"),
    artifact: await readJson(`${artifactDir}/DelayedRecoveryVault.json`)
  },
  {
    label: "role-separated assurance",
    lane: "role-assurance-funding",
    amountTkas: Number(process.env.ROLE_ASSURANCE_FUNDING_TKAS || "25"),
    artifact: await readJson(`${artifactDir}/AssurancePledge.json`)
  },
  {
    label: "role-separated escrow",
    lane: "role-escrow-funding",
    amountTkas: Number(process.env.ROLE_ESCROW_FUNDING_TKAS || "25"),
    artifact: await readJson(`${artifactDir}/Escrow.json`)
  }
];
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");

if (wallet.address !== funding.address || !wallet.address.startsWith("kaspatest:")) {
  throw new Error("Wallet and funding outpoint must use the same TN12 kaspatest: address.");
}

const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const outputSpecs = contracts.map((contract) => {
  const redeemScript = Uint8Array.from(contract.artifact.script);
  const amountSompi = tkasToSompi(contract.amountTkas);
  return {
    label: contract.label,
    lane: contract.lane,
    contract: contract.artifact.contract_name,
    amountTkas: contract.amountTkas,
    amountSompi,
    redeemScript,
    scriptPublicKey: scriptPublicKeyP2sh(redeemScript),
    redeemScriptHash: bytesToHex(blake2b(redeemScript, undefined, 32)),
    redeemScriptBytes: redeemScript.length
  };
});
const changeSompi = fundingSompi - outputSpecs.reduce((sum, output) => sum + output.amountSompi, 0n) - minerFeeSompi;

if (changeSompi <= 0n) {
  throw new Error(`Role-separated funding outputs plus miner fee exceed the fetched UTXO. Current fixture has ${sompiToTkas(fundingSompi)} TKAS.`);
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
    ...outputSpecs.map((output) => new TransactionOutput(output.amountSompi, output.scriptPublicKey)),
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
  schema: "tn12-role-separated-funding-draft/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  lane: "role-separated-funding",
  warning: "This funds fresh role-separated contract outputs for the next proof pass. Do not submit if the source outpoint has already been spent.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  artifactDir,
  outputs: [
    ...outputSpecs.map((output, index) => ({
      index,
      label: output.label,
      lane: output.lane,
      contract: output.contract,
      amountTkas: output.amountTkas,
      amountSompi: output.amountSompi.toString(),
      scriptType: "p2sh",
      redeemScriptHash: output.redeemScriptHash,
      redeemScriptBytes: output.redeemScriptBytes
    })),
    {
      index: outputSpecs.length,
      label: "change",
      lane: "change",
      address: wallet.address,
      amountTkas: sompiToTkas(changeSompi),
      amountSompi: changeSompi.toString(),
      scriptType: "p2pk"
    }
  ],
  minerFeeSompi: minerFeeSompi.toString(),
  transactionId: signedTransaction.tx?.id || signedTransaction.tx?.inner?.id || null,
  submitPayload: buildSubmitPayload(signedTransaction),
  signedTransaction,
  nextAfterAccepted: [
    "Fetch output 0 as the role-separated vault contract outpoint.",
    "Fetch output 1 as the role-separated assurance contract outpoint.",
    "Fetch output 2 as the role-separated escrow contract outpoint.",
    "Build accepted spends and invalid candidates from those fresh outpoints."
  ]
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} transactionId=${artifact.transactionId}`);
console.log(`contractOutputs=${outputSpecs.length}`);
console.log(`changeTkas=${artifact.outputs.at(-1).amountTkas}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function tkasToSompi(value) {
  return BigInt(Math.round(Number(value) * Number(SOMPI_PER_TKAS)));
}

function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16))));
}

function scriptPublicKeyP2sh(redeemScript) {
  const hash = blake2b(redeemScript, undefined, 32);
  return new ScriptPublicKey(0, Uint8Array.from([0xaa, 0x20, ...hash, 0x87]));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}
