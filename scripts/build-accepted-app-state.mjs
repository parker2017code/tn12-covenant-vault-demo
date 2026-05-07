import { readFile, writeFile } from "node:fs/promises";
import {
  TN12_TRANSACTION_ENDPOINT,
  buildAcceptedAppState
} from "../src/acceptedIndexer.mjs";

const proofFixture = JSON.parse(await readFile("fixtures/AcceptedProofTransactions.json", "utf8"));
const transactions = {};

for (const proof of proofFixture.transactions) {
  transactions[proof.txid] = await fetchTransaction(proof.txid);
}

const state = buildAcceptedAppState({ proofFixture, transactions });
await writeFile("fixtures/AcceptedAppState.json", `${JSON.stringify(state, null, 2)}\n`);

if (state.summary.mismatches > 0) {
  throw new Error(`Accepted app state has ${state.summary.mismatches} mismatched records.`);
}

console.log(JSON.stringify({
  schema: state.schema,
  network: state.network,
  records: state.summary.total,
  accepted: state.summary.accepted,
  matched: state.summary.matched,
  outFile: "fixtures/AcceptedAppState.json"
}, null, 2));

async function fetchTransaction(txid) {
  const response = await fetch(`${TN12_TRANSACTION_ENDPOINT}/${txid}`);
  if (!response.ok) {
    throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
