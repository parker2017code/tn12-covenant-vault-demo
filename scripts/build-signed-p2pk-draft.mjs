import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  Address,
  PrivateKey,
  ScriptPublicKey,
  createTransaction,
  signTransaction
} from "kaspa-wasm";

const SOMPI_PER_TKAS = 100000000n;
const fundingOutpointPath = process.env.FUNDING_OUTPOINT || "fixtures/FundedWalletOutpoint.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/self-send-p2pk.json";
const amountTkas = Number(process.env.AMOUNT_TKAS || "1");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");
const amountSompi = BigInt(Math.round(amountTkas * Number(SOMPI_PER_TKAS)));

const funding = JSON.parse(await readFile(fundingOutpointPath, "utf8"));
const wallet = JSON.parse(await readFile(walletPath, "utf8"));

if (wallet.address !== funding.address || !wallet.address.startsWith("kaspatest:")) {
  throw new Error("Wallet and funding outpoint must use the same TN12 kaspatest: address.");
}

const address = new Address(wallet.address);
const source = [buildUtxoSource(funding)];
const tx = createTransaction(
  source,
  [{ address: wallet.address, amount: amountSompi }],
  address,
  minerFeeSompi,
  "",
  1,
  1
);
const scriptHashes = tx.getScriptHashes();
const signed = signTransaction(tx, [new PrivateKey(wallet.privateKey)], true);
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
    to: wallet.address,
    amountTkas,
    amountSompi: amountSompi.toString(),
    minerFeeSompi: minerFeeSompi.toString()
  },
  scriptHashes,
  transactionId: signedJson.tx?.id || signedJson.tx?.inner?.id || null,
  signedTransaction: signedJson
};

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`transactionId=${artifact.transactionId}`);

function buildUtxoSource(funding) {
  const raw = funding.raw;
  const scriptHex = raw.utxoEntry.scriptPublicKey.scriptPublicKey;

  return {
    address: new Address(funding.address),
    outpoint: raw.outpoint,
    utxoEntry: {
      amount: BigInt(raw.utxoEntry.amount),
      scriptPublicKey: new ScriptPublicKey(0, hexToBytes(scriptHex)),
      blockDaaScore: BigInt(raw.utxoEntry.blockDaaScore),
      isCoinbase: raw.utxoEntry.isCoinbase
    }
  };
}

function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/../g).map((chunk) => Number.parseInt(chunk, 16)));
}

function parsePossiblyNestedJson(value) {
  let parsed = JSON.parse(value);
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  return parsed;
}
