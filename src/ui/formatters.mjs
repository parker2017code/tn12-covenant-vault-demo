export function shortTxid(txid) {
  return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
}

export function shortAddress(address) {
  return `${address.slice(0, 18)}...${address.slice(-8)}`;
}

export function sompiToTkas(sompi) {
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}

export function cssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(value);
  return String(value).replaceAll('"', '\\"');
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
