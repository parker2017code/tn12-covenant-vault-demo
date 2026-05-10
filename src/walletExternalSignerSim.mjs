// Simulates an external wallet signer for the roundtrip test.
// Reads the already-signed local drafts and wraps them in wallet-standard signer return envelopes.
// Validates fingerprint preservation, payload bytes, and computeBudget fields.
// Does NOT use live keys or submit to TN12 — status is SIGNED_NOT_BROADCAST.

export function buildWalletExternalSignerSim({
  roundtripPlan = {},
  signedDrafts = {},
  signerName = "local-sim",
  signerVersion = "0.1.0",
  generatedAt = new Date().toISOString()
} = {}) {
  const rows = Array.isArray(roundtripPlan.rows) ? roundtripPlan.rows : [];
  const results = rows.map((row) => buildResult({ row, signedDrafts, signerName, signerVersion }));
  const passed = results.filter((r) => r.roundtripStatus === "sim-roundtrip-passed");
  const failed = results.filter((r) => r.roundtripStatus !== "sim-roundtrip-passed");

  return {
    schema: "tn12-wallet-external-signer-sim/v1",
    network: roundtripPlan.network || "kaspa-testnet-12",
    generatedAt,
    status: failed.length === 0 && passed.length > 0 ? "sim-roundtrip-all-passed" : "sim-roundtrip-needs-review",
    signerName,
    signerVersion,
    note: "All signing used local TN12 keys — this is a protocol roundtrip simulation, not a live external wallet integration.",
    summary: {
      requests: results.length,
      passed: passed.length,
      failed: failed.length,
      payloadPreserved: results.filter((r) => r.payloadBytesMatch).length,
      fingerprintPreserved: results.filter((r) => r.fingerprintMatch).length,
      computeBudgetPreserved: results.filter((r) => r.computeBudgetPreserved).length
    },
    results,
    boundaries: [
      "SIGNED_NOT_BROADCAST — sim results are not submitted to TN12.",
      "Local keys only — no external wallet, no KasWare/KasSigner involved.",
      "Fingerprint matching proves transaction structure is preserved through the signer return envelope.",
      "A live external signer roundtrip still requires a wallet that supports the wallet-standard interface."
    ]
  };
}

function buildResult({ row, signedDrafts, signerName, signerVersion }) {
  const requestId = row.requestId || "";
  const draftPath = row.sourceSignedDraftPath || "";
  const draft = signedDrafts[draftPath] || null;
  const expectedTxid = row.expectedTransactionIdAfterSigning || "";
  const expectedFingerprint = row.reviewFingerprint || "";

  if (!draft) {
    return {
      requestId,
      label: row.label || "",
      kind: row.kind || "",
      roundtripStatus: "sim-roundtrip-missing-draft",
      payloadBytesMatch: false,
      fingerprintMatch: false,
      computeBudgetPreserved: false,
      error: `Signed draft not found at ${draftPath}`
    };
  }

  // Drafts use different schemas: payload drafts put tx in signedTransaction.tx;
  // covenant spend drafts put tx in submitPayload.transaction
  const tx = draft.signedTransaction?.tx || draft.submitPayload?.transaction || {};
  const actualTxid = draft.transactionId || tx.id || "";
  const payloadHex = tx.payload || "";
  const actualPayloadBytes = payloadHex ? Math.ceil(payloadHex.length / 2) : 0;
  const expectedPayloadBytes = row.payloadBytes || 0;
  const payloadBytesMatch = actualPayloadBytes === expectedPayloadBytes;

  const fingerprintMatch = Boolean(expectedTxid && actualTxid === expectedTxid);

  // computeBudget: check inputs for budget fields when expected
  const inputs = tx.inputs || [];
  const hasComputeBudgetInput = inputs.some((inp) =>
    (inp.sigOpCount !== undefined && inp.sigOpCount !== null) ||
    (inp.computeBudget !== undefined && inp.computeBudget !== null)
  );
  const computeBudgetPreserved = row.computeBudgetInputs > 0 ? hasComputeBudgetInput : true;

  const roundtripStatus = payloadBytesMatch && fingerprintMatch && computeBudgetPreserved
    ? "sim-roundtrip-passed"
    : "sim-roundtrip-field-mismatch";

  return {
    requestId,
    label: row.label || "",
    kind: row.kind || "",
    roundtripStatus,
    payloadBytesMatch,
    fingerprintMatch,
    computeBudgetPreserved,
    signerReturn: {
      signerName,
      signerVersion,
      requestId,
      transactionId: actualTxid,
      reviewFingerprint: expectedFingerprint,
      payloadBytes: actualPayloadBytes,
      inputBudgetReport: {
        totalInputs: inputs.length,
        computeBudgetInputs: hasComputeBudgetInput ? inputs.filter((inp) =>
          (inp.sigOpCount !== undefined && inp.sigOpCount !== null) ||
          (inp.computeBudget !== undefined && inp.computeBudget !== null)
        ).length : 0
      },
      userApprovalSimulated: true,
      status: "SIGNED_NOT_BROADCAST"
    },
    validation: {
      expectedTxid,
      actualTxid,
      txidMatch: actualTxid === expectedTxid,
      expectedPayloadBytes,
      actualPayloadBytes,
      expectedComputeBudgetInputs: row.computeBudgetInputs || 0
    }
  };
}
