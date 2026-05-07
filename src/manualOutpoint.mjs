export const FUNDED_TN12_ADDRESS = "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt";

export const DEFAULT_MANUAL_OUTPOINT = Object.freeze({
  label: "User-checked funded TN12 wallet",
  address: FUNDED_TN12_ADDRESS,
  txid: "f6ca76d93accf1a468de36ba35439bc8ca5cb2e1ba28f30b3220586e90bb0aee",
  outputIndex: 0,
  amountTkas: 10000,
  scriptType: "p2pk",
  explorerUrl: "https://tn12.kaspa.stream/txs/f6ca76d93accf1a468de36ba35439bc8ca5cb2e1ba28f30b3220586e90bb0aee",
  note: "User reported this saved TN12 address has about 10,000 testnet KAS/TKAS; api-tn12.kaspa.org returned this exact UTXO."
});

export function normalizeManualOutpoint(input = {}) {
  return {
    label: String(input.label || DEFAULT_MANUAL_OUTPOINT.label).trim(),
    address: String(input.address || DEFAULT_MANUAL_OUTPOINT.address).trim(),
    txid: String(input.txid || "").trim(),
    outputIndex: clampInteger(Number(input.outputIndex), 0, 1000000),
    amountTkas: clampNumber(Number(input.amountTkas), 0, 100000000),
    scriptType: String(input.scriptType || DEFAULT_MANUAL_OUTPOINT.scriptType).trim(),
    explorerUrl: String(input.explorerUrl || DEFAULT_MANUAL_OUTPOINT.explorerUrl).trim(),
    note: String(input.note || DEFAULT_MANUAL_OUTPOINT.note).trim()
  };
}

export function validateManualOutpoint(outpoint) {
  const issues = [];

  if (!outpoint.address.startsWith("kaspatest:")) {
    issues.push("Manual funding address must be a TN12/testnet kaspatest: address.");
  }

  if (outpoint.txid && !/^[a-fA-F0-9]{32,128}$/.test(outpoint.txid)) {
    issues.push("Transaction ID should be a hex hash copied from the TN12 explorer.");
  }

  if (outpoint.amountTkas <= 0) {
    issues.push("Amount must be greater than zero.");
  }

  if (!Number.isInteger(outpoint.outputIndex) || outpoint.outputIndex < 0) {
    issues.push("Output index must be a non-negative integer.");
  }

  if (outpoint.explorerUrl && !/^https:\/\/tn12\.kaspa\.stream\/?/.test(outpoint.explorerUrl)) {
    issues.push("Explorer URL should point to the TN12 explorer.");
  }

  return issues;
}

export function buildManualOutpointArtifact(outpoint) {
  const normalized = normalizeManualOutpoint(outpoint);
  const issues = validateManualOutpoint(normalized);

  return {
    schema: "tn12-manual-outpoint/v1",
    network: "kaspa-testnet-12",
    status: normalized.txid ? "manual-outpoint-entered" : "funded-address-known-outpoint-needed",
    outpoint: normalized,
    userReported: {
      funded: true,
      approximateBalanceTkas: 10000,
      checkedAt: "2026-05-07"
    },
    issues,
    nextNeeded: normalized.txid
      ? "Use this exact outpoint as the first transaction-builder input."
      : "Paste the exact funding transaction ID and output index from the TN12 explorer before signing."
  };
}

function clampInteger(value, min, max) {
  const number = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(Math.max(number, min), max);
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(number, min), max);
}
