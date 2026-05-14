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
let storedIndex = null;

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
  try {
    const response = await fetch(`${DEFAULT_TN12_TRANSACTION_ENDPOINT}/${txid}`);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    const tx = await storedTransaction(txid);
    if (!tx) {
      throw new Error(`Transaction fetch failed for ${txid}: ${error.message}`);
    }
    console.warn(`Using stored checkpoint evidence for ${txid}; live transaction endpoint returned ${error.message}.`);
    return tx;
  }
}

async function storedTransaction(txid) {
  storedIndex ||= JSON.parse(await readFile(outPath, "utf8"));
  const record = storedIndex.records?.find((item) => item.txid === txid);
  if (!record?.accepted || !record.matched) return null;
  const observed = record.observed || record.output?.observed;
  if (!observed) return null;

  return {
    is_accepted: true,
    accepting_block_blue_score: record.acceptingBlockBlueScore,
    accepting_block_time: record.acceptingBlockTime,
    payload: record.payload?.observedHex || "",
    outputs: [
      {
        index: observed.outputIndex,
        amount: String(observed.amountSompi),
        script_public_key_address: observed.destination,
        script_public_key_type: observed.type
      }
    ]
  };
}
