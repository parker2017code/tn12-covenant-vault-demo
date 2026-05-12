import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildReviewerSettlementFlow } from "../src/reviewerSettlementFlow.mjs";

const outPath = process.env.OUT || "artifacts/reviewer-settlement-flow.json";

const flow = buildReviewerSettlementFlow({
  fundingEvidence: await readJson("artifacts/playground-funding-20260512-evidence.json"),
  session: await readJson("artifacts/playground-session.example.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json"),
  liveWindow: await readJson("artifacts/virtual-chain-live-window.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(flow, null, 2)}\n`);

console.log(outPath);
console.log(`status=${flow.status}`);
console.log(`acceptedSessionTxids=${flow.summary.acceptedSessionTxids}`);
console.log(`matchedFundingOutputs=${flow.summary.matchedFundingOutputs}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
