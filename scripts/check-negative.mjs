import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAgentCommitmentBoard } from "../src/agentCommitments.mjs";
import { buildAccessPassPlanner } from "../src/accessPassPlanner.mjs";
import { buildAuctionIntentPrototype } from "../src/auctionIntent.mjs";
import { buildBatchAssuranceState } from "../src/batchAssurance.mjs";
import { buildInvoiceRegistry } from "../src/invoiceReceipt.mjs";
import { buildStableIssuerRedemptionState } from "../src/stableIssuerRedemption.mjs";

const auctionFixture = JSON.parse(await readFile(new URL("../fixtures/AuctionIntentPrototype.json", import.meta.url), "utf8"));
const highSignedOnlyAuction = buildAuctionIntentPrototype({
  ...auctionFixture,
  bids: auctionFixture.bids.map((bid) => bid.bidId === "bid-pass-003"
    ? { ...bid, amountTkas: 10000, payloadStatus: "signed-not-submitted" }
    : bid)
});
const passAuction = highSignedOnlyAuction.auctions.find((auction) => auction.auctionId === "auction-pass-001");
assert.equal(passAuction.winner.bidId, "bid-pass-002");
assert.notEqual(passAuction.winner.bidId, "bid-pass-003");

const belowReserveAuction = buildAuctionIntentPrototype({
  ...auctionFixture,
  auctions: auctionFixture.auctions.map((auction) => auction.auctionId === "auction-voucher-001"
    ? { ...auction, reserveTkas: 1000 }
    : auction)
});
const voucherAuction = belowReserveAuction.auctions.find((auction) => auction.auctionId === "auction-voucher-001");
assert.equal(voucherAuction.winner, null);
assert.equal(voucherAuction.settlementPlan.status, "no-release-yet");

const campaignFixture = JSON.parse(await readFile(new URL("../fixtures/BatchAssuranceCampaign.json", import.meta.url), "utf8"));
const signedOnlyTargetCampaign = buildBatchAssuranceState({
  ...campaignFixture,
  campaign: { ...campaignFixture.campaign, targetTkas: 100 },
  pledgeOutputs: campaignFixture.pledgeOutputs.map((pledge) => pledge.status === "accepted-output-imported"
    ? { ...pledge, amountTkas: 10 }
    : { ...pledge, amountTkas: 1000, status: "signed-not-submitted" })
});
assert.equal(signedOnlyTargetCampaign.summary.plannedTargetMet, true);
assert.equal(signedOnlyTargetCampaign.summary.acceptedTargetMet, false);
assert.equal(signedOnlyTargetCampaign.summary.releaseStatus, "release-not-ready");

const invoiceFixture = JSON.parse(await readFile(new URL("../fixtures/InvoiceReceipts.json", import.meta.url), "utf8"));
const mismatchedReceiptRegistry = buildInvoiceRegistry({
  ...invoiceFixture,
  acceptedReceipts: [{
    invoiceId: "not-the-real-invoice",
    accepted: true,
    txid: "abc123"
  }]
});
assert.equal(mismatchedReceiptRegistry.summary.paid, 0);
assert.equal(mismatchedReceiptRegistry.status, "receipt-review-needed");
assert.equal(mismatchedReceiptRegistry.summary.staleReceipts, 1);

const duplicateReceiptRegistry = buildInvoiceRegistry({
  ...invoiceFixture,
  acceptedReceipts: [
    ...invoiceFixture.acceptedReceipts,
    {
      ...invoiceFixture.acceptedReceipts[0],
      txid: "duplicate-receipt-txid"
    }
  ]
});
assert.equal(duplicateReceiptRegistry.summary.paid, 1);
assert.equal(duplicateReceiptRegistry.status, "receipt-review-needed");
assert.equal(duplicateReceiptRegistry.summary.duplicateReceipts, 1);
assert.equal(duplicateReceiptRegistry.invoices[0].receiptReviews.length, 1);

const agentFixture = JSON.parse(await readFile(new URL("../fixtures/AgentCommitments.json", import.meta.url), "utf8"));
const disputedAcceptedProofBoard = buildAgentCommitmentBoard({
  ...agentFixture,
  proofs: agentFixture.proofs.map((proof) => proof.taskId === "agent-task-escrow-001"
    ? { ...proof, reviewerStatus: "accepted", payloadStatus: "accepted-payload" }
    : proof)
});
const disputedTask = disputedAcceptedProofBoard.tasks.find((task) => task.taskId === "agent-task-escrow-001");
assert.equal(disputedTask.state, "disputed");
assert.equal(disputedTask.settlementPlan.status, "hold-during-dispute");

const accessPassFixture = JSON.parse(await readFile(new URL("../fixtures/AccessPassPlanner.json", import.meta.url), "utf8"));
const duplicateAccessPassPlanner = buildAccessPassPlanner({
  ...accessPassFixture,
  redemptions: [
    ...accessPassFixture.redemptions,
    {
      ...accessPassFixture.redemptions[0],
      redemptionId: "redeem-workshop-alpha-duplicate",
      acceptedTxid: "duplicate-fixture-txid",
      status: "accepted-redemption"
    },
    {
      ...accessPassFixture.redemptions[0],
      redemptionId: "redeem-workshop-alpha-missing-txid",
      holder: "holder-without-txid",
      acceptedTxid: "",
      status: "accepted-redemption"
    }
  ]
});
const workshopPass = duplicateAccessPassPlanner.passes.find((pass) => pass.passId === "pass-dev-workshop-001");
assert.equal(workshopPass.redeemed, 1);
assert.equal(duplicateAccessPassPlanner.summary.acceptedRedemptions, 1);
assert.equal(duplicateAccessPassPlanner.summary.duplicateRedemptions, 1);
assert.equal(duplicateAccessPassPlanner.summary.missingAcceptedTxids, 1);

const stableIssuerFixture = JSON.parse(await readFile(new URL("../fixtures/StableIssuerRedemptions.json", import.meta.url), "utf8"));
const signedOnlyFullRedemption = buildStableIssuerRedemptionState({
  ...stableIssuerFixture,
  redemptions: [
    ...stableIssuerFixture.redemptions,
    {
      recordId: "redeem-signed-only-full-balance",
      holder: "merchant-alpha",
      amountUnits: 32500,
      acceptedTxid: "",
      issuerSignature: "demo-issuer-signature-negative",
      memo: "Signed-only request attempting to consume the full accepted balance."
    }
  ]
});
assert.equal(signedOnlyFullRedemption.summary.acceptedOutstandingDisplay, "325.00");
assert.equal(signedOnlyFullRedemption.summary.signedOnlyRedemptions, 2);

console.log("Negative checks passed.");
