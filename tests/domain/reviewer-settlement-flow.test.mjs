import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildReviewerSettlementFlow } from "../../src/reviewerSettlementFlow.mjs";

const fundingEvidence = await readJson("artifacts/playground-funding-20260512-evidence.json");
const session = await readJson("artifacts/playground-session.example.json");
const reducer = await readJson("artifacts/defi-scenario-reducer.json");
const liveWindow = await readJson("artifacts/virtual-chain-live-window.json");

const rebuilt = buildReviewerSettlementFlow({
  fundingEvidence,
  session,
  reducer,
  liveWindow,
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(rebuilt.schema, "tn12-reviewer-settlement-flow/v1");
assert.equal(rebuilt.status, "reviewer-settlement-flow-ready");
assert.equal(rebuilt.summary.freshFundingAccepted, true);
assert.equal(rebuilt.summary.matchedFundingOutputs, 7);
assert.equal(rebuilt.summary.acceptedSessionTxids, 4);
assert.ok(rebuilt.summary.replayedBalanceRows > 0);
assert.equal(rebuilt.summary.privateKeysIncluded, 0);
assert.equal(rebuilt.summary.userWalletRequired, false);
assert.ok(rebuilt.reviewerRun.some((step) => step.command.includes("npm run check:tn12")));
assert.ok(rebuilt.reviewerRun.some((step) => step.command.includes("--submit")));
assert.match(rebuilt.boundaries.join("\n"), /testnet reviewer run/);
assert.match(rebuilt.boundaries.join("\n"), /No mainnet funds/);

const checkedIn = await readJson("artifacts/reviewer-settlement-flow.json");
assert.equal(checkedIn.status, "reviewer-settlement-flow-ready");
assert.equal(checkedIn.acceptedEvidence.fundingTxid, "42e14cf17dba547e228729e048d2efc9ed70505b874a7ae9e32dafcdbad8a5b5");
assert.doesNotMatch(JSON.stringify(checkedIn), /\.local\/tn12-wallet\.json|"privateKey"\s*:|"mnemonic"\s*:/i);

console.log("Reviewer settlement flow tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
