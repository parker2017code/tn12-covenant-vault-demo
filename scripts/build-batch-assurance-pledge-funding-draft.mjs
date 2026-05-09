import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import {
  Address,
  Keypair,
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
const sourcePath = process.env.BATCH_PLEDGE_FUNDING_SOURCE || "fixtures/FundedWalletOutpoint.json";
const requirementsPath = process.env.CUSTODY_REQUIREMENTS || "artifacts/batch-assurance-custody-requirements.json";
const localWalletsPath = process.env.BATCH_PLEDGE_WALLETS || ".local/tn12-batch-pledge-wallets.json";
const publicWalletsPath = process.env.BATCH_PLEDGE_PUBLIC_WALLETS || "fixtures/BatchAssurancePledgeWallets.public.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/batch-assurance-pledge-funding.json";
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");

const funding = await readJson(sourcePath);
const sourceWallet = await readJson(".local/tn12-wallet.json");
const requirements = await readJson(requirementsPath);
const requiredOutputs = requirements.requirements || [];
const pledgeWallets = await loadOrCreatePledgeWallets(requiredOutputs);

if (sourceWallet.address !== funding.address || !sourceWallet.address.startsWith("kaspatest:")) {
  throw new Error("Wallet and funding outpoint must use the same TN12 kaspatest: address.");
}
if (requiredOutputs.length === 0) {
  throw new Error("No batch-assurance custody requirements found.");
}

const fundingSompi = BigInt(funding.raw.utxoEntry.amount);
const outputSpecs = requiredOutputs.map((requirement) => {
  const pledgeWallet = pledgeWallets.wallets.find((wallet) => wallet.pledgeId === requirement.pledgeId);
  if (!pledgeWallet) {
    throw new Error(`Missing generated pledge wallet for ${requirement.pledgeId}.`);
  }

  return {
    pledgeId: requirement.pledgeId,
    contributor: requirement.contributor,
    amountSompi: BigInt(requirement.required.amountSompi),
    amountTkas: requirement.required.amountTkas,
    address: pledgeWallet.address,
    scriptPublicKey: p2pkScriptFromXOnly(pledgeWallet.xOnlyPublicKey),
    scriptType: "p2pk"
  };
});
const changeSompi = fundingSompi - outputSpecs.reduce((sum, output) => sum + output.amountSompi, 0n) - minerFeeSompi;

if (changeSompi <= 0n) {
  throw new Error(`Pledge outputs plus miner fee exceed the fetched UTXO. Current fixture has ${sompiToTkas(fundingSompi)} TKAS.`);
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
const signed = signTransaction(signable, [new PrivateKey(sourceWallet.privateKey)], true);
const signedTransaction = parsePossiblyNestedJson(signed.toString());
const artifact = {
  schema: "tn12-batch-assurance-pledge-funding-draft/v1",
  network: "kaspa-testnet-12",
  status: "signed-not-broadcast",
  lane: "batch-assurance-pledge-custody-funding",
  warning: "This draft creates amount-matched TN12 P2PK pledge outputs for custody import review. It is not submitted and is not pooled covenant settlement.",
  source: {
    address: funding.address,
    txid: funding.txid,
    outputIndex: funding.outputIndex,
    amountTkas: funding.amountTkas
  },
  campaign: requirements.campaign,
  outputs: [
    ...outputSpecs.map((output, index) => ({
      index,
      pledgeId: output.pledgeId,
      contributor: output.contributor,
      address: output.address,
      amountTkas: output.amountTkas,
      amountSompi: output.amountSompi.toString(),
      scriptType: output.scriptType,
      importTarget: {
        fixturePath: "fixtures/BatchAssuranceCustodyImports.json",
        outpointIndex: index,
        acceptedEvidenceTxid: "fill-after-submit"
      }
    })),
    {
      index: outputSpecs.length,
      label: "change",
      address: sourceWallet.address,
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
    "Review and submit this draft explicitly; it is not auto-broadcast.",
    "Fetch the accepted transaction and import outputs 0, 1, and 2 into fixtures/BatchAssuranceCustodyImports.json.",
    "Rerun npm run campaign:custody-imports and only then rebuild custody settlement drafts."
  ],
  boundaries: [
    "Generated pledge private keys are stored only in .local/tn12-batch-pledge-wallets.json and are testnet-only.",
    "These are amount-matched P2PK pledge outputs, not pooled covenant enforcement.",
    "This draft does not mutate the campaign fixture or mark custody ready."
  ]
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} transactionId=${artifact.transactionId}`);
console.log(`pledgeOutputs=${outputSpecs.length}`);
console.log(`changeTkas=${artifact.outputs.at(-1).amountTkas}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function loadOrCreatePledgeWallets(requirementsList) {
  let existing = null;
  try {
    existing = await readJson(localWalletsPath);
  } catch {
    existing = null;
  }

  const requiredIds = new Set(requirementsList.map((requirement) => requirement.pledgeId));
  const existingWallets = existing?.wallets || [];
  const hasEveryWallet = [...requiredIds].every((pledgeId) =>
    existingWallets.some((wallet) => wallet.pledgeId === pledgeId && wallet.privateKey && wallet.address && wallet.xOnlyPublicKey)
  );

  if (hasEveryWallet) {
    const selected = existingWallets.filter((wallet) => requiredIds.has(wallet.pledgeId));
    await writePublicWallets(selected);
    return {
      ...existing,
      wallets: selected
    };
  }

  const wallets = requirementsList.map((requirement) => {
    const keypair = Keypair.random();
    const parsed = JSON.parse(keypair.toString());
    return {
      pledgeId: requirement.pledgeId,
      contributor: requirement.contributor,
      address: String(keypair.toAddress("testnet")),
      publicKey: parsed.publicKey,
      xOnlyPublicKey: parsed.xOnlyPublicKey,
      privateKey: String(keypair.privateKey),
      network: "kaspa-testnet-12"
    };
  });
  const artifact = {
    schema: "tn12-batch-assurance-pledge-wallets-local/v1",
    network: "kaspa-testnet-12",
    status: "testnet-wallets-generated",
    warning: "TESTNET ONLY. Do not commit this file. These keys are for amount-matched TN12 pledge-output experiments.",
    wallets
  };

  await mkdir(localWalletsPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  await writeFile(localWalletsPath, `${JSON.stringify(artifact, null, 2)}\n`, { mode: 0o600 });
  await chmod(localWalletsPath, 0o600);
  await writePublicWallets(wallets);
  return artifact;
}

async function writePublicWallets(wallets) {
  const publicArtifact = {
    schema: "tn12-batch-assurance-pledge-wallets-public/v1",
    network: "kaspa-testnet-12",
    status: "public-pledge-wallet-metadata",
    warning: "Public metadata only. Private keys live in .local/tn12-batch-pledge-wallets.json and must not be committed.",
    wallets: wallets.map((wallet) => ({
      pledgeId: wallet.pledgeId,
      contributor: wallet.contributor,
      address: wallet.address,
      publicKey: wallet.publicKey,
      xOnlyPublicKey: wallet.xOnlyPublicKey,
      network: wallet.network
    }))
  };
  await mkdir(publicWalletsPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  await writeFile(publicWalletsPath, `${JSON.stringify(publicArtifact, null, 2)}\n`);
}

function p2pkScriptFromXOnly(xOnlyPublicKey) {
  const keyBytes = hexToBytes(xOnlyPublicKey);
  if (keyBytes.length !== 32) {
    throw new Error("Expected a 32-byte x-only public key for P2PK pledge output.");
  }
  return new ScriptPublicKey(0, Uint8Array.from([0x20, ...keyBytes, 0xac]));
}

function scriptPublicKeyFromHex(hex) {
  return new ScriptPublicKey(0, hexToBytes(hex));
}

function hexToBytes(hex) {
  const clean = String(hex || "");
  if (!/^[0-9a-f]*$/i.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Expected even-length hex.");
  }
  return Uint8Array.from(clean.match(/../g)?.map((chunk) => Number.parseInt(chunk, 16)) || []);
}

function sompiToTkas(sompi) {
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}
