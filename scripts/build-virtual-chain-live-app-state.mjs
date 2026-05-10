import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainLiveAppState } from "../src/virtualChainLiveAppState.mjs";

const liveReplayRowsPath = process.env.VIRTUAL_CHAIN_LIVE_REPLAY_ROWS || "artifacts/virtual-chain-live-replay-rows.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-live-app-state.json";

const liveReplayRows = JSON.parse(await readFile(liveReplayRowsPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));

const appState = buildVirtualChainLiveAppState({ liveReplayRows, checkpointIndex });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(appState, null, 2)}\n`);

console.log(outPath);
console.log(`status=${appState.status}`);
console.log(`liveAcceptedTransactions=${appState.summary.liveAcceptedTransactions}`);
console.log(`matchedCheckpointTxids=${appState.summary.matchedCheckpointTxids}`);
console.log(`forwardIndexingCapable=${appState.operationalStatus.forwardIndexingCapable}`);
console.log(`appStatePromoted=${appState.appStatePromoted}`);
