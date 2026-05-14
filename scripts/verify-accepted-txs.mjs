import { readFile } from "node:fs/promises";
import { buildAcceptedAppState } from "../src/acceptedIndexer.mjs";

const fixturePath = process.env.PROOF_FIXTURE || "fixtures/AcceptedProofTransactions.json";
const storedEvidencePath = process.env.PROOF_EVIDENCE || defaultEvidencePath(fixturePath);
const proofFixture = JSON.parse(await readFile(fixturePath, "utf8"));
let storedEvidence = null;
const proofTransactions = proofFixture.transactions.map((item) => ({
  label: item.label,
  txid: item.txid,
  expectedOutputs: [
    {
      index: 0,
      amountSompi: String(item.amountSompi),
      address: item.destination,
      type: "pubkey"
    }
  ]
}));

const transactions = {};

for (const proof of proofTransactions) {
  const tx = await fetchTransaction(proof.txid);
  transactions[proof.txid] = tx;
  if (!tx.is_accepted) {
    throw new Error(`${proof.label} ${proof.txid} is not accepted.`);
  }

  for (const expected of proof.expectedOutputs) {
    const output = tx.outputs.find((item) => Number(item.index) === expected.index);
    if (!output) {
      throw new Error(`${proof.label} is missing output ${expected.index}.`);
    }
    if (String(output.amount) !== expected.amountSompi) {
      throw new Error(`${proof.label} output ${expected.index} amount mismatch.`);
    }
    if (output.script_public_key_address !== expected.address) {
      throw new Error(`${proof.label} output ${expected.index} address mismatch.`);
    }
    if (output.script_public_key_type !== expected.type) {
      throw new Error(`${proof.label} output ${expected.index} type mismatch.`);
    }
  }
}

const state = buildAcceptedAppState({ proofFixture, transactions });

console.log(JSON.stringify({
  schema: "tn12-proof-transaction-verification/v1",
  network: "kaspa-testnet-12",
  verifiedAt: new Date().toISOString(),
  fixture: fixturePath,
  endpointBase: "https://api-tn12.kaspa.org/transactions",
  summary: state.summary,
  results: state.records.map((record) => ({
    label: record.label,
    txid: record.txid,
    accepted: record.accepted,
    acceptingBlockTime: record.acceptingBlockTime,
    acceptingBlockBlueScore: record.acceptingBlockBlueScore,
    outputs: [
      {
        index: record.expected.outputIndex,
        amountSompi: String(record.expected.amountSompi),
        address: record.expected.destination,
        type: record.expected.type
      }
    ]
  }))
}, null, 2));

async function fetchTransaction(txid) {
  try {
    const response = await fetch(`https://api-tn12.kaspa.org/transactions/${txid}`);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    const tx = await storedTransaction(txid);
    if (!tx) {
      throw new Error(`Transaction fetch failed for ${txid}: ${error.message}`);
    }
    console.warn(`Using stored TN12 evidence for ${txid}; live transaction endpoint returned ${error.message}.`);
    return tx;
  }
}

async function storedTransaction(txid) {
  storedEvidence ||= JSON.parse(await readFile(storedEvidencePath, "utf8"));
  const record = storedEvidence.proofs?.find((proof) => proof.txid === txid);
  if (!record?.accepted || !record.output) return null;

  return {
    is_accepted: true,
    accepting_block_blue_score: record.acceptingBlockBlueScore,
    accepting_block_time: record.acceptingBlockTime,
    outputs: [
      {
        index: record.output.index,
        amount: String(record.output.amount),
        script_public_key_address: record.output.address,
        script_public_key_type: record.output.type
      }
    ]
  };
}

function defaultEvidencePath(path) {
  return path.includes("RoleSeparated")
    ? "artifacts/role-separated-proof-evidence.json"
    : "artifacts/proof-evidence.json";
}
