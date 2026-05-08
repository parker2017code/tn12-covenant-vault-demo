import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainIngestionPlan } from "../src/virtualChainIngestion.mjs";

const replayPlanPath = process.env.REPLAY_PLAN || "artifacts/indexer-replay-plan.json";
const storageSchemaPath = process.env.INDEXER_STORAGE_SCHEMA || "artifacts/indexer-storage-schema.json";
const submitRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-ingestion-plan.json";

const replayPlan = JSON.parse(await readFile(replayPlanPath, "utf8"));
const storageSchema = JSON.parse(await readFile(storageSchemaPath, "utf8"));
const submitRequests = JSON.parse(await readFile(submitRequestsPath, "utf8"));
const plan = buildVirtualChainIngestionPlan({ replayPlan, storageSchema, submitRequests });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(plan, null, 2)}\n`);

console.log(outPath);
console.log(`status=${plan.status}`);
console.log(`records=${plan.sourceCheckpoint.recordCount}`);
