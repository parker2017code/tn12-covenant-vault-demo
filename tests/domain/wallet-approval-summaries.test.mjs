import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildWalletApprovalSummaries } from "../../src/walletApprovalSummaries.mjs";

const [resetProof, resetDraft, continuation, checkedIn] = await Promise.all([
  readJson("artifacts/recurring-treasury-vault-window-reset-proof.json"),
  readJson("artifacts/signed-drafts/recurring-treasury-vault-window-reset.json"),
  readJson("fixtures/RecurringTreasuryVaultWindowResetContinuationOutpoint.json"),
  readJson("artifacts/wallet-approval-summaries.json")
]);

const artifact = buildWalletApprovalSummaries({
  resetProof,
  resetDraft,
  continuation,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-wallet-approval-summaries/v1");
assert.equal(artifact.status, "wallet-approval-summary-ready");
assert.equal(artifact.summaries.length, 1);

const summary = artifact.summaries[0];
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

assert.equal(checkedIn.schema, artifact.schema);
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.summaries[0].technicalChecks.spendTxid, summary.technicalChecks.spendTxid);

console.log("Wallet approval summary tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
