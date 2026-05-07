export function buildAccessPassPlanner(fixture = {}) {
  const passes = (fixture.passes || []).map(normalizePass);
  const redemptions = (fixture.redemptions || []).map(normalizeRedemption);
  const passesWithState = passes.map((pass) => {
    const passRedemptions = redemptions.filter((redemption) => redemption.passId === pass.passId);
    return {
      ...pass,
      issued: pass.supplyIssued,
      redeemed: passRedemptions.filter((redemption) => redemption.status === "accepted-redemption").length,
      pending: passRedemptions.filter((redemption) => redemption.status !== "accepted-redemption").length,
      remaining: Math.max(pass.supplyIssued - passRedemptions.filter((redemption) => redemption.status === "accepted-redemption").length, 0),
      state: passState(pass, passRedemptions)
    };
  });

  return {
    schema: "kaspa-access-pass-planner/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: "issuer-indexer-flow-not-native-enforcement",
    summary: {
      totalPasses: passes.length,
      totalIssued: passes.reduce((total, pass) => total + pass.supplyIssued, 0),
      acceptedRedemptions: redemptions.filter((redemption) => redemption.status === "accepted-redemption").length,
      pendingRedemptions: redemptions.filter((redemption) => redemption.status !== "accepted-redemption").length
    },
    passes: passesWithState,
    redemptions,
    boundaries: [
      "Access passes are issuer/indexer claims in this repo, not native covenant-enforced tickets.",
      "Accepted redemption payloads can update app state, but the issuer must honor the claim off-chain unless a later enforcement path exists.",
      "KRC-style ecosystem/indexer flows should stay clearly labeled until the repo integrates a specific indexer/API.",
      "Duplicate redemption prevention is app/indexer responsibility in this planner."
    ]
  };
}

function normalizePass(pass = {}) {
  return {
    passId: String(pass.passId || ""),
    name: String(pass.name || "Access pass"),
    issuer: String(pass.issuer || ""),
    category: String(pass.category || "membership"),
    claim: String(pass.claim || ""),
    supplyIssued: Math.max(Math.round(Number(pass.supplyIssued || 0)), 0),
    validFromIso: String(pass.validFromIso || ""),
    validUntilIso: String(pass.validUntilIso || ""),
    metadataHash: String(pass.metadataHash || ""),
    status: String(pass.status || "draft"),
    enforcement: String(pass.enforcement || "issuer-indexer")
  };
}

function normalizeRedemption(redemption = {}) {
  return {
    redemptionId: String(redemption.redemptionId || ""),
    passId: String(redemption.passId || ""),
    holder: String(redemption.holder || ""),
    acceptedTxid: String(redemption.acceptedTxid || ""),
    payloadKind: String(redemption.payloadKind || "access-pass-redemption"),
    redeemedAtIso: String(redemption.redeemedAtIso || ""),
    status: String(redemption.status || "draft")
  };
}

function passState(pass, redemptions) {
  const accepted = redemptions.filter((redemption) => redemption.status === "accepted-redemption");
  if (pass.status !== "active") return "not-active";
  if (accepted.length >= pass.supplyIssued) return "fully-redeemed";
  if (accepted.length > 0) return "partially-redeemed";
  return "issued-not-redeemed";
}
