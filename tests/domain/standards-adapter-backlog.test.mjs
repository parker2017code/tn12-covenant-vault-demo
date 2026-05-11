import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildStandardsAdapterBacklog } from "../../src/standardsAdapterBacklog.mjs";

const backlog = buildStandardsAdapterBacklog({
  provenStatus: await readJson("artifacts/proven-status.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  playgroundSession: await readJson("artifacts/playground-session.example.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(backlog.schema, "tn12-standards-adapter-backlog/v1");
assert.equal(backlog.network, "kaspa-testnet-12");
assert.equal(backlog.status, "standards-adapter-backlog-ready");
assert.equal(backlog.summary.lanes, 7);
assert.equal(backlog.summary.liveProductClaims, 0);
assert.equal(backlog.summary.copiedBrandingClaims, 0);
assert.equal(backlog.summary.institutionalClaims, 0);
assert.ok(backlog.summary.proofAvailableLanes >= 5);
assert.ok(backlog.lanes.some((lane) => lane.id === "x402-http-payment-adapter" && lane.proofAvailable));
assert.ok(backlog.lanes.some((lane) => lane.id === "wallet-signing-standard" && !lane.proofAvailable));
assert.ok(backlog.rules.some((rule) => /not as claims of certification/.test(rule)));

const checkedIn = await readJson("artifacts/standards-adapter-backlog.json");
assert.equal(checkedIn.summary.lanes, backlog.summary.lanes);

console.log("Standards adapter backlog tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
