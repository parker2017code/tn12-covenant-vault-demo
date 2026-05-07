export function buildStableIssuerRedemptionState(fixture = {}) {
  const unit = normalizeUnit(fixture.unit);
  const issuances = (fixture.issuances || []).map((record) => normalizeRecord(record, "issuance"));
  const redemptions = (fixture.redemptions || []).map((record) => normalizeRecord(record, "redemption"));
  const acceptedIssuances = issuances.filter((record) => record.accepted);
  const acceptedRedemptions = redemptions.filter((record) => record.accepted);
  const acceptedIssuedUnits = sumUnits(acceptedIssuances);
  const acceptedRedeemedUnits = sumUnits(acceptedRedemptions);
  const signedOnlyRedemptions = redemptions.filter((record) => !record.accepted);

  return {
    schema: "kaspa-stable-issuer-redemption-state/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-07",
    status: "issuer-indexer-state-not-native-stablecoin",
    unit,
    summary: {
      issuedRecords: issuances.length,
      redemptionRecords: redemptions.length,
      acceptedIssuedUnits,
      acceptedRedeemedUnits,
      acceptedOutstandingUnits: acceptedIssuedUnits - acceptedRedeemedUnits,
      acceptedIssuedDisplay: formatUnits(acceptedIssuedUnits, unit.decimals),
      acceptedRedeemedDisplay: formatUnits(acceptedRedeemedUnits, unit.decimals),
      acceptedOutstandingDisplay: formatUnits(acceptedIssuedUnits - acceptedRedeemedUnits, unit.decimals),
      signedOnlyRedemptions: signedOnlyRedemptions.length,
      missingAcceptedTxids: [...issuances, ...redemptions].filter((record) => !record.accepted).length
    },
    issuances,
    redemptions,
    boundaries: [
      "This is issuer/indexer accounting, not a native Kaspa stablecoin.",
      "Signed-only redemptions do not reduce accepted outstanding balance.",
      "Real issuer-backed value needs issuer reserves, legal redemption operations, compliance, wallet UX, and accepted transaction receipts.",
      "Do not treat this as collateralized, synthetic, bridged, or covenant-native settlement."
    ]
  };
}

function normalizeUnit(unit = {}) {
  return {
    unitId: String(unit.unitId || ""),
    name: String(unit.name || "Stable-value unit"),
    issuer: String(unit.issuer || ""),
    peg: String(unit.peg || ""),
    decimals: Math.max(Math.round(Number(unit.decimals || 0)), 0),
    status: String(unit.status || "issuer-indexer-simulation")
  };
}

function normalizeRecord(record = {}, kind) {
  const acceptedTxid = String(record.acceptedTxid || "");
  return {
    kind,
    recordId: String(record.recordId || ""),
    holder: String(record.holder || ""),
    amountUnits: Number(record.amountUnits || 0),
    acceptedTxid,
    evidencePath: String(record.evidencePath || ""),
    accepted: acceptedTxid.length > 0,
    issuerSignature: String(record.issuerSignature || ""),
    memo: String(record.memo || "")
  };
}

function sumUnits(records) {
  return records.reduce((sum, record) => sum + record.amountUnits, 0);
}

function formatUnits(units, decimals) {
  if (decimals === 0) return String(units);
  const scale = 10 ** decimals;
  const whole = Math.trunc(units / scale);
  const fraction = Math.abs(units % scale).toString().padStart(decimals, "0");
  return `${whole}.${fraction}`;
}
