import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceSettlementDecision } from "../src/batchAssuranceSettlementDecision.mjs";

const settlementDraftsPath = process.env.BATCH_ASSURANCE_SETTLEMENT_DRAFTS || "artifacts/batch-assurance-settlement-drafts.json";
const custodyRequirementsPath = process.env.BATCH_ASSURANCE_CUSTODY_REQUIREMENTS || "artifacts/batch-assurance-custody-requirements.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-settlement-decision.json";

const settlementDrafts = JSON.parse(await readFile(settlementDraftsPath, "utf8"));
const custodyRequirements = JSON.parse(await readFile(custodyRequirementsPath, "utf8"));
const decision = buildBatchAssuranceSettlementDecision({ settlementDrafts, custodyRequirements });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(decision, null, 2)}\n`);

console.log(outPath);
console.log(`status=${decision.status}`);
console.log(`selectedPath=${decision.selectedPath}`);
console.log(`submitNow=${decision.submitNow}`);
