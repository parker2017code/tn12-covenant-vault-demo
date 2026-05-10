import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAccessPassIssuerReview } from "../src/accessPassIssuerReview.mjs";
import { buildAccessPassPlanner } from "../src/accessPassPlanner.mjs";

const fixturePath = process.env.ACCESS_PASS_FIXTURE || "fixtures/AccessPassPlanner.json";
const outPath = process.env.OUT || "artifacts/access-pass-gates.json";
const reviewedAt = process.env.REVIEWED_AT || "2026-05-10T00:00:00.000Z";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));

const baselinePlanner = buildAccessPassPlanner(fixture);
const baselineReview = buildAccessPassIssuerReview({ accessPassState: baselinePlanner, reviewedAt });

const scenarios = [
  buildScenario("baseline", fixture),
  buildScenario("duplicate-redemption", {
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
  }),
  buildScenario("missing-txid", {
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
  }),
  buildScenario("expired-redemption", {
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
  })
];

const artifact = {
  schema: "tn12-access-pass-gates/v1",
  network: fixture.network || "kaspa-testnet-12",
  reviewedAt,
  status: "access-pass-gates-ready",
  summary: {
    passes: baselinePlanner.summary.totalPasses,
    acceptedRedemptions: baselinePlanner.summary.acceptedRedemptions,
    duplicateRedemptions: baselinePlanner.summary.duplicateRedemptions,
    missingAcceptedTxids: baselinePlanner.summary.missingAcceptedTxids,
    expiredPasses: baselineReview.summary.expiredPasses,
    expiredRedemptions: baselineReview.summary.expiredRedemptions
  },
  scenarios,
  boundaries: [
    "Access passes are issuer/indexer claims, not native covenant-enforced tickets.",
    "Accepted redemptions count only when the txid exists.",
    "Duplicate or post-expiry redemptions stay review-only."
  ]
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`acceptedRedemptions=${artifact.summary.acceptedRedemptions}`);
console.log(`duplicateRedemptions=${artifact.summary.duplicateRedemptions}`);

function buildScenario(label, scenarioFixture) {
  const planner = buildAccessPassPlanner(scenarioFixture);
  const review = buildAccessPassIssuerReview({ accessPassState: planner, reviewedAt });
  const workshopPass = planner.passes.find((pass) => pass.passId === "pass-dev-workshop-001");
  const workshopRedemption = review.redemptionRows.find((row) => row.redemptionId.startsWith("redeem-workshop-alpha"));

  return {
    label,
    planner: {
      acceptedRedemptions: planner.summary.acceptedRedemptions,
      duplicateRedemptions: planner.summary.duplicateRedemptions,
      missingAcceptedTxids: planner.summary.missingAcceptedTxids
    },
    review: {
      expiredPasses: review.summary.expiredPasses,
      expiredRedemptions: review.summary.expiredRedemptions,
      workshopPassState: workshopPass?.state || "",
      workshopRedemptionStatus: workshopRedemption?.status || ""
    }
  };
}
