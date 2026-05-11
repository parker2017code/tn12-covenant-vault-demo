import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPlaygroundPlan } from "../src/playgroundPlan.mjs";

const outPath = process.env.OUT || "artifacts/playground-plan.json";
const artifact = buildPlaygroundPlan({
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  provenStatus: await readJson("artifacts/proven-status.json"),
  benchmark: await readJson("artifacts/full-defi-benchmark.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`roles=${artifact.summary.roles}`);
console.log(`guidedActions=${artifact.summary.guidedActions}`);
console.log(`sharedWalletPrivateKeys=${artifact.summary.sharedWalletPrivateKeys}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
