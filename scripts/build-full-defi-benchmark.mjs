import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildFullDefiBenchmark } from "../src/fullDefiBenchmark.mjs";

const outPath = process.env.OUT || "artifacts/full-defi-benchmark.json";
const artifact = buildFullDefiBenchmark({
  provenStatus: await readJson("artifacts/proven-status.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  schedulerRegistry: await readJson("artifacts/scheduler-intent-registry.json"),
  schedulerBinding: await readJson("artifacts/scheduler-covenant-binding.json"),
  durableReplayGuard: await readJson("artifacts/durable-replay-promotion-guard.json"),
  signerValidation: await readJson("artifacts/wallet-standard-signer-validation.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`currentPercent=${artifact.currentPercent}`);
console.log(`completedRails=${artifact.summary.completedRails}/${artifact.summary.rails}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
