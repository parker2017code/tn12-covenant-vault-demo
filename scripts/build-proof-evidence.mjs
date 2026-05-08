import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildProofEvidence } from "../src/proofEvidence.mjs";

const fixturePath = process.env.PROOF_FIXTURE || "fixtures/AcceptedProofTransactions.json";
const outPath = process.env.OUT || "artifacts/proof-evidence.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";
const proofFixture = JSON.parse(await readFile(fixturePath, "utf8"));
const transactions = {};
const previousTransactions = {};

for (const proof of proofFixture.transactions) {
  const tx = await fetchTransaction(proof.txid);
  transactions[proof.txid] = tx;
  for (const input of tx.inputs || []) {
    if (!previousTransactions[input.previous_outpoint_hash]) {
      previousTransactions[input.previous_outpoint_hash] = await fetchTransaction(input.previous_outpoint_hash);
    }
  }
}

const evidence = buildProofEvidence({ proofFixture, transactions, previousTransactions });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(outPath);
console.log(`accepted=${evidence.summary.accepted}/${evidence.summary.total}`);
console.log(`p2shInputs=${evidence.summary.p2shInputs}/${evidence.summary.total}`);
console.log(`matchedInputs=${evidence.summary.matchedInputs}/${evidence.summary.total}`);
console.log(`p2pkOutputs=${evidence.summary.p2pkOutputs}/${evidence.summary.total}`);

async function fetchTransaction(txid) {
  const response = await fetch(`${endpointBase}/${txid}`);
  if (!response.ok) {
    throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
