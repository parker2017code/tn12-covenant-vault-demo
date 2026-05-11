import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAgentCommitmentBoard } from "../../src/agentCommitments.mjs";
import { buildAgentSettlementDrafts } from "../../src/agentSettlementDrafts.mjs";
import { buildAgentSettlementReview } from "../../src/agentSettlementReview.mjs";
import { buildAuctionCustodyReview } from "../../src/auctionCustodyReview.mjs";
import { buildAuctionIntentPrototype } from "../../src/auctionIntent.mjs";
import { buildAuctionSettlementDrafts } from "../../src/auctionSettlementDrafts.mjs";
import { buildDefiReceiptReplayGuard } from "../../src/defiReceiptReplayGuard.mjs";
import { buildDefiResearchBacklog } from "../../src/defiBacklog.mjs";
import { buildDefiV1OperatorLoop } from "../../src/defiV1OperatorLoop.mjs";
import { buildStableIssuerRedemptionState } from "../../src/stableIssuerRedemption.mjs";
import { buildStableValuePathRegistry } from "../../src/stableValuePaths.mjs";

const walletConnectorRequests = await readJson("artifacts/wallet-connector-submit-requests.json");
const walletStandardMapping = await readJson("artifacts/wallet-standard-mapping.json");

const auctionPrototype = buildAuctionIntentPrototype(await readJson("fixtures/AuctionIntentPrototype.json"));
assert.equal(auctionPrototype.status, "accepted-payload-indexer-first-not-mev-resistant");
assert.equal(auctionPrototype.summary.auctions, 2);
assert.equal(auctionPrototype.summary.acceptedBidPayloads, 3);
assert.equal(auctionPrototype.summary.acceptedSettlementEvents, 2);
assert.equal(auctionPrototype.summary.auctionsWithWinner, 1);
assert.ok(auctionPrototype.auctions.some((auction) =>
  auction.auctionId === "auction-pass-001"
  && auction.winner?.bidId === "bid-pass-002"
));

const auctionSettlementDrafts = buildAuctionSettlementDrafts({
  auctionState: auctionPrototype,
  walletConnectorRequests
});
assert.equal(auctionSettlementDrafts.status, "planner-settlement-drafts-ready-not-custody");
assert.equal(auctionSettlementDrafts.summary.drafts, 3);
assert.equal(auctionSettlementDrafts.summary.winnerReleaseDrafts, 1);
assert.equal(auctionSettlementDrafts.summary.refundDrafts, 2);
assert.equal(auctionSettlementDrafts.summary.custodyReadyDrafts, 0);

const auctionSettlementDraftsArtifact = await readJson("artifacts/auction-settlement-drafts.json");
assert.equal(auctionSettlementDraftsArtifact.summary.drafts, auctionSettlementDrafts.summary.drafts);

const auctionCustodyReview = buildAuctionCustodyReview({
  settlementDrafts: auctionSettlementDraftsArtifact,
  walletStandardMapping,
  custodySources: await readJson("fixtures/AuctionCustodySources.json"),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(auctionCustodyReview.status, "auction-custody-review-ready");
assert.equal(auctionCustodyReview.summary.custodyEvidenceRows, 2);
assert.equal(auctionCustodyReview.summary.amountMatchedRows, 2);
assert.equal(auctionCustodyReview.summary.custodyReadyRows, 2);
assert.ok(auctionCustodyReview.rows.some((row) =>
  row.id === "auction-pass-001:winner-release:bid-pass-002"
  && row.custodySourcePresent
  && row.amountMatched
  && row.status === "custody-source-ready-needs-wallet"
));

const auctionCustodyReviewArtifact = await readJson("artifacts/auction-custody-review.json");
assert.equal(auctionCustodyReviewArtifact.status, "auction-custody-review-ready");
assert.equal(auctionCustodyReviewArtifact.summary.custodyReadyRows, auctionCustodyReview.summary.custodyReadyRows);

const defiBacklog = buildDefiResearchBacklog(await readJson("fixtures/DefiResearchBacklog.json"));
assert.equal(defiBacklog.status, "research-backlog-not-live-defi");
assert.equal(defiBacklog.summary.total, 8);
assert.equal(defiBacklog.summary.researchOnly, 4);
assert.ok(defiBacklog.missingRails.includes("price oracle"));
assert.ok(defiBacklog.briefs.some((brief) =>
  brief.id === "prediction-hedge-simulator"
  && brief.status === "prototype-later"
));

const defiLoopArtifact = await readJson("artifacts/defi-v1-operator-loop.json");
assert.equal(defiLoopArtifact.status, "repeatable-live-receipt-loop-ready");
assert.ok(defiLoopArtifact.receipts.length >= 2);
assert.ok(defiLoopArtifact.receipts.every((receipt) => receipt.accepted && receipt.payloadMatches));
assert.ok(defiLoopArtifact.staleOutpointGuards.every((outpoint) => outpoint.consumed));
assert.ok(defiLoopArtifact.currentSpendableOutpoint.spendable);

const optionalThirdReceipt = await readOptionalJson("artifacts/payload-defi-v1-third-receipt-evidence.json");
const optionalThirdDraft = await readOptionalJson("artifacts/signed-drafts/tn12-defi-v1-third-receipt.json");
const optionalFourthReceipt = await readOptionalJson("artifacts/payload-defi-v1-operator-pack-004-evidence.json");
const optionalFourthDraft = await readOptionalJson("artifacts/signed-drafts/tn12-defi-v1-operator-pack-004.json");
const rebuiltDefiLoop = buildDefiV1OperatorLoop({
  firstReceipt: {
    ...await readJson("artifacts/payload-defi-v1-live-receipt-evidence.json"),
    source: (await readJson("artifacts/signed-drafts/tn12-defi-v1-payload-receipt.json")).source
  },
  repeatReceipt: {
    ...await readJson("artifacts/payload-defi-v1-repeat-receipt-evidence.json"),
    source: (await readJson("artifacts/signed-drafts/tn12-defi-v1-repeat-receipt.json")).source
  },
  thirdReceipt: optionalThirdReceipt && optionalThirdDraft ? { ...optionalThirdReceipt, source: optionalThirdDraft.source } : null,
  extraReceipts: [
    optionalFourthReceipt && optionalFourthDraft
      ? {
          id: "operator-pack-receipt-004",
          staleOutpointId: "third-change-spent",
          ...optionalFourthReceipt,
          source: optionalFourthDraft.source
        }
      : null
  ].filter(Boolean),
  fundedOutpoint: await readJson("artifacts/tn12-defi-v1-funded-outpoint.json"),
  previousCurrentOutpoint: await readJson("artifacts/tn12-defi-v1-first-change-outpoint.json"),
  thirdPreviousOutpoint: await readOptionalJson("artifacts/tn12-defi-v1-current-outpoint-before-third.json"),
  currentOutpoint: await readJson("artifacts/tn12-defi-v1-current-outpoint.json"),
  walletAddress: "kaspatest:qz8ke9lvc0prgygp9cyvemlhhdhh6wthyzx2epf2n8nhegkfgvs76tas8y3hk",
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(rebuiltDefiLoop.status, "repeatable-live-receipt-loop-ready");
assert.equal(rebuiltDefiLoop.receipts.length, defiLoopArtifact.receipts.length);

const defiReceiptReplayGuardArtifact = await readJson("artifacts/defi-receipt-replay-guard.json");
assert.equal(defiReceiptReplayGuardArtifact.status, "defi-receipt-replay-guard-ready");
assert.equal(defiReceiptReplayGuardArtifact.summary.acceptedReceipts, 4);
assert.equal(defiReceiptReplayGuardArtifact.summary.wallets, 3);
assert.equal(defiReceiptReplayGuardArtifact.summary.negativeCasesCaught, 3);
assert.deepEqual(
  defiReceiptReplayGuardArtifact.acceptedReceipts.map((receipt) => receipt.txid),
  [
    "8e3911ac9bd6d65e81e77a0ce69554ba3259f44c3846f026a64ed3f8e03e0807",
    "e92803b4a2c84fee868b0f2ec52b9e6993fb0f4762abf7b00da3c48c84ac50bd",
    "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa",
    "8dcda29ef07f3bc2ab799241ecbe932b98f003cd37839357ae14830bfa3c6e39"
  ]
);

const rebuiltDefiReceiptReplayGuard = buildDefiReceiptReplayGuard({
  receiptEvidence: [
    await readJson("artifacts/payload-defi-v1-live-receipt-evidence.json"),
    await readJson("artifacts/payload-defi-v1-repeat-receipt-evidence.json"),
    await readJson("artifacts/payload-defi-v1-multi-wallet-a-evidence.json"),
    await readJson("artifacts/payload-defi-v1-multi-wallet-b-evidence.json")
  ],
  staleCandidates: [{
    txid: "unknown-defi-receipt-txid",
    subject: "defi-v1-stale-receipt",
    walletAddress: "kaspatest:unknown"
  }],
  duplicateCandidates: [
    await readJson("artifacts/payload-defi-v1-live-receipt-evidence.json"),
    await readJson("artifacts/payload-defi-v1-live-receipt-evidence.json")
  ],
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(rebuiltDefiReceiptReplayGuard.status, "defi-receipt-replay-guard-ready");
assert.equal(
  rebuiltDefiReceiptReplayGuard.summary.negativeCasesCaught,
  defiReceiptReplayGuardArtifact.summary.negativeCasesCaught
);

const stableValuePaths = buildStableValuePathRegistry(await readJson("fixtures/StableValuePaths.json"));
assert.equal(stableValuePaths.status, "comparison-brief-not-native-stablecoin");
assert.equal(stableValuePaths.summary.total, 4);
assert.equal(stableValuePaths.summary.buildableNow, 1);
assert.ok(stableValuePaths.paths.some((path) =>
  path.id === "issuer-backed-redeemable-unit"
  && path.earliestKaspaLane === "issuer-indexer"
));
assert.ok(stableValuePaths.boundaries.some((boundary) => /not a live stablecoin/.test(boundary)));

const stableIssuerState = buildStableIssuerRedemptionState(await readJson("fixtures/StableIssuerRedemptions.json"));
assert.equal(stableIssuerState.status, "issuer-indexer-state-not-native-stablecoin");
assert.equal(stableIssuerState.summary.acceptedIssuedDisplay, "375.00");
assert.equal(stableIssuerState.summary.acceptedRedeemedDisplay, "50.00");
assert.equal(stableIssuerState.summary.acceptedOutstandingDisplay, "325.00");
assert.equal(stableIssuerState.summary.signedOnlyRedemptions, 1);
assert.ok(stableIssuerState.boundaries.some((boundary) => /not a native Kaspa stablecoin/.test(boundary)));

const agentBoard = buildAgentCommitmentBoard(await readJson("fixtures/AgentCommitments.json"));
assert.equal(agentBoard.status, "payload-indexed-agent-commitments-not-autonomous-payouts");
assert.equal(agentBoard.summary.tasks, 3);
assert.equal(agentBoard.summary.releaseReady, 1);
assert.equal(agentBoard.summary.disputed, 1);
assert.equal(agentBoard.summary.acceptedLifecycleEvents, 2);
assert.ok(agentBoard.tasks.some((task) =>
  task.taskId === "agent-task-escrow-001"
  && task.state === "disputed"
));

const agentSettlementDrafts = buildAgentSettlementDrafts({
  agentBoard,
  walletConnectorRequests
});
assert.equal(agentSettlementDrafts.status, "agent-settlement-drafts-ready-not-autonomous");
assert.equal(agentSettlementDrafts.summary.drafts, 3);
assert.equal(agentSettlementDrafts.summary.releaseDrafts, 1);
assert.equal(agentSettlementDrafts.summary.refundDrafts, 1);
assert.equal(agentSettlementDrafts.summary.holdDrafts, 1);
assert.equal(agentSettlementDrafts.summary.autonomousPayouts, 0);

const agentSettlementDraftsArtifact = await readJson("artifacts/agent-settlement-drafts.json");
assert.equal(agentSettlementDraftsArtifact.summary.drafts, agentSettlementDrafts.summary.drafts);

const agentSettlementReview = buildAgentSettlementReview({
  settlementDrafts: agentSettlementDraftsArtifact,
  walletStandardMapping,
  custodySources: await readJson("fixtures/AgentCustodySources.json"),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(agentSettlementReview.status, "agent-settlement-review-ready");
assert.equal(agentSettlementReview.summary.reviewEvidenceReadyRows, 2);
assert.equal(agentSettlementReview.summary.releaseReviewReadyRows, 1);
assert.equal(agentSettlementReview.summary.holdReviewReadyRows, 1);
assert.equal(agentSettlementReview.summary.custodyEvidenceRows, 2);
assert.equal(agentSettlementReview.summary.amountMatchedRows, 2);
assert.equal(agentSettlementReview.summary.custodyReadyRows, 2);
assert.ok(agentSettlementReview.rows.some((row) =>
  row.id === "agent-task-invoice-001:release"
  && row.reviewEvidenceReady
  && row.status === "custody-source-ready-needs-wallet"
));

const agentSettlementReviewArtifact = await readJson("artifacts/agent-settlement-review.json");
assert.equal(agentSettlementReviewArtifact.status, "agent-settlement-review-ready");
assert.equal(agentSettlementReviewArtifact.summary.reviewEvidenceReadyRows, agentSettlementReview.summary.reviewEvidenceReadyRows);
assert.equal(agentSettlementReviewArtifact.summary.custodyReadyRows, agentSettlementReview.summary.custodyReadyRows);

console.log("Market, DeFi, stable, and agent tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
