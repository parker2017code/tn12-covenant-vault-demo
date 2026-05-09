import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  DEFAULT_TN12_TRANSACTION_ENDPOINT,
  buildCheckpointedAcceptedIndex
} from "../src/checkpointedIndexer.mjs";

const proofFixturePath = process.env.PROOF_FIXTURE || "fixtures/AcceptedProofTransactions.json";
const payloadManifestPath = process.env.PAYLOAD_EVENT_MANIFEST || "fixtures/PayloadEventEvidence.json";
const outputManifestPath = process.env.OUTPUT_EVENT_MANIFEST || "fixtures/AcceptedOutputEvidence.json";
const outPath = process.env.OUT || "artifacts/checkpointed-accepted-index.json";

const proofFixture = JSON.parse(await readFile(proofFixturePath, "utf8"));
const payloadManifest = JSON.parse(await readFile(payloadManifestPath, "utf8"));
const outputManifest = JSON.parse(await readFile(outputManifestPath, "utf8"));
const proofTransactions = {};
const payloadArtifacts = {};
const payloadTransactions = {};
const outputTransactions = {};

for (const proof of proofFixture.transactions || []) {
  proofTransactions[proof.txid] = await fetchTransaction(proof.txid);
}

for (const event of payloadManifest.events || []) {
  const artifact = JSON.parse(await readFile(event.draftPath, "utf8"));
  payloadArtifacts[event.draftPath] = artifact;
  payloadTransactions[artifact.transactionId] = await fetchTransaction(artifact.transactionId);
}

for (const output of outputManifest.outputs || []) {
  outputTransactions[output.txid] ||= await fetchTransaction(output.txid);
}

const index = buildCheckpointedAcceptedIndex({
  proofFixture,
  proofTransactions,
  payloadManifest,
  payloadArtifacts,
  payloadTransactions,
  outputManifest,
  outputTransactions
});

await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
await writeFile(outPath, `${JSON.stringify(index, null, 2)}\n`);

if (index.summary.mismatches > 0) {
  throw new Error(`Checkpointed index has ${index.summary.mismatches} mismatched records.`);
}

console.log(outPath);
console.log(`records=${index.summary.total}`);
console.log(`proofs=${index.summary.proofs}`);
console.log(`payloadEvents=${index.summary.payloadEvents}`);
console.log(`outputEvidence=${index.summary.outputEvidence}`);
console.log(`maxBlueScore=${index.checkpoint.maxAcceptingBlockBlueScore}`);

async function fetchTransaction(txid) {
  const response = await fetch(`${DEFAULT_TN12_TRANSACTION_ENDPOINT}/${txid}`);
  if (!response.ok) {
    throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
