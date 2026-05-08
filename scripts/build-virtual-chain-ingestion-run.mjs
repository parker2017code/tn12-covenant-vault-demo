import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainIngestionRun } from "../src/virtualChainIngestionRun.mjs";

const ingestionPlanPath = process.env.VIRTUAL_CHAIN_PLAN || "artifacts/virtual-chain-ingestion-plan.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const submitRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-ingestion-run.json";

const ingestionPlan = JSON.parse(await readFile(ingestionPlanPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const submitRequests = JSON.parse(await readFile(submitRequestsPath, "utf8"));
const run = buildVirtualChainIngestionRun({
  ingestionPlan,
  checkpointIndex,
  submitRequests
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(run, null, 2)}\n`);

console.log(outPath);
console.log(`status=${run.status}`);
console.log(`virtualChainRows=${run.summary.virtualChainRows}`);
console.log(`rollbackRows=${run.summary.rollbackRows}`);
