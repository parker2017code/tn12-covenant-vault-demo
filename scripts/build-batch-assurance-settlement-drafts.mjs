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

const localWalletsPath = process.env.BATCH_PLEDGE_WALLETS || ".local/tn12-batch-pledge-wallets.json";
const publicWalletsPath = process.env.BATCH_PLEDGE_PUBLIC_WALLETS || "fixtures/BatchAssurancePledgeWallets.public.json";
const savedWalletPublicPath = process.env.SAVED_WALLET_PUBLIC || "fixtures/SavedWallet.public.json";
const custodyPath = process.env.BATCH_CUSTODY_DRAFTS || "artifacts/batch-assurance-custody-drafts.json";
const outputEvidencePath = process.env.OUTPUT_EVIDENCE || "fixtures/AcceptedOutputEvidence.json";
const outDir = process.env.OUT_DIR || "artifacts/signed-drafts";
const summaryPath = process.env.OUT || "artifacts/batch-assurance-settlement-drafts.json";

const localWallets = await readJson(localWalletsPath);
const publicWallets = await readJson(publicWalletsPath);
const savedWalletPublic = await readJson(savedWalletPublicPath);
const custodyDrafts = await readJson(custodyPath);
const outputEvidence = await readJson(outputEvidencePath);

const walletByPledge = new Map((localWallets.wallets || []).map((wallet) => [wallet.pledgeId, wallet]));
const publicWalletByPledge = new Map((publicWallets.wallets || []).map((wallet) => [wallet.pledgeId, wallet]));
const evidenceByOutpoint = new Map((outputEvidence.outputs || []).map((output) => [
  outpointKey({ txid: output.txid, index: output.outputIndex }),
  output
]));

if (custodyDrafts.status !== "custody-release-draft-ready") {
  throw new Error(`Batch custody drafts are not ready: ${custodyDrafts.status}`);
}

const releaseArtifact = buildReleaseArtifact();
const refundArtifacts = custodyDrafts.refundDrafts.map((refund) => buildRefundArtifact(refund));

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/batch-assurance-release.json`, `${JSON.stringify(releaseArtifact, null, 2)}\n`);
for (const artifact of refundArtifacts) {
  await writeFile(`${outDir}/batch-assurance-refund-${artifact.pledgeId}.json`, `${JSON.stringify(artifact, null, 2)}\n`);
}

const summary = {
  schema: "tn12-batch-assurance-settlement-drafts/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  campaign: custodyDrafts.campaign,
  release: summarizeDraft(releaseArtifact, `${outDir}/batch-assurance-release.json`),
  refunds: refundArtifacts.map((artifact) => summarizeDraft(artifact, `${outDir}/batch-assurance-refund-${artifact.pledgeId}.json`)),
  boundaries: [
    "These drafts spend accepted P2PK pledge outputs, not pooled covenant aggregation.",
    "Release and refund paths are mutually exclusive for the same pledge outputs.",
    "Do not submit more than one mutually exclusive settlement path.",
    "Generated pledge private keys stay in .local and are testnet-only."
  ],
  next: "Review one settlement path, then submit explicitly only if the mutually exclusive consequences are intended."
};
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(summaryPath);
console.log(`status=${summary.status}`);
console.log(`releaseTx=${releaseArtifact.transactionId}`);
console.log(`refunds=${refundArtifacts.length}`);

function buildReleaseArtifact() {
  const inputs = custodyDrafts.releaseDraft.inputs;
  const output = custodyDrafts.releaseDraft.output;
  const signedTransaction = signP2pkTransaction({
    inputs,
    outputs: [{
      address: output.address,
      amountSompi: output.amountSompi
    }]
  });

  return settlementArtifact({
    kind: "release",
    status: "signed-not-broadcast",
    inputs,
    outputs: [{
      address: output.address,
      amountSompi: output.amountSompi,
      amountTkas: output.amountTkas,
      role: "recipient"
    }],
    signedTransaction
  });
}

function buildRefundArtifact(refund) {
  const input = refund.input;
  const output = refund.output;
  const signedTransaction = signP2pkTransaction({
    inputs: [input],
    outputs: [{
      address: output.address,
      amountSompi: output.amountSompi
    }]
  });

  return settlementArtifact({
    kind: "refund",
    pledgeId: refund.pledgeId,
    status: "signed-not-broadcast",
    inputs: [input],
    outputs: [{
      address: output.address,
      amountSompi: output.amountSompi,
      amountTkas: output.amountTkas,
      role: "refund"
    }],
    signedTransaction
  });
}

function signP2pkTransaction({ inputs, outputs }) {
  const entries = new UtxoEntries(inputs.map((input) => {
    const wallet = requireWallet(input.pledgeId);
    const evidence = requireEvidence(input);
    return {
      address: new Address(wallet.address),
      outpoint: {
        transactionId: input.txid,
        index: input.outputIndex
      },
      utxoEntry: {
        amount: BigInt(input.amountSompi),
        scriptPublicKey: p2pkScriptFromXOnly(wallet.xOnlyPublicKey),
        blockDaaScore: BigInt(evidence.acceptingBlockBlueScore || 0),
        isCoinbase: false
      }
    };
  }));
  const tx = new Transaction({
    version: 0,
    inputs: inputs.map((input) => new TransactionInput({
      previousOutpoint: {
        transactionId: input.txid,
        index: input.outputIndex
      },
      signatureScript: [],
      sequence: 0n,
      sigOpCount: 1
    })),
    outputs: outputs.map((output) =>
      new TransactionOutput(BigInt(output.amountSompi), p2pkScriptFromAddress(output.address))
    ),
    lockTime: 0n,
    subnetworkId: "0000000000000000000000000000000000000000",
    gas: 0n,
    payload: ""
  });
  tx.finalize();

  const keys = inputs.map((input) => new PrivateKey(requireWallet(input.pledgeId).privateKey));
  return parsePossiblyNestedJson(signTransaction(new SignableTransaction(tx, entries), keys, true).toString());
}

function settlementArtifact({
  kind,
  pledgeId = null,
  status,
  inputs,
  outputs,
  signedTransaction
}) {
  return {
    schema: "tn12-batch-assurance-settlement-draft/v1",
    network: "kaspa-testnet-12",
    status,
    kind,
    pledgeId,
    campaign: custodyDrafts.campaign,
    inputs: inputs.map((input) => ({
      pledgeId: input.pledgeId,
      outpoint: {
        txid: input.txid,
        index: input.outputIndex
      },
      amountSompi: input.amountSompi,
      amountTkas: input.amountTkas
    })),
    outputs,
    transactionId: signedTransaction.tx?.id || signedTransaction.tx?.inner?.id || null,
    submitPayload: buildSubmitPayload(signedTransaction),
    signedTransaction,
    warning: "Review only. Do not submit alongside a mutually exclusive settlement draft for the same pledge outputs.",
    boundaries: [
      "This is a P2PK settlement draft from accepted pledge outputs.",
      "It is not pooled covenant target aggregation.",
      "It does not prove mainnet readiness or wallet connector readiness."
    ]
  };
}

function summarizeDraft(artifact, path) {
  return {
    kind: artifact.kind,
    pledgeId: artifact.pledgeId,
    path,
    transactionId: artifact.transactionId,
    inputCount: artifact.inputs.length,
    outputCount: artifact.outputs.length,
    outputTkas: artifact.outputs.map((output) => output.amountTkas),
    status: artifact.status
  };
}

function requireWallet(pledgeId) {
  const wallet = walletByPledge.get(pledgeId);
  const publicWallet = publicWalletByPledge.get(pledgeId);
  if (!wallet?.privateKey || !publicWallet || wallet.address !== publicWallet.address) {
    throw new Error(`Missing matching local/public pledge wallet for ${pledgeId}.`);
  }
  return wallet;
}

function requireEvidence(input) {
  const evidence = evidenceByOutpoint.get(outpointKey({ txid: input.txid, index: input.outputIndex }));
  if (!evidence) {
    throw new Error(`Missing accepted output evidence for ${input.txid}:${input.outputIndex}.`);
  }
  return evidence;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function p2pkScriptFromAddress(address) {
  const publicWallet = [...publicWalletByPledge.values()].find((wallet) => wallet.address === address);
  if (publicWallet) return p2pkScriptFromXOnly(publicWallet.xOnlyPublicKey);
  if (savedWalletPublic.address === address) {
    return p2pkScriptFromXOnly(savedWalletPublic.xOnlyPublicKey);
  }
  throw new Error(`No public key metadata for output address ${address}.`);
}

function p2pkScriptFromXOnly(xOnlyPublicKey) {
  const keyBytes = hexToBytes(xOnlyPublicKey);
  if (keyBytes.length !== 32) throw new Error("Expected a 32-byte x-only public key for P2PK output.");
  return new ScriptPublicKey(0, Uint8Array.from([0x20, ...keyBytes, 0xac]));
}

function hexToBytes(hex) {
  const clean = String(hex || "");
  if (!/^[0-9a-f]*$/i.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Expected even-length hex.");
  }
  return Uint8Array.from(clean.match(/../g)?.map((chunk) => Number.parseInt(chunk, 16)) || []);
}

function outpointKey(outpoint = {}) {
  return `${outpoint.txid || ""}:${Number(outpoint.index || 0)}`;
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  return parsed;
}
