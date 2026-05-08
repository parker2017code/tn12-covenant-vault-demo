import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildIndexerStorageSchema } from "../src/indexerStorageSchema.mjs";

const replayPlanPath = process.env.REPLAY_PLAN || "artifacts/indexer-replay-plan.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const outPath = process.env.OUT || "artifacts/indexer-storage-schema.json";

const replayPlan = JSON.parse(await readFile(replayPlanPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const storageSchema = buildIndexerStorageSchema({ replayPlan, checkpointIndex });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(storageSchema, null, 2)}\n`);

console.log(outPath);
console.log(`status=${storageSchema.status}`);
console.log(`tables=${storageSchema.tables.length}`);
console.log(`records=${storageSchema.sourceCheckpoint.recordCount}`);
