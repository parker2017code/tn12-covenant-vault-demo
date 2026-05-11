export const TN12_PREFIX = "kaspatest";
const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [
  0x98f2bc8e61n,
  0x79b76d99e2n,
  0xf33e5fb3c4n,
  0xae2eabe2a8n,
  0x1e4f43e470n
];

export function parseKaspaAddress(address) {
  const value = String(address || "").trim();
  if (!value) {
    return {
      ok: false,
      address: value,
      error: "Address is required."
    };
  }

  if (value !== value.toLowerCase()) {
    return {
      ok: false,
      address: value,
      error: "Address must be lowercase."
    };
  }

  const [prefix, payload, extra] = value.split(":");
  if (!prefix || !payload || extra !== undefined) {
    return {
      ok: false,
      address: value,
      error: "Address must use prefix:payload format."
    };
  }

  const data = [];
  for (const char of payload) {
    const index = CHARSET.indexOf(char);
    if (index === -1) {
      return {
        ok: false,
        address: value,
        error: "Address contains characters outside the Kaspa address alphabet."
      };
    }
    data.push(BigInt(index));
  }

  if (data.length <= 8 || polymod(prefixExpand(prefix).concat(data)) !== 1n) {
    return {
      ok: false,
      address: value,
      error: "Address checksum is invalid."
    };
  }

  return {
    ok: true,
    address: value,
    prefix,
    version: String(data[0])
  };
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

function prefixExpand(prefix) {
  return [...prefix].map((char) => BigInt(char.charCodeAt(0) & 0x1f)).concat([0n]);
}

function polymod(values) {
  let checksum = 1n;
  for (const value of values) {
    const top = checksum >> 35n;
    checksum = ((checksum & 0x07ffffffffn) << 5n) ^ value;
    for (let index = 0; index < GENERATOR.length; index += 1) {
      if (((top >> BigInt(index)) & 1n) === 1n) {
        checksum ^= GENERATOR[index];
      }
    }
  }
  return checksum;
}
