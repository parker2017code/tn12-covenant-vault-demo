import { normalizePayloadBytes } from "./submitPayload.mjs";

export function summarizeSignedDraft(artifact, path = "") {
  const submit = artifact.submitPayload?.transaction || {};
  const signedTx = artifact.signedTransaction?.tx?.inner || artifact.signedTransaction?.tx || {};
  const inputs = submit.inputs || [];
  const outputs = submit.outputs || [];
  const payloadBytes = normalizePayloadBytes(submit.payload || signedTx.payload);
  const outputSompi = outputs.reduce((sum, output) => sum + BigInt(output.amount || 0), 0n);

  return {
    schema: "tn12-submit-console-summary/v1",
    path,
    network: artifact.network || "kaspa-testnet-12",
    status: artifact.status || "unknown",
    lane: artifact.lane || artifact.schema || "signed-draft",
    transactionId: artifact.transactionId || signedTx.id || null,
    warning: artifact.warning || "Review exact inputs and outputs before submit.",
    requiresPayloadSubmitSupport: Boolean(artifact.requiresPayloadSubmitSupport),
    source: artifact.source || artifact.inputs?.source || null,
    counts: {
      inputs: inputs.length,
      outputs: outputs.length,
      payloadBytes: payloadBytes.length
    },
    totals: {
      outputSompi: outputSompi.toString(),
      outputTkas: sompiToTkas(outputSompi)
    },
    inputs: inputs.map((input) => ({
      txid: input.previousOutpoint?.transactionId || "",
      index: input.previousOutpoint?.index ?? null,
      sigOpCount: input.sigOpCount ?? null,
      sequence: input.sequence ?? null
    })),
    outputs: outputs.map((output, index) => ({
      index,
      amountSompi: String(output.amount || 0),
      amountTkas: sompiToTkas(BigInt(output.amount || 0)),
      scriptVersion: output.scriptPublicKey?.version ?? null,
      scriptPreview: shortHex(output.scriptPublicKey?.scriptPublicKey || "")
    })),
    payload: {
      present: payloadBytes.length > 0,
      bytes: payloadBytes.length,
      previewHex: shortHex(bytesToHex(payloadBytes), 96)
    },
    submit: {
      dryRunCommand: `node scripts/submit-signed-draft.mjs ${path}`,
      submitCommand: artifact.requiresPayloadSubmitSupport
        ? `KASPA_WRPC_URL=<ws-or-wss-url> node scripts/submit-signed-draft-wrpc.mjs ${path} --submit`
        : `node scripts/submit-signed-draft.mjs ${path} --submit`,
      restSubmitCommand: artifact.requiresPayloadSubmitSupport
        ? `ALLOW_PAYLOAD_REST_SUBMIT=1 node scripts/submit-signed-draft.mjs ${path} --submit`
        : null,
      boundary: artifact.requiresPayloadSubmitSupport
        ? "Do not use the public REST submit route for payload receipts; use a verified payload-preserving wRPC/wallet route."
        : "Actual broadcast requires explicit --submit."
    }
  };
}

export function buildSubmitConsoleRegistry(manifest, artifactsByPath) {
  const drafts = (manifest.drafts || []).map((item) => {
    const artifact = artifactsByPath[item.path];
    const summary = summarizeSignedDraft(artifact, item.path);
    return {
      ...summary,
      label: item.label,
      priority: item.priority,
      description: item.description
    };
  });

  return {
    schema: "tn12-submit-console-registry/v1",
    network: manifest.network || "kaspa-testnet-12",
    status: "review-only-not-broadcast",
    summary: {
      total: drafts.length,
      payloadDrafts: drafts.filter((draft) => draft.payload.present).length,
      explicitSubmitRequired: drafts.length,
      payloadSubmitGated: drafts.filter((draft) => draft.requiresPayloadSubmitSupport).length
    },
    drafts,
    boundaries: [
      "The console reviews signed draft artifacts only; it does not read or expose private keys.",
      "Dry-run commands are safe inspection commands.",
      "Broadcast commands are explicit and testnet-only."
    ]
  };
}

function sompiToTkas(sompi) {
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

function shortHex(hex, size = 36) {
  const value = String(hex || "");
  if (value.length <= size) return value;
  const side = Math.max(8, Math.floor((size - 3) / 2));
  return `${value.slice(0, side)}...${value.slice(-side)}`;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
