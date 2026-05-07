import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  TN12_TRANSACTION_ENDPOINT,
  buildPayloadReceiptEvidence
} from "../src/payloadReceiptVerifier.mjs";

const manifestPath = process.env.PAYLOAD_EVENT_MANIFEST || "fixtures/PayloadEventEvidence.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const events = manifest.events || [];

await mkdir("artifacts", { recursive: true });

const results = [];
for (const event of events) {
  const artifact = JSON.parse(await readFile(event.draftPath, "utf8"));
  const txid = artifact.transactionId;
  const tx = await fetchTransaction(txid);
  const evidence = buildPayloadReceiptEvidence({ artifact, tx, txid });
  await writeFile(event.outPath, `${JSON.stringify(evidence, null, 2)}\n`);
  results.push(evidence);
}

const failed = results.filter((evidence) => evidence.status !== "accepted-payload-receipt-matched");
if (failed.length) {
  throw new Error(`Payload event verification failed for ${failed.map((evidence) => evidence.txid).join(", ")}`);
}

console.log(`payloadEvents=${results.length}`);
for (const evidence of results) {
  console.log(`${evidence.txid} ${evidence.payload.decoded.payload.subject}=${evidence.payload.decoded.payload.value}`);
}

async function fetchTransaction(txid) {
  const response = await fetch(`${TN12_TRANSACTION_ENDPOINT}/${txid}`);
  if (!response.ok) {
    throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
