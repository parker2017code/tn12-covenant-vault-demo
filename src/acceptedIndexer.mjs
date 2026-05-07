import { decodeSignalPayload } from "./signalPayload.mjs";

export const TN12_TRANSACTION_ENDPOINT = "https://api-tn12.kaspa.org/transactions";

export function buildAcceptedAppState({ proofFixture, transactions, fetchedAt = new Date().toISOString() }) {
  const records = proofFixture.transactions.map((proof) => {
    const tx = transactions[proof.txid];
    const expectedOutput = tx?.outputs?.find((output) => Number(output.index) === 0);
    const amountMatches = expectedOutput && String(expectedOutput.amount) === proof.amountSompi;
    const addressMatches = expectedOutput?.script_public_key_address === proof.destination;
    const typeMatches = expectedOutput?.script_public_key_type === "pubkey";
    const accepted = Boolean(tx?.is_accepted);
    const outputMatches = Boolean(amountMatches && addressMatches && typeMatches);
    const receipt = decodeSignalPayload(tx?.payload);

    return {
      id: `${proof.lane}:${proof.entrypoint}:${proof.txid}`,
      lane: proof.lane,
      label: proof.label,
      entrypoint: proof.entrypoint,
      txid: proof.txid,
      status: accepted && outputMatches ? "accepted-output-matched" : "mismatch-or-not-accepted",
      accepted,
      outputMatches,
      acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null,
      acceptingBlockTime: tx?.accepting_block_time ?? null,
      expected: {
        outputIndex: 0,
        amountSompi: proof.amountSompi,
        destination: proof.destination,
        type: "pubkey"
      },
      observed: expectedOutput
        ? {
            outputIndex: Number(expectedOutput.index),
            amountSompi: String(expectedOutput.amount),
            destination: expectedOutput.script_public_key_address,
            type: expectedOutput.script_public_key_type
          }
        : null,
      receipt,
      explorerUrl: `https://tn12.kaspa.stream/txs/${proof.txid}`
    };
  });

  return {
    schema: "tn12-accepted-app-state/v1",
    network: proofFixture.network || "kaspa-testnet-12",
    fetchedAt,
    endpointBase: TN12_TRANSACTION_ENDPOINT,
    summary: summarize(records),
    records,
    appState: {
      vault: laneState(records, "vault"),
      assurance: laneState(records, "assurance"),
      receipts: {
        status: records.some((record) => record.receipt) ? "payload-receipts-decoded" : "payload-receipt-indexer-next",
        decoded: records
          .filter((record) => record.receipt)
          .map((record) => ({
            txid: record.txid,
            lane: record.lane,
            label: record.label,
            receipt: record.receipt
          })),
        next: "Attach payload receipts to new transactions, then decode accepted transaction payloads into this state snapshot."
      }
    }
  };
}

export function summarize(records) {
  const accepted = records.filter((record) => record.accepted).length;
  const matched = records.filter((record) => record.status === "accepted-output-matched").length;
  const lanes = [...new Set(records.map((record) => record.lane))].sort();

  return {
    total: records.length,
    accepted,
    matched,
    mismatches: records.length - matched,
    receipts: records.filter((record) => record.receipt).length,
    lanes
  };
}

function laneState(records, lane) {
  const laneRecords = records.filter((record) => record.lane === lane);
  return {
    status: laneRecords.every((record) => record.status === "accepted-output-matched")
      ? "proofs-accepted"
      : "needs-review",
    proofs: laneRecords.map((record) => ({
      label: record.label,
      entrypoint: record.entrypoint,
      txid: record.txid,
      status: record.status,
      amountSompi: record.expected.amountSompi,
      acceptingBlockBlueScore: record.acceptingBlockBlueScore
    }))
  };
}
