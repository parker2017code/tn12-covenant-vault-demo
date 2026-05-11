import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchedulerCovenantBinding } from "../src/schedulerCovenantBinding.mjs";

const outPath = process.env.OUT || "artifacts/scheduler-covenant-binding.json";
const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
const payloadEvidenceByPath = Object.fromEntries(await Promise.all(
  (payloadEvents.events || []).map(async (event) => [event.outPath, await readOptionalJson(event.outPath)])
));

const artifact = buildSchedulerCovenantBinding({
  payloadEvents,
  payloadEvidenceByPath,
  proofEvidence: await readJson("artifacts/proof-evidence.json"),
  roleProofEvidence: await readJson("artifacts/role-separated-proof-evidence.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`acceptedBindings=${artifact.summary.acceptedBindings}`);
console.log(`readyBindings=${artifact.summary.readyBindings}`);

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
