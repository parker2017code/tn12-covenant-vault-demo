import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDurableReplayPromotionGuard } from "../src/durableReplayPromotionGuard.mjs";

const outPath = process.env.OUT || "artifacts/durable-replay-promotion-guard.json";
const checkpointIndex = await readJson("artifacts/checkpointed-accepted-index.json");
const fixtureReplay = await readJson("artifacts/indexer-replay-run.json");
const liveReplayRows = await readJson("artifacts/virtual-chain-live-replay-rows.json");
const liveAppState = await readJson("artifacts/virtual-chain-live-app-state.json");
const checkpointTxids = checkpointIndex.checkpoint?.txids || [];
const anchorTxid = liveAppState.matchedKnownTxids?.[0] || checkpointTxids[0] || "";
const alternateTxid = checkpointTxids.find((txid) => txid !== anchorTxid) || anchorTxid;

const rollbackTests = [
  {
    id: "remove-stale-anchor-then-add-replacement",
    before: [anchorTxid, alternateTxid].filter(Boolean),
    removedTxids: [anchorTxid].filter(Boolean),
    added: ["synthetic-replacement-app-state-txid"],
    expectedFinalTxids: [alternateTxid, "synthetic-replacement-app-state-txid"].filter(Boolean)
  },
  {
    id: "remove-none-preserves-order",
    before: [anchorTxid, alternateTxid].filter(Boolean),
    removedTxids: [],
    added: ["synthetic-new-live-txid"],
    expectedFinalTxids: [anchorTxid, alternateTxid, "synthetic-new-live-txid"].filter(Boolean)
  }
];

const guard = buildDurableReplayPromotionGuard({
  checkpointIndex,
  fixtureReplay,
  liveReplayRows,
  liveAppState,
  rollbackTests
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(guard, null, 2)}\n`);

console.log(outPath);
console.log(`status=${guard.status}`);
console.log(`promotionReady=${guard.summary.promotionReady}`);
console.log(`matchedCheckpointTxids=${guard.summary.matchedCheckpointTxids}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
