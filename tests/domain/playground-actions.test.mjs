import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPlaygroundActions } from "../../src/playgroundActions.mjs";

const actions = buildPlaygroundActions({
  plan: await readJson("artifacts/playground-plan.json"),
  session: await readJson("artifacts/playground-session.example.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(actions.schema, "tn12-playground-actions/v1");
assert.equal(actions.status, "playground-actions-ready");
assert.equal(actions.summary.actions, 7);
assert.equal(actions.summary.readyActions, 6);
assert.equal(actions.summary.realTn12Targets, 5);
assert.equal(actions.summary.reducerChecks, 2);
assert.equal(actions.summary.liveProductClaims, 0);
assert.equal(actions.summary.privateKeysIncluded, 0);
assert.ok(actions.actionRows.some((row) => row.id === "payload-receipt" && row.ready));
assert.ok(actions.actionRows.some((row) => row.id === "bad-withdrawal-check" && row.ready));
assert.ok(actions.actionRows.some((row) => row.id === "pool-deposit" && row.ready));
assert.ok(actions.actionRows.some((row) => row.id === "replay-state" && !row.ready));

const checkedIn = await readJson("artifacts/playground-actions.json");
assert.equal(checkedIn.summary.actions, actions.summary.actions);

console.log("Playground actions tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
