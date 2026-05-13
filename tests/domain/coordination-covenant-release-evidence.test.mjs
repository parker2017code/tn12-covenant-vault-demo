import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [funding, outpoints, releaseDrafts, evidence] = await Promise.all([
  readJson("artifacts/signed-drafts/coordination-covenant-pledge-funding.json"),
  readJson("fixtures/CoordinationCovenantPledgeOutpoints.json"),
  readJson("artifacts/signed-drafts/coordination-covenant-release-spends.json"),
  readJson("artifacts/coordination-covenant-release-evidence.json")
]);

assert.equal(funding.schema, "tn12-coordination-covenant-pledge-funding-draft/v1");
assert.equal(funding.status, "signed-covenant-pledges-not-broadcast");
assert.equal(funding.checks.allPledgeOutputsHaveCovenantBinding, true);
assert.equal(funding.outputs.length, 3);
assert.ok(funding.outputs.every((row) => /^[0-9a-f]{64}$/.test(row.covenant?.covenantId || "")));

assert.equal(outpoints.schema, "tn12-coordination-covenant-pledge-outpoints/v1");
assert.equal(outpoints.status, "accepted");
assert.equal(outpoints.fundingTxid, funding.transactionId);
assert.equal(outpoints.pledgeOutputCount, 3);
assert.ok(outpoints.outpoints.every((row) => row.status === "accepted"));

assert.equal(releaseDrafts.schema, "tn12-coordination-covenant-release-drafts/v1");
assert.equal(releaseDrafts.status, "signed-release-spends-not-broadcast");
assert.equal(releaseDrafts.releases.length, 3);
assert.ok(releaseDrafts.releases.every((row) => row.draftPath && row.transactionId));

assert.equal(evidence.schema, "tn12-coordination-covenant-release-evidence/v1");
assert.equal(evidence.status, "accepted-covenant-release-spends");
assert.equal(evidence.funding.allPledgeOutputsHaveCovenantBinding, true);
assert.equal(evidence.summary.pledgeOutputs, 3);
assert.equal(evidence.summary.releaseDrafts, 3);
assert.equal(evidence.summary.acceptedReleases, 3);
assert.ok(evidence.releases.every((row) => row.status === "accepted"));
assert.ok(evidence.boundaries.some((row) => /threshold/.test(row)));

console.log("Coordination covenant release evidence tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
