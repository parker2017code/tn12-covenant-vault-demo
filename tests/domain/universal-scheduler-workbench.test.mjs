import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildUniversalSchedulerWorkbench } from "../../src/universalSchedulerWorkbench.mjs";

const artifact = buildUniversalSchedulerWorkbench({
  schedulerRegistry: await readJson("artifacts/scheduler-intent-registry.json"),
  schedulerBinding: await readJson("artifacts/scheduler-covenant-binding.json"),
  coordinationPrototype: await readJson("artifacts/coordination-market-prototype.json"),
  coordinationBrief: await readJson("artifacts/coordination-market-settlement-brief.json"),
  auctionCustody: await readJson("artifacts/auction-custody-review.json"),
  agentSettlement: await readJson("artifacts/agent-settlement-review.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-universal-scheduler-workbench/v1");
assert.equal(artifact.status, "scheduler-workbench-ready");
assert.equal(artifact.summary.jobs, 6);
assert.ok(artifact.summary.acceptedEvidenceJobs >= 4);
assert.ok(artifact.summary.replayCheckedJobs >= 5);
assert.ok(artifact.summary.blockedPredictions >= 10);
assert.equal(artifact.summary.liveProductClaims, 0);
assert.equal(artifact.summary.protocolSchedulerClaims, 0);
assert.equal(artifact.summary.autonomousCustodyClaims, 0);
assert.equal(artifact.summary.mainnetClaims, 0);
assert.equal(artifact.runThisFirst.id, "accepted-scheduler-trigger-replay");
assert.ok(artifact.runThisFirst.currentEvidence.length >= 3);
assert.match(artifact.runThisFirst.expectedResult, /executed/);
assert.ok(artifact.jobs.some((job) => job.id === "scheduler-trigger-execution" && job.tn12Reality === "accepted-evidence"));
assert.ok(artifact.jobs.some((job) => job.id === "coordination-pack-solver" && /qualifying intendos/.test(job.observed)));
assert.ok(artifact.jobs.some((job) => job.id === "agent-task-settlement-review" && job.blockedCases.length > 0));
assert.ok(artifact.expectedBehavior.some((row) => /accepted execution receipt/.test(row)));
assert.ok(artifact.predictionsToTestNext.some((row) => /stale-source bid/.test(row)));
assert.ok(artifact.boundaries.some((row) => /not a protocol universal scheduler/.test(row)));

const checkedIn = await readJson("artifacts/universal-scheduler-workbench.json");
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.summary.jobs, artifact.summary.jobs);

console.log("Universal scheduler workbench tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
