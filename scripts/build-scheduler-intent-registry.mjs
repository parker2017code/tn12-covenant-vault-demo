import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchedulerIntentRegistry } from "../src/schedulerIntentRegistry.mjs";

const outPath = process.env.OUT || "artifacts/scheduler-intent-registry.json";
const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
const acceptedActivity = await readJson("artifacts/defi-accepted-activity-ledger.json");
const payloadEvidenceByPath = Object.fromEntries(await Promise.all(
  (payloadEvents.events || []).map(async (event) => [event.outPath, await readOptionalJson(event.outPath)])
));
const executionEvidenceByPath = {
  "artifacts/tn12-scheduler-execution-payout-user-03-evidence.json": await readOptionalJson("artifacts/tn12-scheduler-execution-payout-user-03-evidence.json")
};

const registry = buildSchedulerIntentRegistry({
  payloadEvents,
  payloadEvidenceByPath,
  executionEvidenceByPath,
  acceptedActivity
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`status=${registry.status}`);
console.log(`acceptedIntents=${registry.summary.acceptedIntents}`);
console.log(`eligibleTriggers=${registry.summary.eligibleTriggers}`);
console.log(`executedTriggers=${registry.summary.executedTriggers}`);
console.log(`schedulerBids=${registry.summary.schedulerBids}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch {
    return {};
  }
}
