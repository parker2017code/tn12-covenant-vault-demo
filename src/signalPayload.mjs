const STANDARD_TX_MASS_LIMIT = 100000;
const TRANSIENT_BYTE_MASS = 4;

export const DEFAULT_SIGNAL_PAYLOAD = Object.freeze({
  kind: "order-receipt",
  subject: "merchant-order-1337",
  value: "paid",
  note: "Demo payload for accepted-transaction indexing"
});

export function normalizeSignalPayload(input = {}) {
  return {
    kind: clean(input.kind || DEFAULT_SIGNAL_PAYLOAD.kind, 48),
    subject: clean(input.subject || DEFAULT_SIGNAL_PAYLOAD.subject, 96),
    value: clean(input.value || DEFAULT_SIGNAL_PAYLOAD.value, 96),
    note: clean(input.note || DEFAULT_SIGNAL_PAYLOAD.note, 240)
  };
}

export function buildSignalPayloadArtifact(input = {}) {
  const payload = normalizeSignalPayload(input);
  const json = JSON.stringify(payload);
  const bytes = encodeSignalPayloadBytes(payload);
  const transientMass = bytes.length * TRANSIENT_BYTE_MASS;
  const remainingMass = Math.max(STANDARD_TX_MASS_LIMIT - transientMass, 0);

  return {
    schema: "kaspa-signal-payload/v1",
    status: transientMass < STANDARD_TX_MASS_LIMIT ? "payload-size-ok" : "payload-too-large",
    lane: "transaction-payload",
    payload,
    encoded: {
      bytes: bytes.length,
      transientMass,
      hex: bytesToHex(bytes)
    },
    limits: {
      standardTxMassLimit: STANDARD_TX_MASS_LIMIT,
      transientByteMass: TRANSIENT_BYTE_MASS,
      remainingMassBeforeInputsOutputsAndSignatures: remainingMass
    },
    boundary: "This models user transaction payload data, not arbitrary miner header data."
  };
}

export function encodeSignalPayloadBytes(input = {}) {
  return new TextEncoder().encode(JSON.stringify(normalizeSignalPayload(input)));
}

export function decodeSignalPayload(value) {
  const bytes = normalizePayloadBytes(value);
  if (!bytes.length) return null;

  try {
    const text = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(text);
    const payload = normalizeSignalPayload(parsed);
    if (!payload.kind || !payload.subject) return null;
    return {
      schema: "kaspa-signal-payload/v1",
      status: "decoded",
      payload,
      encoded: {
        bytes: bytes.length,
        hex: bytesToHex(bytes)
      }
    };
  } catch {
    return null;
  }
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}

function normalizePayloadBytes(value) {
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
