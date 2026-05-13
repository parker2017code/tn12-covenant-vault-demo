import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildWalletApprovalSummaries } from "../../src/walletApprovalSummaries.mjs";

const [resetProof, resetDraft, continuation, siblingDiscovery, muxLiveFlow, muxChallenge, schedulerPayout, schedulerTarget, schedulerNegatives, coordinationRelease, coordinationRefund, heistEvidence, checkedIn] = await Promise.all([
  readJson("artifacts/recurring-treasury-vault-window-reset-proof.json"),
  readJson("artifacts/signed-drafts/recurring-treasury-vault-window-reset.json"),
  readJson("fixtures/RecurringTreasuryVaultWindowResetContinuationOutpoint.json"),
  readJson("artifacts/sibling-input-discovery.json"),
  readJson("artifacts/blitz-mux-live-flow-evidence.json"),
  readJson("artifacts/blitz-mux-challenge-settlement.json"),
  readJson("artifacts/scheduler-covenant-payout-evidence.json"),
  readJson("artifacts/scheduler-covenant-settlement-target.json"),
  readJson("artifacts/scheduler-covenant-payout-negative-evidence.json"),
  readJson("artifacts/coordination-covenant-release-evidence.json"),
  readJson("artifacts/coordination-covenant-refund-evidence.json"),
  readJson("artifacts/covenant-heist-evidence.json"),
  readJson("artifacts/wallet-approval-summaries.json")
]);

const artifact = buildWalletApprovalSummaries({
  resetProof,
  resetDraft,
  continuation,
  siblingDiscovery,
  muxLiveFlow,
  muxChallenge,
  schedulerPayout,
  schedulerTarget,
  schedulerNegatives,
  coordinationRelease,
  coordinationRefund,
  heistEvidence,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-wallet-approval-summaries/v1");
assert.equal(artifact.status, "wallet-approval-summary-ready");
assert.equal(artifact.summaries.length, 6);

const summary = artifact.summaries.find((item) => item.id === "recurring-cap-reset-window");
assert.equal(summary.id, "recurring-cap-reset-window");
assert.equal(summary.recommendedWalletDecision, "approve-if-user-initiated");
assert.equal(summary.technicalChecks.spendTxid, resetProof.accepted.resetTxid);
assert.equal(summary.technicalChecks.explorerUrl, `https://tn12.kaspa.stream/transactions/${resetProof.accepted.resetTxid}`);
assert.equal(summary.technicalChecks.covenantId, resetDraft.source.covenantId);
assert.equal(summary.technicalChecks.continuation.covenantId, resetDraft.source.covenantId);
assert.equal(summary.technicalChecks.continuation.outpoint, resetProof.accepted.continuationOutpoint);
assert.match(summary.plainAction, /40 tKAS/);
assert.ok(summary.userChecks.some((item) => /Cap: 75 tKAS/.test(item)));
assert.ok(summary.userChecks.some((item) => /Next spent in window: 40 tKAS/.test(item)));
assert.deepEqual(summary.refusalPrompts.map((item) => item.id), [
  "early-reset",
  "stale-reset-window",
  "over-cap-reset"
]);
assert.ok(summary.refusalPrompts.every((item) => item.recommendedWalletDecision === "reject"));
assert.ok(summary.boundaries.some((item) => /testnet/.test(item)));

const siblingSummary = artifact.summaries.find((item) => item.id === "sibling-asset-strike");
assert.equal(siblingSummary.recommendedWalletDecision, "approve-if-user-initiated");
assert.equal(siblingSummary.technicalChecks.requiredSibling.covenantId, siblingDiscovery.requiredSibling.covenantId);
assert.equal(siblingSummary.technicalChecks.requiredSibling.witnessInput, 1);
assert.equal(siblingSummary.technicalChecks.selectedCandidate.outpoint, siblingDiscovery.selectedCandidate.outpoint);
assert.equal(siblingSummary.technicalChecks.acceptedStrike.txid, siblingDiscovery.acceptedStrike.txid);
assert.equal(siblingSummary.refusalPrompts.length, 3);
assert.ok(siblingSummary.userChecks.some((item) => item.includes("Required sibling input index: 1")));

const muxSummary = artifact.summaries.find((item) => item.id === "mux-worker-route-timeout");
assert.equal(muxSummary.recommendedWalletDecision, "approve-if-user-initiated");
assert.equal(muxSummary.technicalChecks.family.covenantId, muxLiveFlow.contractFamily.covenantId);
assert.equal(muxSummary.technicalChecks.normalWorkerReturn.txid, "bc51db872c8f926fb887cf150af5bf918c44cf20f72abfc3ac4620d57fa0c037");
assert.equal(muxSummary.technicalChecks.timeoutSettlement.txid, "26be92cbbde3673e2ba539412b981655693ed3f4a08c8ad9f7ce3b2e47aef036");
assert.equal(muxSummary.technicalChecks.workerBSettlement.txid, "9985e4e92d5e877b1530ae00625be29429350bb6393c9da1ee5a9d92c9fa9eb2");
assert.deepEqual(muxSummary.refusalPrompts.map((item) => item.id), [
  "bad-selector-challenge",
  "too-early-timeout-challenge"
]);

const schedulerSummary = artifact.summaries.find((item) => item.id === "scheduler-covenant-payout");
assert.equal(schedulerSummary.recommendedWalletDecision, "approve-if-user-initiated");
assert.equal(schedulerSummary.technicalChecks.release.txid, schedulerPayout.release.txid);
assert.equal(schedulerSummary.technicalChecks.release.destination, schedulerPayout.release.destination);
assert.equal(schedulerSummary.technicalChecks.schedulerContext.intentTxid, schedulerPayout.schedulerContext.intentTxid);
assert.ok(schedulerSummary.technicalChecks.scriptEnforces.includes("recipient destination"));
assert.ok(schedulerSummary.technicalChecks.replayStillChecks.some((item) => /stale/.test(item)));
assert.deepEqual(schedulerSummary.refusalPrompts.map((item) => item.id), [
  "stale-or-duplicate-scheduler-row",
  "wrong_recipient_rejects",
  "wrong_payout_amount_rejects",
  "wrong_input_value_rejects"
]);
assert.ok(schedulerSummary.refusalPrompts.some((item) => item.evidenceClass === "LOCAL_SCRIPT_ENGINE_REJECT"));
assert.ok(schedulerSummary.boundaries.some((item) => item.includes("replay/indexer-derived")));

const coordinationSummary = artifact.summaries.find((item) => item.id === "coordination-covenant-release");
assert.equal(coordinationSummary.recommendedWalletDecision, "approve-if-user-initiated");
assert.equal(coordinationSummary.technicalChecks.funding.txid, coordinationRelease.funding.txid);
assert.equal(coordinationSummary.technicalChecks.refundFunding.txid, coordinationRefund.funding.txid);
assert.equal(coordinationSummary.technicalChecks.releases.length, 3);
assert.equal(coordinationSummary.technicalChecks.refunds.length, 3);
assert.ok(coordinationSummary.userChecks.some((item) => /Total released: 99.99985 tKAS/.test(item)));
assert.ok(coordinationSummary.userChecks.some((item) => /Accepted refunds on separate fresh pledge set: 3/.test(item)));
assert.deepEqual(coordinationSummary.refusalPrompts.map((item) => item.id), ["non-selected-refund-after-release"]);

const heistSummary = artifact.summaries.find((item) => item.id === "vault-negative-checks");
assert.equal(heistSummary.recommendedWalletDecision, "reject-invalid-attempts");
assert.equal(heistSummary.technicalChecks.acceptedBackbone.resetTxid, heistEvidence.acceptedBackbone.resetTxid);
assert.equal(heistSummary.refusalPrompts.length, heistEvidence.rows.length);
assert.ok(heistSummary.refusalPrompts.some((item) => item.id === "wrong-destination"));
assert.ok(heistSummary.boundaries.includes("TN12 broadcast-rejected invalid candidates"));

assert.equal(checkedIn.schema, artifact.schema);
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.summaries.length, artifact.summaries.length);
assert.equal(checkedIn.summaries.find((item) => item.id === summary.id).technicalChecks.spendTxid, summary.technicalChecks.spendTxid);

console.log("Wallet approval summary tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
