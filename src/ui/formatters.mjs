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

export function publicLaneText(value) {
  return String(value)
    .replace(/External wallet handoff/g, "Use your own wallet")
    .replace(/external wallet signing/gi, "user-wallet signing")
    .replace(/external signer/gi, "wallet signer")
    .replace(/external-signer/gi, "wallet-signer")
    .replace(/external-wallet/gi, "user-wallet")
    .replace(/6 of 10 benchmark rails complete/g, "6 lab checks have repo evidence")
    .replace(/benchmark rails complete/gi, "lab checks have repo evidence")
    .replace(/production signer/gi, "user-wallet signing")
    .replace(/No autonomous payout; /g, "")
    .replace(/No AMM custody, lending custody, liquidation engine, oracle truth, or user-wallet signing yet\./g, "AMM custody, lending custody, liquidation, oracle inputs, and user-wallet signing still need separate rules.")
    .replace(/No opacity, capital multiplexing, composability, or atomic Hunt execution yet\./g, "Privacy, shared capital, composition, and settlement still need separate rules.");
}
