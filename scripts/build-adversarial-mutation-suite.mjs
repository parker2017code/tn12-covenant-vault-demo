/**
 * Full adversarial mutation suite — wrong-selector, wrong-output-lock, wrong-output-amount.
 * All 3 P2SH outputs from the role-separated funding tx are still unspent after wrong-signer
 * rejections, so we reuse them here.
 *
 * Usage:
 *   node scripts/build-adversarial-mutation-suite.mjs          # dry-run
 *   node scripts/build-adversarial-mutation-suite.mjs --submit  # submit + capture rejections
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
const vaultOutpoint = JSON.parse(await readFile("fixtures/RoleVaultContractOutpoint.json", "utf8"));
const assuranceOutpoint = JSON.parse(await readFile("fixtures/RoleAssuranceContractOutpoint.json", "utf8"));
const escrowOutpoint = JSON.parse(await readFile("fixtures/RoleEscrowContractOutpoint.json", "utf8"));

const wallets = {};
for (const [role, data] of Object.entries(roleWallets.roles)) {
  wallets[role] = { ...data, xOnlyPublicKey: publicRoles.roles[role].xOnlyPublicKey };
}

const ZERO_SUBNETWORK_ID = "0000000000000000000000000000000000000000";
const OP_0 = 0x00;
const OP_1 = 0x51;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const FINAL_SEQUENCE = 18446744073709551615n;
const NONFINAL_SEQUENCE = 0n;
const CONTRACT_FEE = 5000n;

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

function buildSpend({ outpoint, outputSompi, destinationXOnlyKey, lockTime = 0n }) {
  const inputSompi = BigInt(outpoint.amountSompi);
  const effOutput = outputSompi ?? (inputSompi - CONTRACT_FEE);
  const destScript = p2pkScript(destinationXOnlyKey);

  const entries = new UtxoEntries([{
    address: new Address(outpoint.scriptPublicKeyAddress),
    outpoint: outpoint.raw.outpoint,
    utxoEntry: {
      amount: inputSompi,
      scriptPublicKey: new ScriptPublicKey(0, hexToBytes(outpoint.scriptPublicKey.replace(/^0+/, '').replace(/^aa20/, 'aa20'))),
      blockDaaScore: BigInt(outpoint.raw.utxoEntry.blockDaaScore),
      isCoinbase: outpoint.raw.utxoEntry.isCoinbase
    }
  }]);

  const input = new TransactionInput({
    previousOutpoint: outpoint.raw.outpoint,
    signatureScript: [],
    sequence: lockTime > 0n ? NONFINAL_SEQUENCE : FINAL_SEQUENCE,
    sigOpCount: 1
  });

  const tx = new Transaction({
    version: 0,
    inputs: [input],
    outputs: [new TransactionOutput(effOutput, new ScriptPublicKey(0, destScript))],
    lockTime,
    subnetworkId: ZERO_SUBNETWORK_ID,
    gas: 0n,
    payload: ""
  });
  tx.finalize();

  const signable = SignableTransaction ? new SignableTransaction(tx, entries) : null;
  const scriptHash = signable ? signable.getScriptHashes()[0] : null;

  return { tx, input, entries, signable, scriptHash, effOutput, destScript };
}

function sign({ signable, tx, privateKey, scriptHash }) {
  if (signable) return hexToBytes(signScriptHash(scriptHash, new PrivateKey(privateKey)));
  return hexToBytes(createInputSignature(tx, 0, new PrivateKey(privateKey)));
}

function buildSigScript({ sigBytes, selector, redeemHex }) {
  const redeemScript = hexToBytes(redeemHex);
  return Uint8Array.from([...sigBytes, selector, ...pushData(redeemScript)]);
}

function buildSubmitPayload({ outpoint, sigScript, tx, effOutput, destScript }) {
  return {
    transaction: {
      version: 0,
      inputs: [{
        previousOutpoint: {
          transactionId: outpoint.raw.outpoint.transactionId,
          index: outpoint.raw.outpoint.index
        },
        signatureScript: bytesToHex(sigScript),
        sequence: String(tx.inputs[0]?.sequence ?? FINAL_SEQUENCE),
        sigOpCount: 1
      }],
      outputs: [{
        amount: Number(effOutput),
        scriptPublicKey: {
          version: 0,
          scriptPublicKey: bytesToHex(Uint8Array.from([0x20, ...destScript.slice(1, 33), 0xac]))
        }
      }],
      lockTime: 0,
      subnetworkId: ZERO_SUBNETWORK_ID
    },
    allowOrphan: false
  };
}

async function submitOrDry(payload, id) {
  if (!shouldSubmit) return { status: "built-not-submitted" };
  const resp = await fetch("https://api-tn12.kaspa.org/transactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await resp.json().catch(() => resp.text());
  return {
    status: resp.status === 200 ? "unexpectedly-accepted" : "rejected-as-expected",
    httpStatus: resp.status,
    body,
    submittedAt: new Date().toISOString()
  };
}

const cases = [];

// ─── WRONG SELECTOR ──────────────────────────────────────────────────────────
// Vault: sign with correct vaultRecovery key but use OP_0 (withdrawal branch) → wrong branch, wrong key for that branch
{
  const op = vaultOutpoint;
  const w = wallets.vaultRecovery;
  const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
    outpoint: op,
    destinationXOnlyKey: w.xOnlyPublicKey
  });
  const sigBytes = sign({ signable, tx, privateKey: w.privateKey, scriptHash });
  const sigScript = buildSigScript({ sigBytes, selector: OP_0, redeemHex: op.redeemScriptHex });
  const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput, destScript });
  const txId = bytesToHex(hexToBytes(tx.id || "0000000000000000000000000000000000000000000000000000000000000000"));
  cases.push({
    id: "vault-wrong-selector",
    contract: "DelayedRecoveryVault",
    invalidation: "wrong-selector",
    correctSelector: "OP_1 (recover)",
    usedSelector: "OP_0 (withdraw branch)",
    signer: "vaultRecovery (correct key, wrong branch)",
    expectedFailure: "OP_0 dispatches to withdrawal branch which encodes vaultOwner key; checkSig fails",
    sourceOutpoint: `${op.txid}:${op.outputIndex}`,
    payload
  });
}

// Assurance: sign with correct pledgeRecipient key but use OP_1 (refund branch) → wrong branch
{
  const op = assuranceOutpoint;
  const w = wallets.pledgeRecipient;
  const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
    outpoint: op,
    destinationXOnlyKey: w.xOnlyPublicKey
  });
  const sigBytes = sign({ signable, tx, privateKey: w.privateKey, scriptHash });
  const sigScript = buildSigScript({ sigBytes, selector: OP_1, redeemHex: op.redeemScriptHex });
  const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput, destScript });
  cases.push({
    id: "assurance-wrong-selector",
    contract: "AssurancePledge",
    invalidation: "wrong-selector",
    correctSelector: "OP_0 (release)",
    usedSelector: "OP_1 (refund branch)",
    signer: "pledgeRecipient (correct key, wrong branch)",
    expectedFailure: "OP_1 dispatches to refund branch which encodes pledgeContributor key + time lock; fails both",
    sourceOutpoint: `${op.txid}:${op.outputIndex}`,
    payload
  });
}

// Escrow: sign with correct escrowBuyer key but use OP_1 (refund branch)
{
  const op = escrowOutpoint;
  const w = wallets.escrowBuyer;
  const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
    outpoint: op,
    destinationXOnlyKey: w.xOnlyPublicKey
  });
  const sigBytes = sign({ signable, tx, privateKey: w.privateKey, scriptHash });
  const sigScript = buildSigScript({ sigBytes, selector: OP_1, redeemHex: op.redeemScriptHex });
  const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput, destScript });
  cases.push({
    id: "escrow-wrong-selector",
    contract: "Escrow",
    invalidation: "wrong-selector",
    correctSelector: "OP_0 (release)",
    usedSelector: "OP_1 (refund branch)",
    signer: "escrowBuyer (correct key, wrong branch for time-lock check)",
    expectedFailure: "Refund branch requires DAA time lock; sequence/lockTime not set; script fails",
    sourceOutpoint: `${op.txid}:${op.outputIndex}`,
    payload
  });
}

// ─── WRONG OUTPUT LOCK ────────────────────────────────────────────────────────
// Vault: correct signer + selector, but output pays pledgeRecipient address instead of vaultRecovery
{
  const op = vaultOutpoint;
  const correctW = wallets.vaultRecovery;
  const wrongDestW = wallets.pledgeRecipient;
  const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
    outpoint: op,
    destinationXOnlyKey: wrongDestW.xOnlyPublicKey  // wrong destination
  });
  const sigBytes = sign({ signable, tx, privateKey: correctW.privateKey, scriptHash });
  const sigScript = buildSigScript({ sigBytes, selector: OP_1, redeemHex: op.redeemScriptHex });
  const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput, destScript });
  cases.push({
    id: "vault-wrong-output-lock",
    contract: "DelayedRecoveryVault",
    invalidation: "wrong-output-lock",
    correctOutput: `vaultRecovery address (${correctW.address?.slice(0, 30)}...)`,
    usedOutput: `pledgeRecipient address (${wrongDestW.address?.slice(0, 30)}...)`,
    signer: "vaultRecovery (correct)",
    selector: "OP_1 (correct)",
    expectedFailure: "Covenant enforces output[0] must pay vaultRecovery role; wrong address → script fails",
    sourceOutpoint: `${op.txid}:${op.outputIndex}`,
    payload
  });
}

// Assurance: correct signer + selector, but output pays pledgeContributor instead of pledgeRecipient
{
  const op = assuranceOutpoint;
  const correctW = wallets.pledgeRecipient;
  const wrongDestW = wallets.pledgeContributor;
  const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
    outpoint: op,
    destinationXOnlyKey: wrongDestW.xOnlyPublicKey
  });
  const sigBytes = sign({ signable, tx, privateKey: correctW.privateKey, scriptHash });
  const sigScript = buildSigScript({ sigBytes, selector: OP_0, redeemHex: op.redeemScriptHex });
  const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput, destScript });
  cases.push({
    id: "assurance-wrong-output-lock",
    contract: "AssurancePledge",
    invalidation: "wrong-output-lock",
    correctOutput: "pledgeRecipient address",
    usedOutput: "pledgeContributor address",
    signer: "pledgeRecipient (correct)",
    selector: "OP_0 (correct)",
    expectedFailure: "Covenant enforces output[0] must pay pledgeRecipient; wrong address → script fails",
    sourceOutpoint: `${op.txid}:${op.outputIndex}`,
    payload
  });
}

// Escrow: correct signer + selector, but output pays escrowBuyer instead of escrowSeller
{
  const op = escrowOutpoint;
  const correctW = wallets.escrowBuyer;
  const wrongDestW = wallets.escrowBuyer; // escrow release pays seller, so buyer as dest = wrong
  const sellerW = wallets.escrowSeller;
  const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
    outpoint: op,
    destinationXOnlyKey: wrongDestW.xOnlyPublicKey  // paying buyer instead of seller
  });
  const sigBytes = sign({ signable, tx, privateKey: correctW.privateKey, scriptHash });
  const sigScript = buildSigScript({ sigBytes, selector: OP_0, redeemHex: op.redeemScriptHex });
  const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput, destScript });
  cases.push({
    id: "escrow-wrong-output-lock",
    contract: "Escrow",
    invalidation: "wrong-output-lock",
    correctOutput: "escrowSeller address (release pays seller)",
    usedOutput: "escrowBuyer address",
    signer: "escrowBuyer (correct)",
    selector: "OP_0 (correct)",
    expectedFailure: "Covenant enforces output[0] must pay escrowSeller on release; wrong address → script fails",
    sourceOutpoint: `${op.txid}:${op.outputIndex}`,
    payload
  });
}

// ─── WRONG OUTPUT AMOUNT ──────────────────────────────────────────────────────
// All 3 contracts: correct signer + selector + address, but amount - 1 sompi
{
  const threeContracts = [
    { op: vaultOutpoint, signerW: wallets.vaultRecovery, selector: OP_1, id: "vault-wrong-amount", contract: "DelayedRecoveryVault", signerLabel: "vaultRecovery" },
    { op: assuranceOutpoint, signerW: wallets.pledgeRecipient, selector: OP_0, id: "assurance-wrong-amount", contract: "AssurancePledge", signerLabel: "pledgeRecipient" },
    { op: escrowOutpoint, signerW: wallets.escrowBuyer, selector: OP_0, id: "escrow-wrong-amount", contract: "Escrow", signerLabel: "escrowBuyer" }
  ];
  for (const { op, signerW, selector, id, contract, signerLabel } of threeContracts) {
    const inputSompi = BigInt(op.amountSompi);
    const correctOutput = inputSompi - CONTRACT_FEE;
    const wrongOutput = correctOutput - 1n;  // 1 sompi short
    const { tx, signable, scriptHash, effOutput, destScript } = buildSpend({
      outpoint: op,
      outputSompi: wrongOutput,
      destinationXOnlyKey: signerW.xOnlyPublicKey
    });
    const sigBytes = sign({ signable, tx, privateKey: signerW.privateKey, scriptHash });
    const sigScript = buildSigScript({ sigBytes, selector, redeemHex: op.redeemScriptHex });
    const payload = buildSubmitPayload({ outpoint: op, sigScript, tx, effOutput: wrongOutput, destScript });
    cases.push({
      id,
      contract,
      invalidation: "wrong-output-amount",
      correctAmount: String(correctOutput),
      usedAmount: String(wrongOutput),
      signer: `${signerLabel} (correct)`,
      expectedFailure: "Covenant enforces output amount = input - minerFee; 1-sompi deficit → script fails",
      sourceOutpoint: `${op.txid}:${op.outputIndex}`,
      payload
    });
  }
}

// ─── Submit / dry-run ─────────────────────────────────────────────────────────
const results = [];
for (const c of cases) {
  const result = await submitOrDry(c.payload, c.id);
  const artifact = {
    schema: "tn12-adversarial-invalid-spend/v1",
    network: "kaspa-testnet-12",
    generatedAt: new Date().toISOString(),
    ...c,
    submissionResult: shouldSubmit ? result : undefined,
    status: shouldSubmit ? result.status : "built-not-submitted"
  };
  const path = `${outDir}/${c.id}.json`;
  await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`);
  results.push({ id: c.id, status: artifact.status, httpStatus: result.httpStatus });
  console.log(`${c.id}: ${artifact.status}${result.httpStatus ? ` (HTTP ${result.httpStatus})` : ""}`);
}

// Update summary
const existingSummary = JSON.parse(await readFile(`${outDir}/adversarial-summary.json`, "utf8"));
const allCases = [...existingSummary.cases, ...results];
const updated = {
  ...existingSummary,
  updatedAt: new Date().toISOString(),
  submitted: shouldSubmit || existingSummary.submitted,
  cases: allCases
};
await writeFile(`${outDir}/adversarial-summary.json`, `${JSON.stringify(updated, null, 2)}\n`);
console.log(`\nTotal cases in summary: ${allCases.length}`);
console.log(`This run: ${cases.length} new cases, submitted: ${shouldSubmit}`);
