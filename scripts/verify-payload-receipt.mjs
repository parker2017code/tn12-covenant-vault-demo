import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  TN12_TRANSACTION_ENDPOINT,
  buildPayloadReceiptEvidence
} from "../src/payloadReceiptVerifier.mjs";

const artifactPath = process.env.PAYLOAD_DRAFT || "artifacts/signed-drafts/payload-receipt-self-send.json";
const outPath = process.env.OUT || "artifacts/payload-receipt-evidence.json";
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const txid = process.env.PAYLOAD_TXID || artifact.transactionId;

if (!txid) {
  throw new Error("Payload receipt txid is missing.");
}

const tx = await fetchTransaction(txid);
const evidence = buildPayloadReceiptEvidence({ artifact, tx, txid });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(evidence, null, 2)}\n`);

if (evidence.status !== "accepted-payload-receipt-matched") {
  throw new Error(`Payload receipt evidence is ${evidence.status}.`);
}

console.log(outPath);
console.log(`txid=${evidence.txid}`);
console.log(`payloadBytes=${evidence.payload.bytes}`);
console.log(`status=${evidence.status}`);

async function fetchTransaction(txid) {
  const response = await fetch(`${TN12_TRANSACTION_ENDPOINT}/${txid}`);
  if (!response.ok) {
    throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
