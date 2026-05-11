export const SOMPI_PER_TKAS = 100000000n;

export function decimalTkasToSompi(value) {
  const raw = String(value ?? "0").trim();
  if (!/^\d+(\.\d{0,8})?$/.test(raw)) {
    throw new Error(`Invalid TKAS decimal amount: ${raw}`);
  }

  const [whole, fraction = ""] = raw.split(".");
  return (BigInt(whole || "0") * SOMPI_PER_TKAS) + BigInt(fraction.padEnd(8, "0").slice(0, 8) || "0");
}

export function sompiToTkas(value) {
  const sompi = BigInt(value);
  const whole = sompi / SOMPI_PER_TKAS;
  const fraction = sompi % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

export function sompiToSafeJsonNumber(value) {
  const sompi = BigInt(value);
  if (sompi > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Sompi amount exceeds JSON safe integer boundary: ${sompi}`);
  }
  return Number(sompi);
}
