import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildSelfServeLaneRunbook } from "../../src/selfServeLaneRunbook.mjs";

const runbook = buildSelfServeLaneRunbook({
  provenStatus: await readJson("artifacts/proven-status.json"),
  playgroundPlan: await readJson("artifacts/playground-plan.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  benchmark: await readJson("artifacts/full-defi-benchmark.json"),
  batchAssurance: await readJson("artifacts/batch-assurance-campaign.json"),
  escrowActionMap: await readJson("artifacts/escrow-marketplace-action-map.json"),
  coordinationMarket: await readJson("artifacts/coordination-market-prototype.json"),
  walletRequests: await readJson("artifacts/wallet-standard-requests.json"),
  accessPasses: await readJson("artifacts/access-pass-planner.json"),
  auctionIntents: await readJson("artifacts/auction-intents.json"),
  agentCommitments: await readJson("artifacts/agent-commitments.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(runbook.schema, "tn12-self-serve-lane-runbook/v1");
assert.equal(runbook.status, "self-serve-lane-runbook-ready");
assert.equal(runbook.summary.lanes, 12);
assert.equal(runbook.summary.moneyRails, 2);
assert.equal(runbook.summary.covenantPrimitives, 3);
assert.equal(runbook.summary.basedAppPrototypes, 4);
assert.equal(runbook.summary.liveProductClaims, 0);
assert.equal(runbook.summary.sharedPrivateKeys, 0);
assert.ok(runbook.lanes.some((lane) => lane.id === "defi-lab" && lane.openRail.some((rail) => /No AMM custody/.test(rail))));
assert.ok(runbook.lanes.some((lane) => lane.id === "external-wallet-handoff" && lane.commands.includes("npm run wallet:standard-requests")));
assert.ok(runbook.lanes.some((lane) => lane.id === "coordination-stag" && lane.status === "research-play"));
assert.ok(runbook.lanes.some((lane) => lane.id === "defi-lab" && lane.stackLayer === "based-app-prototype"));
assert.ok(runbook.lanes.every((lane) => lane.uiTarget && lane.evidence.length > 0 && lane.commands.length > 0));

const checkedIn = await readJson("artifacts/self-serve-lane-runbook.json");
assert.equal(checkedIn.status, runbook.status);
assert.equal(checkedIn.summary.lanes, runbook.summary.lanes);

console.log("Self-serve lane runbook tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
