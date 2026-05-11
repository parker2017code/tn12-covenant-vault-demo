import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_ASSURANCE,
  buildAssuranceArtifact,
  normalizeAssurance
} from "../../src/assuranceContract.mjs";
import {
  DEFAULT_MANUAL_OUTPOINT,
  normalizeManualOutpoint
} from "../../src/manualOutpoint.mjs";
import {
  DEFAULT_PLAN_INPUTS,
  buildDryRunTransactionPlan,
  tkasToSompi
} from "../../src/transactionPlanner.mjs";
import { buildTransactionDrafts } from "../../src/transactionDrafts.mjs";
import {
  DEFAULT_POLICY,
  buildPolicyArtifact,
  normalizePolicy,
  policyId
} from "../../src/vaultPolicy.mjs";

const alternateTn12Address = "kaspatest:qqr8fl2xuwu9fu2l5j4d0jtzqpdtzxeqyaelcty0l9xeshfnwwhdus566pnyy";

const policy = normalizePolicy({
  ...DEFAULT_POLICY,
  ownerAddress: DEFAULT_MANUAL_OUTPOINT.address,
  recoveryAddress: alternateTn12Address,
  withdrawalDelayHours: "48",
  dailyLimitTkas: "250.5",
  guardianThreshold: "2",
  guardianCount: "3"
});
const vaultArtifact = buildPolicyArtifact(policy, await policyId(policy));

const assurancePolicy = normalizeAssurance({
  ...DEFAULT_ASSURANCE,
  recipientAddress: DEFAULT_MANUAL_OUTPOINT.address,
  refundAddress: alternateTn12Address,
  targetTkas: "1000",
  pledgedTkas: "250",
  minimumPledgeTkas: "100",
  deadlineHours: "48"
});
const assuranceArtifact = buildAssuranceArtifact(assurancePolicy);
const manualOutpoint = normalizeManualOutpoint(DEFAULT_MANUAL_OUTPOINT);
const vaultContractArtifact = JSON.parse(await readFile("artifacts/DelayedRecoveryVault.json", "utf8"));
const assuranceContractArtifact = JSON.parse(await readFile("artifacts/AssurancePledge.json", "utf8"));

const transactionPlan = buildDryRunTransactionPlan({
  vaultArtifact,
  assuranceArtifact,
  vaultContractArtifact,
  assuranceContractArtifact,
  fundingOutpoint: manualOutpoint,
  inputs: DEFAULT_PLAN_INPUTS
});

assert.equal(transactionPlan.status, "dry-run-not-signed-not-broadcast");
assert.equal(transactionPlan.plans.length, 6);
assert.deepEqual(
  transactionPlan.plans.map((plan) => plan.id),
  [
    "vault-funding",
    "vault-delayed-withdrawal",
    "vault-recovery",
    "assurance-pledge",
    "assurance-release",
    "assurance-refund"
  ]
);
assert.equal(transactionPlan.artifacts.vaultContract.contractName, "DelayedRecoveryVault");
assert.deepEqual(transactionPlan.artifacts.assuranceContract.entrypoints, ["release", "refund"]);
assert.ok(transactionPlan.boundaries.some((boundary) => /ZK is not required/.test(boundary)));
assert.equal(transactionPlan.inputs.fundingOutpoint.amountTkas, 10000);
assert.equal(transactionPlan.inputs.fundingOutpoint.status, "exact-outpoint-entered");
assert.equal(tkasToSompi(1).toString(), "100000000");

const transactionDrafts = buildTransactionDrafts(transactionPlan);
assert.equal(transactionDrafts.length, 6);
assert.equal(transactionDrafts[0].status, "draft-not-serialized-not-signed-not-broadcast");

console.log("Transaction plan tests passed.");
