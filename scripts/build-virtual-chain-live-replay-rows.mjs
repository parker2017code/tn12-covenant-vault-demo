import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainLiveReplayRows } from "../src/virtualChainLiveReplayRows.mjs";

const liveWindowPath = process.env.VIRTUAL_CHAIN_LIVE_WINDOW || "artifacts/virtual-chain-live-window.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-live-replay-rows.json";

const liveWindow = JSON.parse(await readFile(liveWindowPath, "utf8"));
const replayRows = buildVirtualChainLiveReplayRows({ liveWindow });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(replayRows, null, 2)}\n`);

console.log(outPath);
console.log(`status=${replayRows.status}`);
console.log(`rows=${replayRows.summary.rows}`);
console.log(`appStatePromoted=${replayRows.appStatePromoted}`);
