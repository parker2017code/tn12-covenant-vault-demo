export function buildAccessPassIssuerReview({ accessPassState = {}, reviewedAt = "2026-05-09T00:00:00.000Z" } = {}) {
  const now = Date.parse(reviewedAt);
  const passes = Array.isArray(accessPassState.passes) ? accessPassState.passes : [];
  const redemptions = Array.isArray(accessPassState.redemptions) ? accessPassState.redemptions : [];
  const passRows = passes.map((pass) => {
    const expired = pass.validUntilIso ? Date.parse(pass.validUntilIso) < now : false;
    const activeWindow = !expired && pass.state !== "not-active";
    return {
      passId: pass.passId,
      issuer: pass.issuer,
      state: pass.state,
      expired,
      activeWindow,
      issuerReviewRequired: pass.enforcement === "issuer-indexer",
      remaining: Number(pass.remaining || 0)
    };
  });
  const redemptionRows = redemptions.map((redemption) => {
    const pass = passes.find((item) => item.passId === redemption.passId);
    const expiredAtRedemption = pass?.validUntilIso && redemption.redeemedAtIso
      ? Date.parse(redemption.redeemedAtIso) > Date.parse(pass.validUntilIso)
      : false;
    return {
      redemptionId: redemption.redemptionId,
      passId: redemption.passId,
      holder: redemption.holder,
      review: redemption.review,
      expiredAtRedemption,
      issuerMustHonorOffchain: redemption.review === "counted-accepted-redemption",
      status: expiredAtRedemption ? "expired-redemption-review" : redemption.review
    };
  });

  return {
    schema: "kaspa-access-pass-issuer-review/v1",
    network: accessPassState.network || "kaspa-testnet-12",
    reviewedAt,
    status: "access-pass-issuer-review-ready",
    summary: {
      passes: passRows.length,
      issuerReviewRequired: passRows.filter((row) => row.issuerReviewRequired).length,
      expiredPasses: passRows.filter((row) => row.expired).length,
      redemptions: redemptionRows.length,
      expiredRedemptions: redemptionRows.filter((row) => row.expiredAtRedemption).length,
      countableRedemptions: redemptionRows.filter((row) => row.review === "counted-accepted-redemption").length
    },
    passRows,
    redemptionRows,
    boundaries: [
      "Access passes are issuer/indexer claims.",
      "Issuer review is required before off-chain access, discount, or membership is granted.",
      "Count accepted redemptions after expiry, duplicate, and txid checks."
    ]
  };
}
