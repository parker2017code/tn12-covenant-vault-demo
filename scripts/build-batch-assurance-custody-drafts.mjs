import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceCustodyDrafts } from "../src/batchAssuranceCustodyDrafts.mjs";

const campaignPath = process.env.CAMPAIGN_STATE || "artifacts/batch-assurance-campaign.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-custody-drafts.json";
const campaignState = JSON.parse(await readFile(campaignPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const custodyDrafts = buildBatchAssuranceCustodyDrafts({ campaignState, checkpointIndex });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(custodyDrafts, null, 2)}\n`);

console.log(outPath);
console.log(`status=${custodyDrafts.status}`);
console.log(`eligible=${custodyDrafts.summary.eligibleInputCount}`);
console.log(`blocked=${custodyDrafts.summary.blockedInputCount}`);
