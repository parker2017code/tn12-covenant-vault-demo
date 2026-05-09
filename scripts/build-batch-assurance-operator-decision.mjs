import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssuranceOperatorDecision } from "../src/batchAssuranceOperatorDecision.mjs";

const decisionPath = process.env.BATCH_OPERATOR_DECISION || "fixtures/BatchAssuranceOperatorDecision.json";
const settlementDecisionPath = process.env.BATCH_SETTLEMENT_DECISION || "artifacts/batch-assurance-settlement-decision.json";
const settlementDraftsPath = process.env.BATCH_SETTLEMENT_DRAFTS || "artifacts/batch-assurance-settlement-drafts.json";
const walletSignerValidationPath = process.env.WALLET_SIGNER_VALIDATION || "artifacts/wallet-standard-signer-validation.json";
const checkpointComparisonPath = process.env.CHECKPOINT_COMPARISON || "artifacts/virtual-chain-checkpoint-comparison.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-operator-decision.json";

const decisionFixture = JSON.parse(await readFile(decisionPath, "utf8"));
const settlementDecision = JSON.parse(await readFile(settlementDecisionPath, "utf8"));
const settlementDrafts = JSON.parse(await readFile(settlementDraftsPath, "utf8"));
const walletSignerValidation = JSON.parse(await readFile(walletSignerValidationPath, "utf8"));
const checkpointComparison = JSON.parse(await readFile(checkpointComparisonPath, "utf8"));

const operatorDecision = buildBatchAssuranceOperatorDecision({
  decisionFixture,
  settlementDecision,
  settlementDrafts,
  walletSignerValidation,
  checkpointComparison
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(operatorDecision, null, 2)}\n`);

console.log(outPath);
console.log(`status=${operatorDecision.status}`);
console.log(`selectedPath=${operatorDecision.selectedPath}`);
console.log(`submitNow=${operatorDecision.submitNow}`);
