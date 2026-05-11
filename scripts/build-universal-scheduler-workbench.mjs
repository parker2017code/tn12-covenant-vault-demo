import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildUniversalSchedulerWorkbench } from "../src/universalSchedulerWorkbench.mjs";

const outPath = process.env.OUT || "artifacts/universal-scheduler-workbench.json";
const artifact = buildUniversalSchedulerWorkbench({
  schedulerRegistry: await readJson("artifacts/scheduler-intent-registry.json"),
  schedulerBinding: await readJson("artifacts/scheduler-covenant-binding.json"),
  coordinationPrototype: await readJson("artifacts/coordination-market-prototype.json"),
  coordinationBrief: await readJson("artifacts/coordination-market-settlement-brief.json"),
  auctionCustody: await readJson("artifacts/auction-custody-review.json"),
  agentSettlement: await readJson("artifacts/agent-settlement-review.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(outPath);
console.log(`jobs=${artifact.summary.jobs}`);
console.log(`acceptedEvidenceJobs=${artifact.summary.acceptedEvidenceJobs}`);
console.log(`blockedPredictions=${artifact.summary.blockedPredictions}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
