import { Address } from "kaspa-wasm";

export const TN12_PREFIX = "kaspatest";

export function parseKaspaAddress(address) {
  const value = String(address || "").trim();
  if (!value) {
    return {
      ok: false,
      address: value,
      error: "Address is required."
    };
  }

  try {
    const parsed = new Address(value);
    return {
      ok: true,
      address: String(parsed),
      prefix: parsed.prefix,
      version: String(parsed.version)
    };
  } catch (error) {
    return {
      ok: false,
      address: value,
      error: "Address is not a valid Kaspa address."
    };
  }
}

export function validateKaspaAddress(address, { prefix } = {}) {
  const parsed = parseKaspaAddress(address);
  if (!parsed.ok) return parsed;

  if (prefix && parsed.prefix !== prefix) {
    return {
      ...parsed,
      ok: false,
      error: `Address must use ${prefix}: prefix.`
    };
  }

  return parsed;
}

export function validateTn12Address(address) {
  return validateKaspaAddress(address, { prefix: TN12_PREFIX });
}

export function isTn12Address(address) {
  return validateTn12Address(address).ok;
}

export function assertTn12Address(address, label = "Address") {
  const result = validateTn12Address(address);
  if (!result.ok) {
    throw new Error(`${label} must be a valid TN12/testnet kaspatest address: ${result.error}`);
  }
  return result.address;
}

export function assertSameTn12Address(left, right, label = "Addresses") {
  const normalizedLeft = assertTn12Address(left, `${label} left side`);
  const normalizedRight = assertTn12Address(right, `${label} right side`);
  if (normalizedLeft !== normalizedRight) {
    throw new Error(`${label} must match exactly.`);
  }
  return normalizedLeft;
}
