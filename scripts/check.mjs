import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_ASSURANCE,
  buildAssuranceArtifact,
  normalizeAssurance,
  validateAssurance
} from "../src/assuranceContract.mjs";
import {
  DEFAULT_POLICY,
  buildLifecycle,
  buildPolicyArtifact,
  normalizePolicy,
  policyId,
  validatePolicy
} from "../src/vaultPolicy.mjs";
import {
  DEFAULT_PLAN_INPUTS,
  buildDryRunTransactionPlan,
  tkasToSompi
} from "../src/transactionPlanner.mjs";
import { buildTransactionDrafts } from "../src/transactionDrafts.mjs";
import {
  DEFAULT_MANUAL_OUTPOINT,
  buildManualOutpointArtifact,
  normalizeManualOutpoint,
  validateManualOutpoint
} from "../src/manualOutpoint.mjs";
import {
  DEFAULT_SIGNAL_PAYLOAD,
  buildSignalPayloadArtifact,
  decodeSignalPayload
} from "../src/signalPayload.mjs";
import { buildAttestationRegistry } from "../src/attestationSignal.mjs";
import {
  DEFAULT_INVOICE,
  buildInvoiceArtifact,
  buildInvoiceRegistry
} from "../src/invoiceReceipt.mjs";
import {
  buildSubmitConsoleRegistry,
  summarizeSignedDraft
} from "../src/submitConsole.mjs";
import { buildResearchLibrary } from "../src/appResearch.mjs";
import { buildMainstreamAppDirection } from "../src/mainstreamAppDirection.mjs";
import { buildMissingRailsMatrix } from "../src/missingRailsMatrix.mjs";
import { buildBatchAssuranceState } from "../src/batchAssurance.mjs";
import { buildBatchAssuranceCustodyDrafts } from "../src/batchAssuranceCustodyDrafts.mjs";
import { buildBatchAssuranceCustodyRequirements } from "../src/batchAssuranceCustodyRequirements.mjs";
import { buildWalletConnectorReadiness } from "../src/walletConnectorReadiness.mjs";
import { buildWalletSubmitPackage } from "../src/walletSubmitPackage.mjs";
import { buildEnforcementMatrix } from "../src/enforcementMatrix.mjs";
import { buildEscrowPrimitive } from "../src/escrowPrimitive.mjs";
import { buildTreasuryVaultRegistry } from "../src/treasuryVault.mjs";
import { buildPayloadSubmitReadiness } from "../src/payloadSubmitReadiness.mjs";
import { buildWalletReviewReadiness } from "../src/walletReview.mjs";
import { summarizeWrpcCandidate } from "../src/wrpcSubmitCandidate.mjs";
import { buildIndexerReplayPlan } from "../src/indexerReplayPlan.mjs";
import { buildCoordinationMarketPrototype } from "../src/coordinationMarket.mjs";
import { buildAccessPassPlanner } from "../src/accessPassPlanner.mjs";
import { buildMainnetReadiness } from "../src/mainnetReadiness.mjs";
import { buildAssetPolicyRegistry } from "../src/assetPolicy.mjs";
import { buildAuctionIntentPrototype } from "../src/auctionIntent.mjs";
import { buildDefiResearchBacklog } from "../src/defiBacklog.mjs";
import { buildPredictionHedgeSimulator } from "../src/predictionHedgeSimulator.mjs";
import { buildStableValuePathRegistry } from "../src/stableValuePaths.mjs";
import { buildStableIssuerRedemptionState } from "../src/stableIssuerRedemption.mjs";
import { buildAgentCommitmentBoard } from "../src/agentCommitments.mjs";
import { buildBasedRollupScout } from "../src/basedRollupScout.mjs";
import { buildProjectStatus } from "../src/buildStatus.mjs";
import { buildProjectPlan } from "../src/projectPlan.mjs";
import { buildProofEvidence } from "../src/proofEvidence.mjs";
import { buildCovenantAdversarialCoverage } from "../src/covenantAdversarialCoverage.mjs";
import { buildRoleSeparatedInvalidCandidates } from "../src/roleSeparatedInvalidCandidates.mjs";
import { buildAcceptedAppState } from "../src/acceptedIndexer.mjs";
import { buildCheckpointedAcceptedIndex } from "../src/checkpointedIndexer.mjs";
import { buildPersistedCheckpointGuard } from "../src/indexerPersistence.mjs";
import { buildIndexerStorageSchema } from "../src/indexerStorageSchema.mjs";
import { buildIndexerReplayRun } from "../src/indexerReplayRun.mjs";

const policy = normalizePolicy({
  ...DEFAULT_POLICY,
  ownerAddress: "kaspatest:owner",
  recoveryAddress: "kaspatest:recovery",
  withdrawalDelayHours: "48",
  dailyLimitTkas: "250.5",
  guardianThreshold: "2",
  guardianCount: "3"
});

assert.equal(policy.withdrawalDelayHours, 48);
assert.equal(policy.dailyLimitTkas, 250.5);
assert.deepEqual(validatePolicy(policy), []);

const id = await policyId(policy);
assert.match(id, /^[a-f0-9]{24}$/);

const artifact = buildPolicyArtifact(policy, id);
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "tn12-configured-browser-artifact");
assert.equal(buildLifecycle(policy).length, 5);

const assurancePolicy = normalizeAssurance({
  ...DEFAULT_ASSURANCE,
  recipientAddress: "kaspatest:recipient",
  refundAddress: "kaspatest:refund",
  targetTkas: "1000",
  pledgedTkas: "250",
  minimumPledgeTkas: "100",
  deadlineHours: "48"
});
assert.deepEqual(validateAssurance(assurancePolicy), []);
const assuranceArtifact = buildAssuranceArtifact(assurancePolicy);
assert.equal(assuranceArtifact.state.remainingTkas, 750);
assert.equal(assuranceArtifact.state.pledgesNeeded, 8);
const manualOutpoint = normalizeManualOutpoint(DEFAULT_MANUAL_OUTPOINT);
const manualOutpointArtifact = buildManualOutpointArtifact(manualOutpoint);
assert.deepEqual(validateManualOutpoint(manualOutpoint), []);
assert.equal(manualOutpointArtifact.userReported.approximateBalanceTkas, 10000);
const signalArtifact = buildSignalPayloadArtifact(DEFAULT_SIGNAL_PAYLOAD);
assert.equal(signalArtifact.status, "payload-size-ok");
assert.equal(signalArtifact.lane, "transaction-payload");
assert.match(signalArtifact.boundary, /not arbitrary miner header data/);
assert.equal(decodeSignalPayload(signalArtifact.encoded.hex).payload.subject, DEFAULT_SIGNAL_PAYLOAD.subject);
const attestationFixture = JSON.parse(await readFile(new URL("../fixtures/AttestationSignals.json", import.meta.url), "utf8"));
const attestationRegistry = buildAttestationRegistry(attestationFixture);
assert.equal(attestationRegistry.status, "research-fixture-not-market-settlement");
assert.equal(attestationRegistry.summary.total, 3);
assert.equal(attestationRegistry.summary.signatureVerified, 1);
assert.equal(attestationRegistry.summary.influenceReady, 1);
assert.ok(attestationRegistry.boundaries.some((boundary) => /block headers/.test(boundary)));
assert.ok(attestationRegistry.sources.some((source) => source.source === "pool-operator-gamma"));
assert.ok(attestationRegistry.signals.some((signal) => signal.id === "sig-rtd-hashrate-001" && signal.influenceReady));
assert.ok(attestationRegistry.signals.some((signal) => signal.id === "sig-pool-policy-001" && signal.signatureReview.status === "pending-review"));
const invoiceArtifact = buildInvoiceArtifact(DEFAULT_INVOICE);
assert.equal(invoiceArtifact.schema, "kaspa-invoice-receipt-app/v1");
assert.equal(invoiceArtifact.status, "draft-needs-payload-submit");
assert.equal(invoiceArtifact.receipt.payload.kind, "invoice-receipt");
const invoiceFixture = JSON.parse(await readFile(new URL("../fixtures/InvoiceReceipts.json", import.meta.url), "utf8"));
const invoiceRegistry = buildInvoiceRegistry(invoiceFixture);
assert.equal(invoiceRegistry.status, "has-accepted-invoice-events");
assert.equal(invoiceRegistry.summary.total, 4);
assert.equal(invoiceRegistry.summary.paid, 1);
assert.equal(invoiceRegistry.summary.refunded, 1);
assert.equal(invoiceRegistry.summary.errors, 1);
assert.equal(invoiceRegistry.summary.draft, 1);
assert.equal(invoiceRegistry.summary.review, 0);
assert.equal(invoiceRegistry.summary.duplicateReceipts, 0);
assert.equal(invoiceRegistry.summary.staleReceipts, 0);
assert.equal(invoiceRegistry.summary.refundReviews, 0);
assert.equal(invoiceRegistry.summary.errorReviews, 0);
const payloadReadinessArtifact = JSON.parse(await readFile(new URL("../artifacts/payload-submit-readiness.json", import.meta.url), "utf8"));
const payloadReadiness = buildPayloadSubmitReadiness(payloadReadinessArtifact);
assert.equal(payloadReadiness.status, "accepted-wrpc-payload-receipt-rest-blocked");
assert.equal(payloadReadiness.checks.submitTxModelHasPayload, false);
assert.equal(payloadReadiness.checks.fetchedTxModelHasPayload, true);
assert.equal(payloadReadiness.checks.signedDraftHasPayload, true);
assert.equal(payloadReadiness.checks.restSubmitAttempted, true);
assert.equal(payloadReadiness.checks.restSubmitPayloadPreserved, false);
assert.equal(payloadReadiness.checks.acceptedWrpcPayloadReceiptMatched, true);
assert.equal(payloadReadiness.checks.safeToSubmitPayloadReceiptByDefault, true);
const payloadReceiptDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/payload-receipt-self-send.json", import.meta.url), "utf8"));
assert.equal(payloadReceiptDraft.submitPayload.transaction.outputs.length, 2);
assert.equal(payloadReceiptDraft.submitPayload.transaction.outputs[0].amount, 100000000);
assert.ok(payloadReceiptDraft.submitPayload.transaction.outputs[1].amount > 0);
assert.equal(payloadReceiptDraft.payment.minerFeeSompi, "5000");
const wrpcCandidate = summarizeWrpcCandidate(payloadReceiptDraft, { artifactPath: "artifacts/signed-drafts/payload-receipt-self-send.json" });
assert.equal(wrpcCandidate.status, "needs-kaspa-wrpc-url");
assert.equal(wrpcCandidate.txidMatches, true);
assert.equal(wrpcCandidate.payloadBytes, 127);
const p2pkSelfSendDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/self-send-p2pk.json", import.meta.url), "utf8"));
assert.ok(BigInt(p2pkSelfSendDraft.payment.changeSompi) > 0n);
const splitDraftArtifact = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/split-funding.json", import.meta.url), "utf8"));
const splitDraftSummary = summarizeSignedDraft(splitDraftArtifact, "artifacts/signed-drafts/split-funding.json");
assert.equal(splitDraftSummary.counts.inputs, 1);
assert.equal(splitDraftSummary.counts.outputs, 3);
assert.match(splitDraftSummary.submit.submitCommand, /--submit/);
const submitManifest = JSON.parse(await readFile(new URL("../fixtures/SubmitConsoleDrafts.json", import.meta.url), "utf8"));
const submitArtifacts = {};
for (const draft of submitManifest.drafts) {
  submitArtifacts[draft.path] = JSON.parse(await readFile(new URL(`../${draft.path}`, import.meta.url), "utf8"));
}
const submitRegistry = buildSubmitConsoleRegistry(submitManifest, submitArtifacts);
assert.equal(submitRegistry.summary.total, 47);
assert.equal(submitRegistry.summary.payloadDrafts, 26);
assert.equal(submitRegistry.summary.payloadSubmitGated, 26);
assert.ok(submitRegistry.drafts.some((draft) =>
  draft.path === "artifacts/signed-drafts/role-separated-funding.json"
  && draft.counts.outputs === 4
));
assert.ok(submitRegistry.drafts.some((draft) =>
  draft.path === "artifacts/signed-drafts/role-escrow-cancel.json"
  && draft.inputs[0].computeBudget === 30
));
const walletReview = buildWalletReviewReadiness(submitRegistry);
assert.equal(walletReview.status, "wallet-review-ready");
assert.equal(walletReview.summary.ready, 47);
assert.equal(walletReview.summary.payloadRouteReady, 26);
assert.equal(walletReview.summary.registrySecretFields, 0);
const walletConnector = buildWalletConnectorReadiness(walletReview);
assert.equal(walletConnector.status, "wallet-connector-spec-ready");
assert.equal(walletConnector.summary.drafts, 47);
assert.equal(walletConnector.summary.payloadDrafts, 26);
assert.equal(walletConnector.summary.registrySecretFields, 0);
assert.ok(walletConnector.requiredWalletCapabilities.some((capability) => capability.id === "payload-preserving-submit"));
const walletSubmitPackage = buildWalletSubmitPackage({ walletReview, walletConnector });
assert.equal(walletSubmitPackage.status, "wallet-submit-package-ready");
assert.equal(walletSubmitPackage.summary.total, 47);
assert.equal(walletSubmitPackage.summary.payloadDrafts, 26);
assert.equal(walletSubmitPackage.summary.contractDrafts, 19);
assert.ok(walletSubmitPackage.firstPayloadIntents.every((intent) => intent.requiredWalletChecks.includes("Reject public REST payload submit.")));
const escrowFundingDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-funding.json", import.meta.url), "utf8"));
assert.equal(escrowFundingDraft.contract, "Escrow");
assert.equal(escrowFundingDraft.status, "signed-not-broadcast");
assert.ok(submitRegistry.drafts.some((draft) => draft.lane === "escrow-funding" && draft.label === "Escrow funding"));
const escrowReleaseDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-release.json", import.meta.url), "utf8"));
const escrowRefundDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-refund.json", import.meta.url), "utf8"));
const escrowCancelDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-cancel.json", import.meta.url), "utf8"));
const escrowDaaRefundDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-daa-refund-proof-refund.json", import.meta.url), "utf8"));
const escrowCancelProofDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-cancel-proof-cancel.json", import.meta.url), "utf8"));
assert.equal(escrowReleaseDraft.entrypoint, "release");
assert.equal(escrowRefundDraft.entrypoint, "refund");
assert.equal(escrowCancelDraft.entrypoint, "cancel");
assert.equal(escrowDaaRefundDraft.entrypoint, "refund");
assert.equal(escrowCancelProofDraft.entrypoint, "cancel");
assert.equal(escrowCancelProofDraft.transactionId, "14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c");
assert.equal(escrowCancelProofDraft.submitPayload.transaction.version, 1);
assert.equal(escrowCancelProofDraft.submitPayload.transaction.inputs[0].computeBudget, 30);
assert.equal(escrowCancelProofDraft.submitPayload.transaction.inputs[0].sigOpCount, undefined);
assert.ok(escrowCancelDraft.signatureScriptHex.length > escrowReleaseDraft.signatureScriptHex.length);
const escrowCancelAttempt = JSON.parse(await readFile(new URL("../artifacts/escrow-cancel-attempt.json", import.meta.url), "utf8"));
assert.equal(escrowCancelAttempt.status, "accepted-version1-compute-budget-sdk-corrected");
assert.equal(escrowCancelAttempt.submitPayloadSigOpCount, 2);
assert.match(escrowCancelAttempt.submitResult.error, /verification failed/);
assert.match(escrowCancelAttempt.previousRejectedDraft.error, /script units exceeded/);
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.spendTxid, escrowCancelProofDraft.transactionId);
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.computeBudget, 30);
assert.match(escrowCancelAttempt.version1ComputeBudgetAttempt.publicRestSubmit.computeBudgetOnly.error, /sigOpCount/);
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.localSdk.installedVersion, "0.13.0");
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.tn12Sdk.version, "1.1.1-toc.1");
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.tn12Sdk.inputBudgetSupport.preservesComputeBudget, true);
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.localSdk.inputBudgetSupport.acceptsComputeBudgetOnly, false);
assert.equal(escrowCancelAttempt.version1ComputeBudgetAttempt.localSdk.inputBudgetSupport.requiresSigOpCountProperty, true);
assert.match(escrowCancelAttempt.boundary, /rebuilt with Rusty Kaspa TN12 kaspa-wasm 1\.1\.1-toc\.1/);
const researchFixture = JSON.parse(await readFile(new URL("../fixtures/CrossChainResearchLibrary.json", import.meta.url), "utf8"));
const researchLibrary = buildResearchLibrary(researchFixture);
assert.equal(researchLibrary.status, "research-inputs-not-protocol-claims");
assert.equal(researchLibrary.summary.total, 16);
assert.equal(researchLibrary.summary.lanes["live-kaspa"], 5);
assert.equal(researchLibrary.summary.lanes["tn12-toccata"], 3);
assert.equal(researchLibrary.summary.lanes.roadmap, 4);
assert.equal(researchLibrary.summary.lanes.research, 4);
assert.ok(researchLibrary.candidates.some((candidate) => candidate.id === "uniswap-amm"));
assert.ok(researchLibrary.candidates.some((candidate) => candidate.id === "wallet-api-send" && candidate.priority === "build-now"));
const mainstreamFixture = JSON.parse(await readFile(new URL("../fixtures/MainstreamAppDirection.json", import.meta.url), "utf8"));
const mainstreamApps = buildMainstreamAppDirection(mainstreamFixture);
assert.equal(mainstreamApps.status, "high-impact-app-direction-documented");
assert.equal(mainstreamApps.summary.total, 10);
assert.equal(mainstreamApps.summary.buildNow, 7);
assert.equal(mainstreamApps.summary.researchOrLater, 3);
assert.equal(mainstreamApps.summary.topPriority, "invoice-receipts");
assert.ok(mainstreamApps.buildNow.some((target) => target.id === "escrow-marketplace"));
assert.ok(mainstreamApps.researchOrLater.some((target) => target.id === "defi-liquidity-stack"));
assert.ok(mainstreamApps.targets.every((target) => target.doNotClaimYet.length > 20));
const missingRailsFixture = JSON.parse(await readFile(new URL("../fixtures/MissingRailsMatrix.json", import.meta.url), "utf8"));
const missingRailsMatrix = buildMissingRailsMatrix(missingRailsFixture);
assert.equal(missingRailsMatrix.status, "missing-rails-explicit");
assert.equal(missingRailsMatrix.summary.categories, 5);
assert.equal(missingRailsMatrix.summary.questions, 23);
assert.equal(missingRailsMatrix.summary.buildNowClaimsAllowed, 0);
assert.ok(missingRailsMatrix.categories.some((category) =>
  category.id === "dex-amm"
  && category.questions.some((question) => /pool reserves/.test(question.question))
));
assert.ok(missingRailsMatrix.categories.some((category) =>
  category.id === "lending"
  && category.questions.some((question) => /oracle/.test(question.question))
));
const missingRailsArtifact = JSON.parse(await readFile(new URL("../artifacts/missing-rails-matrix.json", import.meta.url), "utf8"));
assert.equal(missingRailsArtifact.summary.questions, 23);
const rollupScoutFixture = JSON.parse(await readFile(new URL("../fixtures/BasedRollupScout.json", import.meta.url), "utf8"));
const rollupScout = buildBasedRollupScout(rollupScoutFixture);
assert.equal(rollupScout.status, "scouting-not-deployment");
assert.equal(rollupScout.summary.sourceCount, 4);
assert.equal(rollupScout.summary.contributorCount, 3);
assert.equal(rollupScout.summary.nextActions, 3);
assert.equal(rollupScout.conclusion.changesCurrentTn12Work, false);
assert.equal(rollupScout.conclusion.changesFuturePlan, true);
assert.equal(rollupScout.conclusion.needsProductionReadinessAnswerNow, false);
assert.equal(rollupScout.conclusion.usingIgra, false);
assert.equal(rollupScout.conclusion.usingKasplex, false);
assert.equal(rollupScout.conclusion.usingAnyL2Now, false);
assert.equal(rollupScout.conclusion.considerCoreMigratableRollup, true);
assert.match(rollupScout.conclusion.whenItMatters, /After wallet submit/);
assert.ok(rollupScout.contributors.some((contributor) =>
  contributor.id === "maxim-biryukov"
  && contributor.status === "poc-reference"
));
assert.ok(rollupScout.contributors.some((contributor) =>
  contributor.id === "hans-moog"
  && contributor.status === "runtime-reference"
));
const campaignFixture = JSON.parse(await readFile(new URL("../fixtures/BatchAssuranceCampaign.json", import.meta.url), "utf8"));
const campaignState = buildBatchAssuranceState(campaignFixture);
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
const custodyDraftFixture = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-custody-drafts.json", import.meta.url), "utf8"));
assert.equal(custodyDraftFixture.status, "custody-draft-blocked");
assert.equal(custodyDraftFixture.summary.blockedInputCount, 3);
assert.equal(custodyDraftFixture.summary.eligibleInputCount, 0);
assert.match(custodyDraftFixture.releaseDraft.blockers[0].reason, /amount does not match/);
const custodyRequirementsFixture = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-custody-requirements.json", import.meta.url), "utf8"));
assert.equal(custodyRequirementsFixture.status, "custody-requirements-open");
assert.equal(custodyRequirementsFixture.summary.pledgeOutputCount, 3);
assert.equal(custodyRequirementsFixture.summary.readyCount, 0);
assert.equal(custodyRequirementsFixture.summary.blockedCount, 3);
assert.equal(custodyRequirementsFixture.summary.requiredTkas, "100");
assert.equal(custodyRequirementsFixture.summary.observedReferencedTkas, "3");
assert.equal(custodyRequirementsFixture.summary.missingMatchedTkas, "100");
assert.ok(custodyRequirementsFixture.requirements.every((requirement) =>
  requirement.required.sourceKind === "accepted-pledge-output"
  && requirement.currentReference.amountMatches === false
));
const syntheticCustodyCheckpoint = {
  network: "kaspa-testnet-12",
  records: campaignState.releasePlan.inputs.map((input) => ({
    txid: input.sourceOutpoint.txid,
    matched: true,
    output: {
      observed: {
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
const enforcementFixture = JSON.parse(await readFile(new URL("../fixtures/EnforcementMatrix.json", import.meta.url), "utf8"));
const enforcementMatrix = buildEnforcementMatrix(enforcementFixture);
assert.equal(enforcementMatrix.status, "claim-surface-audit");
assert.equal(enforcementMatrix.summary.total, 18);
assert.equal(enforcementMatrix.summary.contractEnforced, 5);
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "vault-daily-limit" && feature.enforcement === "simulation"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "assurance-target-progress" && feature.enforcement === "planner-indexer"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "escrow-spend-paths" && feature.enforcement === "script"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "treasury-payroll-caps" && feature.enforcement === "wallet-policy"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "coordination-market-hunt" && feature.enforcement === "research"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "access-pass-redemption" && feature.enforcement === "planner-indexer"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "simple-asset-policy" && feature.enforcement === "planner-indexer"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "auction-intent-winner-selection" && feature.enforcement === "planner-indexer"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "defi-backlog" && feature.enforcement === "documentation"));
assert.ok(enforcementMatrix.features.some((feature) => feature.id === "agent-commitment-settlement" && feature.enforcement === "planner-indexer"));
const escrowFixture = JSON.parse(await readFile(new URL("../fixtures/EscrowPrimitives.json", import.meta.url), "utf8"));
const escrowRegistry = buildEscrowPrimitive(escrowFixture);
assert.equal(escrowRegistry.status, "planner-fixture-not-script-proof");
assert.equal(escrowRegistry.summary.total, 3);
assert.equal(escrowRegistry.summary.funded, 1);
assert.equal(escrowRegistry.summary.needsAction, 2);
assert.ok(escrowRegistry.escrows.some((escrow) => escrow.escrowId === "escrow-freelance-001" && escrow.spendPaths.length === 3));
const treasuryFixture = JSON.parse(await readFile(new URL("../fixtures/TreasuryVaults.json", import.meta.url), "utf8"));
const treasuryRegistry = buildTreasuryVaultRegistry(treasuryFixture);
assert.equal(treasuryRegistry.status, "planner-policy-before-extra-script-paths");
assert.equal(treasuryRegistry.summary.total, 2);
assert.equal(treasuryRegistry.summary.plannedPayrollTkas, 80);
assert.equal(treasuryRegistry.summary.largeWithdrawalsPending, 1);
assert.ok(treasuryRegistry.vaults.some((vault) => vault.vaultId === "treasury-core-team" && vault.checks.largeWithdrawalReviewRequired));
const coordinationFixture = JSON.parse(await readFile(new URL("../fixtures/CoordinationMarketPrototype.json", import.meta.url), "utf8"));
const coordinationPrototype = buildCoordinationMarketPrototype(coordinationFixture);
assert.equal(coordinationPrototype.status, "transparent-toy-staghunt-preprototype");
assert.equal(coordinationPrototype.summary.stags, 2);
assert.equal(coordinationPrototype.summary.intendos, 5);
assert.equal(coordinationPrototype.summary.satisfiablePacks, 1);
assert.ok(coordinationPrototype.missingProperties.includes("accumulation opacity"));
const accessPassFixture = JSON.parse(await readFile(new URL("../fixtures/AccessPassPlanner.json", import.meta.url), "utf8"));
const accessPassPlanner = buildAccessPassPlanner(accessPassFixture);
assert.equal(accessPassPlanner.status, "issuer-indexer-flow-not-native-enforcement");
assert.equal(accessPassPlanner.summary.totalPasses, 3);
assert.equal(accessPassPlanner.summary.acceptedRedemptions, 1);
assert.equal(accessPassPlanner.summary.duplicateRedemptions, 0);
assert.equal(accessPassPlanner.summary.missingAcceptedTxids, 0);
assert.ok(accessPassPlanner.passes.some((pass) => pass.passId === "pass-dev-workshop-001" && pass.state === "partially-redeemed"));
const mainnetReadinessFixture = JSON.parse(await readFile(new URL("../fixtures/MainnetReadiness.json", import.meta.url), "utf8"));
const mainnetReadiness = buildMainnetReadiness(mainnetReadinessFixture);
assert.equal(mainnetReadiness.status, "readiness-map-not-launch-approval");
assert.equal(mainnetReadiness.summary.mainnetCapable, 4);
assert.equal(mainnetReadiness.summary.tn12Only, 3);
assert.equal(mainnetReadiness.summary.researchOnly, 1);
assert.equal(mainnetReadiness.summary.localOnly, 1);
const assetPolicyFixture = JSON.parse(await readFile(new URL("../fixtures/SimpleAssetPolicies.json", import.meta.url), "utf8"));
const assetPolicies = buildAssetPolicyRegistry(assetPolicyFixture);
assert.equal(assetPolicies.status, "roadmap-policy-not-live-native-asset");
assert.equal(assetPolicies.summary.total, 2);
assert.equal(assetPolicies.summary.covenantNative, 1);
assert.ok(assetPolicies.policies.some((policy) => policy.assetId === "asset-recoverable-voucher" && policy.rules.recovery.enabled));
const auctionFixture = JSON.parse(await readFile(new URL("../fixtures/AuctionIntentPrototype.json", import.meta.url), "utf8"));
const auctionPrototype = buildAuctionIntentPrototype(auctionFixture);
assert.equal(auctionPrototype.status, "accepted-payload-indexer-first-not-mev-resistant");
assert.equal(auctionPrototype.summary.auctions, 2);
assert.equal(auctionPrototype.summary.acceptedBidPayloads, 3);
assert.equal(auctionPrototype.summary.acceptedSettlementEvents, 2);
assert.equal(auctionPrototype.summary.auctionsWithWinner, 1);
assert.ok(auctionPrototype.auctions.some((auction) => auction.auctionId === "auction-pass-001" && auction.winner?.bidId === "bid-pass-002"));
const defiFixture = JSON.parse(await readFile(new URL("../fixtures/DefiResearchBacklog.json", import.meta.url), "utf8"));
const defiBacklog = buildDefiResearchBacklog(defiFixture);
assert.equal(defiBacklog.status, "research-backlog-not-live-defi");
assert.equal(defiBacklog.summary.total, 8);
assert.equal(defiBacklog.summary.researchOnly, 4);
assert.ok(defiBacklog.missingRails.includes("price oracle"));
assert.ok(defiBacklog.briefs.some((brief) => brief.id === "prediction-hedge-simulator" && brief.status === "prototype-later"));
const predictionFixture = JSON.parse(await readFile(new URL("../fixtures/PredictionHedgeSimulator.json", import.meta.url), "utf8"));
const predictionSimulator = buildPredictionHedgeSimulator({ fixture: predictionFixture, attestationRegistry });
assert.equal(predictionSimulator.status, "simulation-only");
assert.equal(predictionSimulator.summary.markets, 3);
assert.equal(predictionSimulator.summary.verifiedSignalInputs, 1);
assert.ok(predictionSimulator.markets.some((market) => market.eventId === "event-exchange-listing-window" && market.ignoredSignals === 1));
assert.ok(predictionSimulator.markets.some((market) => market.acceptedEvent?.txid === "9f9766567fbe8032804583e48e6e9a1aa70f8bb4fbd30018dd45f32e9c0daca7"));
assert.ok(predictionSimulator.suggestions.some((suggestion) => suggestion.status === "review-suggested"));
assert.ok(predictionSimulator.suggestions.some((suggestion) => suggestion.acceptedReview?.txid === "1d5a3c2404188e62663535692ee575a1cb96a069fa19ea7c67670975078c6f3d"));
const stableValueFixture = JSON.parse(await readFile(new URL("../fixtures/StableValuePaths.json", import.meta.url), "utf8"));
const stableValuePaths = buildStableValuePathRegistry(stableValueFixture);
assert.equal(stableValuePaths.status, "comparison-brief-not-native-stablecoin");
assert.equal(stableValuePaths.summary.total, 4);
assert.equal(stableValuePaths.summary.buildableNow, 1);
assert.ok(stableValuePaths.paths.some((path) => path.id === "issuer-backed-redeemable-unit" && path.earliestKaspaLane === "issuer-indexer"));
assert.ok(stableValuePaths.boundaries.some((boundary) => /not a live stablecoin/.test(boundary)));
const stableIssuerFixture = JSON.parse(await readFile(new URL("../fixtures/StableIssuerRedemptions.json", import.meta.url), "utf8"));
const stableIssuerState = buildStableIssuerRedemptionState(stableIssuerFixture);
assert.equal(stableIssuerState.status, "issuer-indexer-state-not-native-stablecoin");
assert.equal(stableIssuerState.summary.acceptedIssuedDisplay, "375.00");
assert.equal(stableIssuerState.summary.acceptedRedeemedDisplay, "50.00");
assert.equal(stableIssuerState.summary.acceptedOutstandingDisplay, "325.00");
assert.equal(stableIssuerState.summary.signedOnlyRedemptions, 1);
assert.ok(stableIssuerState.boundaries.some((boundary) => /not a native Kaspa stablecoin/.test(boundary)));
const agentFixture = JSON.parse(await readFile(new URL("../fixtures/AgentCommitments.json", import.meta.url), "utf8"));
const agentBoard = buildAgentCommitmentBoard(agentFixture);
assert.equal(agentBoard.status, "payload-indexed-agent-commitments-not-autonomous-payouts");
assert.equal(agentBoard.summary.tasks, 3);
assert.equal(agentBoard.summary.releaseReady, 1);
assert.equal(agentBoard.summary.disputed, 1);
assert.equal(agentBoard.summary.acceptedLifecycleEvents, 2);
assert.ok(agentBoard.tasks.some((task) => task.taskId === "agent-task-escrow-001" && task.state === "disputed"));
const buildStatusFixture = JSON.parse(await readFile(new URL("../fixtures/BuildStatus.json", import.meta.url), "utf8"));
const projectStatus = buildProjectStatus(buildStatusFixture);
assert.equal(projectStatus.status, "active-build-map");
assert.equal(projectStatus.summary.total, 14);
assert.ok(projectStatus.summary.builtBases >= 10);
assert.ok(projectStatus.naturalNextSteps.some((step) => /agent-task/i.test(step)));
assert.ok(projectStatus.lanes.some((lane) => lane.id === "zk-anchor-readiness" && lane.status === "research"));
const projectPlan = buildProjectPlan(buildStatusFixture);
assert.equal(projectPlan.status, "active-operator-plan");
assert.equal(projectPlan.summary.done, 17);
assert.equal(projectPlan.summary.wip, 4);
assert.equal(projectPlan.summary.next, 5);
assert.equal(projectPlan.summary.later, 6);
assert.ok(projectPlan.next.some((item) => item.id === "wallet-connector-submit"));
assert.ok(projectPlan.done.some((item) => item.id === "based-rollup-scout"));
assert.ok(projectPlan.done.some((item) => item.id === "covenant-adversarial-map"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-fixtures"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-funding"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-spend-drafts"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-accepted-spends"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-invalid-candidates"));
assert.ok(projectPlan.done.some((item) => item.id === "indexer-storage-schema"));
assert.ok(projectPlan.done.some((item) => item.id === "indexer-fixture-replay"));
assert.ok(projectPlan.next.some((item) => item.id === "indexer-virtual-chain-reader"));
assert.ok(projectPlan.next.some((item) => item.id === "rollup-bridge-brief"));
assert.ok(projectPlan.later.some((item) => item.id === "native-assets-and-stables"));
assert.ok(projectPlan.later.some((item) => item.id === "vprog-forward-compat"));
assert.ok(projectPlan.longTermVision.some((item) => /wallet-reviewed Kaspa app console/.test(item)));
const proofFixture = JSON.parse(await readFile(new URL("../fixtures/AcceptedProofTransactions.json", import.meta.url), "utf8"));
const roleProofFixture = JSON.parse(await readFile(new URL("../fixtures/RoleSeparatedAcceptedProofTransactions.json", import.meta.url), "utf8"));
const roleProofEvidence = JSON.parse(await readFile(new URL("../artifacts/role-separated-proof-evidence.json", import.meta.url), "utf8"));
assert.equal(roleProofFixture.schema, "tn12-role-separated-accepted-proof-transactions/v1");
assert.equal(roleProofFixture.transactions.length, 7);
assert.equal(roleProofFixture.fundingBatches.length, 3);
assert.equal(roleProofFixture.fundingBatches[0].txid, "ce1a94b8ced52cbc73e8f79c173e6b3611fa0c57fa3a712db64da290f555f4e0");
assert.ok(roleProofFixture.transactions.some((proof) => proof.txid === "dbe2c3ea5cf7e93031db468a8906be16fdc1a2e4b6382d14d7d01e67e71274e0"));
assert.ok(roleProofFixture.transactions.some((proof) => proof.txid === "cb7da9329250a82bfbe53ce6a25855402de1dc9fdc5d856daa25576088b90b11"));
assert.ok(roleProofFixture.transactions.some((proof) => proof.txid === "677b9c3925c3e9fa6b8c62a3db5c44587a21b2951006395f827574dff7c7bdfa"));
assert.ok(roleProofFixture.historicalRejectedAttempts.some((attempt) => /sigOpCount: 1/.test(attempt.correction)));
assert.ok(roleProofFixture.historicalRejectedAttempts.some((attempt) => /DAA-style/.test(attempt.correction)));
assert.equal(roleProofEvidence.summary.total, 7);
assert.equal(roleProofEvidence.summary.accepted, 7);
assert.equal(roleProofEvidence.summary.matchedInputs, 7);
assert.equal(roleProofEvidence.summary.p2pkOutputs, 7);
const roleWalletsPublic = JSON.parse(await readFile(new URL("../fixtures/RoleSeparatedWallets.public.json", import.meta.url), "utf8"));
assert.equal(roleWalletsPublic.schema, "tn12-role-separated-wallets-public/v1");
assert.equal(Object.keys(roleWalletsPublic.roles).length, 6);
assert.equal(new Set(Object.values(roleWalletsPublic.roles).map((role) => role.xOnlyPublicKey)).size, 6);
assert.equal(roleWalletsPublic.constructorFixtures.Escrow, "fixtures/role-separated/Escrow.ctor.json");
const roleDraftPaths = [
  "artifacts/signed-drafts/role-vault-recovery.json",
  "artifacts/signed-drafts/role-daa-expired-vault-withdrawal.json",
  "artifacts/signed-drafts/role-assurance-release.json",
  "artifacts/signed-drafts/role-daa-expired-assurance-refund.json",
  "artifacts/signed-drafts/role-escrow-release.json",
  "artifacts/signed-drafts/role-daa-expired-escrow-refund.json",
  "artifacts/signed-drafts/role-expired-escrow-cancel.json"
];
const roleDrafts = Object.fromEntries(await Promise.all(roleDraftPaths.map(async (path) => [
  path,
  JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"))
])));
const roleInvalidCandidates = buildRoleSeparatedInvalidCandidates({
  proofFixture: roleProofFixture,
  drafts: roleDrafts,
  roleWallets: roleWalletsPublic,
  generatedAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(roleInvalidCandidates.status, "local-review-only-not-submitted");
assert.equal(roleInvalidCandidates.summary.proofPaths, 7);
assert.equal(roleInvalidCandidates.summary.candidates, 32);
assert.equal(roleInvalidCandidates.summary.wrongSigner, 7);
assert.equal(roleInvalidCandidates.summary.wrongSelector, 7);
assert.equal(roleInvalidCandidates.summary.wrongOutputLock, 7);
assert.equal(roleInvalidCandidates.summary.wrongOutputAmount, 7);
assert.equal(roleInvalidCandidates.summary.badLockShape, 3);
assert.equal(roleInvalidCandidates.summary.singlePartyCancel, 1);
assert.equal(roleInvalidCandidates.summary.readyForSubmission, 0);
assert.ok(roleInvalidCandidates.cases.some((item) =>
  item.label === "Role-separated escrow cancel"
  && item.candidates.some((candidate) => candidate.id === "single-party-cancel")
));
const roleInvalidArtifact = JSON.parse(await readFile(new URL("../artifacts/role-separated-invalid-candidates.json", import.meta.url), "utf8"));
assert.equal(roleInvalidArtifact.summary.candidates, 32);
assert.equal(roleInvalidArtifact.summary.readyForSubmission, 0);
const covenantCoverage = buildCovenantAdversarialCoverage({
  proofFixture,
  constructorArgs: {
    DelayedRecoveryVault: JSON.parse(await readFile(new URL("../fixtures/DelayedRecoveryVault.ctor.json", import.meta.url), "utf8")),
    AssurancePledge: JSON.parse(await readFile(new URL("../fixtures/AssurancePledge.ctor.json", import.meta.url), "utf8")),
    Escrow: JSON.parse(await readFile(new URL("../fixtures/Escrow.ctor.json", import.meta.url), "utf8"))
  },
  compiledContracts: {
    DelayedRecoveryVault: JSON.parse(await readFile(new URL("../artifacts/DelayedRecoveryVault.json", import.meta.url), "utf8")),
    AssurancePledge: JSON.parse(await readFile(new URL("../artifacts/AssurancePledge.json", import.meta.url), "utf8")),
    Escrow: JSON.parse(await readFile(new URL("../artifacts/Escrow.json", import.meta.url), "utf8"))
  },
  drafts: [
    { path: "artifacts/signed-drafts/vault-recovery.json", acceptedTxid: "b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/vault-recovery.json", import.meta.url), "utf8")) },
    { path: "artifacts/signed-drafts/vault-withdrawal.json", acceptedTxid: "9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/vault-withdrawal.json", import.meta.url), "utf8")) },
    { path: "artifacts/signed-drafts/assurance-release.json", acceptedTxid: "80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/assurance-release.json", import.meta.url), "utf8")) },
    { path: "artifacts/signed-drafts/assurance-refund.json", acceptedTxid: "faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/assurance-refund.json", import.meta.url), "utf8")) },
    { path: "artifacts/signed-drafts/escrow-release.json", acceptedTxid: "825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-release.json", import.meta.url), "utf8")) },
    { path: "artifacts/signed-drafts/escrow-daa-refund-proof-refund.json", acceptedTxid: "6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-daa-refund-proof-refund.json", import.meta.url), "utf8")) },
    { path: "artifacts/signed-drafts/escrow-cancel-proof-cancel.json", acceptedTxid: "14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c", draft: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/escrow-cancel-proof-cancel.json", import.meta.url), "utf8")) }
  ]
});
assert.equal(covenantCoverage.status, "local-adversarial-coverage-with-open-gaps");
assert.equal(covenantCoverage.summary.acceptedProofSpends, 7);
assert.equal(covenantCoverage.summary.localDraftCases, 7);
assert.equal(covenantCoverage.summary.adversarialMutations, 38);
assert.equal(covenantCoverage.summary.roleSeparationGaps, 3);
assert.ok(covenantCoverage.cases.some((item) =>
  item.id === "escrow-cancel:cancel"
  && item.positiveChecks.inputMassMatchesTxVersion
));
assert.ok(covenantCoverage.gaps.some((gap) => /constructor roles reuse/.test(gap)));
const fakeTransactions = Object.fromEntries(proofFixture.transactions.map((proof, index) => [
  proof.txid,
  {
    is_accepted: true,
    accepting_block_blue_score: 1000 + index,
    accepting_block_time: 1778141640000 + index,
    outputs: [
      {
        index: 0,
        amount: proof.amountSompi,
        script_public_key_address: proof.destination,
        script_public_key_type: "pubkey"
      }
    ]
  }
]));
const acceptedState = buildAcceptedAppState({ proofFixture, transactions: fakeTransactions, fetchedAt: "2026-05-07T00:00:00.000Z" });
assert.equal(acceptedState.summary.total, 7);
assert.equal(acceptedState.summary.matched, 7);
assert.equal(acceptedState.appState.vault.status, "proofs-accepted");
assert.equal(acceptedState.appState.escrow.status, "proofs-accepted");
assert.ok(acceptedState.records.some((record) =>
  record.entrypoint === "cancel"
  && record.accepted === true
  && record.txid === "14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c"
));
const checkpointFixture = JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8"));
assert.equal(checkpointFixture.summary.total, 33);
assert.equal(checkpointFixture.summary.proofs, 7);
assert.equal(checkpointFixture.summary.payloadEvents, 26);
assert.equal(checkpointFixture.summary.mismatches, 0);
assert.equal(checkpointFixture.status, "accepted-index-fully-matched");
assert.ok(checkpointFixture.checkpoint.maxAcceptingBlockBlueScore > checkpointFixture.checkpoint.minAcceptingBlockBlueScore);
const persistedCheckpointFixture = JSON.parse(await readFile(new URL("../artifacts/persisted-checkpoint-guard.json", import.meta.url), "utf8"));
assert.equal(persistedCheckpointFixture.status, "persisted-checkpoint-ready");
assert.equal(persistedCheckpointFixture.summary.recordCount, 33);
assert.equal(persistedCheckpointFixture.summary.mismatches, 0);
assert.equal(persistedCheckpointFixture.summary.rollbackDetected, false);
const replayPlanFixture = JSON.parse(await readFile(new URL("../artifacts/indexer-replay-plan.json", import.meta.url), "utf8"));
assert.equal(replayPlanFixture.status, "durable-indexer-plan-ready");
assert.equal(replayPlanFixture.currentCheckpoint.recordCount, 33);
assert.equal(replayPlanFixture.currentCheckpoint.proofSpends, 7);
assert.equal(replayPlanFixture.currentCheckpoint.payloadEvents, 26);
assert.equal(replayPlanFixture.currentCheckpoint.rollbackDetected, false);
assert.equal(replayPlanFixture.target.dataVerbosity, "High");
assert.ok(replayPlanFixture.buildOrder.some((step) => step.id === "rollback-replay"));
assert.ok(replayPlanFixture.acceptanceCriteria.some((criterion) => criterion.includes("matched accepted payload bytes")));
const indexerStorageFixture = JSON.parse(await readFile(new URL("../artifacts/indexer-storage-schema.json", import.meta.url), "utf8"));
assert.equal(indexerStorageFixture.status, "storage-schema-ready");
assert.equal(indexerStorageFixture.tables.length, 5);
assert.ok(indexerStorageFixture.tables.some((table) => table.name === "rollback_segments"));
assert.equal(indexerStorageFixture.sourceCheckpoint.recordCount, 33);
const rebuiltIndexerStorage = buildIndexerStorageSchema({
  replayPlan: replayPlanFixture,
  checkpointIndex: checkpointFixture,
  generatedAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(rebuiltIndexerStorage.status, "storage-schema-ready");
assert.equal(rebuiltIndexerStorage.sourceCheckpoint.payloadEvents, 26);
const indexerReplayRunFixture = JSON.parse(await readFile(new URL("../artifacts/indexer-replay-run.json", import.meta.url), "utf8"));
assert.equal(indexerReplayRunFixture.status, "fixture-replay-ready");
assert.equal(indexerReplayRunFixture.summary.records, 33);
assert.equal(indexerReplayRunFixture.summary.payloadEvents, 26);
assert.equal(indexerReplayRunFixture.summary.proofSpends, 7);
assert.equal(indexerReplayRunFixture.summary.appStateReady, true);
assert.equal(indexerReplayRunFixture.tableCounts.accepted_transactions, 33);
assert.equal(indexerReplayRunFixture.tableCounts.rollback_segments, 0);
const rebuiltReplayRun = buildIndexerReplayRun({
  checkpointIndex: checkpointFixture,
  storageSchema: indexerStorageFixture,
  runAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(rebuiltReplayRun.status, "fixture-replay-ready");
assert.ok(rebuiltReplayRun.reducerReadiness.some((item) =>
  item.lane === "invoice" && item.status === "ready-from-fixture-replay"
));
const samplePayloadArtifact = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/payload-receipt-self-send.json", import.meta.url), "utf8"));
const samplePayloadTx = {
  is_accepted: true,
  accepting_block_blue_score: 2000,
  accepting_block_time: 1778141640000,
  payload: samplePayloadArtifact.submitPayload.transaction.payload,
  outputs: [
    {
      index: 0,
      amount: samplePayloadArtifact.submitPayload.transaction.outputs[0].amount,
      script_public_key_address: samplePayloadArtifact.payment.destination,
      script_public_key_type: "pubkey"
    }
  ]
};
const checkpointState = buildCheckpointedAcceptedIndex({
  proofFixture: { network: "kaspa-testnet-12", transactions: [proofFixture.transactions[0]] },
  proofTransactions: { [proofFixture.transactions[0].txid]: fakeTransactions[proofFixture.transactions[0].txid] },
  payloadManifest: {
    network: "kaspa-testnet-12",
    events: [
      {
        label: "Invoice paid",
        draftPath: "artifacts/signed-drafts/payload-receipt-self-send.json",
        outPath: "artifacts/payload-receipt-evidence.json"
      }
    ]
  },
  payloadArtifacts: {
    "artifacts/signed-drafts/payload-receipt-self-send.json": samplePayloadArtifact
  },
  payloadTransactions: {
    [samplePayloadArtifact.transactionId]: samplePayloadTx
  },
  fetchedAt: "2026-05-07T00:00:00.000Z"
});
assert.equal(checkpointState.summary.total, 2);
assert.equal(checkpointState.summary.matched, 2);
assert.equal(checkpointState.checkpoint.maxAcceptingBlockBlueScore, 2000);
const persistedCheckpoint = buildPersistedCheckpointGuard({
  currentIndex: checkpointState,
  previousSnapshot: {
    current: {
      recordCount: 2,
      minBlueScore: 1000,
      maxBlueScore: 2000,
      txids: checkpointState.checkpoint.txids
    }
  },
  persistedAt: "2026-05-07T00:00:00.000Z"
});
assert.equal(persistedCheckpoint.status, "persisted-checkpoint-ready");
assert.equal(persistedCheckpoint.summary.rollbackDetected, false);
const replayPlan = buildIndexerReplayPlan({
  checkpointIndex: checkpointState,
  persistedCheckpoint
});
assert.equal(replayPlan.status, "durable-indexer-plan-ready");
assert.equal(replayPlan.currentCheckpoint.recordCount, 2);
assert.equal(replayPlan.currentCheckpoint.proofSpends, 1);
assert.equal(replayPlan.currentCheckpoint.payloadEvents, 1);
const rollbackCheckpoint = buildPersistedCheckpointGuard({
  currentIndex: checkpointState,
  previousSnapshot: {
    current: {
      recordCount: 3,
      minBlueScore: 1000,
      maxBlueScore: 3000,
      txids: [...checkpointState.checkpoint.txids, "missing-after-rollback"]
    }
  },
  persistedAt: "2026-05-07T00:00:00.000Z"
});
assert.equal(rollbackCheckpoint.status, "rollback-review-required");
assert.equal(rollbackCheckpoint.summary.rollbackDetected, true);
const fakePreviousTransactions = Object.fromEntries(proofFixture.transactions.map((proof, index) => [
  proof.source?.txid || `prev-${index}`,
  {
    outputs: [
      {
        index: proof.source?.outputIndex ?? 0,
        amount: Number(proof.source?.amountSompi || (index < 2 ? 2500000000 : 25000000000)),
        script_public_key_address: `kaspatest:pcontract${index}`,
        script_public_key_type: "scripthash"
      }
    ]
  }
]));
const fakeSpendTransactions = Object.fromEntries(proofFixture.transactions.map((proof, index) => [
  proof.txid,
  {
    is_accepted: true,
    accepting_block_blue_score: 1000 + index,
    accepting_block_time: 1778141640000 + index,
    inputs: [
      {
        previous_outpoint_hash: proof.source?.txid || `prev-${index}`,
        previous_outpoint_index: String(proof.source?.outputIndex ?? 0),
        sig_op_count: "1"
      }
    ],
    outputs: [
      {
        index: 0,
        amount: Number(proof.amountSompi),
        script_public_key_address: proof.destination,
        script_public_key_type: "pubkey"
      }
    ]
  }
]));
const proofEvidence = buildProofEvidence({
  proofFixture,
  transactions: fakeSpendTransactions,
  previousTransactions: fakePreviousTransactions,
  verifiedAt: "2026-05-07T00:00:00.000Z"
});
assert.equal(proofEvidence.summary.accepted, 7);
assert.equal(proofEvidence.summary.p2shInputs, 7);
assert.equal(proofEvidence.summary.matchedInputs, 7);
assert.equal(proofEvidence.summary.p2pkOutputs, 7);
assert.equal(proofEvidence.summary.matchedOutputs, 7);

const vaultContractArtifact = JSON.parse(await readFile(new URL("../artifacts/DelayedRecoveryVault.json", import.meta.url), "utf8"));
const assuranceContractArtifact = JSON.parse(await readFile(new URL("../artifacts/AssurancePledge.json", import.meta.url), "utf8"));
const transactionPlan = buildDryRunTransactionPlan({
  vaultArtifact: artifact,
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

const files = [
  "index.html",
  "styles.css",
  "app.js",
  "package.json",
  "package-lock.json",
  "scripts/create-testnet-address.mjs",
  "scripts/check-ui.mjs",
  "scripts/wallet-public-info.mjs",
  "scripts/fetch-funded-utxos.mjs",
  "scripts/generate-constructor-fixtures.mjs",
  "scripts/generate-role-separated-fixtures.mjs",
  "scripts/generate-role-separated-expired-fixtures.mjs",
  "scripts/compile-silverscript.mjs",
  "scripts/compile-role-separated-contracts.mjs",
  "scripts/build-transaction-drafts.mjs",
  "scripts/build-signed-p2pk-draft.mjs",
  "scripts/build-signed-contract-funding-drafts.mjs",
  "scripts/build-signed-escrow-funding-draft.mjs",
  "scripts/build-signed-escrow-spend-drafts.mjs",
  "scripts/build-signed-split-draft.mjs",
  "scripts/build-role-separated-funding-draft.mjs",
  "scripts/build-role-separated-spend-drafts.mjs",
  "scripts/build-signed-contract-spend-drafts.mjs",
  "scripts/fetch-contract-outpoints.mjs",
  "scripts/fetch-contract-outpoint.mjs",
  "scripts/fetch-split-buckets.mjs",
  "scripts/build-signed-payload-receipt-draft.mjs",
  "scripts/verify-accepted-txs.mjs",
  "scripts/build-proof-evidence.mjs",
  "scripts/build-covenant-adversarial-coverage.mjs",
  "scripts/build-role-separated-invalid-candidates.mjs",
  "scripts/build-accepted-app-state.mjs",
  "scripts/build-checkpointed-index.mjs",
  "scripts/build-persisted-checkpoint-guard.mjs",
  "scripts/build-indexer-replay-plan.mjs",
  "scripts/build-indexer-storage-schema.mjs",
  "scripts/build-indexer-replay-run.mjs",
  "scripts/submit-signed-draft.mjs",
  "scripts/submit-signed-draft-wrpc.mjs",
  "scripts/plan-transactions.mjs",
  "scripts/build-signal-payload.mjs",
  "scripts/build-invoice-registry.mjs",
  "scripts/build-submit-console-registry.mjs",
  "scripts/build-wallet-review-readiness.mjs",
  "scripts/build-wallet-connector-readiness.mjs",
  "scripts/build-wallet-submit-package.mjs",
  "scripts/build-research-library.mjs",
  "scripts/build-based-rollup-scout.mjs",
  "scripts/build-mainstream-app-direction.mjs",
  "scripts/build-missing-rails-matrix.mjs",
  "scripts/build-batch-assurance-campaign.mjs",
  "scripts/build-batch-assurance-custody-drafts.mjs",
  "scripts/build-batch-assurance-custody-requirements.mjs",
  "scripts/build-enforcement-matrix.mjs",
  "scripts/build-escrow-primitives.mjs",
  "scripts/build-treasury-vaults.mjs",
  "scripts/build-payload-submit-readiness.mjs",
  "scripts/verify-payload-receipt.mjs",
  "scripts/verify-payload-events.mjs",
  "scripts/build-coordination-market.mjs",
  "scripts/build-access-pass-planner.mjs",
  "scripts/build-mainnet-readiness.mjs",
  "scripts/build-asset-policies.mjs",
  "scripts/build-prediction-hedge-simulator.mjs",
  "scripts/build-stable-value-paths.mjs",
  "scripts/build-stable-issuer-redemptions.mjs",
  "scripts/build-status.mjs",
  "scripts/build-project-plan.mjs",
  "scripts/check-negative.mjs",
  "contracts/DelayedRecoveryVault.sil",
  "contracts/AssurancePledge.sil",
  "contracts/Escrow.sil",
  "contracts/EscrowExpired.sil",
  "artifacts/DelayedRecoveryVault.json",
  "artifacts/AssurancePledge.json",
  "artifacts/Escrow.json",
  "artifacts/EscrowExpired.json",
  "artifacts/role-separated/DelayedRecoveryVault.json",
  "artifacts/role-separated/AssurancePledge.json",
  "artifacts/role-separated/Escrow.json",
  "artifacts/role-separated-expired/DelayedRecoveryVault.json",
  "artifacts/role-separated-expired/AssurancePledge.json",
  "artifacts/role-separated-expired/Escrow.json",
  "artifacts/role-separated-daa-expired/DelayedRecoveryVault.json",
  "artifacts/role-separated-daa-expired/AssurancePledge.json",
  "artifacts/role-separated-daa-expired/Escrow.json",
  "artifacts/signed-drafts/escrow-daa-refund-funding.json",
  "artifacts/signed-drafts/escrow-daa-refund-proof-refund.json",
  "artifacts/signed-drafts/escrow-cancel-funding.json",
  "artifacts/signed-drafts/escrow-cancel-proof-cancel.json",
  "artifacts/escrow-cancel-attempt.json",
  "artifacts/signed-drafts/escrow-funding.json",
  "artifacts/signed-drafts/escrow-release.json",
  "artifacts/signed-drafts/escrow-refund.json",
  "artifacts/signed-drafts/escrow-cancel.json",
  "artifacts/signed-drafts/role-separated-funding.json",
  "artifacts/signed-drafts/role-vault-withdrawal.json",
  "artifacts/signed-drafts/role-vault-recovery.json",
  "artifacts/signed-drafts/role-assurance-release.json",
  "artifacts/signed-drafts/role-assurance-refund.json",
  "artifacts/signed-drafts/role-escrow-release.json",
  "artifacts/signed-drafts/role-escrow-refund.json",
  "artifacts/signed-drafts/role-escrow-cancel.json",
  "artifacts/signed-drafts/role-expired-funding.json",
  "artifacts/signed-drafts/role-expired-vault-withdrawal.json",
  "artifacts/signed-drafts/role-expired-vault-recovery.json",
  "artifacts/signed-drafts/role-expired-assurance-release.json",
  "artifacts/signed-drafts/role-expired-assurance-refund.json",
  "artifacts/signed-drafts/role-expired-escrow-release.json",
  "artifacts/signed-drafts/role-expired-escrow-refund.json",
  "artifacts/signed-drafts/role-expired-escrow-cancel.json",
  "artifacts/signed-drafts/role-daa-expired-funding.json",
  "artifacts/signed-drafts/role-daa-expired-vault-withdrawal.json",
  "artifacts/signed-drafts/role-daa-expired-vault-recovery.json",
  "artifacts/signed-drafts/role-daa-expired-assurance-release.json",
  "artifacts/signed-drafts/role-daa-expired-assurance-refund.json",
  "artifacts/signed-drafts/role-daa-expired-escrow-release.json",
  "artifacts/signed-drafts/role-daa-expired-escrow-refund.json",
  "artifacts/signed-drafts/role-daa-expired-escrow-cancel.json",
  "artifacts/signed-drafts/payload-receipt-self-send.json",
  "artifacts/signed-drafts/payload-refund-self-send.json",
  "artifacts/signed-drafts/payload-error-self-send.json",
  "artifacts/submit-console-registry.json",
  "artifacts/wallet-review-readiness.json",
  "artifacts/wallet-connector-readiness.json",
  "artifacts/wallet-submit-package.json",
  "artifacts/research-library.json",
  "artifacts/based-rollup-scout.json",
  "artifacts/mainstream-app-direction.json",
  "artifacts/missing-rails-matrix.json",
  "artifacts/batch-assurance-campaign.json",
  "artifacts/batch-assurance-custody-drafts.json",
  "artifacts/batch-assurance-custody-requirements.json",
  "artifacts/enforcement-matrix.json",
  "artifacts/proof-evidence.json",
  "artifacts/role-separated-proof-evidence.json",
  "artifacts/covenant-adversarial-coverage.json",
  "artifacts/role-separated-invalid-candidates.json",
  "artifacts/escrow-primitives.json",
  "artifacts/treasury-vaults.json",
  "artifacts/payload-submit-readiness.json",
  "artifacts/payload-receipt-evidence.json",
  "artifacts/payload-refund-evidence.json",
  "artifacts/payload-error-evidence.json",
  "artifacts/checkpointed-accepted-index.json",
  "artifacts/persisted-checkpoint-guard.json",
  "artifacts/indexer-replay-plan.json",
  "artifacts/indexer-storage-schema.json",
  "artifacts/indexer-replay-run.json",
  "artifacts/coordination-market-prototype.json",
  "artifacts/access-pass-planner.json",
  "artifacts/mainnet-readiness.json",
  "artifacts/simple-asset-policies.json",
  "artifacts/prediction-hedge-simulator.json",
  "artifacts/stable-value-paths.json",
  "artifacts/stable-issuer-redemptions.json",
  "artifacts/build-status.json",
  "artifacts/project-plan.json",
  "fixtures/FundedWalletOutpoint.example.json",
  "fixtures/FundedWalletOutpoint.json",
  "fixtures/FundedWalletUtxos.json",
  "fixtures/SavedWallet.public.json",
  "fixtures/RoleSeparatedWallets.public.json",
  "fixtures/AcceptedProofTransactions.json",
  "fixtures/RoleSeparatedAcceptedProofTransactions.json",
  "fixtures/AcceptedAppState.json",
  "fixtures/EcosystemBuildQueue.json",
  "fixtures/VaultTemplates.json",
  "fixtures/KaspaAppLab.json",
  "fixtures/MinerSignalResearch.json",
  "fixtures/AttestationSignals.json",
  "fixtures/MasterAppRoadmap.json",
  "fixtures/InvoiceReceipts.json",
  "fixtures/PayloadSubmitAttempt.json",
  "fixtures/SubmitConsoleDrafts.json",
  "fixtures/CrossChainResearchLibrary.json",
  "fixtures/BasedRollupScout.json",
  "fixtures/MainstreamAppDirection.json",
  "fixtures/MissingRailsMatrix.json",
  "fixtures/BatchAssuranceCampaign.json",
  "fixtures/EnforcementMatrix.json",
  "fixtures/EscrowPrimitives.json",
  "fixtures/TreasuryVaults.json",
  "fixtures/CoordinationMarketPrototype.json",
  "fixtures/AccessPassPlanner.json",
  "fixtures/MainnetReadiness.json",
  "fixtures/SimpleAssetPolicies.json",
  "fixtures/StableValuePaths.json",
  "fixtures/StableIssuerRedemptions.json",
  "fixtures/BuildStatus.json",
  "fixtures/EscrowContractOutpoint.json",
  "fixtures/EscrowDaaRefundContractOutpoint.json",
  "fixtures/EscrowCancelContractOutpoint.json",
  "fixtures/RoleVaultContractOutpoint.json",
  "fixtures/RoleAssuranceContractOutpoint.json",
  "fixtures/RoleEscrowContractOutpoint.json",
  "fixtures/RoleExpiredVaultContractOutpoint.json",
  "fixtures/RoleExpiredAssuranceContractOutpoint.json",
  "fixtures/RoleExpiredEscrowContractOutpoint.json",
  "fixtures/RoleDaaExpiredVaultContractOutpoint.json",
  "fixtures/RoleDaaExpiredAssuranceContractOutpoint.json",
  "fixtures/RoleDaaExpiredEscrowContractOutpoint.json",
  "fixtures/EscrowExpired.ctor.json",
  "fixtures/role-separated/DelayedRecoveryVault.ctor.json",
  "fixtures/role-separated/AssurancePledge.ctor.json",
  "fixtures/role-separated/Escrow.ctor.json",
  "fixtures/role-separated-expired/DelayedRecoveryVault.ctor.json",
  "fixtures/role-separated-expired/AssurancePledge.ctor.json",
  "fixtures/role-separated-expired/Escrow.ctor.json",
  "fixtures/role-separated-daa-expired/DelayedRecoveryVault.ctor.json",
  "fixtures/role-separated-daa-expired/AssurancePledge.ctor.json",
  "fixtures/role-separated-daa-expired/Escrow.ctor.json",
  "src/manualOutpoint.mjs",
  "src/acceptedIndexer.mjs",
  "src/checkpointedIndexer.mjs",
  "src/indexerPersistence.mjs",
  "src/indexerStorageSchema.mjs",
  "src/indexerReplayRun.mjs",
  "src/signalPayload.mjs",
  "src/attestationSignal.mjs",
  "src/invoiceReceipt.mjs",
  "src/submitConsole.mjs",
  "src/walletReview.mjs",
  "src/walletConnectorReadiness.mjs",
  "src/walletSubmitPackage.mjs",
  "src/appResearch.mjs",
  "src/basedRollupScout.mjs",
  "src/mainstreamAppDirection.mjs",
  "src/missingRailsMatrix.mjs",
  "src/batchAssurance.mjs",
  "src/batchAssuranceCustodyDrafts.mjs",
  "src/enforcementMatrix.mjs",
  "src/escrowPrimitive.mjs",
  "src/treasuryVault.mjs",
  "src/payloadSubmitReadiness.mjs",
  "src/wrpcSubmitCandidate.mjs",
  "src/coordinationMarket.mjs",
  "src/accessPassPlanner.mjs",
  "src/mainnetReadiness.mjs",
  "src/assetPolicy.mjs",
  "src/predictionHedgeSimulator.mjs",
  "src/stableValuePaths.mjs",
  "src/stableIssuerRedemption.mjs",
  "src/buildStatus.mjs",
  "src/projectPlan.mjs",
  "src/covenantAdversarialCoverage.mjs",
  "src/roleSeparatedInvalidCandidates.mjs",
  "src/transactionPlanner.mjs",
  "src/transactionDrafts.mjs",
  "src/signedContractDrafts.mjs",
  "src/contractSpendDrafts.mjs",
  "src/submitPayload.mjs",
  "README.md",
  "AGENTS.md",
  "CONTEXT.md",
  "docs/STATUS.md",
  "docs/SOURCES.md",
  "docs/BUILD_PLAN.md",
  "docs/LLM_REVIEW_GUIDE.md",
  "docs/MICHAEL_QUESTIONS.md",
  "docs/ROADMAP_STATE.md",
  "docs/TN12_TEST_MATRIX.md",
  "docs/TRANSACTION_API_NOTES.md",
  "docs/ASSURANCE_CONTRACTS.md",
  "docs/KASPA_DOCS_REVIEW.md",
  "docs/ECOSYSTEM_BUILD_PLAN.md",
  "docs/GITHUB_HOSTING.md",
  "docs/MASTER_APP_PLAN.md",
  "docs/PROGRAMMABILITY_PATHS.md",
  "docs/MAINSTREAM_APP_DIRECTION.md"
];

for (const file of files) {
  const text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  assert.ok(text.length > 100, `${file} should not be empty`);
}

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
assert.match(readme, /faucet-tn12\.kaspanet\.io/);
assert.match(readme, /avoids mainnet-wallet claims/i);
assert.match(readme, /starts with local evidence/i);
assert.match(readme, /npm run address/);
assert.match(readme, /npm run fixtures/);
assert.match(readme, /npm run fixtures:roles/);
assert.match(readme, /npm run compile:roles/);
assert.match(readme, /npm run wallet:public/);
assert.match(readme, /npm run plan/);
assert.match(readme, /npm run drafts/);
assert.match(readme, /npm run indexer:persist/);
assert.match(readme, /npm run indexer:replay-plan/);
assert.match(readme, /npm run indexer:schema/);
assert.match(readme, /npm run indexer:replay/);
assert.match(readme, /npm run tx:p2pk/);
assert.match(readme, /npm run tx:contracts/);
assert.match(readme, /npm run tx:split/);
assert.match(readme, /npm run tx:roles:fund/);
assert.match(readme, /npm run tx:roles:spends/);
assert.match(readme, /npm run tx:roles:verify/);
assert.match(readme, /npm run roles:proof:evidence/);
assert.match(readme, /npm run roles:invalid-candidates/);
assert.match(readme, /npm run invoice:registry/);
assert.match(readme, /npm run submit:registry/);
assert.match(readme, /npm run wallet:review/);
assert.match(readme, /npm run wallet:connector/);
assert.match(readme, /npm run research:library/);
assert.match(readme, /npm run rollup:scout/);
assert.match(readme, /npm run mainstream:direction/);
assert.match(readme, /npm run rails:missing/);
assert.match(readme, /npm run covenant:adversarial/);
assert.match(readme, /npm run campaign:state/);
assert.match(readme, /npm run campaign:custody/);
assert.match(readme, /npm run campaign:custody-requirements/);
assert.match(readme, /npm run enforcement:matrix/);
assert.match(readme, /npm run escrow:registry/);
assert.match(readme, /npm run treasury:registry/);
assert.match(readme, /npm run payload:readiness/);
assert.match(readme, /npm run coordination:market/);
assert.match(readme, /npm run access:passes/);
assert.match(readme, /npm run mainnet:readiness/);
assert.match(readme, /npm run asset:policies/);
assert.match(readme, /npm run stable:value/);
assert.match(readme, /npm run stable:issuer/);
assert.match(readme, /npm run build:status/);
assert.match(readme, /Manual Address Checks/);
assert.match(readme, /Build Plan/);
assert.match(readme, /PROGRAMMABILITY_PATHS\.md/);
assert.match(readme, /MAINSTREAM_APP_DIRECTION\.md/);
assert.match(readme, /qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt/);
assert.match(readme, /npm run check:tn12/);

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /TN12 configured\. Proof transactions accepted\./);
assert.match(html, /TN12 faucet/);
assert.match(html, /npm run address/);
assert.match(html, /Assurance contract/);
assert.match(html, /Manual address check/);
assert.match(html, /Kaspa app lab/);
assert.match(html, /Miner signal research/);
assert.match(html, /Accepted transaction indexer/);
assert.match(html, /Payload receipt app/);
assert.match(html, /payload:readiness/);
assert.match(html, /Batch assurance campaigns/);
assert.match(html, /Enforcement matrix/);
assert.match(html, /Escrow primitive/);
assert.match(html, /Treasury \/ team vaults/);
assert.match(html, /Transparent coordination-market prototype/);
assert.match(html, /KRC \/ access pass planner/);
assert.match(html, /Mainnet readiness map/);
assert.match(html, /Simple asset policy/);
assert.match(html, /Stable-value paths/);
assert.match(html, /Issuer redemption state/);
assert.match(html, /Build status/);
assert.match(html, /Operator plan/);
assert.match(html, /npm run project:plan/);
assert.match(html, /Wallet-facing submit console/);
assert.match(html, /Cross-chain research library/);
assert.match(html, /receipt-events/);
assert.match(html, /Master app plan/);
assert.match(html, /Attestation registry/);
assert.match(html, /Prediction hedge simulator/);
assert.match(html, /npm run prediction:hedge/);
assert.match(html, /escrow mutual-cancel proof transactions/);
assert.match(html, /accepted pledge-output custody drafts/);
assert.doesNotMatch(html, /escrow cancel redesign/);

const assuranceDocs = await readFile(new URL("../docs/ASSURANCE_CONTRACTS.md", import.meta.url), "utf8");
assert.match(assuranceDocs, /funding rule strangers can rely on/);
assert.match(assuranceDocs, /AssurancePledge\.sil/);
assert.match(assuranceDocs, /target aggregation/);

const buildPlan = await readFile(new URL("../docs/BUILD_PLAN.md", import.meta.url), "utf8");
assert.match(buildPlan, /Completed Proof Path/);
assert.match(buildPlan, /Next 20 Build Tasks/);
assert.match(buildPlan, /Accepted-transaction app-state snapshot/);

const michaelQuestions = await readFile(new URL("../docs/MICHAEL_QUESTIONS.md", import.meta.url), "utf8");
assert.match(michaelQuestions, /14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c/);
assert.match(michaelQuestions, /computeBudget: 30/);
assert.match(michaelQuestions, /local debugging has checked the basic layers/);
assert.match(michaelQuestions, /kaspa-wasm@0\.13\.0/);
assert.match(michaelQuestions, /1\.1\.1-toc\.1/);
assert.match(michaelQuestions, /RpcTransactionInput\.sig_op_count is inconsistent/);
assert.match(michaelQuestions, /RPC response error NotFound/);

const statusDocs = await readFile(new URL("../docs/STATUS.md", import.meta.url), "utf8");
assert.match(statusDocs, /payload receipts must use JSON wRPC/);
assert.match(statusDocs, /26 accepted payload events/);
assert.doesNotMatch(statusDocs, /broadcast: implemented through the TN12 public REST API/);

const builderLessons = await readFile(new URL("../docs/BUILDER_LESSONS.md", import.meta.url), "utf8");
assert.match(builderLessons, /Accepted State Beats Local Confidence/);
assert.match(builderLessons, /sigOpCount: 0/);
assert.match(builderLessons, /computeBudget: 30/);
assert.match(builderLessons, /Aspectron/);
assert.match(builderLessons, /stale tooling/);

const kaspaDocsReview = await readFile(new URL("../docs/KASPA_DOCS_REVIEW.md", import.meta.url), "utf8");
assert.match(kaspaDocsReview, /Wallet API is the better long-term send path/);
assert.match(kaspaDocsReview, /getVirtualChainFromBlockV2/);

const ecosystemBuildPlan = await readFile(new URL("../docs/ECOSYSTEM_BUILD_PLAN.md", import.meta.url), "utf8");
assert.match(ecosystemBuildPlan, /Payload Receipt \/ Invoice App/);
assert.match(ecosystemBuildPlan, /Batch Assurance Campaign App/);
assert.match(ecosystemBuildPlan, /Escrow Primitive/);
assert.match(ecosystemBuildPlan, /Cross-Chain App Code And PMF Research/);
assert.match(ecosystemBuildPlan, /Miner \/ Pool Signal Research App/);

const appLab = JSON.parse(await readFile(new URL("../fixtures/KaspaAppLab.json", import.meta.url), "utf8"));
assert.ok(appLab.lanes.some((lane) => lane.id === "cross-chain-research"));

const masterRoadmap = JSON.parse(await readFile(new URL("../fixtures/MasterAppRoadmap.json", import.meta.url), "utf8"));
assert.equal(masterRoadmap.lanes.length, 12);
assert.deepEqual(masterRoadmap.lanes.map((lane) => lane.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
assert.ok(masterRoadmap.lanes.some((lane) => lane.id === "miner-pool-signals"));

const sources = await readFile(new URL("../docs/SOURCES.md", import.meta.url), "utf8");
assert.match(sources, /Cross-Chain App Research Resources/);
assert.match(sources, /PMF clues/);

const masterPlan = await readFile(new URL("../docs/MASTER_APP_PLAN.md", import.meta.url), "utf8");
assert.match(masterPlan, /Payload Receipt \/ Invoice App/);
assert.match(masterPlan, /Batch Assurance Campaigns/);
assert.match(masterPlan, /Cross-Chain App Research Library/);
assert.match(masterPlan, /AI-Agent Commitment Board/);
assert.match(masterPlan, /No fake block-header claims|arbitrary app data can be placed in block headers/);

const mainstreamDirection = await readFile(new URL("../docs/MAINSTREAM_APP_DIRECTION.md", import.meta.url), "utf8");
assert.match(mainstreamDirection, /Mainstream App Direction/);
assert.match(mainstreamDirection, /Invoice \/ receipt app/);
assert.match(mainstreamDirection, /Escrow \/ freelance \/ marketplace/);
assert.match(mainstreamDirection, /DEX \/ AMM \/ lending \/ perps/);
assert.match(mainstreamDirection, /Build-Now Focus/);

const githubHosting = await readFile(new URL("../docs/GITHUB_HOSTING.md", import.meta.url), "utf8");
assert.match(githubHosting, /GitHub Pages/);
assert.match(githubHosting, /Repo Settings/);
assert.match(githubHosting, /Never commit `\.local\/tn12-wallet\.json`/);

const vaultContract = await readFile(new URL("../contracts/DelayedRecoveryVault.sil", import.meta.url), "utf8");
assert.match(vaultContract, /contract DelayedRecoveryVault/);
assert.match(vaultContract, /entrypoint function recover/);

const pledgeContract = await readFile(new URL("../contracts/AssurancePledge.sil", import.meta.url), "utf8");
assert.match(pledgeContract, /contract AssurancePledge/);
assert.match(pledgeContract, /entrypoint function refund/);

const escrowContract = await readFile(new URL("../contracts/Escrow.sil", import.meta.url), "utf8");
assert.match(escrowContract, /contract Escrow/);
assert.match(escrowContract, /entrypoint function release/);
assert.match(escrowContract, /entrypoint function cancel/);

console.log("Checks passed.");
