import { decodeSignalPayload } from "./signalPayload.mjs";

export const TN12_TRANSACTION_ENDPOINT = "https://api-tn12.kaspa.org/transactions";

export function buildPayloadReceiptEvidence({ artifact, tx, txid = artifact?.transactionId, verifiedAt = new Date().toISOString() }) {
  const expectedPayloadHex = artifact?.submitPayload?.transaction?.payload || artifact?.receipt?.encoded?.hex || "";
  const expectedOutput = artifact?.submitPayload?.transaction?.outputs?.[0] || null;
  const observedOutput = tx?.outputs?.find((output) => Number(output.index) === 0) || null;
  const decoded = decodeSignalPayload(tx?.payload);
  const accepted = Boolean(tx?.is_accepted);
  const payloadMatches = Boolean(expectedPayloadHex && tx?.payload === expectedPayloadHex);
  const outputMatches = Boolean(
    observedOutput
    && expectedOutput
    && Number(observedOutput.amount) === Number(expectedOutput.amount)
    && observedOutput.script_public_key_type === "pubkey"
  );
  const receiptMatches = Boolean(
    decoded
    && decoded.payload.kind === artifact?.receipt?.payload?.kind
    && decoded.payload.subject === artifact?.receipt?.payload?.subject
    && decoded.payload.value === artifact?.receipt?.payload?.value
  );

  return {
    schema: "tn12-payload-receipt-evidence/v1",
    network: artifact?.network || "kaspa-testnet-12",
    verifiedAt,
    endpointBase: TN12_TRANSACTION_ENDPOINT,
    status: accepted && payloadMatches && outputMatches && receiptMatches
      ? "accepted-payload-receipt-matched"
      : "needs-review",
    txid,
    accepted,
    acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null,
    acceptingBlockTime: tx?.accepting_block_time ?? null,
    payload: {
      expectedHex: expectedPayloadHex,
      observedHex: tx?.payload || "",
      bytes: (tx?.payload || "").length / 2,
      matches: payloadMatches,
      decoded
    },
    output: {
      expected: expectedOutput
        ? {
            index: 0,
            amountSompi: String(expectedOutput.amount),
            scriptVersion: expectedOutput.scriptPublicKey?.version ?? null
          }
        : null,
      observed: observedOutput
        ? {
            index: Number(observedOutput.index),
            amountSompi: String(observedOutput.amount),
            address: observedOutput.script_public_key_address,
            type: observedOutput.script_public_key_type
          }
        : null,
      matches: outputMatches
    },
    receiptMatches,
    invoiceId: decoded?.payload?.subject || artifact?.receipt?.payload?.subject || null,
    explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`
  };
}
