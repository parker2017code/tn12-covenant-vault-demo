export function buildAccessPassPlanner(fixture = {}) {
  const passes = (fixture.passes || []).map(normalizePass);
  const redemptions = (fixture.redemptions || []).map(normalizeRedemption);
  const redemptionReviews = reviewRedemptions(redemptions);
  const countableRedemptions = redemptions.filter((redemption) => isCountableRedemption(redemption, redemptionReviews));
  const passesWithState = passes.map((pass) => {
    const passRedemptions = countableRedemptions.filter((redemption) => redemption.passId === pass.passId);
    const pendingRedemptions = redemptions.filter((redemption) => redemption.passId === pass.passId && !passRedemptions.includes(redemption));
    const acceptedCount = passRedemptions.length;
    return {
      ...pass,
      issued: pass.supplyIssued,
      redeemed: acceptedCount,
      pending: pendingRedemptions.length,
      remaining: Math.max(pass.supplyIssued - acceptedCount, 0),
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
      acceptedRedemptions: countableRedemptions.length,
      pendingRedemptions: redemptions.length - countableRedemptions.length,
      duplicateRedemptions: redemptionReviews.filter((review) => review.status === "duplicate-redemption").length,
      missingAcceptedTxids: redemptionReviews.filter((review) => review.status === "missing-accepted-txid").length
    },
    passes: passesWithState,
    redemptions: redemptions.map((redemption) => ({
      ...redemption,
      review: redemptionReviews.find((review) => review.redemptionId === redemption.redemptionId)?.status || "draft"
    })),
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

function reviewRedemptions(redemptions) {
  const seen = new Set();

  return redemptions.map((redemption) => {
    if (redemption.status !== "accepted-redemption") {
      return {
        redemptionId: redemption.redemptionId,
        status: "not-accepted"
      };
    }

    if (!redemption.acceptedTxid) {
      return {
        redemptionId: redemption.redemptionId,
        status: "missing-accepted-txid"
      };
    }

    const key = `${redemption.passId}:${redemption.holder}`;
    if (seen.has(key)) {
      return {
        redemptionId: redemption.redemptionId,
        status: "duplicate-redemption"
      };
    }
    seen.add(key);

    return {
      redemptionId: redemption.redemptionId,
      status: "counted-accepted-redemption"
    };
  });
}

function isCountableRedemption(redemption, reviews) {
  return reviews.find((review) => review.redemptionId === redemption.redemptionId)?.status === "counted-accepted-redemption";
}

function passState(pass, redemptions) {
  if (pass.status !== "active") return "not-active";
  if (redemptions.length >= pass.supplyIssued) return "fully-redeemed";
  if (redemptions.length > 0) return "partially-redeemed";
  return "issued-not-redeemed";
}
