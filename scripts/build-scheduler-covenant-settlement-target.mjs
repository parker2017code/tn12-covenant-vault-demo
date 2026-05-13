import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchedulerCovenantSettlementTarget } from "../src/schedulerCovenantSettlementTarget.mjs";

const outPath = process.env.OUT || "artifacts/scheduler-covenant-settlement-target.json";

const [workbench, intentRegistry, binding] = await Promise.all([
  readJson("artifacts/universal-scheduler-workbench.json"),
  readJson("artifacts/scheduler-intent-registry.json"),
  readJson("artifacts/scheduler-covenant-binding.json")
]);

const artifact = buildSchedulerCovenantSettlementTarget({
  workbench,
  intentRegistry,
  binding
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
