export function buildSubmitPayload(signedTransaction) {
  const tx = signedTransaction.tx?.inner || signedTransaction.tx;
  if (!tx) {
    throw new Error("Signed transaction artifact is missing tx.inner.");
  }

  const transaction = {
    version: tx.version,
    inputs: tx.inputs.map((input) => {
      const inner = input.inner || input;
      const previous = inner.previousOutpoint.inner || inner.previousOutpoint;
      return {
        previousOutpoint: {
          transactionId: previous.transactionId,
          index: previous.index
        },
        signatureScript: bytesToHex(inner.signatureScript || []),
        sequence: inner.sequence,
        sigOpCount: inner.sigOpCount
      };
    }),
    outputs: tx.outputs.map((output) => {
      const inner = output.inner || output;
      return {
        amount: Number(inner.value ?? inner.amount),
        scriptPublicKey: splitScriptPublicKey(inner.scriptPublicKey)
      };
    }),
    lockTime: tx.lockTime || 0,
    subnetworkId: tx.subnetworkId || "0000000000000000000000000000000000000000"
  };

  const payload = normalizePayloadBytes(tx.payload);
  if (payload.length) {
    transaction.payload = bytesToHex(payload);
  }

  return {
    transaction,
    allowOrphan: false
  };
}

export function normalizePayloadBytes(value) {
  if (!value) return new Uint8Array();
  if (value instanceof Uint8Array) return value;
  if (Array.isArray(value)) return Uint8Array.from(value);
  if (typeof value === "string") {
    const normalized = value.startsWith("0x") ? value.slice(2) : value;
    if (/^[a-fA-F0-9]+$/.test(normalized) && normalized.length % 2 === 0) {
      return Uint8Array.from(normalized.match(/../g).map((chunk) => Number.parseInt(chunk, 16)));
    }
    return new TextEncoder().encode(value);
  }
  return new Uint8Array();
}

function splitScriptPublicKey(scriptPublicKey) {
  const normalized = String(scriptPublicKey);
  return {
    version: Number.parseInt(normalized.slice(0, 4), 16),
    scriptPublicKey: normalized.slice(4)
  };
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
