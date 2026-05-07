import { Encoding, NetworkType, Transaction } from "kaspa-wasm";
import { normalizePayloadBytes } from "./submitPayload.mjs";

export function buildWrpcTransactionFromArtifact(artifact = {}) {
  const submit = artifact.submitPayload?.transaction;
  if (!submit) {
    throw new Error("Signed artifact is missing submitPayload.transaction.");
  }

  const tx = new Transaction({
    version: submit.version,
    inputs: submit.inputs.map((input) => ({
      previousOutpoint: input.previousOutpoint,
      signatureScript: input.signatureScript,
      sequence: input.sequence,
      sigOpCount: input.sigOpCount
    })),
    outputs: submit.outputs.map((output) => ({
      value: output.amount,
      scriptPublicKey: `${Number(output.scriptPublicKey.version).toString(16).padStart(4, "0")}${output.scriptPublicKey.scriptPublicKey}`
    })),
    lockTime: submit.lockTime || 0,
    subnetworkId: submit.subnetworkId || "0000000000000000000000000000000000000000",
    gas: 0,
    payload: submit.payload || ""
  });
  tx.finalize();
  return tx;
}

export function summarizeWrpcCandidate(artifact = {}, options = {}) {
  const tx = buildWrpcTransactionFromArtifact(artifact);
  const payload = normalizePayloadBytes(tx.payload);
  const expectedTxid = artifact.transactionId || null;
  const actualTxid = tx.id;
  const txidMatches = !expectedTxid || expectedTxid === actualTxid;
  const encoding = normalizeEncoding(options.encoding || "borsh");
  const url = options.url || process.env.KASPA_WRPC_URL || "";
  const artifactPath = options.artifactPath || "artifacts/signed-drafts/payload-receipt-self-send.json";

  return {
    schema: "tn12-wrpc-submit-candidate/v1",
    network: options.network || "kaspa-testnet-12",
    status: url ? "wrpc-url-configured" : "needs-kaspa-wrpc-url",
    artifactPath,
    expectedTransactionId: expectedTxid,
    reconstructedTransactionId: actualTxid,
    txidMatches,
    payloadBytes: payload.length,
    outputs: tx.outputs.length,
    inputs: tx.inputs.length,
    encoding: encoding.label,
    urlConfigured: Boolean(url),
    dryRunCommand: `node scripts/submit-signed-draft-wrpc.mjs ${artifactPath}`,
    submitCommand: `KASPA_WRPC_URL=<ws-or-wss-url> node scripts/submit-signed-draft-wrpc.mjs ${artifactPath} --submit`,
    boundary: "Use this only with a trusted TN12 wRPC endpoint. The public REST submit route already accepted a no-payload transaction for this lane."
  };
}

export function normalizeEncoding(value) {
  const normalized = String(value || "borsh").toLowerCase();
  if (normalized === "json" || normalized === "serdejson" || normalized === "serde-json") {
    return { label: "json", value: Encoding.SerdeJson };
  }
  return { label: "borsh", value: Encoding.Borsh };
}

export function testnetNetworkType() {
  return NetworkType.Testnet;
}
