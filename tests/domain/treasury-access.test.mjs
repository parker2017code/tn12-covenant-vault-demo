import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAccessPassIssuerReview } from "../../src/accessPassIssuerReview.mjs";
import { buildAccessPassPlanner } from "../../src/accessPassPlanner.mjs";
import { buildTreasuryConstrainedSpends } from "../../src/treasuryConstrainedSpends.mjs";
import { buildTreasuryRoleReview } from "../../src/treasuryRoleReview.mjs";
import { buildTreasuryVaultRegistry } from "../../src/treasuryVault.mjs";

const walletConnectorRequests = await readJson("artifacts/wallet-connector-submit-requests.json");

const treasuryRegistry = buildTreasuryVaultRegistry(await readJson("fixtures/TreasuryVaults.json"));
assert.equal(treasuryRegistry.status, "planner-policy-before-extra-script-paths");
assert.equal(treasuryRegistry.summary.total, 2);
assert.equal(treasuryRegistry.summary.plannedPayrollTkas, 80);
assert.equal(treasuryRegistry.summary.largeWithdrawalsPending, 1);
assert.ok(treasuryRegistry.vaults.some((vault) =>
  vault.vaultId === "treasury-core-team"
  && vault.checks.largeWithdrawalReviewRequired
));

const treasurySpends = buildTreasuryConstrainedSpends({
  treasuryRegistry,
  walletConnectorRequests
});
assert.equal(treasurySpends.status, "treasury-spend-drafts-ready-wallet-policy");
assert.equal(treasurySpends.summary.drafts, 4);
assert.equal(treasurySpends.summary.payrollDrafts, 3);
assert.equal(treasurySpends.summary.delayedWithdrawalDrafts, 1);
assert.equal(treasurySpends.summary.blockedDrafts, 0);

const treasurySpendsArtifact = await readJson("artifacts/treasury-constrained-spends.json");
assert.equal(treasurySpendsArtifact.status, "treasury-spend-drafts-ready-wallet-policy");
assert.equal(treasurySpendsArtifact.summary.drafts, treasurySpends.summary.drafts);
assert.equal(treasurySpendsArtifact.summary.payrollDrafts, treasurySpends.summary.payrollDrafts);
assert.equal(treasurySpendsArtifact.summary.delayedWithdrawalDrafts, treasurySpends.summary.delayedWithdrawalDrafts);

const treasuryRoleReview = buildTreasuryRoleReview({
  constrainedSpends: treasurySpendsArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(treasuryRoleReview.status, "treasury-role-review-ready");
assert.equal(treasuryRoleReview.summary.drafts, treasurySpendsArtifact.summary.drafts);
assert.equal(treasuryRoleReview.summary.roleSeparatedRows, 0);

const treasuryRoleReviewArtifact = await readJson("artifacts/treasury-role-review.json");
assert.equal(treasuryRoleReviewArtifact.status, "treasury-role-review-ready");
assert.equal(treasuryRoleReviewArtifact.summary.drafts, treasuryRoleReview.summary.drafts);

const accessPassPlanner = buildAccessPassPlanner(await readJson("fixtures/AccessPassPlanner.json"));
assert.equal(accessPassPlanner.status, "issuer-indexer-flow-not-native-enforcement");
assert.equal(accessPassPlanner.summary.totalPasses, 3);
assert.equal(accessPassPlanner.summary.acceptedRedemptions, 1);
assert.equal(accessPassPlanner.summary.duplicateRedemptions, 0);
assert.equal(accessPassPlanner.summary.missingAcceptedTxids, 0);
assert.ok(accessPassPlanner.passes.some((pass) =>
  pass.passId === "pass-dev-workshop-001"
  && pass.state === "partially-redeemed"
));

const accessIssuerReview = buildAccessPassIssuerReview({
  accessPassState: accessPassPlanner,
  reviewedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(accessIssuerReview.status, "access-pass-issuer-review-ready");
assert.equal(accessIssuerReview.summary.issuerReviewRequired, accessPassPlanner.summary.totalPasses);
assert.equal(accessIssuerReview.summary.countableRedemptions, accessPassPlanner.summary.acceptedRedemptions);

const accessIssuerReviewArtifact = await readJson("artifacts/access-pass-issuer-review.json");
assert.equal(accessIssuerReviewArtifact.status, "access-pass-issuer-review-ready");
assert.equal(accessIssuerReviewArtifact.summary.issuerReviewRequired, accessIssuerReview.summary.issuerReviewRequired);
assert.equal(accessIssuerReviewArtifact.summary.countableRedemptions, accessIssuerReview.summary.countableRedemptions);

console.log("Treasury and access-pass tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
