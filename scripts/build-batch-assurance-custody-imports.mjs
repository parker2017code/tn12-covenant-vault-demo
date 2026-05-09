import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceCustodyImports } from "../src/batchAssuranceCustodyImports.mjs";

const importPath = process.env.IMPORTS || "fixtures/BatchAssuranceCustodyImports.json";
const campaignPath = process.env.CAMPAIGN_STATE || "artifacts/batch-assurance-campaign.json";
const requirementsPath = process.env.CUSTODY_REQUIREMENTS || "artifacts/batch-assurance-custody-requirements.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-custody-imports.json";

const importFixture = JSON.parse(await readFile(importPath, "utf8"));
const campaignState = JSON.parse(await readFile(campaignPath, "utf8"));
const custodyRequirements = JSON.parse(await readFile(requirementsPath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));

const imports = buildBatchAssuranceCustodyImports({
  importFixture,
  campaignState,
  custodyRequirements,
  checkpointIndex
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(imports, null, 2)}\n`);

console.log(outPath);
console.log(`status=${imports.status}`);
console.log(`ready=${imports.summary.readyCount}`);
console.log(`blocked=${imports.summary.blockedCount}`);
