/**
 * Adversarial single-party escrow cancel — submits a cancel tx signed only by escrowBuyer,
 * omitting the required escrowSeller signature. Expects rejection.
 *
 * Usage:
 *   node scripts/build-adversarial-single-party-cancel.mjs          # dry-run
 *   node scripts/build-adversarial-single-party-cancel.mjs --submit  # submit + capture rejection
 */

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
  signScriptHash
} = getKaspaWasmRuntime().module;

const shouldSubmit = process.argv.includes("--submit");
const outDir = "artifacts/adversarial";
await mkdir(outDir, { recursive: true });

const roleWallets = JSON.parse(await readFile(".local/tn12-role-wallets.json", "utf8"));
const publicRoles = JSON.parse(await readFile("fixtures/RoleSeparatedWallets.public.json", "utf8"));
const escrowOutpoint = JSON.parse(await readFile("fixtures/RoleEscrowContractOutpoint.json", "utf8"));

const wallets = {};
for (const [role, data] of Object.entries(roleWallets.roles)) {
  wallets[role] = { ...data, xOnlyPublicKey: publicRoles.roles[role].xOnlyPublicKey };
}

const ZERO_SUBNETWORK_ID = "0000000000000000000000000000000000000000";
const OP_2 = 0x52;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const FINAL_SEQUENCE = 18446744073709551615n;

function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/../g).map((c) => parseInt(c, 16)));
}
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function p2pkScript(xOnlyPublicKey) {
  return Uint8Array.from([0x20, ...hexToBytes(xOnlyPublicKey), 0xac]);
}
function pushData(bytes) {
  if (bytes.length <= 75) return [bytes.length, ...bytes];
  if (bytes.length <= 255) return [OP_PUSHDATA1, bytes.length, ...bytes];
  return [OP_PUSHDATA2, bytes.length & 0xff, bytes.length >> 8, ...bytes];
}

const op = escrowOutpoint;
const buyerW = wallets.escrowBuyer;
const inputSompi = BigInt(op.amountSompi);
const outputSompi = inputSompi - 5000n;
const redeemScript = hexToBytes(op.redeemScriptHex);
const destScript = p2pkScript(buyerW.xOnlyPublicKey);

// Version 1 + computeBudget=30 (as used in the valid escrow cancel path)
const entries = new UtxoEntries([{
  address: new Address(op.scriptPublicKeyAddress),
  outpoint: op.raw.outpoint,
  utxoEntry: {
    amount: inputSompi,
    scriptPublicKey: new ScriptPublicKey(0, hexToBytes(op.scriptPublicKey)),
    blockDaaScore: BigInt(op.raw.utxoEntry.blockDaaScore),
    isCoinbase: op.raw.utxoEntry.isCoinbase
  }
}]);

const input = new TransactionInput({
  previousOutpoint: op.raw.outpoint,
  signatureScript: [],
  sequence: FINAL_SEQUENCE,
  sigOpCount: 0,
  computeBudget: 30
});

const tx = new Transaction({
  version: 1,
  inputs: [input],
  outputs: [new TransactionOutput(outputSompi, new ScriptPublicKey(0, destScript))],
  lockTime: 0n,
  subnetworkId: ZERO_SUBNETWORK_ID,
  gas: 0n,
  payload: ""
});
tx.finalize();

const signable = SignableTransaction ? new SignableTransaction(tx, entries) : null;
const scriptHash = signable ? signable.getScriptHashes()[0] : null;

// Only buyer signature — seller omitted
const buyerSig = signable
  ? hexToBytes(signScriptHash(scriptHash, new PrivateKey(buyerW.privateKey)))
  : hexToBytes(createInputSignature(tx, 0, new PrivateKey(buyerW.privateKey)));

// Single-party: only buyerSig + OP_2, no sellerSig
const sigScript = Uint8Array.from([
  ...buyerSig,
  OP_2,
  ...pushData(redeemScript)
]);

const submitPayload = {
  transaction: {
    version: 1,
    inputs: [{
      previousOutpoint: {
        transactionId: op.raw.outpoint.transactionId,
        index: op.raw.outpoint.index
      },
      signatureScript: bytesToHex(sigScript),
      sequence: String(FINAL_SEQUENCE),
      sigOpCount: 0,
      computeBudget: 30
    }],
    outputs: [{
      amount: Number(outputSompi),
      scriptPublicKey: {
        version: 0,
        scriptPublicKey: bytesToHex(destScript)
      }
    }],
    lockTime: 0,
    subnetworkId: ZERO_SUBNETWORK_ID
  },
  allowOrphan: false
};

let submissionResult = undefined;
let status = "built-not-submitted";

if (shouldSubmit) {
  const resp = await fetch("https://api-tn12.kaspa.org/transactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(submitPayload)
  });
  const body = await resp.json().catch(() => resp.text());
  submissionResult = { httpStatus: resp.status, body, submittedAt: new Date().toISOString() };
  status = resp.status === 200 ? "unexpectedly-accepted" : "rejected-as-expected";
  if (resp.status === 200) {
    console.error(`UNEXPECTED ACCEPTANCE — txid from body: ${JSON.stringify(body)}`);
  }
}

const artifact = {
  schema: "tn12-adversarial-invalid-spend/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  id: "escrow-single-party-cancel",
  contract: "Escrow",
  entrypoint: "cancelEscrow",
  invalidation: "single-party-cancel",
  correctSigners: "escrowBuyer + escrowSeller (both required)",
  usedSigners: "escrowBuyer only (seller omitted)",
  selector: "OP_2",
  version: 1,
  computeBudget: 30,
  expectedFailure: "Cancel branch requires two OP_CHECKSIG verifications; single sig leaves seller checkSig unsatisfied",
  sourceOutpoint: `${op.txid}:${op.outputIndex}`,
  status,
  submissionResult,
  submitPayload
};

const artifactPath = `${outDir}/escrow-single-party-cancel.json`;
await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

// Update summary
const summary = JSON.parse(await readFile(`${outDir}/adversarial-summary.json`, "utf8"));
const entry = { id: "escrow-single-party-cancel", status, httpStatus: submissionResult?.httpStatus };
const already = summary.cases.findIndex((c) => c.id === "escrow-single-party-cancel");
if (already >= 0) summary.cases[already] = entry; else summary.cases.push(entry);
summary.updatedAt = new Date().toISOString();
await writeFile(`${outDir}/adversarial-summary.json`, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`escrow-single-party-cancel: ${status}${submissionResult ? ` (HTTP ${submissionResult.httpStatus})` : ""}`);
console.log(`Total cases in summary: ${summary.cases.length}`);
