import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiAdvancedSimulation } from "../src/defiAdvancedSimulation.mjs";

const fixturePath = process.env.DEFI_ADVANCED_FIXTURE || "fixtures/DefiAdvancedSimulation.json";
const outPath = process.env.OUT || "artifacts/defi-advanced-simulation.json";

const artifact = buildDefiAdvancedSimulation({
  fixture: await readJson(fixturePath),
  scenario: await readJson("artifacts/defi-scenario-simulation.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`ammBlockedActions=${artifact.summary.ammBlockedActions}`);
console.log(`oracleBlockedCases=${artifact.summary.oracleBlockedCases}`);
console.log(`lendingBlocked=${artifact.summary.lendingBlocked}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
