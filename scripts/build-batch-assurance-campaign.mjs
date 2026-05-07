import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceState } from "../src/batchAssurance.mjs";

const fixturePath = process.env.CAMPAIGN_FIXTURE || "fixtures/BatchAssuranceCampaign.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-campaign.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const campaign = buildBatchAssuranceState(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(campaign, null, 2)}\n`);
console.log(outPath);
console.log(`accepted=${campaign.summary.acceptedTkas}/${campaign.summary.targetTkas} TKAS`);
console.log(`release=${campaign.summary.releaseStatus}`);
