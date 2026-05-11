import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildBatchAssuranceState } from "../../src/batchAssurance.mjs";
import { buildBatchAssuranceCustodyDrafts } from "../../src/batchAssuranceCustodyDrafts.mjs";
import { buildBatchAssuranceCustodyRequirements } from "../../src/batchAssuranceCustodyRequirements.mjs";
import { buildBatchAssurancePledgeOutputPlan } from "../../src/batchAssurancePledgeOutputs.mjs";
import { buildBatchAssuranceCustodyImports } from "../../src/batchAssuranceCustodyImports.mjs";
import { buildBatchAssuranceSettlementDecision } from "../../src/batchAssuranceSettlementDecision.mjs";
import { buildBatchAssuranceSubmitRunbook } from "../../src/batchAssuranceSubmitRunbook.mjs";
import { buildBatchAssuranceOperatorDecision } from "../../src/batchAssuranceOperatorDecision.mjs";

const campaignState = buildBatchAssuranceState(await readJson("fixtures/BatchAssuranceCampaign.json"));
assert.equal(campaignState.status, "app-layer-campaign-planner-not-pooled-covenant");
assert.equal(campaignState.summary.pledgeCount, 5);
assert.equal(campaignState.summary.acceptedTkas, 100);
assert.equal(campaignState.summary.pendingTkas, 40);
assert.equal(campaignState.summary.rejectedCount, 1);
assert.equal(campaignState.summary.remainingAcceptedTkas, 0);
assert.equal(campaignState.summary.releaseStatus, "release-ready-from-accepted-pledges");
assert.equal(campaignState.releasePlan.acceptedInputCount, 3);
assert.equal(campaignState.releasePlan.output.amountTkas, 100);
assert.equal(campaignState.refundPlan.refundCount, 3);
assert.ok(campaignState.pledges.some((pledge) =>
  pledge.pledgeId === "pledge-docs-005"
  && pledge.review.status === "review-needed"
  && pledge.review.countsTowardRelease === false
));

const custodyDrafts = await readJson("artifacts/batch-assurance-custody-drafts.json");
assert.equal(custodyDrafts.status, "custody-release-draft-ready");
assert.equal(custodyDrafts.summary.blockedInputCount, 0);
assert.equal(custodyDrafts.summary.eligibleInputCount, 3);
assert.equal(custodyDrafts.summary.releaseOutputTkas, "99.99995");
assert.equal(custodyDrafts.releaseDraft.blockers.length, 0);

const custodyRequirements = await readJson("artifacts/batch-assurance-custody-requirements.json");
assert.equal(custodyRequirements.status, "custody-requirements-satisfied");
assert.equal(custodyRequirements.summary.pledgeOutputCount, 3);
assert.equal(custodyRequirements.summary.readyCount, 3);
assert.equal(custodyRequirements.summary.blockedCount, 0);
assert.equal(custodyRequirements.summary.requiredTkas, "100");
assert.equal(custodyRequirements.summary.observedReferencedTkas, "100");
assert.equal(custodyRequirements.summary.missingMatchedTkas, "0");
assert.ok(custodyRequirements.requirements.every((requirement) =>
  requirement.required.sourceKind === "accepted-pledge-output"
  && requirement.currentReference.amountMatches === true
));

const pledgeOutputPlan = buildBatchAssurancePledgeOutputPlan({
  custodyRequirements,
  walletConnectorRequests: await readJson("artifacts/wallet-connector-submit-requests.json")
});
assert.equal(pledgeOutputPlan.status, "pledge-outputs-already-matched");
assert.equal(pledgeOutputPlan.summary.outputsToCreate, 0);
assert.equal(pledgeOutputPlan.summary.totalRequiredTkas, "100");
assert.equal(pledgeOutputPlan.summary.missingTkas, "0");
assert.equal(pledgeOutputPlan.summary.walletConnectorRequestsReady, true);
assert.equal(pledgeOutputPlan.outputsToCreate.length, 0);

const pledgeOutputPlanArtifact = await readJson("artifacts/batch-assurance-pledge-output-plan.json");
assert.equal(pledgeOutputPlanArtifact.status, "pledge-outputs-already-matched");
assert.equal(pledgeOutputPlanArtifact.summary.outputsToCreate, 0);

const custodyImports = buildBatchAssuranceCustodyImports({
  importFixture: await readJson("fixtures/BatchAssuranceCustodyImports.json"),
  campaignState,
  custodyRequirements,
  checkpointIndex: await readJson("artifacts/checkpointed-accepted-index.json")
});
assert.equal(custodyImports.status, "custody-imports-ready");
assert.equal(custodyImports.summary.importCount, 3);
assert.equal(custodyImports.summary.readyCount, 3);
assert.equal(custodyImports.summary.blockedCount, 0);
assert.equal(custodyImports.summary.requiredPledgeCount, 3);
assert.equal(custodyImports.summary.missingRequiredImports, 0);
assert.equal(custodyImports.summary.requirementsSatisfied, true);
assert.ok(custodyImports.imports.every((row) =>
  row.status === "custody-import-ready"
  && row.acceptedEvidence.kind === "accepted-output"
  && row.checks.plannerPayloadOnly === false
));

const custodyImportsArtifact = await readJson("artifacts/batch-assurance-custody-imports.json");
assert.equal(custodyImportsArtifact.status, "custody-imports-ready");
assert.equal(custodyImportsArtifact.summary.readyCount, 3);

const pledgeFundingDraft = await readJson("artifacts/signed-drafts/batch-assurance-pledge-funding.json");
const pledgeWalletPublic = await readJson("fixtures/BatchAssurancePledgeWallets.public.json");
assert.equal(pledgeFundingDraft.schema, "tn12-batch-assurance-pledge-funding-draft/v1");
assert.equal(pledgeFundingDraft.status, "signed-not-broadcast");
assert.equal(pledgeFundingDraft.lane, "batch-assurance-pledge-custody-funding");
assert.equal(pledgeFundingDraft.outputs.length, 4);
assert.deepEqual(
  pledgeFundingDraft.outputs.filter((output) => output.pledgeId).map((output) => [output.pledgeId, output.amountTkas]),
  [
    ["pledge-docs-001", "45"],
    ["pledge-docs-002", "35"],
    ["pledge-docs-003", "20"]
  ]
);
assert.equal(pledgeFundingDraft.submitPayload.transaction.outputs.length, 4);
assert.equal(pledgeFundingDraft.submitPayload.transaction.payload, undefined);
assert.ok(pledgeFundingDraft.transactionId);
assert.ok(Number(pledgeFundingDraft.source.amountTkas) > 100);
assert.doesNotMatch(JSON.stringify(pledgeFundingDraft), /privateKey/i);
assert.equal(pledgeWalletPublic.schema, "tn12-batch-assurance-pledge-wallets-public/v1");
assert.equal(pledgeWalletPublic.wallets.length, 3);
assert.doesNotMatch(JSON.stringify(pledgeWalletPublic), /privateKey/i);

const settlementDrafts = await readJson("artifacts/batch-assurance-settlement-drafts.json");
const releaseDraft = await readJson("artifacts/signed-drafts/batch-assurance-release.json");
const refundDraft001 = await readJson("artifacts/signed-drafts/batch-assurance-refund-pledge-docs-001.json");
assert.equal(settlementDrafts.schema, "tn12-batch-assurance-settlement-drafts/v1");
assert.ok(["signed-not-broadcast", "release-accepted-tn12"].includes(settlementDrafts.status));
assert.equal(settlementDrafts.release.inputCount, 3);
assert.equal(settlementDrafts.release.outputTkas[0], "99.99995");
assert.equal(settlementDrafts.refunds.length, 3);
assert.ok(settlementDrafts.boundaries.some((boundary) => /mutually exclusive/.test(boundary)));

const settlementDecision = buildBatchAssuranceSettlementDecision({
  settlementDrafts,
  custodyRequirements,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(settlementDecision.status, "settlement-release-accepted");
assert.equal(settlementDecision.selectedPath, "release-accepted");
assert.equal(settlementDecision.submitNow, false);
assert.equal(settlementDecision.summary.releaseAccepted, true);

const settlementDecisionArtifact = await readJson("artifacts/batch-assurance-settlement-decision.json");
assert.equal(settlementDecisionArtifact.status, "settlement-release-accepted");
assert.equal(settlementDecisionArtifact.selectedPath, "release-accepted");

const submitRunbook = buildBatchAssuranceSubmitRunbook({
  settlementDecision: settlementDecisionArtifact,
  settlementDrafts,
  custodyImports: custodyImportsArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(submitRunbook.status, "release-path-accepted");
assert.equal(submitRunbook.summary.readyImports, 3);

const submitRunbookArtifact = await readJson("artifacts/batch-assurance-submit-runbook.json");
assert.equal(submitRunbookArtifact.status, "release-path-accepted");

const operatorDecision = buildBatchAssuranceOperatorDecision({
  decisionFixture: await readJson("fixtures/BatchAssuranceOperatorDecision.json"),
  settlementDecision: settlementDecisionArtifact,
  settlementDrafts,
  walletSignerValidation: await readJson("artifacts/wallet-standard-signer-validation.json"),
  checkpointComparison: await readJson("artifacts/virtual-chain-checkpoint-comparison.json"),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(operatorDecision.status, "operator-release-accepted");
assert.equal(operatorDecision.selectedPath, "release-accepted");
assert.equal(operatorDecision.submitNow, false);
assert.ok(!operatorDecision.blockers.includes("external signer accepted result missing"));
assert.equal(operatorDecision.summary.blockers, 0);
assert.ok(!operatorDecision.blockers.includes("live indexer checkpoint overlap missing"));

const operatorDecisionArtifact = await readJson("artifacts/batch-assurance-operator-decision.json");
assert.equal(operatorDecisionArtifact.status, "operator-release-accepted");
assert.equal(operatorDecisionArtifact.selectedPath, "release-accepted");
assert.equal(operatorDecisionArtifact.submitNow, false);

assert.equal(releaseDraft.kind, "release");
assert.equal(releaseDraft.inputs.length, 3);
assert.equal(releaseDraft.submitPayload.transaction.inputs.length, 3);
assert.equal(releaseDraft.submitPayload.transaction.outputs[0].amount, 9999995000);
assert.equal(refundDraft001.kind, "refund");
assert.equal(refundDraft001.pledgeId, "pledge-docs-001");
assert.equal(refundDraft001.submitPayload.transaction.inputs.length, 1);
assert.equal(refundDraft001.submitPayload.transaction.outputs[0].amount, 4499995000);
assert.doesNotMatch(JSON.stringify(settlementDrafts), /privateKey/i);
assert.doesNotMatch(JSON.stringify(releaseDraft), /privateKey/i);

const syntheticCustodyCheckpoint = {
  network: "kaspa-testnet-12",
  records: campaignState.releasePlan.inputs.map((input) => ({
    txid: input.sourceOutpoint.txid,
    matched: true,
    output: {
      observed: {
        outputIndex: input.sourceOutpoint.index,
        amountSompi: String(BigInt(Math.round(input.amountTkas * 100000000))),
        amountTkas: String(input.amountTkas)
      }
    }
  }))
};

const readyCustodyDrafts = buildBatchAssuranceCustodyDrafts({
  campaignState,
  checkpointIndex: syntheticCustodyCheckpoint
});
assert.equal(readyCustodyDrafts.status, "custody-release-draft-ready");
assert.equal(readyCustodyDrafts.summary.eligibleInputCount, 3);
assert.equal(readyCustodyDrafts.summary.blockedInputCount, 0);

const readyCustodyRequirements = buildBatchAssuranceCustodyRequirements({
  campaignState,
  checkpointIndex: syntheticCustodyCheckpoint,
  custodyDrafts: readyCustodyDrafts
});
assert.equal(readyCustodyRequirements.status, "custody-requirements-satisfied");
assert.equal(readyCustodyRequirements.summary.readyCount, 3);
assert.equal(readyCustodyRequirements.summary.blockedCount, 0);
assert.equal(readyCustodyRequirements.summary.missingMatchedTkas, "0");

console.log("Batch assurance tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
