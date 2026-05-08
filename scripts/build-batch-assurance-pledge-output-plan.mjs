import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBatchAssurancePledgeOutputPlan } from "../src/batchAssurancePledgeOutputs.mjs";

const custodyRequirementsPath = process.env.CUSTODY_REQUIREMENTS || "artifacts/batch-assurance-custody-requirements.json";
const walletConnectorRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/batch-assurance-pledge-output-plan.json";

const custodyRequirements = JSON.parse(await readFile(custodyRequirementsPath, "utf8"));
const walletConnectorRequests = JSON.parse(await readFile(walletConnectorRequestsPath, "utf8"));
const plan = buildBatchAssurancePledgeOutputPlan({
  custodyRequirements,
  walletConnectorRequests
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(plan, null, 2)}\n`);

console.log(outPath);
console.log(`status=${plan.status}`);
console.log(`outputsToCreate=${plan.summary.outputsToCreate}`);
console.log(`missingTkas=${plan.summary.missingTkas}`);
