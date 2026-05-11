import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiMultiWalletScenarioPack } from "../../src/defiMultiWalletScenarioPack.mjs";

const pack = buildDefiMultiWalletScenarioPack({
  scenario: await readJson("artifacts/defi-scenario-simulation.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json"),
  advanced: await readJson("artifacts/defi-advanced-simulation.json"),
  receiptGuard: await readJson("artifacts/defi-receipt-replay-guard.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(pack.status, "multi-wallet-scenario-pack-ready-local-keys");
assert.equal(pack.enforcement, "INDEXER_DERIVED");
assert.equal(pack.summary.roles, 4);
assert.equal(pack.summary.acceptedIndexedRoles, 4);
assert.equal(pack.summary.reviewStatePromotedRoles, 3);
assert.equal(pack.summary.blockedRows, 10);
assert.equal(pack.summary.actualWalletAddresses, 3);
assert.equal(pack.summary.localKeySignedReceipts, 4);
assert.equal(pack.summary.externalSignerClaims, 0);
assert.equal(pack.summary.custodyActions, 0);
assert.equal(pack.summary.liveProductClaims, 0);

const swapper = pack.roles.find((role) => role.id === "wallet-a-swapper");
assert.equal(swapper.acceptedIndexed, true);
assert.equal(swapper.promotionState, "review-state-promoted");
assert.equal(swapper.localKeyEvidence, true);
assert.match(swapper.walletAddress, /^kaspatest:/);

const reporter = pack.roles.find((role) => role.id === "wallet-c-oracle-reporter");
assert.equal(reporter.acceptedIndexed, true);
assert.equal(reporter.promotionState, "review-state-promoted");
assert.equal(reporter.externalSignerEvidence, false);

const reviewer = pack.roles.find((role) => role.id === "wallet-d-risk-reviewer");
assert.equal(reviewer.promotionState, "blocked-review");
assert.ok(reviewer.reviewProblems.includes("liquidation review is not executable"));

assert.ok(pack.blockedRows.some((row) => row.kind === "custody-promotion-candidate" && row.status === "blocked"));
assert.equal(pack.blockedRows.filter((row) => row.kind === "withdrawal-candidate" && row.status === "blocked").length, 2);
assert.ok(pack.boundaries.some((boundary) => /does not prove external wallet signing/.test(boundary)));

const artifact = await readJson("artifacts/defi-multi-wallet-scenario-pack.json");
assert.equal(artifact.status, pack.status);
assert.equal(artifact.summary.roles, pack.summary.roles);
assert.equal(artifact.summary.externalSignerClaims, 0);

console.log("DeFi multi-wallet scenario pack tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
