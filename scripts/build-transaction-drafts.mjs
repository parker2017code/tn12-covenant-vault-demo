import { readFile } from "node:fs/promises";
import {
  DEFAULT_ASSURANCE,
  buildAssuranceArtifact,
  normalizeAssurance
} from "../src/assuranceContract.mjs";
import {
  DEFAULT_MANUAL_OUTPOINT,
  normalizeManualOutpoint
} from "../src/manualOutpoint.mjs";
import {
  DEFAULT_POLICY,
  buildPolicyArtifact,
  normalizePolicy,
  policyId
} from "../src/vaultPolicy.mjs";
import {
  DEFAULT_PLAN_INPUTS,
  buildDryRunTransactionPlan,
  normalizePlanInputs
} from "../src/transactionPlanner.mjs";
import { buildTransactionDrafts, writeTransactionDrafts } from "../src/transactionDrafts.mjs";

const parsedArgs = parseArgs(process.argv.slice(2));
const fundingOutpoint = parsedArgs.fundingOutpoint
  ? normalizeManualOutpoint(await readJson(parsedArgs.fundingOutpoint))
  : normalizeManualOutpoint(DEFAULT_MANUAL_OUTPOINT);
const inputs = normalizePlanInputs(parsedArgs);
const policy = normalizePolicy({
  ...DEFAULT_POLICY,
  ownerAddress: fundingOutpoint.address,
  recoveryAddress: fundingOutpoint.address,
  withdrawalDelayHours: 24,
  dailyLimitTkas: 10
});
const assurance = normalizeAssurance({
  ...DEFAULT_ASSURANCE,
  recipientAddress: fundingOutpoint.address,
  refundAddress: fundingOutpoint.address,
  targetTkas: 5000,
  pledgedTkas: inputs.assurancePledgeTkas,
  minimumPledgeTkas: 100,
  deadlineHours: 24
});

const plan = buildDryRunTransactionPlan({
  vaultArtifact: buildPolicyArtifact(policy, await policyId(policy)),
  assuranceArtifact: buildAssuranceArtifact(assurance),
  vaultContractArtifact: await readJson("artifacts/DelayedRecoveryVault.json"),
  assuranceContractArtifact: await readJson("artifacts/AssurancePledge.json"),
  fundingOutpoint,
  inputs
});
const drafts = buildTransactionDrafts(plan);
const written = await writeTransactionDrafts(drafts, parsedArgs.outDir || "artifacts/tx-drafts");

for (const path of written) {
  console.log(path);
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
}

function parseArgs(args) {
  const parsed = { ...DEFAULT_PLAN_INPUTS };

  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (key === "vault-funding-tkas") parsed.vaultFundingTkas = Number(value);
    if (key === "vault-withdrawal-tkas") parsed.vaultWithdrawalTkas = Number(value);
    if (key === "assurance-pledge-tkas") parsed.assurancePledgeTkas = Number(value);
    if (key === "miner-fee-sompi") parsed.minerFeeSompi = Number(value);
    if (key === "funding-outpoint") parsed.fundingOutpoint = value;
    if (key === "out-dir") parsed.outDir = value;
  }

  return parsed;
}
