import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceCustodyRequirements } from "../src/batchAssuranceCustodyRequirements.mjs";

const campaignPath = process.env.CAMPAIGN_STATE || "artifacts/batch-assurance-campaign.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const custodyPath = process.env.CUSTODY_DRAFTS || "artifacts/batch-assurance-custody-drafts.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-custody-requirements.json";
const campaignState = JSON.parse(await readFile(campaignPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const custodyDrafts = JSON.parse(await readFile(custodyPath, "utf8"));
const requirements = buildBatchAssuranceCustodyRequirements({
  campaignState,
  checkpointIndex,
  custodyDrafts
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(requirements, null, 2)}\n`);

console.log(outPath);
console.log(`status=${requirements.status}`);
console.log(`ready=${requirements.summary.readyCount}`);
console.log(`blocked=${requirements.summary.blockedCount}`);
