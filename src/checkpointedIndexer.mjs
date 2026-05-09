import { decodeSignalPayload } from "./signalPayload.mjs";

export const DEFAULT_TN12_TRANSACTION_ENDPOINT = "https://api-tn12.kaspa.org/transactions";

export function buildCheckpointedAcceptedIndex({
  proofFixture = {},
  proofTransactions = {},
  payloadManifest = {},
  payloadArtifacts = {},
  payloadTransactions = {},
  outputManifest = {},
  outputTransactions = {},
  fetchedAt = new Date().toISOString(),
  endpointBase = DEFAULT_TN12_TRANSACTION_ENDPOINT
}) {
  const proofRecords = (proofFixture.transactions || []).map((proof) =>
    buildProofRecord({ proof, tx: proofTransactions[proof.txid] })
  );
  const payloadRecords = (payloadManifest.events || []).map((event) => {
    const artifact = payloadArtifacts[event.draftPath];
    const txid = artifact?.transactionId || "";
    return buildPayloadRecord({ event, artifact, tx: payloadTransactions[txid], txid });
  });
  const outputRecords = (outputManifest.outputs || []).map((output) =>
    buildOutputRecord({ output, tx: outputTransactions[output.txid] })
  );
  const records = [...proofRecords, ...payloadRecords, ...outputRecords];
  const checkpoint = buildCheckpoint(records);

  return {
    schema: "tn12-checkpointed-accepted-index/v1",
    network: proofFixture.network || payloadManifest.network || "kaspa-testnet-12",
    fetchedAt,
    endpointBase,
    sourceManifests: {
      proofs: "fixtures/AcceptedProofTransactions.json",
      payloadEvents: "fixtures/PayloadEventEvidence.json",
      outputEvidence: "fixtures/AcceptedOutputEvidence.json"
    },
    status: records.every((record) => record.status.endsWith("matched"))
      ? "accepted-index-fully-matched"
      : "needs-review",
    checkpoint,
    summary: {
      total: records.length,
      proofs: proofRecords.length,
      payloadEvents: payloadRecords.length,
      outputEvidence: outputRecords.length,
      accepted: records.filter((record) => record.accepted).length,
      matched: records.filter((record) => record.status.endsWith("matched")).length,
      mismatches: records.filter((record) => !record.status.endsWith("matched")).length,
      lanes: summarizeLanes(records)
    },
    records,
    boundaries: [
      "This checkpoint is rebuilt from known TN12 txids and public transaction reads.",
      "It is rollback-aware metadata, not a full virtual-chain subscription.",
      "A production indexer should persist checkpoints from node/RPC virtual-chain reads before serving app state."
    ]
  };
}

function buildOutputRecord({ output, tx }) {
  const outputIndex = Number(output.outputIndex || 0);
  const observedOutput = tx?.outputs?.find((candidate) => Number(candidate.index) === outputIndex) || null;
  const accepted = Boolean(tx?.is_accepted);
  const outputMatches = Boolean(
    observedOutput
    && String(observedOutput.amount) === String(output.amountSompi)
    && observedOutput.script_public_key_address === output.destination
    && observedOutput.script_public_key_type === String(output.scriptType || "pubkey")
  );

  return {
    kind: "accepted-output",
    lane: String(output.lane || "accepted-output"),
    label: String(output.label || ""),
    txid: String(output.txid || ""),
    status: accepted && outputMatches ? "accepted-output-matched" : "needs-review",
    accepted,
    matched: accepted && outputMatches,
    acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null,
    acceptingBlockTime: tx?.accepting_block_time ?? null,
    expected: {
      outputIndex,
      amountSompi: String(output.amountSompi || ""),
      destination: String(output.destination || ""),
      type: String(output.scriptType || "pubkey"),
      subject: output.subject || null
    },
    output: {
      expected: {
        outputIndex,
        amountSompi: String(output.amountSompi || ""),
        destination: String(output.destination || ""),
        type: String(output.scriptType || "pubkey")
      },
      observed: observedOutput
        ? {
            outputIndex: Number(observedOutput.index),
            amountSompi: String(observedOutput.amount),
            destination: observedOutput.script_public_key_address,
            type: observedOutput.script_public_key_type
          }
        : null,
      matches: outputMatches
    },
    observed: observedOutput
      ? {
          outputIndex: Number(observedOutput.index),
          amountSompi: String(observedOutput.amount),
          destination: observedOutput.script_public_key_address,
          type: observedOutput.script_public_key_type
        }
      : null,
    explorerUrl: `https://tn12.kaspa.stream/txs/${output.txid}`
  };
}

function buildProofRecord({ proof, tx }) {
  const observedOutput = tx?.outputs?.find((output) => Number(output.index) === 0) || null;
  const accepted = Boolean(tx?.is_accepted);
  const outputMatches = Boolean(
    observedOutput
    && String(observedOutput.amount) === String(proof.amountSompi)
    && observedOutput.script_public_key_address === proof.destination
    && observedOutput.script_public_key_type === "pubkey"
  );

  return {
    kind: "proof-spend",
    lane: String(proof.lane || "proof"),
    label: String(proof.label || ""),
    entrypoint: String(proof.entrypoint || ""),
    txid: String(proof.txid || ""),
    status: accepted && outputMatches ? "accepted-output-matched" : "needs-review",
    accepted,
    matched: accepted && outputMatches,
    acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null,
    acceptingBlockTime: tx?.accepting_block_time ?? null,
    expected: {
      outputIndex: 0,
      amountSompi: String(proof.amountSompi || ""),
      destination: String(proof.destination || ""),
      type: "pubkey"
    },
    observed: observedOutput
      ? {
          outputIndex: Number(observedOutput.index),
          amountSompi: String(observedOutput.amount),
          destination: observedOutput.script_public_key_address,
          type: observedOutput.script_public_key_type
        }
      : null,
    explorerUrl: `https://tn12.kaspa.stream/txs/${proof.txid}`
  };
}

function buildPayloadRecord({ event, artifact, tx, txid }) {
  const decoded = decodeSignalPayload(tx?.payload);
  const expectedPayloadHex = artifact?.submitPayload?.transaction?.payload || artifact?.receipt?.encoded?.hex || "";
  const expectedReceipt = artifact?.receipt?.payload || {};
  const expectedOutput = artifact?.submitPayload?.transaction?.outputs?.[0] || null;
  const observedOutput = tx?.outputs?.find((output) => Number(output.index) === 0) || null;
  const accepted = Boolean(tx?.is_accepted);
  const payloadMatches = Boolean(expectedPayloadHex && tx?.payload === expectedPayloadHex);
  const receiptMatches = Boolean(
    decoded
    && decoded.payload.kind === expectedReceipt.kind
    && decoded.payload.subject === expectedReceipt.subject
    && decoded.payload.value === expectedReceipt.value
  );
  const outputMatches = Boolean(
    expectedOutput
    && observedOutput
    && Number(observedOutput.amount) === Number(expectedOutput.amount)
    && observedOutput.script_public_key_type === "pubkey"
  );
  const matched = accepted && payloadMatches && receiptMatches && outputMatches;

  return {
    kind: "payload-event",
    lane: String(decoded?.payload?.kind || expectedReceipt.kind || "payload"),
    label: String(event.label || expectedReceipt.subject || ""),
    txid,
    status: matched ? "accepted-payload-matched" : "needs-review",
    accepted,
    matched,
    acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null,
    acceptingBlockTime: tx?.accepting_block_time ?? null,
    draftPath: event.draftPath,
    evidencePath: event.outPath,
    payload: {
      expectedHex: expectedPayloadHex,
      observedHex: tx?.payload || "",
      matches: payloadMatches,
      bytes: (tx?.payload || "").length / 2,
      decoded
    },
    receiptMatches,
    output: {
      expected: expectedOutput
        ? {
            outputIndex: 0,
            amountSompi: String(expectedOutput.amount),
            type: "pubkey"
          }
        : null,
      observed: observedOutput
        ? {
            outputIndex: Number(observedOutput.index),
            amountSompi: String(observedOutput.amount),
            destination: observedOutput.script_public_key_address,
            type: observedOutput.script_public_key_type
          }
        : null,
      matches: outputMatches
    },
    explorerUrl: `https://tn12.kaspa.stream/txs/${txid}`
  };
}

function buildCheckpoint(records) {
  const blueScores = records
    .map((record) => Number(record.acceptingBlockBlueScore))
    .filter((score) => Number.isFinite(score));
  const maxBlueScore = blueScores.length ? Math.max(...blueScores) : null;
  const minBlueScore = blueScores.length ? Math.min(...blueScores) : null;

  return {
    kind: "known-txid-public-read-checkpoint",
    recordCount: records.length,
    minAcceptingBlockBlueScore: minBlueScore,
    maxAcceptingBlockBlueScore: maxBlueScore,
    txids: records.map((record) => record.txid),
    rollbackNote: "If a future node/RPC backend reports rollback below this blue-score range, rebuild derived app state from the affected checkpoint."
  };
}

function summarizeLanes(records) {
  const laneMap = new Map();
  for (const record of records) {
    const current = laneMap.get(record.lane) || {
      lane: record.lane,
      total: 0,
      accepted: 0,
      matched: 0
    };
    current.total += 1;
    if (record.accepted) current.accepted += 1;
    if (record.matched) current.matched += 1;
    laneMap.set(record.lane, current);
  }
  return [...laneMap.values()].sort((a, b) => a.lane.localeCompare(b.lane));
}
