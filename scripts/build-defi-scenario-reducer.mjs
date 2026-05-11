import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiScenarioReducer } from "../src/defiScenarioReducer.mjs";

const outPath = process.env.OUT || "artifacts/defi-scenario-reducer.json";
const scenario = await readJson("artifacts/defi-scenario-simulation.json");

const reducer = buildDefiScenarioReducer({
  scenario,
  duplicateCandidates: [
    {
      id: "swap-ok-001",
      txid: "8e3911ac9bd6d65e81e77a0ce69554ba3259f44c3846f026a64ed3f8e03e0807"
    }
  ],
  missingCandidates: [
    {
      id: "swap-missing-accepted-reference",
      txid: "missing-defi-scenario-txid"
    }
  ],
  custodyPromotionCandidates: [
    {
      id: "lend-safe-001",
      txid: "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa",
      requestedAction: "custody-promotion"
    },
    {
      id: "lend-liquidation-review-001",
      txid: "8dcda29ef07f3bc2ab799241ecbe932b98f003cd37839357ae14830bfa3c6e39",
      requestedAction: "custody-promotion"
    }
  ]
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(reducer, null, 2)}\n`);

console.log(outPath);
console.log(`status=${reducer.status}`);
console.log(`stateRows=${reducer.summary.stateRows}`);
console.log(`promotedReviewRows=${reducer.summary.promotedReviewRows}`);
console.log(`blockedScenarioRows=${reducer.summary.blockedScenarioRows}`);
console.log(`blockedNegativeRows=${reducer.summary.blockedNegativeRows}/${reducer.summary.negativeRows}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
