import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceSubmitRunbook } from "../src/batchAssuranceSubmitRunbook.mjs";

const settlementDecision = JSON.parse(await readFile(process.env.BATCH_SETTLEMENT_DECISION || "artifacts/batch-assurance-settlement-decision.json", "utf8"));
const settlementDrafts = JSON.parse(await readFile(process.env.BATCH_SETTLEMENT_DRAFTS || "artifacts/batch-assurance-settlement-drafts.json", "utf8"));
const custodyImports = JSON.parse(await readFile(process.env.BATCH_CUSTODY_IMPORTS || "artifacts/batch-assurance-custody-imports.json", "utf8"));
const outPath = process.env.OUT || "artifacts/batch-assurance-submit-runbook.json";

const runbook = buildBatchAssuranceSubmitRunbook({ settlementDecision, settlementDrafts, custodyImports });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(runbook, null, 2)}\n`);

console.log(outPath);
console.log(`status=${runbook.status}`);
console.log(`selectedPath=${runbook.selectedPath}`);
