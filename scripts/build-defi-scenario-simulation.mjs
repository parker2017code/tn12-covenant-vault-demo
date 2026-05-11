import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiScenarioSimulation } from "../src/defiScenarioSimulation.mjs";

const fixturePath = process.env.DEFI_SCENARIO_FIXTURE || "fixtures/DefiScenarioSimulation.json";
const outPath = process.env.OUT || "artifacts/defi-scenario-simulation.json";

const simulation = buildDefiScenarioSimulation({
  fixture: await readJson(fixturePath),
  plannerSimulation: await readJson("artifacts/defi-planner-simulation.json"),
  acceptedIndex: await readJson("artifacts/checkpointed-accepted-index.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(simulation, null, 2)}\n`);

console.log(outPath);
console.log(`status=${simulation.status}`);
console.log(`swaps=${simulation.summary.swaps}`);
console.log(`lendingPositions=${simulation.summary.lendingPositions}`);
console.log(`blockedNegativeCases=${simulation.summary.blockedNegativeCases}`);
console.log(`acceptedReferencesIndexed=${simulation.summary.acceptedReferencesIndexed}/${simulation.summary.acceptedReferences}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
