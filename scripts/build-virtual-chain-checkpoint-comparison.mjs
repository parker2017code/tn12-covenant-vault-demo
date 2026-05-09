import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainCheckpointComparison } from "../src/virtualChainCheckpointComparison.mjs";

const liveReplayRowsPath = process.env.VIRTUAL_CHAIN_LIVE_REPLAY_ROWS || "artifacts/virtual-chain-live-replay-rows.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-checkpoint-comparison.json";

const liveReplayRows = JSON.parse(await readFile(liveReplayRowsPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const comparison = buildVirtualChainCheckpointComparison({ liveReplayRows, checkpointIndex });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(comparison, null, 2)}\n`);

console.log(outPath);
console.log(`status=${comparison.status}`);
console.log(`matchedCheckpointRows=${comparison.summary.matchedCheckpointRows}`);
console.log(`appStatePromoted=${comparison.appStatePromoted}`);
