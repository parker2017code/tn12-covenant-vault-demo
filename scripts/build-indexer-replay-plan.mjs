import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildIndexerReplayPlan } from "../src/indexerReplayPlan.mjs";

const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const persistedPath = process.env.PERSISTED_CHECKPOINT || "artifacts/persisted-checkpoint-guard.json";
const outPath = process.env.OUT || "artifacts/indexer-replay-plan.json";
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const persistedCheckpoint = JSON.parse(await readFile(persistedPath, "utf8"));
const replayPlan = buildIndexerReplayPlan({ checkpointIndex, persistedCheckpoint });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(replayPlan, null, 2)}\n`);

console.log(outPath);
console.log(`status=${replayPlan.status}`);
console.log(`records=${replayPlan.currentCheckpoint.recordCount}`);
console.log(`next=${replayPlan.buildOrder.filter((step) => step.status === "next").length}`);
