import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [funding, outpoints, refundDrafts, evidence] = await Promise.all([
  readJson("artifacts/signed-drafts/coordination-covenant-daa-refund-pledge-funding.json"),
  readJson("fixtures/CoordinationCovenantDaaRefundPledgeOutpoints.json"),
  readJson("artifacts/signed-drafts/coordination-covenant-refund-spends.json"),
  readJson("artifacts/coordination-covenant-refund-evidence.json")
]);

assert.equal(funding.schema, "tn12-coordination-covenant-pledge-funding-draft/v1");
assert.equal(funding.status, "signed-covenant-pledges-not-broadcast");
assert.equal(funding.checks.allPledgeOutputsHaveCovenantBinding, true);
assert.equal(funding.outputs.length, 3);

assert.equal(outpoints.schema, "tn12-coordination-covenant-pledge-outpoints/v1");
assert.equal(outpoints.status, "accepted");
assert.equal(outpoints.fundingTxid, funding.transactionId);
assert.equal(outpoints.pledgeOutputCount, 3);
assert.ok(outpoints.outpoints.every((row) => row.status === "accepted"));

assert.equal(refundDrafts.schema, "tn12-coordination-covenant-refund-drafts/v1");
assert.equal(refundDrafts.status, "signed-refund-spends-not-broadcast");
assert.equal(refundDrafts.refunds.length, 3);
assert.equal(refundDrafts.lockTime, "7000000");
assert.ok(refundDrafts.refunds.every((row) => row.draftPath && row.transactionId));

assert.equal(evidence.schema, "tn12-coordination-covenant-refund-evidence/v1");
assert.equal(evidence.status, "accepted-covenant-refund-spends");
assert.equal(evidence.funding.allPledgeOutputsHaveCovenantBinding, true);
assert.equal(evidence.summary.pledgeOutputs, 3);
assert.equal(evidence.summary.refundDrafts, 3);
assert.equal(evidence.summary.acceptedRefunds, 3);
assert.equal(evidence.summary.acceptedReleaseSpendsOnSeparateFreshOutputs, 3);
assert.ok(evidence.refunds.every((row) => row.status === "accepted"));
assert.ok(evidence.boundaries.some((row) => /separate fresh pledge set/.test(row)));

console.log("Coordination covenant refund evidence tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
