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
  let evidence;

  try {
    const tx = await fetchTransaction(txid);
    evidence = buildPayloadReceiptEvidence({ artifact, tx, txid });
    await writeFile(event.outPath, `${JSON.stringify(evidence, null, 2)}\n`);
  } catch (error) {
    evidence = await readStoredEvidence(event.outPath, txid, error);
  }

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

async function readStoredEvidence(outPath, txid, cause) {
  let evidence;

  try {
    evidence = JSON.parse(await readFile(outPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Transaction fetch failed for ${txid}: ${cause.message}; stored evidence unavailable at ${outPath}: ${error.message}`
    );
  }

  if (evidence.txid !== txid) {
    throw new Error(`Stored payload event evidence txid mismatch for ${txid}: found ${evidence.txid}`);
  }

  if (evidence.status !== "accepted-payload-receipt-matched") {
    throw new Error(`Stored payload event evidence is not accepted for ${txid}: ${evidence.status}`);
  }

  console.warn(`Using stored payload event evidence for ${txid}; live transaction endpoint failed with: ${cause.message}`);
  return evidence;
}
