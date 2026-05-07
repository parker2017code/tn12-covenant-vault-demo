import { readFile } from "node:fs/promises";
import {
  DEFAULT_ASSURANCE,
  buildAssuranceArtifact,
  normalizeAssurance
} from "../src/assuranceContract.mjs";
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
import { DEFAULT_MANUAL_OUTPOINT, normalizeManualOutpoint } from "../src/manualOutpoint.mjs";

const parsedArgs = parseArgs(process.argv.slice(2));
const inputs = normalizePlanInputs(parsedArgs);
const fundingOutpoint = parsedArgs.fundingOutpoint
  ? normalizeManualOutpoint(await readJson(parsedArgs.fundingOutpoint))
  : normalizeManualOutpoint(DEFAULT_MANUAL_OUTPOINT);
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
  refundAddress: fundingOutpoint.address
});

const vaultPolicyId = await policyId(policy);
const plan = buildDryRunTransactionPlan({
  vaultArtifact: buildPolicyArtifact(policy, vaultPolicyId),
  assuranceArtifact: buildAssuranceArtifact(assurance),
  vaultContractArtifact: await readJson("artifacts/DelayedRecoveryVault.json"),
  assuranceContractArtifact: await readJson("artifacts/AssurancePledge.json"),
  fundingOutpoint,
  inputs
});

console.log(JSON.stringify(plan, null, 2));

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
  }

  return parsed;
}
