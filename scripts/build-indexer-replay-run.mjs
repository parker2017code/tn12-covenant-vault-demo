import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildIndexerReplayRun } from "../src/indexerReplayRun.mjs";

const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const schemaPath = process.env.INDEXER_STORAGE_SCHEMA || "artifacts/indexer-storage-schema.json";
const outPath = process.env.OUT || "artifacts/indexer-replay-run.json";

const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const storageSchema = JSON.parse(await readFile(schemaPath, "utf8"));
const replayRun = buildIndexerReplayRun({ checkpointIndex, storageSchema });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(replayRun, null, 2)}\n`);

console.log(outPath);
console.log(`status=${replayRun.status}`);
console.log(`records=${replayRun.summary.records}`);
console.log(`appStateReady=${replayRun.summary.appStateReady}`);
