import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAccessPassIssuerReview } from "../src/accessPassIssuerReview.mjs";
import { buildAccessPassPlanner } from "../src/accessPassPlanner.mjs";

const fixture = JSON.parse(await readFile("fixtures/AccessPassPlanner.json", "utf8"));
const reviewedAt = "2026-05-10T00:00:00.000Z";

const duplicateFixture = {
  ...fixture,
  redemptions: [
    ...(fixture.redemptions || []),
    {
      ...(fixture.redemptions || [])[0],
      redemptionId: "redeem-workshop-alpha-duplicate",
      acceptedTxid: "duplicate-fixture-txid",
      status: "accepted-redemption"
    }
  ]
};
const missingTxidFixture = {
  ...fixture,
  redemptions: [
    ...(fixture.redemptions || []),
    {
      ...(fixture.redemptions || [])[0],
      redemptionId: "redeem-workshop-alpha-missing-txid",
      acceptedTxid: "",
      status: "accepted-redemption"
    }
  ]
};
const expiredFixture = {
  ...fixture,
  redemptions: [
    ...(fixture.redemptions || []),
    {
      ...(fixture.redemptions || [])[0],
      redemptionId: "redeem-workshop-alpha-expired",
      acceptedTxid: "expired-fixture-txid",
      redeemedAtIso: "2026-06-15T00:00:00.000Z",
      status: "accepted-redemption"
    }
  ]
};

const duplicatePlanner = buildAccessPassPlanner(duplicateFixture);
const duplicateReview = buildAccessPassIssuerReview({ accessPassState: duplicatePlanner, reviewedAt });
const missingTxidPlanner = buildAccessPassPlanner(missingTxidFixture);
const missingTxidReview = buildAccessPassIssuerReview({ accessPassState: missingTxidPlanner, reviewedAt });
const expiredPlanner = buildAccessPassPlanner(expiredFixture);
const expiredReview = buildAccessPassIssuerReview({ accessPassState: expiredPlanner, reviewedAt });

assert.equal(duplicatePlanner.summary.duplicateRedemptions, 1);
assert.equal(duplicatePlanner.summary.acceptedRedemptions, 1);
assert.equal(missingTxidPlanner.summary.missingAcceptedTxids, 1);
assert.equal(expiredReview.summary.expiredRedemptions, 1);
assert.equal(expiredReview.redemptionRows.find((row) => row.redemptionId === "redeem-workshop-alpha-expired")?.status, "expired-redemption-review");

const artifact = {
  schema: "tn12-access-pass-negative-cases/v1",
  reviewedAt,
  status: "access-pass-negative-cases-ready",
  cases: [
    { id: "duplicate-redemption", observed: duplicatePlanner.summary.duplicateRedemptions, expected: 1 },
    { id: "missing-txid", observed: missingTxidPlanner.summary.missingAcceptedTxids, expected: 1 },
    { id: "expired-redemption", observed: expiredReview.summary.expiredRedemptions, expected: 1 }
  ]
};

await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/access-pass-negative-cases.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log("artifacts/access-pass-negative-cases.json");
console.log(`status=${artifact.status}`);
