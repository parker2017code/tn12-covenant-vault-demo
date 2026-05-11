import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSelfServeLaneRunbook } from "../src/selfServeLaneRunbook.mjs";

const outPath = process.env.OUT || "artifacts/self-serve-lane-runbook.json";
const runbook = buildSelfServeLaneRunbook({
  provenStatus: await readJson("artifacts/proven-status.json"),
  playgroundPlan: await readJson("artifacts/playground-plan.json"),
  acceptedActivity: await readJson("artifacts/defi-accepted-activity-ledger.json"),
  benchmark: await readJson("artifacts/full-defi-benchmark.json"),
  batchAssurance: await readJson("artifacts/batch-assurance-campaign.json"),
  escrowActionMap: await readJson("artifacts/escrow-marketplace-action-map.json"),
  coordinationMarket: await readJson("artifacts/coordination-market-prototype.json"),
  walletRequests: await readJson("artifacts/wallet-standard-requests.json"),
  accessPasses: await readJson("artifacts/access-pass-planner.json"),
  auctionIntents: await readJson("artifacts/auction-intents.json"),
  agentCommitments: await readJson("artifacts/agent-commitments.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(runbook, null, 2)}\n`);
console.log(outPath);
console.log(`lanes=${runbook.summary.lanes}`);
console.log(`playNow=${runbook.summary.playNow}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
