import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPersistedCheckpointGuard } from "../src/indexerPersistence.mjs";

const indexPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const outPath = process.env.OUT || "artifacts/persisted-checkpoint-guard.json";

const currentIndex = JSON.parse(await readFile(indexPath, "utf8"));
const previousSnapshot = await readJsonIfPresent(outPath);
const guard = buildPersistedCheckpointGuard({
  currentIndex,
  previousSnapshot,
  sourcePath: indexPath,
  persistedAt: currentIndex.fetchedAt
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(guard, null, 2)}\n`);

if (guard.status !== "persisted-checkpoint-ready") {
  throw new Error(`Persisted checkpoint guard failed: ${guard.rollback.reason}`);
}

console.log(outPath);
console.log(`records=${guard.summary.recordCount}`);
console.log(`rollbackDetected=${guard.summary.rollbackDetected}`);
console.log(`missingTxids=${guard.summary.missingTxids}`);

async function readJsonIfPresent(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
