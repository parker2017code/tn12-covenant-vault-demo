import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildStandardsAdapterBacklog } from "../src/standardsAdapterBacklog.mjs";

const outPath = process.env.OUT || "artifacts/standards-adapter-backlog.json";
const backlog = buildStandardsAdapterBacklog({
  provenStatus: await readJson("artifacts/proven-status.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  playgroundSession: await readJson("artifacts/playground-session.example.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(backlog, null, 2)}\n`);
console.log(outPath);
console.log(`lanes=${backlog.summary.lanes}`);
console.log(`proofAvailableLanes=${backlog.summary.proofAvailableLanes}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
