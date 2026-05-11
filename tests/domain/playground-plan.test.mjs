import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPlaygroundPlan } from "../../src/playgroundPlan.mjs";

const artifact = buildPlaygroundPlan({
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  provenStatus: await readJson("artifacts/proven-status.json"),
  benchmark: await readJson("artifacts/full-defi-benchmark.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(artifact.schema, "tn12-playground-plan/v1");
assert.equal(artifact.status, "playground-plan-ready");
assert.equal(artifact.target, "real-tn12-session-playground");
assert.equal(artifact.summary.roles, 6);
assert.equal(artifact.summary.guidedActions, 7);
assert.equal(artifact.summary.sharedWalletPrivateKeys, 0);
assert.equal(artifact.summary.committedSecrets, 0);
assert.equal(artifact.summary.mainnetClaims, 0);
assert.equal(artifact.summary.liveProductClaims, 0);
assert.ok(artifact.roles.every((role) => /^kaspa-testnet-12$/.test(role.network)));
assert.ok(artifact.roles.every((role) => role.privateKeyPolicy === "session-only-not-committed"));
assert.ok(artifact.actions.some((action) => action.enforcement === "TN12_ACCEPTED_TARGET"));
assert.ok(artifact.actions.some((action) => action.enforcement === "REJECTED_BY_REDUCER"));
assert.ok(artifact.hardRules.some((rule) => /Never expose or reuse repo private keys/.test(rule)));

const checkedIn = await readJson("artifacts/playground-plan.json");
assert.equal(checkedIn.status, artifact.status);
assert.equal(checkedIn.summary.roles, artifact.summary.roles);

console.log("Playground plan tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
