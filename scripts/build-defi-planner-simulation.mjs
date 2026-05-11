import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiPlannerSimulation } from "../src/defiPlannerSimulation.mjs";

const outPath = process.env.OUT || "artifacts/defi-planner-simulation.json";

const simulation = buildDefiPlannerSimulation({
  backlog: await readJson("artifacts/defi-backlog.json"),
  missingRails: await readJson("artifacts/missing-rails-matrix.json"),
  oracleMatrix: await readJson("artifacts/oracle-source-matrix.json"),
  acceptedIndex: await readJson("artifacts/checkpointed-accepted-index.json"),
  walletValidation: await readJson("artifacts/wallet-submit-result-validation.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(simulation, null, 2)}\n`);

console.log(outPath);
console.log(`status=${simulation.status}`);
console.log(`lanes=${simulation.summary.lanes}`);
console.log(`simulationReadyLanes=${simulation.summary.simulationReadyLanes}`);
console.log(`liveProductClaims=${simulation.summary.liveProductClaims}`);
console.log(`blockedNegativeCases=${simulation.summary.blockedNegativeCases}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
