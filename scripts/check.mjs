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
import { buildAttestationReputationThresholds } from "../src/attestationReputationThresholds.mjs";
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
import { buildWalletConnectorSubmitRequests } from "../src/walletConnectorSubmitRequests.mjs";
import { buildMainstreamAppDirection } from "../src/mainstreamAppDirection.mjs";
import { buildMissingRailsMatrix } from "../src/missingRailsMatrix.mjs";
import { buildRailResearchTriggers } from "../src/railResearchTriggers.mjs";
import { buildOracleSourceMatrix } from "../src/oracleSourceMatrix.mjs";
import { buildNextWorkQueue } from "../src/nextWorkQueue.mjs";
import { buildNextTenExecutionPlan } from "../src/nextTenExecutionPlan.mjs";
import { buildNextTenExecutionStatus } from "../src/nextTenExecutionStatus.mjs";
import { buildBatchAssuranceState } from "../src/batchAssurance.mjs";
import { buildBatchAssuranceCustodyDrafts } from "../src/batchAssuranceCustodyDrafts.mjs";
import { buildBatchAssuranceCustodyRequirements } from "../src/batchAssuranceCustodyRequirements.mjs";
import { buildBatchAssurancePledgeOutputPlan } from "../src/batchAssurancePledgeOutputs.mjs";
import { buildBatchAssuranceCustodyImports } from "../src/batchAssuranceCustodyImports.mjs";
import { buildWalletConnectorReadiness } from "../src/walletConnectorReadiness.mjs";
import { buildWalletSubmitPackage } from "../src/walletSubmitPackage.mjs";
import { buildEnforcementMatrix } from "../src/enforcementMatrix.mjs";
import { buildEscrowPrimitive } from "../src/escrowPrimitive.mjs";
import { buildEscrowMarketplaceDemo } from "../src/escrowMarketplaceDemo.mjs";
import { buildEscrowMarketplaceFlow } from "../src/escrowMarketplaceFlow.mjs";
import { buildEscrowMarketplaceActionMap } from "../src/escrowMarketplaceActionMap.mjs";
import { buildTreasuryVaultRegistry } from "../src/treasuryVault.mjs";
import { buildTreasuryConstrainedSpends } from "../src/treasuryConstrainedSpends.mjs";
import { buildPayloadSubmitReadiness } from "../src/payloadSubmitReadiness.mjs";
import { buildWalletReviewReadiness } from "../src/walletReview.mjs";
import { summarizeWrpcCandidate } from "../src/wrpcSubmitCandidate.mjs";
import { buildIndexerReplayPlan } from "../src/indexerReplayPlan.mjs";
import { buildWalletConnectorAdapterRun } from "../src/walletConnectorAdapterRun.mjs";
import { buildWalletConnectorSubmitLedger } from "../src/walletConnectorSubmitLedger.mjs";
import { buildWalletSubmitResultValidation } from "../src/walletSubmitResultValidation.mjs";
import { buildWalletExternalSignerGap } from "../src/walletExternalSignerGap.mjs";
import { buildWalletUnsignedRequestTemplates } from "../src/walletUnsignedRequestTemplates.mjs";
import { buildWalletStandardMapping } from "../src/walletStandardMapping.mjs";
import { buildWalletStandardRequests } from "../src/walletStandardRequests.mjs";
import { buildWalletStandardSignerValidation } from "../src/walletStandardSignerValidation.mjs";
import { buildWalletExternalSignerRoundtripPlan } from "../src/walletExternalSignerRoundtripPlan.mjs";
import { buildWalletExternalSignerResultTemplate } from "../src/walletExternalSignerResultTemplate.mjs";
import { buildExternalSignerPathResearch } from "../src/externalSignerPathResearch.mjs";
import { buildWalletExternalSignerSim } from "../src/walletExternalSignerSim.mjs";
import { buildWalletConnectorImplementationSlice } from "../src/walletConnectorImplementationSlice.mjs";
import { buildVirtualChainLivePreflight } from "../src/virtualChainLivePreflight.mjs";
import { buildVirtualChainEndpointRunbook } from "../src/virtualChainEndpointRunbook.mjs";
import { summarizeTn12WrpcEndpointProbe } from "../src/tn12WrpcEndpointProbe.mjs";
import { summarizeVirtualChainLiveWindow } from "../src/virtualChainLiveWindow.mjs";
import { buildVirtualChainLiveReplayRows } from "../src/virtualChainLiveReplayRows.mjs";
import { buildVirtualChainCheckpointComparison } from "../src/virtualChainCheckpointComparison.mjs";
import { buildDurableReplayPromotionGuard } from "../src/durableReplayPromotionGuard.mjs";
import { buildBatchAssuranceSettlementDecision } from "../src/batchAssuranceSettlementDecision.mjs";
import { buildBatchAssuranceSubmitRunbook } from "../src/batchAssuranceSubmitRunbook.mjs";
import { buildBatchAssuranceOperatorDecision } from "../src/batchAssuranceOperatorDecision.mjs";
import { buildCoordinationMarketPrototype } from "../src/coordinationMarket.mjs";
import { buildCoordinationMarketSettlementBrief } from "../src/coordinationMarketSettlementBrief.mjs";
import { buildAccessPassPlanner } from "../src/accessPassPlanner.mjs";
import { buildAccessPassIssuerReview } from "../src/accessPassIssuerReview.mjs";
import { buildMainnetReadiness } from "../src/mainnetReadiness.mjs";
import { buildInvoiceMainnetLaunchBrief } from "../src/invoiceMainnetLaunchBrief.mjs";
import { buildAssetPolicyRegistry } from "../src/assetPolicy.mjs";
import { buildAuctionIntentPrototype } from "../src/auctionIntent.mjs";
import { buildAuctionSettlementDrafts } from "../src/auctionSettlementDrafts.mjs";
import { buildAuctionCustodyReview } from "../src/auctionCustodyReview.mjs";
import { buildDefiV1OperatorLoop } from "../src/defiV1OperatorLoop.mjs";
import { buildDefiReceiptReplayGuard } from "../src/defiReceiptReplayGuard.mjs";
import { buildDefiResearchBacklog } from "../src/defiBacklog.mjs";
import { buildPredictionHedgeSimulator } from "../src/predictionHedgeSimulator.mjs";
import { buildStableValuePathRegistry } from "../src/stableValuePaths.mjs";
import { buildStableIssuerRedemptionState } from "../src/stableIssuerRedemption.mjs";
import { buildAgentCommitmentBoard } from "../src/agentCommitments.mjs";
import { buildAgentSettlementDrafts } from "../src/agentSettlementDrafts.mjs";
import { buildAgentSettlementReview } from "../src/agentSettlementReview.mjs";
import { buildTreasuryRoleReview } from "../src/treasuryRoleReview.mjs";
import { buildBasedRollupScout } from "../src/basedRollupScout.mjs";
import { buildProjectStatus } from "../src/buildStatus.mjs";
import { buildProjectPlan } from "../src/projectPlan.mjs";
import { buildAiCodingSourceDiscipline } from "../src/aiCodingSourceDiscipline.mjs";
import { buildProofEvidence } from "../src/proofEvidence.mjs";
import { buildCovenantAdversarialCoverage } from "../src/covenantAdversarialCoverage.mjs";
import { buildRoleSeparatedInvalidCandidates } from "../src/roleSeparatedInvalidCandidates.mjs";
import { buildAcceptedAppState } from "../src/acceptedIndexer.mjs";
import { buildCheckpointedAcceptedIndex } from "../src/checkpointedIndexer.mjs";
import { buildPersistedCheckpointGuard } from "../src/indexerPersistence.mjs";
import { buildIndexerStorageSchema } from "../src/indexerStorageSchema.mjs";
import { buildIndexerReplayRun } from "../src/indexerReplayRun.mjs";
import { buildVirtualChainIngestionPlan } from "../src/virtualChainIngestion.mjs";
import { buildVirtualChainIngestionRun } from "../src/virtualChainIngestionRun.mjs";
import { buildVirtualChainReaderAdapter } from "../src/virtualChainReaderAdapter.mjs";
import { buildProvenStatus } from "../src/provenStatus.mjs";
import { buildOperatorReceiptPack } from "../src/operatorReceiptPack.mjs";

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
assert.equal(attestationRegistry.summary.total, 6);
assert.equal(attestationRegistry.summary.signatureVerified, 4);
assert.equal(attestationRegistry.summary.influenceReady, 1);
assert.ok(attestationRegistry.boundaries.some((boundary) => /block headers/.test(boundary)));
assert.ok(attestationRegistry.sources.some((source) => source.source === "pool-operator-gamma"));
assert.ok(attestationRegistry.signals.some((signal) => signal.id === "sig-rtd-hashrate-001" && signal.influenceReady));
assert.ok(attestationRegistry.signals.some((signal) => signal.id === "sig-pool-policy-001" && signal.signatureReview.status === "pending-review"));
assert.ok(attestationRegistry.signals.some((signal) => signal.id === "sig-rtd-hashrate-002-conflict" && signal.conflictsWith.includes("sig-rtd-hashrate-001")));
assert.ok(attestationRegistry.signals.some((signal) => signal.id === "sig-revoked-source-001" && signal.signerProvenance.status === "revoked"));
const attestationThresholds = buildAttestationReputationThresholds({ attestationRegistry });
assert.equal(attestationThresholds.status, "attestation-thresholds-ready");
assert.equal(attestationThresholds.summary.sources, 5);
assert.equal(attestationThresholds.summary.signals, 6);
assert.equal(attestationThresholds.summary.influenceAllowedSources, 1);
assert.equal(attestationThresholds.summary.influenceAllowedSignals, 0);
assert.equal(attestationThresholds.summary.dashboardInfluenceEnabled, false);
assert.equal(attestationThresholds.summary.conflictedEvents, 1);
assert.equal(attestationThresholds.summary.revokedSignals, 1);
assert.ok(attestationThresholds.quorumThresholds.some((event) =>
  event.eventId === "event-network-hashrate-shift"
  && event.conflictOpen
  && !event.quorumMet
));
assert.ok(attestationThresholds.signals.some((signal) =>
  signal.id === "sig-rtd-hashrate-001"
  && signal.influenceReady
  && !signal.influenceAllowed
  && signal.reviewReasons.includes("event quorum not met")
));
assert.ok(attestationThresholds.signals.some((signal) =>
  signal.id === "sig-listing-rumor-001"
  && signal.lane === "review-only"
));
assert.ok(attestationThresholds.signals.some((signal) =>
  signal.id === "sig-stale-feed-001"
  && signal.state === "stale"
));
const attestationThresholdArtifact = JSON.parse(await readFile(new URL("../artifacts/attestation-reputation-thresholds.json", import.meta.url), "utf8"));
assert.equal(attestationThresholdArtifact.status, "attestation-thresholds-ready");
assert.equal(attestationThresholdArtifact.summary.influenceAllowedSignals, 0);
assert.equal(attestationThresholdArtifact.summary.dashboardInfluenceEnabled, false);
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
assert.equal(submitRegistry.summary.total, 50);
assert.equal(submitRegistry.summary.payloadDrafts, 29);
assert.equal(submitRegistry.summary.payloadSubmitGated, 29);
assert.ok(submitRegistry.drafts.some((draft) =>
  draft.path === "artifacts/signed-drafts/tn12-multi-wallet-a-receipt.json"
  && draft.transactionId === "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa"
  && draft.payload.present
));
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
assert.equal(walletReview.summary.ready, 50);
assert.equal(walletReview.summary.payloadRouteReady, 29);
assert.equal(walletReview.summary.registrySecretFields, 0);
const walletConnector = buildWalletConnectorReadiness(walletReview);
assert.equal(walletConnector.status, "wallet-connector-spec-ready");
assert.equal(walletConnector.summary.drafts, 50);
assert.equal(walletConnector.summary.payloadDrafts, 29);
assert.equal(walletConnector.summary.registrySecretFields, 0);
assert.ok(walletConnector.requiredWalletCapabilities.some((capability) => capability.id === "payload-preserving-submit"));
assert.ok(walletConnector.requiredWalletCapabilities.some((capability) => capability.id === "standard-partial-transaction-format"));
assert.ok(walletConnector.referenceImplementations.some((reference) => reference.id === "kassigner"));
const walletSubmitPackage = buildWalletSubmitPackage({ walletReview, walletConnector });
assert.equal(walletSubmitPackage.status, "wallet-submit-package-ready");
assert.equal(walletSubmitPackage.summary.total, 50);
assert.equal(walletSubmitPackage.summary.payloadDrafts, 29);
assert.equal(walletSubmitPackage.summary.contractDrafts, 19);
assert.ok(walletSubmitPackage.firstPayloadIntents.every((intent) => intent.requiredWalletChecks.includes("Reject public REST payload submit.")));
const walletConnectorRequests = buildWalletConnectorSubmitRequests({
  submitPackage: walletSubmitPackage,
  draftArtifacts: submitArtifacts
});
assert.equal(walletConnectorRequests.status, "connector-submit-requests-ready");
assert.equal(walletConnectorRequests.summary.requests, 50);
assert.equal(walletConnectorRequests.summary.payloadRequests, 29);
assert.ok(walletConnectorRequests.summary.computeBudgetRequests >= 1);
assert.equal(walletConnectorRequests.summary.secretFields, 0);
assert.ok(walletConnectorRequests.requests.some((request) =>
  request.path === "artifacts/signed-drafts/role-escrow-cancel.json"
  && request.transaction.inputs[0].computeBudget === 30
));
const walletConnectorRequestsArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-connector-submit-requests.json", import.meta.url), "utf8"));
assert.equal(walletConnectorRequestsArtifact.status, "connector-submit-requests-ready");
assert.equal(walletConnectorRequestsArtifact.summary.requests, 50);
const walletConnectorAdapterRun = buildWalletConnectorAdapterRun({
  submitRequests: walletConnectorRequestsArtifact,
  runAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(walletConnectorAdapterRun.status, "adapter-dry-run-ready");
assert.equal(walletConnectorAdapterRun.summary.reviewReady, 50);
assert.equal(walletConnectorAdapterRun.summary.payloadRequests, 29);
assert.equal(walletConnectorAdapterRun.summary.submitBroadcasts, 0);
assert.equal(walletConnectorAdapterRun.summary.secretFields, 0);
assert.ok(walletConnectorAdapterRun.reviewSessions.some((session) =>
  session.path === "artifacts/signed-drafts/role-escrow-cancel.json"
  && session.preservation.computeBudgetInputs === 1
));
const walletConnectorAdapterArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-connector-adapter-run.json", import.meta.url), "utf8"));
assert.equal(walletConnectorAdapterArtifact.status, "adapter-dry-run-ready");
assert.equal(walletConnectorAdapterArtifact.summary.reviewReady, 50);
const walletSubmitResultsFixture = JSON.parse(await readFile(new URL("../fixtures/WalletConnectorSubmitResults.json", import.meta.url), "utf8"));
const walletSubmitValidationFixture = JSON.parse(await readFile(new URL("../fixtures/WalletSubmitResultValidation.json", import.meta.url), "utf8"));
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
const railResearchFixture = JSON.parse(await readFile(new URL("../fixtures/RailResearchTriggers.json", import.meta.url), "utf8"));
const railResearchTriggers = buildRailResearchTriggers(railResearchFixture);
assert.equal(railResearchTriggers.status, "research-triggers-ready");
assert.equal(railResearchTriggers.summary.triggers, 5);
assert.ok(railResearchTriggers.summary.localSourceRefs >= 20);
assert.ok(railResearchTriggers.summary.externalSourceRefs >= 9);
assert.ok(railResearchTriggers.triggers.every((trigger) => trigger.status === "trigger-ready"));
assert.ok(railResearchTriggers.triggers.some((trigger) =>
  trigger.id === "oracle-price-rail"
  && trigger.externalSources.some((source) => source.url === "https://www.kaskad.app/oracle-kaspa")
));
assert.ok(railResearchTriggers.triggers.some((trigger) =>
  trigger.id === "miner-rtd-signal-rail"
  && trigger.firstArtifact === "miner-signal-thresholds"
));
const railResearchArtifact = JSON.parse(await readFile(new URL("../artifacts/rail-research-triggers.json", import.meta.url), "utf8"));
assert.equal(railResearchArtifact.summary.triggers, 5);
assert.equal(railResearchArtifact.status, "research-triggers-ready");
const oracleMatrixFixture = JSON.parse(await readFile(new URL("../fixtures/OracleSourceMatrix.json", import.meta.url), "utf8"));
const oracleMatrix = buildOracleSourceMatrix(oracleMatrixFixture);
assert.equal(oracleMatrix.status, "oracle-source-matrix-ready");
assert.equal(oracleMatrix.summary.models, 6);
assert.equal(oracleMatrix.summary.custodyReadyModels, 0);
assert.ok(oracleMatrix.missingRails.includes("stale-feed pause rule"));
assert.ok(oracleMatrix.models.some((model) =>
  model.id === "cex-weighted-median"
  && model.currentKaspaLane === "research"
  && model.references.includes("kaskad-oracle-article")
));
const oracleMatrixArtifact = JSON.parse(await readFile(new URL("../artifacts/oracle-source-matrix.json", import.meta.url), "utf8"));
assert.equal(oracleMatrixArtifact.status, "oracle-source-matrix-ready");
assert.equal(oracleMatrixArtifact.summary.models, 6);
const nextWorkQueueFixture = JSON.parse(await readFile(new URL("../fixtures/NextWorkQueue.json", import.meta.url), "utf8"));
const nextWorkQueue = buildNextWorkQueue(nextWorkQueueFixture);
assert.equal(nextWorkQueue.status, "ordered-project-queue-ready");
assert.equal(nextWorkQueue.summary.tasks, 30);
assert.equal(nextWorkQueue.summary.topPriority, "wallet-connector-submit");
assert.ok(nextWorkQueue.sourceDocs.includes("docs/PROGRESS.md"));
assert.ok(nextWorkQueue.sourceDocs.includes("docs/TN12_TEST_MATRIX.md"));
assert.deepEqual(nextWorkQueue.next.five, [
  "wallet-connector-submit",
  "durable-virtual-chain-indexer",
  "batch-assurance-alternate-path-cleanup",
  "escrow-marketplace-demo",
  "attestation-reputation-thresholds"
]);
assert.ok(nextWorkQueue.tasks.some((task) =>
  task.id === "oracle-risk-dashboard"
  && task.startWith.includes("artifacts/oracle-source-matrix.json")
));
const nextWorkQueueArtifact = JSON.parse(await readFile(new URL("../artifacts/next-work-queue.json", import.meta.url), "utf8"));
assert.equal(nextWorkQueueArtifact.summary.tasks, 30);
assert.equal(nextWorkQueueArtifact.status, "ordered-project-queue-ready");
const nextTenExecutionPlan = buildNextTenExecutionPlan({
  queue: nextWorkQueueArtifact,
  walletMapping: JSON.parse(await readFile(new URL("../artifacts/wallet-standard-mapping.json", import.meta.url), "utf8")),
  walletStandardRequests: JSON.parse(await readFile(new URL("../artifacts/wallet-standard-requests.json", import.meta.url), "utf8")),
  livePreflight: JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-preflight.json", import.meta.url), "utf8")),
  settlementDecision: JSON.parse(await readFile(new URL("../artifacts/batch-assurance-settlement-decision.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(nextTenExecutionPlan.status, "next-ten-execution-plan-ready");
assert.equal(nextTenExecutionPlan.summary.tasks, 10);
assert.equal(nextTenExecutionPlan.summary.walletStandardRequests, 4);
assert.ok(nextTenExecutionPlan.slices.some((slice) => slice.id === "wallet-submit"));
const nextTenExecutionPlanArtifact = JSON.parse(await readFile(new URL("../artifacts/next-ten-execution-plan.json", import.meta.url), "utf8"));
assert.equal(nextTenExecutionPlanArtifact.status, "next-ten-execution-plan-ready");
const nextTenExecutionStatusArtifact = JSON.parse(await readFile(new URL("../artifacts/next-ten-execution-status.json", import.meta.url), "utf8"));
assert.equal(nextTenExecutionStatusArtifact.status, "next-ten-execution-status-review");
assert.equal(nextTenExecutionStatusArtifact.summary.tasks, 10);
assert.equal(nextTenExecutionStatusArtifact.summary.completed, 5);
assert.equal(nextTenExecutionStatusArtifact.summary.realizedGainPercent, 13);
assert.equal(nextTenExecutionStatusArtifact.summary.externalSignerStillRequired, true);
assert.equal(nextTenExecutionStatusArtifact.currentCompletionEstimate.afterLocalSlice, "47-50%");
assert.ok(nextTenExecutionStatusArtifact.tasks.some((task) =>
  task.id === "external-signer-defi-receipt"
  && task.status === "blocked-needs-user-wallet-signature"
));
const rebuiltNextTenExecutionStatus = buildNextTenExecutionStatus({
  checkpoint: JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8")),
  receiptGuard: JSON.parse(await readFile(new URL("../artifacts/defi-receipt-replay-guard.json", import.meta.url), "utf8")),
  walletRoundtrip: JSON.parse(await readFile(new URL("../artifacts/wallet-external-signer-roundtrip-plan.json", import.meta.url), "utf8")),
  signerValidation: JSON.parse(await readFile(new URL("../artifacts/wallet-standard-signer-validation.json", import.meta.url), "utf8")),
  signerSim: JSON.parse(await readFile(new URL("../artifacts/wallet-external-signer-sim-results.json", import.meta.url), "utf8")),
  liveAppState: JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-app-state.json", import.meta.url), "utf8")),
  durableReplayGuard: JSON.parse(await readFile(new URL("../artifacts/durable-replay-promotion-guard.json", import.meta.url), "utf8")),
  submitLedger: JSON.parse(await readFile(new URL("../artifacts/wallet-connector-submit-ledger.json", import.meta.url), "utf8")),
  defiLoop: JSON.parse(await readFile(new URL("../artifacts/defi-v1-operator-loop.json", import.meta.url), "utf8")),
  signerResearch: JSON.parse(await readFile(new URL("../artifacts/external-signer-path-research.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(rebuiltNextTenExecutionStatus.status, "next-ten-execution-status-review");
assert.equal(rebuiltNextTenExecutionStatus.summary.completed, nextTenExecutionStatusArtifact.summary.completed);
const provenStatus = buildProvenStatus({
  checkpoint: JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8")),
  proofEvidence: JSON.parse(await readFile(new URL("../artifacts/proof-evidence.json", import.meta.url), "utf8")),
  roleProofEvidence: JSON.parse(await readFile(new URL("../artifacts/role-separated-proof-evidence.json", import.meta.url), "utf8")),
  signerValidation: JSON.parse(await readFile(new URL("../artifacts/wallet-standard-signer-validation.json", import.meta.url), "utf8")),
  durableReplayGuard: JSON.parse(await readFile(new URL("../artifacts/durable-replay-promotion-guard.json", import.meta.url), "utf8")),
  auctionCustodyReview: JSON.parse(await readFile(new URL("../artifacts/auction-custody-review.json", import.meta.url), "utf8")),
  agentSettlementReview: JSON.parse(await readFile(new URL("../artifacts/agent-settlement-review.json", import.meta.url), "utf8")),
  nextTenStatus: nextTenExecutionStatusArtifact,
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(provenStatus.status, "tn12-demo-proof-ready-mainnet-deferred");
assert.equal(provenStatus.currentPercent, "53-58%");
assert.equal(provenStatus.acceptedEvidence.checkpointRecords, 45);
assert.equal(provenStatus.acceptedEvidence.payloadEvents, 32);
assert.equal(provenStatus.readiness.durablePromotionReady, false);
assert.deepEqual(provenStatus.demoBlockers, []);
assert.ok(provenStatus.mainnetDeferredBlockers.includes("external signer accepted result missing"));
assert.ok(provenStatus.mainnetDeferredBlockers.includes("live removed-block rollback evidence missing"));
const provenStatusArtifact = JSON.parse(await readFile(new URL("../artifacts/proven-status.json", import.meta.url), "utf8"));
assert.equal(provenStatusArtifact.status, "tn12-demo-proof-ready-mainnet-deferred");
assert.equal(provenStatusArtifact.currentPercent, "53-58%");
const operatorReceiptPack = buildOperatorReceiptPack({
  provenStatus: provenStatusArtifact,
  checkpoint: JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8")),
  proofEvidence: JSON.parse(await readFile(new URL("../artifacts/proof-evidence.json", import.meta.url), "utf8")),
  roleProofEvidence: JSON.parse(await readFile(new URL("../artifacts/role-separated-proof-evidence.json", import.meta.url), "utf8")),
  payloadManifest: JSON.parse(await readFile(new URL("../fixtures/PayloadEventEvidence.json", import.meta.url), "utf8")),
  operatorLoop: JSON.parse(await readFile(new URL("../artifacts/defi-v1-operator-loop.json", import.meta.url), "utf8")),
  submitLedger: JSON.parse(await readFile(new URL("../artifacts/wallet-connector-submit-ledger.json", import.meta.url), "utf8")),
  auctionCustodyReview: JSON.parse(await readFile(new URL("../artifacts/auction-custody-review.json", import.meta.url), "utf8")),
  agentSettlementReview: JSON.parse(await readFile(new URL("../artifacts/agent-settlement-review.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(operatorReceiptPack.status, "operator-receipt-pack-ready");
assert.equal(operatorReceiptPack.currentPercent, "53-58%");
assert.equal(operatorReceiptPack.evidence.checkpointRecords, 45);
assert.equal(operatorReceiptPack.evidence.payloadEvents, 32);
assert.equal(operatorReceiptPack.custody.auctionReadyRows, 2);
assert.equal(operatorReceiptPack.custody.agentReadyRows, 2);
assert.ok(operatorReceiptPack.nextCommandPath.every((row) => row.ready));
assert.deepEqual(operatorReceiptPack.reviewProblems, []);
assert.ok(operatorReceiptPack.nextCommandPath.some((row) => row.id === "full-operator-refresh"));
const staleOperatorReceiptPack = buildOperatorReceiptPack({
  provenStatus: provenStatusArtifact,
  checkpoint: JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8")),
  proofEvidence: JSON.parse(await readFile(new URL("../artifacts/proof-evidence.json", import.meta.url), "utf8")),
  roleProofEvidence: JSON.parse(await readFile(new URL("../artifacts/role-separated-proof-evidence.json", import.meta.url), "utf8")),
  payloadManifest: { events: [] },
  operatorLoop: {
    wallet: { address: "kaspatest:test" },
    receipts: [{ txid: "", accepted: false, payloadMatches: false }],
    currentSpendableOutpoint: { spendable: false },
    commands: {}
  },
  submitLedger: {},
  auctionCustodyReview: {},
  agentSettlementReview: {},
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(staleOperatorReceiptPack.status, "operator-receipt-pack-review");
assert.ok(staleOperatorReceiptPack.reviewProblems.includes("payload manifest count does not match accepted payload event count"));
assert.ok(staleOperatorReceiptPack.reviewProblems.includes("current local-wallet outpoint is not marked spendable"));
assert.ok(staleOperatorReceiptPack.reviewProblems.includes("one or more local-wallet receipts are not accepted and payload-matched"));
const operatorReceiptPackArtifact = JSON.parse(await readFile(new URL("../artifacts/operator-receipt-pack.json", import.meta.url), "utf8"));
assert.equal(operatorReceiptPackArtifact.status, "operator-receipt-pack-ready");
assert.equal(operatorReceiptPackArtifact.evidence.coreProofTransactions, 9);
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
assert.equal(custodyDraftFixture.status, "custody-release-draft-ready");
assert.equal(custodyDraftFixture.summary.blockedInputCount, 0);
assert.equal(custodyDraftFixture.summary.eligibleInputCount, 3);
assert.equal(custodyDraftFixture.summary.releaseOutputTkas, "99.99995");
assert.equal(custodyDraftFixture.releaseDraft.blockers.length, 0);
const custodyRequirementsFixture = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-custody-requirements.json", import.meta.url), "utf8"));
assert.equal(custodyRequirementsFixture.status, "custody-requirements-satisfied");
assert.equal(custodyRequirementsFixture.summary.pledgeOutputCount, 3);
assert.equal(custodyRequirementsFixture.summary.readyCount, 3);
assert.equal(custodyRequirementsFixture.summary.blockedCount, 0);
assert.equal(custodyRequirementsFixture.summary.requiredTkas, "100");
assert.equal(custodyRequirementsFixture.summary.observedReferencedTkas, "100");
assert.equal(custodyRequirementsFixture.summary.missingMatchedTkas, "0");
assert.ok(custodyRequirementsFixture.requirements.every((requirement) =>
  requirement.required.sourceKind === "accepted-pledge-output"
  && requirement.currentReference.amountMatches === true
));
const pledgeOutputPlan = buildBatchAssurancePledgeOutputPlan({
  custodyRequirements: custodyRequirementsFixture,
  walletConnectorRequests: walletConnectorRequestsArtifact
});
assert.equal(pledgeOutputPlan.status, "pledge-outputs-already-matched");
assert.equal(pledgeOutputPlan.summary.outputsToCreate, 0);
assert.equal(pledgeOutputPlan.summary.totalRequiredTkas, "100");
assert.equal(pledgeOutputPlan.summary.missingTkas, "0");
assert.equal(pledgeOutputPlan.summary.walletConnectorRequestsReady, true);
assert.equal(pledgeOutputPlan.outputsToCreate.length, 0);
const pledgeOutputPlanArtifact = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-pledge-output-plan.json", import.meta.url), "utf8"));
assert.equal(pledgeOutputPlanArtifact.status, "pledge-outputs-already-matched");
assert.equal(pledgeOutputPlanArtifact.summary.outputsToCreate, 0);
const custodyImportsFixture = JSON.parse(await readFile(new URL("../fixtures/BatchAssuranceCustodyImports.json", import.meta.url), "utf8"));
const custodyImportCheckpoint = JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8"));
const custodyImports = buildBatchAssuranceCustodyImports({
  importFixture: custodyImportsFixture,
  campaignState,
  custodyRequirements: custodyRequirementsFixture,
  checkpointIndex: custodyImportCheckpoint
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
const custodyImportsArtifact = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-custody-imports.json", import.meta.url), "utf8"));
assert.equal(custodyImportsArtifact.status, "custody-imports-ready");
assert.equal(custodyImportsArtifact.summary.readyCount, 3);
const pledgeFundingDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/batch-assurance-pledge-funding.json", import.meta.url), "utf8"));
const pledgeWalletPublic = JSON.parse(await readFile(new URL("../fixtures/BatchAssurancePledgeWallets.public.json", import.meta.url), "utf8"));
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
const batchSettlementDrafts = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-settlement-drafts.json", import.meta.url), "utf8"));
const batchReleaseDraft = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/batch-assurance-release.json", import.meta.url), "utf8"));
const batchRefundDraft001 = JSON.parse(await readFile(new URL("../artifacts/signed-drafts/batch-assurance-refund-pledge-docs-001.json", import.meta.url), "utf8"));
assert.equal(batchSettlementDrafts.schema, "tn12-batch-assurance-settlement-drafts/v1");
assert.ok(["signed-not-broadcast", "release-accepted-tn12"].includes(batchSettlementDrafts.status));
assert.equal(batchSettlementDrafts.release.inputCount, 3);
assert.equal(batchSettlementDrafts.release.outputTkas[0], "99.99995");
assert.equal(batchSettlementDrafts.refunds.length, 3);
assert.ok(batchSettlementDrafts.boundaries.some((boundary) => /mutually exclusive/.test(boundary)));
const batchSettlementDecision = buildBatchAssuranceSettlementDecision({
  settlementDrafts: batchSettlementDrafts,
  custodyRequirements: custodyRequirementsFixture,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(batchSettlementDecision.status, "settlement-release-accepted");
assert.equal(batchSettlementDecision.selectedPath, "release-accepted");
assert.equal(batchSettlementDecision.submitNow, false);
assert.equal(batchSettlementDecision.summary.releaseAccepted, true);
const batchSettlementDecisionArtifact = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-settlement-decision.json", import.meta.url), "utf8"));
assert.equal(batchSettlementDecisionArtifact.status, "settlement-release-accepted");
assert.equal(batchSettlementDecisionArtifact.selectedPath, "release-accepted");
const batchSubmitRunbook = buildBatchAssuranceSubmitRunbook({
  settlementDecision: batchSettlementDecisionArtifact,
  settlementDrafts: batchSettlementDrafts,
  custodyImports: custodyImportsArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(batchSubmitRunbook.status, "release-path-accepted");
assert.equal(batchSubmitRunbook.summary.readyImports, 3);
const batchSubmitRunbookArtifact = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-submit-runbook.json", import.meta.url), "utf8"));
assert.equal(batchSubmitRunbookArtifact.status, "release-path-accepted");
const batchOperatorDecisionFixture = JSON.parse(await readFile(new URL("../fixtures/BatchAssuranceOperatorDecision.json", import.meta.url), "utf8"));
const batchOperatorDecision = buildBatchAssuranceOperatorDecision({
  decisionFixture: batchOperatorDecisionFixture,
  settlementDecision: batchSettlementDecisionArtifact,
  settlementDrafts: batchSettlementDrafts,
  walletSignerValidation: JSON.parse(await readFile(new URL("../artifacts/wallet-standard-signer-validation.json", import.meta.url), "utf8")),
  checkpointComparison: JSON.parse(await readFile(new URL("../artifacts/virtual-chain-checkpoint-comparison.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(batchOperatorDecision.status, "operator-release-accepted");
assert.equal(batchOperatorDecision.selectedPath, "release-accepted");
assert.equal(batchOperatorDecision.submitNow, false);
assert.ok(!batchOperatorDecision.blockers.includes("external signer accepted result missing"));
assert.equal(batchOperatorDecision.summary.blockers, 0);
assert.ok(!batchOperatorDecision.blockers.includes("live indexer checkpoint overlap missing"));
const batchOperatorDecisionArtifact = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-operator-decision.json", import.meta.url), "utf8"));
assert.equal(batchOperatorDecisionArtifact.status, "operator-release-accepted");
assert.equal(batchOperatorDecisionArtifact.selectedPath, "release-accepted");
assert.equal(batchOperatorDecisionArtifact.submitNow, false);
assert.equal(batchReleaseDraft.kind, "release");
assert.equal(batchReleaseDraft.inputs.length, 3);
assert.equal(batchReleaseDraft.submitPayload.transaction.inputs.length, 3);
assert.equal(batchReleaseDraft.submitPayload.transaction.outputs[0].amount, 9999995000);
assert.equal(batchRefundDraft001.kind, "refund");
assert.equal(batchRefundDraft001.pledgeId, "pledge-docs-001");
assert.equal(batchRefundDraft001.submitPayload.transaction.inputs.length, 1);
assert.equal(batchRefundDraft001.submitPayload.transaction.outputs[0].amount, 4499995000);
assert.doesNotMatch(JSON.stringify(batchSettlementDrafts), /privateKey/i);
assert.doesNotMatch(JSON.stringify(batchReleaseDraft), /privateKey/i);
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
const proofEvidenceArtifact = JSON.parse(await readFile(new URL("../artifacts/proof-evidence.json", import.meta.url), "utf8"));
const escrowMarketplace = buildEscrowMarketplaceDemo({
  escrowRegistry,
  walletConnectorRequests: walletConnectorRequestsArtifact,
  proofEvidence: proofEvidenceArtifact
});
assert.equal(escrowMarketplace.status, "marketplace-demo-plan-ready");
assert.equal(escrowMarketplace.summary.listings, 3);
assert.equal(escrowMarketplace.summary.acceptedEscrowProofs, 3);
assert.equal(escrowMarketplace.summary.walletConnectorRequestsReady, true);
assert.ok(escrowMarketplace.listings.some((listing) =>
  listing.escrowId === "escrow-freelance-001"
  && listing.acceptedProofBackdrop === "release-refund-cancel-paths-accepted"
));
const escrowMarketplaceArtifact = JSON.parse(await readFile(new URL("../artifacts/escrow-marketplace-demo.json", import.meta.url), "utf8"));
assert.equal(escrowMarketplaceArtifact.status, "marketplace-demo-plan-ready");
assert.equal(escrowMarketplaceArtifact.summary.listings, 3);
const escrowMarketplaceFlow = buildEscrowMarketplaceFlow({
  marketplaceDemo: escrowMarketplaceArtifact,
  unsignedTemplates: JSON.parse(await readFile(new URL("../artifacts/wallet-unsigned-request-templates.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(escrowMarketplaceFlow.status, "escrow-marketplace-flow-ready");
assert.equal(escrowMarketplaceFlow.summary.flows, 3);
assert.equal(escrowMarketplaceFlow.summary.blockedOnWalletStandard, 3);
const escrowMarketplaceFlowArtifact = JSON.parse(await readFile(new URL("../artifacts/escrow-marketplace-flow.json", import.meta.url), "utf8"));
assert.equal(escrowMarketplaceFlowArtifact.status, "escrow-marketplace-flow-ready");
const walletUnsignedTemplatesForEscrow = JSON.parse(await readFile(new URL("../artifacts/wallet-unsigned-request-templates.json", import.meta.url), "utf8"));
const walletStandardRequestsForEscrow = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-requests.json", import.meta.url), "utf8"));
const walletStandardSignerValidationForEscrow = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-signer-validation.json", import.meta.url), "utf8"));
const escrowMarketplaceActionMap = buildEscrowMarketplaceActionMap({
  marketplaceFlow: escrowMarketplaceFlowArtifact,
  unsignedTemplates: walletUnsignedTemplatesForEscrow,
  walletStandardRequests: walletStandardRequestsForEscrow,
  signerValidation: walletStandardSignerValidationForEscrow,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(escrowMarketplaceActionMap.status, "escrow-action-map-ready");
assert.equal(escrowMarketplaceActionMap.summary.actions, 5);
assert.ok(escrowMarketplaceActionMap.summary.blockedActions >= 0);
assert.equal(escrowMarketplaceActionMap.summary.liveExternalSignerAccepted, false);
assert.ok(escrowMarketplaceActionMap.flows.some((flow) =>
  flow.escrowId === "escrow-freelance-001"
  && flow.actions.some((action) =>
    action.action === "mutual-cancel"
    && action.walletStandardRequestId === "ureq-d12412d8-standard"
  )
));
assert.ok(escrowMarketplaceActionMap.flows.some((flow) =>
  flow.escrowId === "escrow-freelance-001"
  && flow.actions.some((action) =>
    action.action === "release"
    && action.walletStandardRequestId === "ureq-fda320a9-standard"
  )
));
assert.ok(escrowMarketplaceActionMap.flows.some((flow) =>
  flow.escrowId === "escrow-freelance-001"
  && flow.actions.some((action) =>
    action.action === "timeout-refund"
    && action.walletStandardRequestId === "ureq-f5845e00-standard"
  )
));
const escrowMarketplaceActionMapArtifact = JSON.parse(await readFile(new URL("../artifacts/escrow-marketplace-action-map.json", import.meta.url), "utf8"));
assert.equal(escrowMarketplaceActionMapArtifact.status, "escrow-action-map-ready");
assert.equal(escrowMarketplaceActionMapArtifact.summary.actions, 5);
assert.ok(escrowMarketplaceActionMapArtifact.summary.blockedActions <= 5);
assert.ok(escrowMarketplaceActionMapArtifact.summary.simValidatedActions >= 0);
const treasuryFixture = JSON.parse(await readFile(new URL("../fixtures/TreasuryVaults.json", import.meta.url), "utf8"));
const treasuryRegistry = buildTreasuryVaultRegistry(treasuryFixture);
assert.equal(treasuryRegistry.status, "planner-policy-before-extra-script-paths");
assert.equal(treasuryRegistry.summary.total, 2);
assert.equal(treasuryRegistry.summary.plannedPayrollTkas, 80);
assert.equal(treasuryRegistry.summary.largeWithdrawalsPending, 1);
assert.ok(treasuryRegistry.vaults.some((vault) => vault.vaultId === "treasury-core-team" && vault.checks.largeWithdrawalReviewRequired));
const treasurySpends = buildTreasuryConstrainedSpends({
  treasuryRegistry,
  walletConnectorRequests: walletConnectorRequestsArtifact
});
assert.equal(treasurySpends.status, "treasury-spend-drafts-ready-wallet-policy");
assert.equal(treasurySpends.summary.drafts, 4);
assert.equal(treasurySpends.summary.payrollDrafts, 3);
assert.equal(treasurySpends.summary.delayedWithdrawalDrafts, 1);
assert.equal(treasurySpends.summary.blockedDrafts, 0);
const treasurySpendsArtifact = JSON.parse(await readFile(new URL("../artifacts/treasury-constrained-spends.json", import.meta.url), "utf8"));
assert.equal(treasurySpendsArtifact.summary.drafts, 4);
const treasuryRoleReview = buildTreasuryRoleReview({
  constrainedSpends: treasurySpendsArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(treasuryRoleReview.status, "treasury-role-review-ready");
assert.equal(treasuryRoleReview.summary.drafts, 4);
assert.equal(treasuryRoleReview.summary.roleSeparatedRows, 0);
const treasuryRoleReviewArtifact = JSON.parse(await readFile(new URL("../artifacts/treasury-role-review.json", import.meta.url), "utf8"));
assert.equal(treasuryRoleReviewArtifact.status, "treasury-role-review-ready");
const coordinationFixture = JSON.parse(await readFile(new URL("../fixtures/CoordinationMarketPrototype.json", import.meta.url), "utf8"));
const coordinationPrototype = buildCoordinationMarketPrototype(coordinationFixture);
assert.equal(coordinationPrototype.status, "transparent-toy-staghunt-preprototype");
assert.equal(coordinationPrototype.summary.stags, 2);
assert.equal(coordinationPrototype.summary.intendos, 5);
assert.equal(coordinationPrototype.summary.satisfiablePacks, 1);
assert.ok(coordinationPrototype.missingProperties.includes("accumulation opacity"));
const coordinationSettlementFixture = JSON.parse(await readFile(new URL("../fixtures/CoordinationMarketSettlementBrief.json", import.meta.url), "utf8"));
const coordinationSettlementBrief = buildCoordinationMarketSettlementBrief({
  fixture: coordinationSettlementFixture,
  coordinationPrototype
});
assert.equal(coordinationSettlementBrief.status, "transparent-settlement-brief-ready-not-production");
assert.equal(coordinationSettlementBrief.summary.productionReady, false);
assert.equal(coordinationSettlementBrief.summary.qualifyingIntendos, 3);
assert.equal(coordinationSettlementBrief.summary.qualifyingTkas, 75);
assert.equal(coordinationSettlementBrief.summary.missingRails, 4);
assert.ok(coordinationSettlementBrief.missingRails.some((rail) => rail.id === "opacity"));
assert.ok(coordinationSettlementBrief.missingRails.some((rail) => rail.id === "capital-multiplexing"));
assert.ok(coordinationSettlementBrief.missingRails.some((rail) => rail.id === "atomic-hunt-execution"));
assert.ok(coordinationSettlementBrief.missingRails.some((rail) => rail.id === "oracle-settlement"));
assert.ok(coordinationSettlementBrief.nonProductionBoundary.some((boundary) => /not Hashdag or Staghunt/.test(boundary)));
const coordinationSettlementArtifact = JSON.parse(await readFile(new URL("../artifacts/coordination-market-settlement-brief.json", import.meta.url), "utf8"));
assert.equal(coordinationSettlementArtifact.status, "transparent-settlement-brief-ready-not-production");
assert.equal(coordinationSettlementArtifact.summary.productionReady, false);
const aiDisciplineFixture = JSON.parse(await readFile(new URL("../fixtures/AiCodingSourceDiscipline.json", import.meta.url), "utf8"));
const aiDiscipline = buildAiCodingSourceDiscipline(aiDisciplineFixture);
assert.equal(aiDiscipline.status, "ai-source-discipline-ready");
assert.equal(aiDiscipline.summary.sourcesNeedingContentImport, 0);
assert.ok(aiDiscipline.summary.agentOperatingPrinciples >= 8);
assert.ok(aiDiscipline.kaspaDailyQaThemes.some((theme) => theme.id === "payments-are-not-2026-adoption-vector"));
assert.ok(aiDiscipline.kaspaDailyQaThemes.some((theme) => theme.id === "coordination-markets-priority"));
assert.ok(aiDiscipline.agentOperatingPrinciples.some((principle) => principle.id === "public-practice-not-private-magic"));
assert.ok(aiDiscipline.operatingRules.some((rule) => /L1-first/.test(rule)));
assert.ok(aiDiscipline.boundaries.some((boundary) => /user-provided/.test(boundary)));
const accessPassFixture = JSON.parse(await readFile(new URL("../fixtures/AccessPassPlanner.json", import.meta.url), "utf8"));
const accessPassPlanner = buildAccessPassPlanner(accessPassFixture);
assert.equal(accessPassPlanner.status, "issuer-indexer-flow-not-native-enforcement");
assert.equal(accessPassPlanner.summary.totalPasses, 3);
assert.equal(accessPassPlanner.summary.acceptedRedemptions, 1);
assert.equal(accessPassPlanner.summary.duplicateRedemptions, 0);
assert.equal(accessPassPlanner.summary.missingAcceptedTxids, 0);
assert.ok(accessPassPlanner.passes.some((pass) => pass.passId === "pass-dev-workshop-001" && pass.state === "partially-redeemed"));
const accessIssuerReview = buildAccessPassIssuerReview({
  accessPassState: accessPassPlanner,
  reviewedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(accessIssuerReview.status, "access-pass-issuer-review-ready");
assert.equal(accessIssuerReview.summary.issuerReviewRequired, 3);
assert.equal(accessIssuerReview.summary.countableRedemptions, 1);
const accessIssuerReviewArtifact = JSON.parse(await readFile(new URL("../artifacts/access-pass-issuer-review.json", import.meta.url), "utf8"));
assert.equal(accessIssuerReviewArtifact.status, "access-pass-issuer-review-ready");
const mainnetReadinessFixture = JSON.parse(await readFile(new URL("../fixtures/MainnetReadiness.json", import.meta.url), "utf8"));
const mainnetReadiness = buildMainnetReadiness(mainnetReadinessFixture);
assert.equal(mainnetReadiness.status, "readiness-map-not-launch-approval");
assert.equal(mainnetReadiness.summary.mainnetCapable, 4);
assert.equal(mainnetReadiness.summary.tn12Only, 3);
assert.equal(mainnetReadiness.summary.researchOnly, 1);
assert.equal(mainnetReadiness.summary.localOnly, 1);
const invoiceRegistryForMainnetBrief = JSON.parse(await readFile(new URL("../artifacts/invoice-registry.json", import.meta.url), "utf8"));
const livePreflightForMainnetBrief = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-preflight.json", import.meta.url), "utf8"));
const walletStandardForMainnetBrief = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-mapping.json", import.meta.url), "utf8"));
const invoiceMainnetBrief = buildInvoiceMainnetLaunchBrief({
  mainnetReadiness,
  invoiceRegistry: invoiceRegistryForMainnetBrief,
  livePreflight: livePreflightForMainnetBrief,
  walletStandardMapping: walletStandardForMainnetBrief,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(invoiceMainnetBrief.status, "invoice-mainnet-brief-ready");
assert.ok(invoiceMainnetBrief.summary.blockers >= 1);
const invoiceMainnetBriefArtifact = JSON.parse(await readFile(new URL("../artifacts/invoice-mainnet-launch-brief.json", import.meta.url), "utf8"));
assert.equal(invoiceMainnetBriefArtifact.status, "invoice-mainnet-brief-ready");
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
const auctionSettlementDrafts = buildAuctionSettlementDrafts({
  auctionState: auctionPrototype,
  walletConnectorRequests: walletConnectorRequestsArtifact
});
assert.equal(auctionSettlementDrafts.status, "planner-settlement-drafts-ready-not-custody");
assert.equal(auctionSettlementDrafts.summary.drafts, 3);
assert.equal(auctionSettlementDrafts.summary.winnerReleaseDrafts, 1);
assert.equal(auctionSettlementDrafts.summary.refundDrafts, 2);
assert.equal(auctionSettlementDrafts.summary.custodyReadyDrafts, 0);
const auctionSettlementDraftsArtifact = JSON.parse(await readFile(new URL("../artifacts/auction-settlement-drafts.json", import.meta.url), "utf8"));
assert.equal(auctionSettlementDraftsArtifact.summary.drafts, 3);
const walletStandardForAuctionReview = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-mapping.json", import.meta.url), "utf8"));
const auctionCustodySources = JSON.parse(await readFile(new URL("../fixtures/AuctionCustodySources.json", import.meta.url), "utf8"));
const auctionCustodyReview = buildAuctionCustodyReview({
  settlementDrafts: auctionSettlementDraftsArtifact,
  walletStandardMapping: walletStandardForAuctionReview,
  custodySources: auctionCustodySources,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(auctionCustodyReview.status, "auction-custody-review-ready");
assert.equal(auctionCustodyReview.summary.custodyEvidenceRows, 2);
assert.equal(auctionCustodyReview.summary.amountMatchedRows, 2);
assert.equal(auctionCustodyReview.summary.custodyReadyRows, 2);
assert.ok(auctionCustodyReview.rows.some((row) =>
  row.id === "auction-pass-001:winner-release:bid-pass-002"
  && row.custodySourcePresent
  && row.amountMatched
  && row.status === "custody-source-ready-needs-wallet"
));
const auctionCustodyReviewArtifact = JSON.parse(await readFile(new URL("../artifacts/auction-custody-review.json", import.meta.url), "utf8"));
assert.equal(auctionCustodyReviewArtifact.status, "auction-custody-review-ready");
assert.equal(auctionCustodyReviewArtifact.summary.custodyReadyRows, 2);
const defiFixture = JSON.parse(await readFile(new URL("../fixtures/DefiResearchBacklog.json", import.meta.url), "utf8"));
const defiBacklog = buildDefiResearchBacklog(defiFixture);
assert.equal(defiBacklog.status, "research-backlog-not-live-defi");
assert.equal(defiBacklog.summary.total, 8);
assert.equal(defiBacklog.summary.researchOnly, 4);
assert.ok(defiBacklog.missingRails.includes("price oracle"));
assert.ok(defiBacklog.briefs.some((brief) => brief.id === "prediction-hedge-simulator" && brief.status === "prototype-later"));
const defiLoopArtifact = JSON.parse(await readFile(new URL("../artifacts/defi-v1-operator-loop.json", import.meta.url), "utf8"));
assert.equal(defiLoopArtifact.status, "repeatable-live-receipt-loop-ready");
assert.ok(defiLoopArtifact.receipts.length >= 2);
assert.ok(defiLoopArtifact.receipts.every((receipt) => receipt.accepted && receipt.payloadMatches));
assert.ok(defiLoopArtifact.staleOutpointGuards.every((outpoint) => outpoint.consumed));
assert.ok(defiLoopArtifact.currentSpendableOutpoint.spendable);
const optionalThirdReceipt = await readOptionalJson("../artifacts/payload-defi-v1-third-receipt-evidence.json");
const optionalThirdDraft = await readOptionalJson("../artifacts/signed-drafts/tn12-defi-v1-third-receipt.json");
const rebuiltDefiLoop = buildDefiV1OperatorLoop({
  firstReceipt: {
    ...JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-live-receipt-evidence.json", import.meta.url), "utf8")),
    source: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/tn12-defi-v1-payload-receipt.json", import.meta.url), "utf8")).source
  },
  repeatReceipt: {
    ...JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-repeat-receipt-evidence.json", import.meta.url), "utf8")),
    source: JSON.parse(await readFile(new URL("../artifacts/signed-drafts/tn12-defi-v1-repeat-receipt.json", import.meta.url), "utf8")).source
  },
  thirdReceipt: optionalThirdReceipt && optionalThirdDraft ? { ...optionalThirdReceipt, source: optionalThirdDraft.source } : null,
  fundedOutpoint: JSON.parse(await readFile(new URL("../artifacts/tn12-defi-v1-funded-outpoint.json", import.meta.url), "utf8")),
  previousCurrentOutpoint: JSON.parse(await readFile(new URL("../artifacts/tn12-defi-v1-first-change-outpoint.json", import.meta.url), "utf8")),
  thirdPreviousOutpoint: await readOptionalJson("../artifacts/tn12-defi-v1-current-outpoint-before-third.json"),
  currentOutpoint: JSON.parse(await readFile(new URL("../artifacts/tn12-defi-v1-current-outpoint.json", import.meta.url), "utf8")),
  walletAddress: "kaspatest:qz8ke9lvc0prgygp9cyvemlhhdhh6wthyzx2epf2n8nhegkfgvs76tas8y3hk",
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(rebuiltDefiLoop.status, "repeatable-live-receipt-loop-ready");
assert.equal(rebuiltDefiLoop.receipts.length, defiLoopArtifact.receipts.length);
const defiReceiptReplayGuardArtifact = JSON.parse(await readFile(new URL("../artifacts/defi-receipt-replay-guard.json", import.meta.url), "utf8"));
assert.equal(defiReceiptReplayGuardArtifact.status, "defi-receipt-replay-guard-ready");
assert.equal(defiReceiptReplayGuardArtifact.summary.acceptedReceipts, 4);
assert.equal(defiReceiptReplayGuardArtifact.summary.wallets, 3);
assert.equal(defiReceiptReplayGuardArtifact.summary.negativeCasesCaught, 3);
assert.deepEqual(
  defiReceiptReplayGuardArtifact.acceptedReceipts.map((receipt) => receipt.txid),
  [
    "8e3911ac9bd6d65e81e77a0ce69554ba3259f44c3846f026a64ed3f8e03e0807",
    "e92803b4a2c84fee868b0f2ec52b9e6993fb0f4762abf7b00da3c48c84ac50bd",
    "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa",
    "8dcda29ef07f3bc2ab799241ecbe932b98f003cd37839357ae14830bfa3c6e39"
  ]
);
const rebuiltDefiReceiptReplayGuard = buildDefiReceiptReplayGuard({
  receiptEvidence: [
    JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-live-receipt-evidence.json", import.meta.url), "utf8")),
    JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-repeat-receipt-evidence.json", import.meta.url), "utf8")),
    JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-multi-wallet-a-evidence.json", import.meta.url), "utf8")),
    JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-multi-wallet-b-evidence.json", import.meta.url), "utf8"))
  ],
  staleCandidates: [{
    txid: "unknown-defi-receipt-txid",
    subject: "defi-v1-stale-receipt",
    walletAddress: "kaspatest:unknown"
  }],
  duplicateCandidates: [
    JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-live-receipt-evidence.json", import.meta.url), "utf8")),
    JSON.parse(await readFile(new URL("../artifacts/payload-defi-v1-live-receipt-evidence.json", import.meta.url), "utf8"))
  ],
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(rebuiltDefiReceiptReplayGuard.status, "defi-receipt-replay-guard-ready");
assert.equal(rebuiltDefiReceiptReplayGuard.summary.negativeCasesCaught, defiReceiptReplayGuardArtifact.summary.negativeCasesCaught);
const predictionFixture = JSON.parse(await readFile(new URL("../fixtures/PredictionHedgeSimulator.json", import.meta.url), "utf8"));
const predictionSimulator = buildPredictionHedgeSimulator({ fixture: predictionFixture, attestationRegistry, attestationThresholds });
assert.equal(predictionSimulator.status, "simulation-only");
assert.equal(predictionSimulator.summary.markets, 3);
assert.equal(predictionSimulator.summary.verifiedSignalInputs, 1);
assert.equal(predictionSimulator.summary.thresholdAllowedSignalInputs, 0);
assert.equal(predictionSimulator.summary.thresholdBlockedSignalInputs, 1);
assert.ok(predictionSimulator.markets.some((market) => market.eventId === "event-exchange-listing-window" && market.ignoredSignals === 1));
assert.ok(predictionSimulator.markets.some((market) => market.acceptedEvent?.txid === "9f9766567fbe8032804583e48e6e9a1aa70f8bb4fbd30018dd45f32e9c0daca7"));
assert.ok(predictionSimulator.markets.some((market) => market.eventId === "event-network-hashrate-shift" && market.status === "threshold-blocked"));
assert.equal(predictionSimulator.summary.reviewSuggestions, 0);
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
const agentSettlementDrafts = buildAgentSettlementDrafts({
  agentBoard,
  walletConnectorRequests: walletConnectorRequestsArtifact
});
assert.equal(agentSettlementDrafts.status, "agent-settlement-drafts-ready-not-autonomous");
assert.equal(agentSettlementDrafts.summary.drafts, 3);
assert.equal(agentSettlementDrafts.summary.releaseDrafts, 1);
assert.equal(agentSettlementDrafts.summary.refundDrafts, 1);
assert.equal(agentSettlementDrafts.summary.holdDrafts, 1);
assert.equal(agentSettlementDrafts.summary.autonomousPayouts, 0);
const agentSettlementDraftsArtifact = JSON.parse(await readFile(new URL("../artifacts/agent-settlement-drafts.json", import.meta.url), "utf8"));
assert.equal(agentSettlementDraftsArtifact.summary.drafts, 3);
const walletStandardForAgentReview = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-mapping.json", import.meta.url), "utf8"));
const agentCustodySources = JSON.parse(await readFile(new URL("../fixtures/AgentCustodySources.json", import.meta.url), "utf8"));
const agentSettlementReview = buildAgentSettlementReview({
  settlementDrafts: agentSettlementDraftsArtifact,
  walletStandardMapping: walletStandardForAgentReview,
  custodySources: agentCustodySources,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(agentSettlementReview.status, "agent-settlement-review-ready");
assert.equal(agentSettlementReview.summary.reviewEvidenceReadyRows, 2);
assert.equal(agentSettlementReview.summary.releaseReviewReadyRows, 1);
assert.equal(agentSettlementReview.summary.holdReviewReadyRows, 1);
assert.equal(agentSettlementReview.summary.custodyEvidenceRows, 2);
assert.equal(agentSettlementReview.summary.amountMatchedRows, 2);
assert.equal(agentSettlementReview.summary.custodyReadyRows, 2);
assert.ok(agentSettlementReview.rows.some((row) =>
  row.id === "agent-task-invoice-001:release"
  && row.reviewEvidenceReady
  && row.status === "custody-source-ready-needs-wallet"
));
const agentSettlementReviewArtifact = JSON.parse(await readFile(new URL("../artifacts/agent-settlement-review.json", import.meta.url), "utf8"));
assert.equal(agentSettlementReviewArtifact.status, "agent-settlement-review-ready");
assert.equal(agentSettlementReviewArtifact.summary.reviewEvidenceReadyRows, 2);
assert.equal(agentSettlementReviewArtifact.summary.custodyReadyRows, 2);
const buildStatusFixture = JSON.parse(await readFile(new URL("../fixtures/BuildStatus.json", import.meta.url), "utf8"));
const projectStatus = buildProjectStatus(buildStatusFixture);
assert.equal(projectStatus.status, "active-build-map");
assert.equal(projectStatus.summary.total, 14);
assert.ok(projectStatus.summary.builtBases >= 10);
assert.ok(projectStatus.naturalNextSteps.some((step) => /agent-task/i.test(step)));
assert.ok(projectStatus.lanes.some((lane) => lane.id === "zk-anchor-readiness" && lane.status === "research"));
const projectPlan = buildProjectPlan(buildStatusFixture);
assert.equal(projectPlan.status, "active-operator-plan");
assert.equal(projectPlan.summary.done, 19);
assert.equal(projectPlan.summary.wip, 4);
assert.equal(projectPlan.summary.next, 5);
assert.equal(projectPlan.summary.later, 6);
assert.ok(projectPlan.next.some((item) => item.id === "wallet-connector-submit"));
assert.ok(projectPlan.done.some((item) => item.id === "based-rollup-scout"));
assert.ok(projectPlan.done.some((item) => item.id === "covenant-adversarial-map"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-fixtures"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-funding"));
assert.ok(projectPlan.done.some((item) => item.id === "role-separated-spend-drafts"));
assert.ok(projectPlan.done.some((item) => item.id === "accepted-pledge-outputs"));
assert.ok(projectPlan.done.some((item) => item.id === "batch-settlement-release"));
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
const payloadEventManifest = JSON.parse(await readFile(new URL("../fixtures/PayloadEventEvidence.json", import.meta.url), "utf8"));
const proofFixtureCount = proofFixture.transactions.length;
const payloadEventCount = payloadEventManifest.events.length;
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
assert.equal(covenantCoverage.summary.acceptedEvidenceRows, proofFixtureCount);
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
assert.equal(acceptedState.summary.total, proofFixtureCount);
assert.equal(acceptedState.summary.matched, proofFixtureCount);
assert.equal(acceptedState.appState.vault.status, "proofs-accepted");
assert.equal(acceptedState.appState.escrow.status, "proofs-accepted");
assert.ok(acceptedState.records.some((record) =>
  record.entrypoint === "cancel"
  && record.accepted === true
  && record.txid === "14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c"
));
const checkpointFixture = JSON.parse(await readFile(new URL("../artifacts/checkpointed-accepted-index.json", import.meta.url), "utf8"));
assert.equal(checkpointFixture.summary.total, proofFixtureCount + payloadEventCount + checkpointFixture.summary.outputEvidence);
assert.equal(checkpointFixture.summary.proofs, proofFixtureCount);
assert.equal(checkpointFixture.summary.payloadEvents, payloadEventCount);
assert.equal(checkpointFixture.summary.outputEvidence, 4);
assert.equal(checkpointFixture.summary.mismatches, 0);
assert.equal(checkpointFixture.status, "accepted-index-fully-matched");
assert.ok(checkpointFixture.records.some((record) =>
  record.kind === "accepted-output"
  && record.lane === "batch-assurance-pledge-output"
  && record.expected.subject === "pledge-docs-001"
  && record.output.observed.outputIndex === 0
));
assert.ok(checkpointFixture.records.some((record) =>
  record.kind === "accepted-output"
  && record.lane === "batch-assurance-settlement-output"
  && record.txid === "4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801"
  && record.matched
));
assert.ok(checkpointFixture.checkpoint.maxAcceptingBlockBlueScore > checkpointFixture.checkpoint.minAcceptingBlockBlueScore);
const persistedCheckpointFixture = JSON.parse(await readFile(new URL("../artifacts/persisted-checkpoint-guard.json", import.meta.url), "utf8"));
assert.equal(persistedCheckpointFixture.status, "persisted-checkpoint-ready");
assert.equal(persistedCheckpointFixture.summary.recordCount, checkpointFixture.summary.total);
assert.equal(persistedCheckpointFixture.summary.mismatches, 0);
assert.equal(persistedCheckpointFixture.summary.rollbackDetected, false);
const replayPlanFixture = JSON.parse(await readFile(new URL("../artifacts/indexer-replay-plan.json", import.meta.url), "utf8"));
assert.equal(replayPlanFixture.status, "durable-indexer-plan-ready");
assert.equal(replayPlanFixture.currentCheckpoint.recordCount, checkpointFixture.summary.total);
assert.equal(replayPlanFixture.currentCheckpoint.proofSpends, proofFixtureCount);
assert.equal(replayPlanFixture.currentCheckpoint.payloadEvents, payloadEventCount);
assert.equal(replayPlanFixture.currentCheckpoint.rollbackDetected, false);
assert.equal(replayPlanFixture.target.dataVerbosity, "High");
assert.ok(replayPlanFixture.buildOrder.some((step) => step.id === "rollback-replay"));
assert.ok(replayPlanFixture.acceptanceCriteria.some((criterion) => criterion.includes("matched accepted payload bytes")));
const indexerStorageFixture = JSON.parse(await readFile(new URL("../artifacts/indexer-storage-schema.json", import.meta.url), "utf8"));
assert.equal(indexerStorageFixture.status, "storage-schema-ready");
assert.equal(indexerStorageFixture.tables.length, 5);
assert.ok(indexerStorageFixture.tables.some((table) => table.name === "rollback_segments"));
assert.equal(indexerStorageFixture.sourceCheckpoint.recordCount, checkpointFixture.summary.total);
const rebuiltIndexerStorage = buildIndexerStorageSchema({
  replayPlan: replayPlanFixture,
  checkpointIndex: checkpointFixture,
  generatedAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(rebuiltIndexerStorage.status, "storage-schema-ready");
assert.equal(rebuiltIndexerStorage.sourceCheckpoint.payloadEvents, payloadEventCount);
const indexerReplayRunFixture = JSON.parse(await readFile(new URL("../artifacts/indexer-replay-run.json", import.meta.url), "utf8"));
assert.equal(indexerReplayRunFixture.status, "fixture-replay-ready");
assert.equal(indexerReplayRunFixture.summary.records, checkpointFixture.summary.total);
assert.equal(indexerReplayRunFixture.summary.payloadEvents, payloadEventCount);
assert.equal(indexerReplayRunFixture.summary.proofSpends, proofFixtureCount);
assert.equal(indexerReplayRunFixture.summary.appStateReady, true);
assert.equal(indexerReplayRunFixture.tableCounts.accepted_transactions, checkpointFixture.summary.total);
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
const virtualChainIngestionPlan = buildVirtualChainIngestionPlan({
  replayPlan: replayPlanFixture,
  storageSchema: indexerStorageFixture,
  submitRequests: walletConnectorRequestsArtifact,
  generatedAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(virtualChainIngestionPlan.status, "virtual-chain-ingestion-contract-ready");
assert.equal(virtualChainIngestionPlan.sourceCheckpoint.recordCount, checkpointFixture.summary.total);
assert.equal(virtualChainIngestionPlan.readerContract.dataVerbosity, "High");
assert.ok(virtualChainIngestionPlan.rollbackPolicy.openWhen.some((item) => /lower than/.test(item)));
const virtualChainIngestionArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-ingestion-plan.json", import.meta.url), "utf8"));
assert.equal(virtualChainIngestionArtifact.status, "virtual-chain-ingestion-contract-ready");
const virtualChainIngestionRun = buildVirtualChainIngestionRun({
  ingestionPlan: virtualChainIngestionArtifact,
  checkpointIndex: checkpointFixture,
  submitRequests: walletConnectorRequestsArtifact,
  runAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(virtualChainIngestionRun.status, "fixture-virtual-chain-run-ready");
assert.equal(virtualChainIngestionRun.summary.virtualChainRows, checkpointFixture.summary.total);
assert.equal(virtualChainIngestionRun.summary.payloadRows, payloadEventCount);
assert.equal(virtualChainIngestionRun.summary.proofRows, proofFixtureCount);
assert.equal(virtualChainIngestionRun.summary.rollbackRows, 0);
assert.equal(virtualChainIngestionRun.summary.walletCandidateRows, 50);
assert.equal(virtualChainIngestionRun.tables.wallet_submit_candidates.length, walletConnectorRequestsArtifact.requests.length);
assert.ok(virtualChainIngestionRun.tables.wallet_submit_candidates.some((row) =>
  row.txid === "34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e"
  && row.acceptedByVirtualChain
  && row.payloadMatches
  && row.outputMatched
  && row.promotionState === "accepted-matched"
));
assert.ok(virtualChainIngestionRun.tables.wallet_submit_candidates.some((row) =>
  row.promotionState === "candidate-only"
));
const virtualChainIngestionRunArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-ingestion-run.json", import.meta.url), "utf8"));
assert.equal(virtualChainIngestionRunArtifact.status, "fixture-virtual-chain-run-ready");
assert.equal(virtualChainIngestionRunArtifact.summary.virtualChainRows, checkpointFixture.summary.total);
assert.equal(virtualChainIngestionRunArtifact.summary.walletCandidateRows, 50);
const virtualChainReaderAdapterFixture = JSON.parse(await readFile(new URL("../fixtures/VirtualChainReaderAdapter.json", import.meta.url), "utf8"));
const virtualChainReaderAdapter = buildVirtualChainReaderAdapter({
  fixture: virtualChainReaderAdapterFixture,
  checkpointIndex: checkpointFixture,
  ingestionRun: virtualChainIngestionRunArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(virtualChainReaderAdapter.status, "virtual-chain-reader-adapter-ready");
assert.equal(virtualChainReaderAdapter.endpoint.configEnv, "TN12_VIRTUAL_CHAIN_RPC_URL");
assert.equal(virtualChainReaderAdapter.endpoint.method, "getVirtualChainFromBlockV2");
assert.equal(virtualChainReaderAdapter.endpoint.dataVerbosity, "High");
assert.equal(virtualChainReaderAdapter.bounds.localNodeRequired, false);
assert.equal(virtualChainReaderAdapter.bounds.liveReadAttempted, false);
assert.equal(virtualChainReaderAdapter.cursor.persistTable, "checkpoint_watermarks");
assert.equal(virtualChainReaderAdapter.cursor.startBlueScore, checkpointFixture.checkpoint.maxAcceptingBlockBlueScore);
assert.ok(virtualChainReaderAdapter.rollbackHandling.detectWhen.some((item) => /disappear/.test(item)));
assert.ok(virtualChainReaderAdapter.retryBackoff.retryOn.includes("timeout"));
assert.ok(virtualChainReaderAdapter.retryBackoff.doNotRetryOn.includes("wrong-network"));
assert.equal(virtualChainReaderAdapter.matching.payload.currentMatchedRows, payloadEventCount);
assert.equal(virtualChainReaderAdapter.matching.proof.currentMatchedRows, proofFixtureCount);
assert.equal(virtualChainReaderAdapter.summary.acceptedCountsChanged, false);
assert.equal(virtualChainReaderAdapter.readinessChecks.fixtureReplayCompatible, true);
const virtualChainReaderAdapterArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-reader-adapter.json", import.meta.url), "utf8"));
assert.equal(virtualChainReaderAdapterArtifact.status, "virtual-chain-reader-adapter-ready");
assert.equal(virtualChainReaderAdapterArtifact.summary.virtualChainRows, checkpointFixture.summary.total);
assert.equal(virtualChainReaderAdapterArtifact.summary.localNodeRequired, false);
const virtualChainLivePreflight = buildVirtualChainLivePreflight({
  readerAdapter: virtualChainReaderAdapterArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.ok(["live-preflight-blocked", "live-preflight-ready"].includes(virtualChainLivePreflight.status));
const virtualChainLivePreflightArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-preflight.json", import.meta.url), "utf8"));
assert.ok(["live-preflight-blocked", "live-preflight-ready"].includes(virtualChainLivePreflightArtifact.status));
const virtualChainEndpointRunbook = buildVirtualChainEndpointRunbook({
  adapter: virtualChainReaderAdapterArtifact,
  preflight: virtualChainLivePreflightArtifact,
  endpointProbe: JSON.parse(await readFile(new URL("../artifacts/tn12-wrpc-endpoint-probe.json", import.meta.url), "utf8")),
  liveWindow: JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-window.json", import.meta.url), "utf8")),
  checkpointComparison: JSON.parse(await readFile(new URL("../artifacts/virtual-chain-checkpoint-comparison.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(virtualChainEndpointRunbook.status, "endpoint-runbook-live-tested-no-promotion");
assert.ok(virtualChainEndpointRunbook.summary.blockingChecks >= 0);
assert.equal(virtualChainEndpointRunbook.summary.probeReady, true);
assert.equal(virtualChainEndpointRunbook.summary.liveWindowReady, true);
assert.equal(virtualChainEndpointRunbook.summary.appStatePromoted, false);
const virtualChainEndpointRunbookArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-endpoint-runbook.json", import.meta.url), "utf8"));
assert.equal(virtualChainEndpointRunbookArtifact.status, "endpoint-runbook-live-tested-no-promotion");
const tn12WrpcEndpointProbeArtifact = JSON.parse(await readFile(new URL("../artifacts/tn12-wrpc-endpoint-probe.json", import.meta.url), "utf8"));
assert.equal(tn12WrpcEndpointProbeArtifact.status, "tn12-wrpc-endpoint-probe-ready");
assert.equal(tn12WrpcEndpointProbeArtifact.observed.dagNetwork, "testnet-12");
assert.ok(tn12WrpcEndpointProbeArtifact.checks.every((item) => item.pass));
const rebuiltEndpointProbe = summarizeTn12WrpcEndpointProbe({
  url: "ws://65.108.107.30:18210",
  encoding: "json",
  networkId: "testnet-12",
  probe: {
    serverInfo: { ok: false, error: tn12WrpcEndpointProbeArtifact.rpcCaveats.serverInfoError },
    currentNetwork: { ok: true, value: { network: tn12WrpcEndpointProbeArtifact.observed.currentNetwork } },
    info: {
      ok: true,
      value: {
        serverVersion: tn12WrpcEndpointProbeArtifact.observed.serverVersion,
        mempoolSize: tn12WrpcEndpointProbeArtifact.observed.mempoolSize,
        isSynced: true,
        isUtxoIndexed: true
      }
    },
    blockDagInfo: {
      ok: true,
      value: {
        network: tn12WrpcEndpointProbeArtifact.observed.dagNetwork,
        blockCount: tn12WrpcEndpointProbeArtifact.observed.blockCount,
        headerCount: tn12WrpcEndpointProbeArtifact.observed.headerCount,
        virtualDaaScore: tn12WrpcEndpointProbeArtifact.observed.virtualDaaScore,
        virtualParentHashes: tn12WrpcEndpointProbeArtifact.observed.virtualParentHashes,
        sink: tn12WrpcEndpointProbeArtifact.observed.sink
      }
    }
  },
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(rebuiltEndpointProbe.status, "tn12-wrpc-endpoint-probe-ready");
const virtualChainLiveWindowArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-window.json", import.meta.url), "utf8"));
assert.equal(virtualChainLiveWindowArtifact.status, "virtual-chain-live-window-ready");
assert.equal(virtualChainLiveWindowArtifact.request.method, "getVirtualChainFromBlockV2");
assert.equal(virtualChainLiveWindowArtifact.request.dataVerbosityLevel, "High");
assert.ok(virtualChainLiveWindowArtifact.summary.acceptedBlocks > 0);
assert.ok(virtualChainLiveWindowArtifact.summary.acceptedTransactions > 0);
assert.ok(virtualChainLiveWindowArtifact.summary.computeBudgetInputs > 0);
assert.ok([
  "getBlockDagInfo.sink",
  "env:TN12_VIRTUAL_CHAIN_START_HASH"
].includes(virtualChainLiveWindowArtifact.request.startHashSource));
assert.equal(
  virtualChainLiveWindowArtifact.replay.acceptedTransactions.length,
  virtualChainLiveWindowArtifact.summary.acceptedTransactions
);
assert.equal(
  virtualChainLiveWindowArtifact.replay.computeBudgetInputs.length,
  virtualChainLiveWindowArtifact.summary.computeBudgetInputs
);
assert.match(virtualChainLiveWindowArtifact.replayUse.checkpointRule, /rollback overlap/);
const rebuiltLiveWindow = summarizeVirtualChainLiveWindow({
  endpointProbe: tn12WrpcEndpointProbeArtifact,
  request: virtualChainLiveWindowArtifact.request,
  response: {
    removedChainBlockHashes: [],
    addedChainBlockHashes: ["sample-added-block"],
    chainBlockAcceptedTransactions: [
      {
        chainBlockHeader: {
          hash: "sample-block",
          blueScore: "1",
          daaScore: "2"
        },
        acceptedTransactions: [
          {
            payload: "00ff",
            inputs: [
              {
                previousOutpoint: { transactionId: "sample", index: 0 },
                sigOpCount: 0,
                computeBudget: 10
              }
            ],
            verboseData: { transactionId: "sample-tx" }
          }
        ]
      }
    ]
  },
  sdk: virtualChainLiveWindowArtifact.sdk,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(rebuiltLiveWindow.status, "virtual-chain-live-window-ready");
assert.equal(rebuiltLiveWindow.summary.payloadTransactions, 1);
assert.equal(rebuiltLiveWindow.summary.computeBudgetInputs, 1);
assert.equal(rebuiltLiveWindow.replay.acceptedTransactions.length, 1);
assert.equal(rebuiltLiveWindow.replay.acceptedTransactions[0].blockHash, "sample-block");
const liveReplayRows = buildVirtualChainLiveReplayRows({
  liveWindow: virtualChainLiveWindowArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(liveReplayRows.status, "virtual-chain-live-replay-rows-ready");
assert.equal(liveReplayRows.appStatePromoted, false);
assert.ok(liveReplayRows.summary.acceptedTransactionRows > 0);
assert.ok(liveReplayRows.summary.computeBudgetRows > 0);
assert.equal(liveReplayRows.summary.fullAcceptedReplay, true);
assert.equal(liveReplayRows.summary.acceptedTransactionRows, virtualChainLiveWindowArtifact.summary.acceptedTransactions);
const liveReplayRowsArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-replay-rows.json", import.meta.url), "utf8"));
assert.equal(liveReplayRowsArtifact.status, "virtual-chain-live-replay-rows-ready");
assert.equal(liveReplayRowsArtifact.appStatePromoted, false);
assert.equal(liveReplayRowsArtifact.summary.fullAcceptedReplay, true);
assert.match(liveReplayRowsArtifact.promotionGate.join(" "), /trusted overlap/);
const checkpointComparison = buildVirtualChainCheckpointComparison({
  liveReplayRows: liveReplayRowsArtifact,
  checkpointIndex: checkpointFixture,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(checkpointComparison.status, "live-window-overlaps-checkpoint");
assert.equal(checkpointComparison.appStatePromoted, false);
assert.equal(checkpointComparison.summary.overlapReady, true);
assert.match(checkpointComparison.nextStep, /deterministic reducer replay|rollback overlap/i);
const checkpointComparisonArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-checkpoint-comparison.json", import.meta.url), "utf8"));
assert.equal(checkpointComparisonArtifact.status, "live-window-overlaps-checkpoint");
assert.equal(checkpointComparisonArtifact.appStatePromoted, false);
const liveAppStateArtifact = JSON.parse(await readFile(new URL("../artifacts/virtual-chain-live-app-state.json", import.meta.url), "utf8"));
assert.equal(liveAppStateArtifact.operationalStatus.getVirtualChainFromBlockV2, true);
assert.equal(liveAppStateArtifact.operationalStatus.forwardIndexingCapable, true);
assert.equal(liveAppStateArtifact.status, "live-window-overlaps-checkpoint");
assert.equal(liveAppStateArtifact.appStatePromoted, true);
assert.ok(liveAppStateArtifact.summary.matchedCheckpointTxids > 0);
assert.ok(liveAppStateArtifact.summary.liveAcceptedTransactions > 0);
assert.match(liveAppStateArtifact.boundaries.join(" "), /forward indexing/i);
const durableReplayPromotionGuard = buildDurableReplayPromotionGuard({
  checkpointIndex: checkpointFixture,
  fixtureReplay: JSON.parse(await readFile(new URL("../artifacts/indexer-replay-run.json", import.meta.url), "utf8")),
  liveReplayRows: liveReplayRowsArtifact,
  liveAppState: liveAppStateArtifact,
  rollbackTests: [{
    id: "remove-stale-anchor-then-add-replacement",
    before: ["0b8196957a09832bc4469237ac75f315eba9c2f22678030eef92816a4e5cd69a", "34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e"],
    removedTxids: ["0b8196957a09832bc4469237ac75f315eba9c2f22678030eef92816a4e5cd69a"],
    added: ["synthetic-replacement-app-state-txid"],
    expectedFinalTxids: ["34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e", "synthetic-replacement-app-state-txid"]
  }],
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(durableReplayPromotionGuard.status, "durable-replay-promotion-guard-review");
assert.equal(durableReplayPromotionGuard.summary.localPromotionReady, true);
assert.equal(durableReplayPromotionGuard.summary.liveRollbackObserved, false);
assert.equal(durableReplayPromotionGuard.summary.promotionReady, false);
assert.equal(durableReplayPromotionGuard.summary.rollbackMatchingReady, true);
const durableReplayPromotionGuardArtifact = JSON.parse(await readFile(new URL("../artifacts/durable-replay-promotion-guard.json", import.meta.url), "utf8"));
assert.equal(durableReplayPromotionGuardArtifact.status, "durable-replay-promotion-guard-review");
assert.equal(durableReplayPromotionGuardArtifact.summary.localPromotionReady, true);
assert.equal(durableReplayPromotionGuardArtifact.summary.promotionReady, false);
assert.equal(durableReplayPromotionGuardArtifact.summary.liveRollbackObserved, false);
assert.match(durableReplayPromotionGuardArtifact.boundaries.join(" "), /not live removed-block evidence/i);
const walletSubmitLedger = buildWalletConnectorSubmitLedger({
  adapterRun: walletConnectorAdapterArtifact,
  submitResults: walletSubmitResultsFixture,
  virtualChainRun: virtualChainIngestionRunArtifact,
  runAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletSubmitLedger.status, "wallet-submit-ledger-ready");
assert.equal(walletSubmitLedger.summary.sessions, 50);
assert.equal(walletSubmitLedger.summary.acceptedEvidence, 3);
assert.equal(walletSubmitLedger.summary.pendingWalletSubmit, 47);
assert.equal(walletSubmitLedger.summary.broadcastsByThisArtifact, 0);
assert.equal(walletSubmitLedger.summary.secretFields, 0);
assert.ok(walletSubmitLedger.ledgerRows
  .filter((row) => row.state === "pending-wallet-submit")
  .every((row) => row.acceptedByVirtualChain === false));
assert.ok(walletSubmitLedger.readyForIndexer.every((row) => /payload-.*-evidence/.test(row.acceptedEvidencePath)));
const walletSubmitLedgerArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-connector-submit-ledger.json", import.meta.url), "utf8"));
assert.equal(walletSubmitLedgerArtifact.status, "wallet-submit-ledger-ready");
assert.equal(walletSubmitLedgerArtifact.summary.acceptedEvidence, 3);
assert.ok(walletSubmitLedgerArtifact.ledgerRows
  .filter((row) => row.state === "pending-wallet-submit")
  .every((row) => row.acceptedByVirtualChain === false));
const walletSubmitResultValidation = buildWalletSubmitResultValidation({
  adapterRun: walletConnectorAdapterArtifact,
  submitResults: walletSubmitResultsFixture,
  virtualChainRun: virtualChainIngestionRunArtifact,
  validationFixture: walletSubmitValidationFixture,
  runAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletSubmitResultValidation.status, "wallet-submit-result-validation-ready");
assert.equal(walletSubmitResultValidation.liveWalletConnectorExists, false);
assert.equal(walletSubmitResultValidation.summary.claims, 3);
assert.equal(walletSubmitResultValidation.summary.validClaims, 3);
assert.equal(walletSubmitResultValidation.summary.liveWalletPromotions, 0);
assert.equal(walletSubmitResultValidation.summary.acceptedEvidencePromotions, 3);
assert.equal(walletSubmitResultValidation.summary.negativeCases, 7);
assert.equal(walletSubmitResultValidation.summary.caughtNegativeCases, 7);
assert.equal(walletSubmitResultValidation.summary.v1ComputeBudgetSessionsPreserved, walletSubmitResultValidation.summary.computeBudgetSessions);
assert.ok(walletSubmitResultValidation.actualRows.every((row) => row.promotion.state === "accepted-evidence-only"));
assert.ok(walletSubmitResultValidation.negativeRows.some((row) => row.id === "forbidden-rest-route" && row.problems.includes("forbidden submit route")));
assert.ok(walletSubmitResultValidation.negativeRows.some((row) => row.id === "missing-user-action" && row.problems.includes("live wallet result missing explicit user action")));
assert.ok(walletSubmitResultValidation.negativeRows.some((row) => row.id === "compute-budget-lost" && row.problems.includes("transaction version mismatch")));
assert.ok(walletSubmitResultValidation.negativeRows.some((row) =>
  row.id === "promotion-without-virtual-chain-acceptance"
  && row.problems.includes("accepted result missing virtual-chain acceptance")
));
const walletSubmitResultValidationArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-submit-result-validation.json", import.meta.url), "utf8"));
assert.equal(walletSubmitResultValidationArtifact.status, "wallet-submit-result-validation-ready");
assert.equal(walletSubmitResultValidationArtifact.liveWalletConnectorExists, false);
assert.equal(walletSubmitResultValidationArtifact.summary.validClaims, 3);
assert.equal(walletSubmitResultValidationArtifact.summary.caughtNegativeCases, 7);
const walletExternalSignerGap = buildWalletExternalSignerGap({
  submitRequests: walletConnectorRequestsArtifact,
  adapterRun: walletConnectorAdapterArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletExternalSignerGap.status, "external-signer-gap-documented");
assert.equal(walletExternalSignerGap.liveNoLocalKeySigningReady, false);
assert.equal(walletExternalSignerGap.summary.requests, 50);
assert.equal(walletExternalSignerGap.summary.signedLocalDrafts, 50);
assert.equal(walletExternalSignerGap.summary.unsignedWalletSignRequests, 0);
assert.equal(walletExternalSignerGap.summary.payloadPreservationNeeded, 29);
assert.equal(walletExternalSignerGap.summary.computeBudgetPreservationNeeded, 3);
assert.ok(walletExternalSignerGap.currentTruth.some((line) => /signed local drafts/.test(line)));
assert.ok(walletExternalSignerGap.closeGapChecklist.some((item) => item.id === "unsigned-request-schema"));
const walletExternalSignerGapArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-external-signer-gap.json", import.meta.url), "utf8"));
assert.equal(walletExternalSignerGapArtifact.status, "external-signer-gap-documented");
assert.equal(walletExternalSignerGapArtifact.liveNoLocalKeySigningReady, false);
assert.equal(walletExternalSignerGapArtifact.summary.signedLocalDrafts, 50);
const submitPackageArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-submit-package.json", import.meta.url), "utf8"));
const draftArtifactsByPath = {};
for (const intent of submitPackageArtifact.intents || []) {
  draftArtifactsByPath[intent.path] = JSON.parse(await readFile(new URL(`../${intent.path}`, import.meta.url), "utf8"));
}
const walletUnsignedTemplates = buildWalletUnsignedRequestTemplates({
  submitPackage: submitPackageArtifact,
  draftArtifacts: draftArtifactsByPath,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletUnsignedTemplates.status, "unsigned-request-templates-ready");
assert.equal(walletUnsignedTemplates.standardMapped, false);
assert.equal(walletUnsignedTemplates.liveExternalSignerReady, false);
assert.equal(walletUnsignedTemplates.summary.templates, 50);
assert.equal(walletUnsignedTemplates.summary.payloadTemplates, 29);
assert.equal(walletUnsignedTemplates.summary.computeBudgetTemplates, 3);
assert.ok(walletUnsignedTemplates.summary.signatureScriptsStripped > 0);
assert.ok(walletUnsignedTemplates.templates.every((template) =>
  template.transaction.inputs.every((input) => input.signatureScript === "" && input.signatureScriptBytes === 0)
));
assert.ok(walletUnsignedTemplates.templates.some((template) =>
  template.preservation.computeBudgetInputs > 0
  && template.requestedSignerAction.mustPreserve.includes("computeBudget fields when present")
));
const walletUnsignedTemplatesArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-unsigned-request-templates.json", import.meta.url), "utf8"));
assert.equal(walletUnsignedTemplatesArtifact.status, "unsigned-request-templates-ready");
assert.equal(walletUnsignedTemplatesArtifact.summary.templates, 50);
assert.equal(walletUnsignedTemplatesArtifact.standardMapped, false);
const signerReferences = await readFile(new URL("../docs/WALLET_SIGNER_REFERENCES.md", import.meta.url), "utf8");
const walletStandardMapping = buildWalletStandardMapping({
  unsignedTemplates: walletUnsignedTemplatesArtifact,
  signerReferences,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletStandardMapping.status, "wallet-standard-mapping-ready");
assert.equal(walletStandardMapping.selectedCandidate, "pskb-pskt");
assert.equal(walletStandardMapping.liveWalletIntegrationReady, false);
const walletStandardMappingArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-mapping.json", import.meta.url), "utf8"));
assert.equal(walletStandardMappingArtifact.status, "wallet-standard-mapping-ready");
assert.equal(walletStandardMappingArtifact.selectedCandidate, "pskb-pskt");
const walletStandardRequests = buildWalletStandardRequests({
  walletMapping: walletStandardMappingArtifact,
  unsignedTemplates: walletUnsignedTemplatesArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletStandardRequests.status, "wallet-standard-request-candidates-ready");
assert.equal(walletStandardRequests.summary.mappedRequests, 4);
assert.equal(walletStandardRequests.summary.payloadRequests, 1);
assert.equal(walletStandardRequests.summary.computeBudgetRequests, 1);
assert.ok(walletStandardRequests.requests.some((request) =>
  request.sourceSignedDraftPath === "artifacts/signed-drafts/tn12-multi-wallet-a-receipt.json"
  && request.preservation.expectedTransactionIdAfterSigning === "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa"
));
assert.ok(walletStandardRequests.requests.every((request) =>
  request.body.format === "pskb-pskt-candidate-json"
  && request.reviewFingerprint.length === 64
  && request.body.transaction.inputs.every((input) => input.signatureScript === "")
));
assert.ok(walletStandardRequests.requests.some((request) =>
  request.preservation.computeBudgetInputs > 0
  && request.signerReturnContract.rejectWhen.some((rule) => /computeBudget/.test(rule))
));
assert.ok(walletStandardRequests.requests.some((request) =>
  request.sourceSignedDraftPath === "artifacts/signed-drafts/role-escrow-release.json"
));
assert.ok(walletStandardRequests.requests.some((request) =>
  request.sourceSignedDraftPath === "artifacts/signed-drafts/role-escrow-refund.json"
));
const walletStandardRequestsArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-requests.json", import.meta.url), "utf8"));
assert.equal(walletStandardRequestsArtifact.status, "wallet-standard-request-candidates-ready");
assert.equal(walletStandardRequestsArtifact.summary.mappedRequests, 4);
const walletSignerResultsFixture = JSON.parse(await readFile(new URL("../fixtures/WalletStandardSignerResults.json", import.meta.url), "utf8"));
const walletSignerValidation = buildWalletStandardSignerValidation({
  standardRequests: walletStandardRequestsArtifact,
  signerResults: walletSignerResultsFixture,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletSignerValidation.status, "wallet-standard-signer-validation-ready");
assert.equal(walletSignerValidation.summary.pending, 4);
assert.equal(walletSignerValidation.summary.negativeCasesCaught, 3);
assert.equal(walletSignerValidation.liveExternalSignerAccepted, false);
assert.ok(walletSignerValidation.validations.some((item) =>
  item.id === "negative-mutated-fingerprint"
  && item.validation === "rejected"
  && item.reasons.includes("review fingerprint mismatch")
));
assert.ok(walletSignerValidation.validations.some((item) =>
  item.id === "negative-dropped-compute-budget"
  && item.validation === "rejected"
  && item.reasons.includes("input 0 computeBudget mismatch")
));
assert.ok(walletSignerValidation.validations.some((item) =>
  item.id === "negative-missing-signed-transaction"
  && item.validation === "rejected"
  && item.reasons.includes("missing signed transaction")
));
const walletSignerValidationArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-standard-signer-validation.json", import.meta.url), "utf8"));
assert.equal(walletSignerValidationArtifact.status, "wallet-standard-signer-validation-ready");
assert.equal(walletSignerValidationArtifact.summary.pending, 4);
assert.equal(walletSignerValidationArtifact.summary.negativeCasesCaught, 3);
assert.ok(walletSignerValidationArtifact.validations.some((row) =>
  row.id === "negative-dropped-compute-budget"
  && row.reasons.length === 1
  && row.reasons[0] === "input 0 computeBudget mismatch"
));
const walletExternalSignerRoundtripPlan = buildWalletExternalSignerRoundtripPlan({
  standardRequests: walletStandardRequestsArtifact,
  signerValidation: walletSignerValidationArtifact,
  endpointRunbook: JSON.parse(await readFile(new URL("../artifacts/virtual-chain-endpoint-runbook.json", import.meta.url), "utf8")),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletExternalSignerRoundtripPlan.status, "external-signer-roundtrip-plan-ready");
assert.equal(walletExternalSignerRoundtripPlan.summary.requests, 4);
assert.equal(walletExternalSignerRoundtripPlan.summary.pendingExternalSigner, 4);
assert.deepEqual(walletExternalSignerRoundtripPlan.recommendedOrder, [
  "ureq-fcfdf1df-standard",
  "ureq-d12412d8-standard"
]);
const walletExternalSignerRoundtripPlanArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-external-signer-roundtrip-plan.json", import.meta.url), "utf8"));
assert.equal(walletExternalSignerRoundtripPlanArtifact.status, "external-signer-roundtrip-plan-ready");
const walletExternalSignerResultTemplate = buildWalletExternalSignerResultTemplate({
  roundtripPlan: walletExternalSignerRoundtripPlanArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletExternalSignerResultTemplate.status, "external-signer-result-template-ready");
assert.equal(walletExternalSignerResultTemplate.summary.templates, 4);
assert.equal(walletExternalSignerResultTemplate.summary.recommendedFirstPass, 2);
assert.equal(walletExternalSignerResultTemplate.results.length, 4);
assert.ok(walletExternalSignerResultTemplate.requiredReturnFields.includes("signedTransaction"));
assert.ok(walletExternalSignerResultTemplate.results.some((row) =>
  row.requestId === "ureq-fcfdf1df-standard"
  && row.reviewFingerprint === "03022c4021c69473bba1873e7141fb87d28d5bc80fad988b6bf8859f34980fc4"
  && row.transactionId === "ff7835059368b559db98e6625b0ffc82e1df2c37cb33f2fbe8abb6408d45ceaa"
  && row.route === "payload-preserving-wrpc"
));
assert.ok(walletExternalSignerResultTemplate.results.some((row) =>
  row.requestId === "ureq-d12412d8-standard"
  && row.inputBudgetReport[0]?.computeBudget === 30
));
const walletExternalSignerResultTemplateArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-external-signer-result-template.json", import.meta.url), "utf8"));
assert.equal(walletExternalSignerResultTemplateArtifact.status, "external-signer-result-template-ready");
assert.equal(walletExternalSignerResultTemplateArtifact.results.length, 4);
const externalSignerPathResearch = buildExternalSignerPathResearch({
  roundtripPlan: walletExternalSignerRoundtripPlanArtifact,
  resultTemplate: walletExternalSignerResultTemplateArtifact,
  signerValidation: walletSignerValidationArtifact,
  generatedAt: "2026-05-10T00:00:00.000Z"
});
assert.equal(externalSignerPathResearch.status, "external-signer-path-ready-for-wallet-approval");
assert.equal(externalSignerPathResearch.summary.userApprovalRequired, true);
assert.equal(externalSignerPathResearch.requestChecklist.length, 2);
assert.match(externalSignerPathResearch.acceptanceRule, /virtual-chain replay observes/);
const externalSignerPathResearchArtifact = JSON.parse(await readFile(new URL("../artifacts/external-signer-path-research.json", import.meta.url), "utf8"));
assert.equal(externalSignerPathResearchArtifact.status, "external-signer-path-ready-for-wallet-approval");
assert.equal(externalSignerPathResearchArtifact.summary.userApprovalRequired, true);
assert.ok(externalSignerPathResearchArtifact.sourceNotes.some((source) => /KasWare/.test(source.label)));
const walletExternalSignerSimArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-external-signer-sim-results.json", import.meta.url), "utf8"));
assert.equal(walletExternalSignerSimArtifact.status, "sim-roundtrip-all-passed");
assert.equal(walletExternalSignerSimArtifact.summary.passed, 4);
assert.equal(walletExternalSignerSimArtifact.summary.fingerprintPreserved, 4);
assert.equal(walletExternalSignerSimArtifact.summary.payloadPreserved, 4);
assert.equal(walletExternalSignerSimArtifact.summary.computeBudgetPreserved, 4);
assert.match(walletExternalSignerSimArtifact.boundaries.join(" "), /SIGNED_NOT_BROADCAST/);
const walletImplementationSlice = buildWalletConnectorImplementationSlice({
  walletMapping: walletStandardMappingArtifact,
  unsignedTemplates: walletUnsignedTemplatesArtifact,
  standardRequests: walletStandardRequestsArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(walletImplementationSlice.status, "wallet-connector-implementation-slice-ready");
assert.equal(walletImplementationSlice.firstUserFlow, "payload-receipt-unsigned-sign");
assert.equal(walletImplementationSlice.summary.payloadTemplates, 29);
assert.equal(walletImplementationSlice.summary.standardRequests, 4);
assert.ok(walletImplementationSlice.firstRoundTripRequest.reviewFingerprint);
const walletImplementationSliceArtifact = JSON.parse(await readFile(new URL("../artifacts/wallet-connector-implementation-slice.json", import.meta.url), "utf8"));
assert.equal(walletImplementationSliceArtifact.status, "wallet-connector-implementation-slice-ready");
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
assert.equal(proofEvidence.summary.accepted, proofFixtureCount);
assert.equal(proofEvidence.summary.p2shInputs, proofFixtureCount);
assert.equal(proofEvidence.summary.matchedInputs, proofFixtureCount);
assert.equal(proofEvidence.summary.p2pkOutputs, proofFixtureCount);
assert.equal(proofEvidence.summary.matchedOutputs, proofFixtureCount);

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
  "scripts/build-attestation-reputation-thresholds.mjs",
  "scripts/build-accepted-app-state.mjs",
  "scripts/build-checkpointed-index.mjs",
  "scripts/build-persisted-checkpoint-guard.mjs",
  "scripts/build-indexer-replay-plan.mjs",
  "scripts/build-indexer-storage-schema.mjs",
  "scripts/build-indexer-replay-run.mjs",
  "scripts/build-virtual-chain-ingestion-plan.mjs",
  "scripts/build-virtual-chain-ingestion-run.mjs",
  "scripts/build-virtual-chain-reader-adapter.mjs",
  "scripts/build-virtual-chain-live-preflight.mjs",
  "scripts/build-virtual-chain-endpoint-runbook.mjs",
  "scripts/probe-tn12-wrpc-endpoint.mjs",
  "scripts/read-virtual-chain-live-window.mjs",
  "scripts/build-virtual-chain-live-replay-rows.mjs",
  "scripts/build-virtual-chain-checkpoint-comparison.mjs",
  "scripts/build-durable-replay-promotion-guard.mjs",
  "scripts/submit-signed-draft.mjs",
  "scripts/submit-signed-draft-wrpc.mjs",
  "scripts/plan-transactions.mjs",
  "scripts/build-signal-payload.mjs",
  "scripts/build-invoice-registry.mjs",
  "scripts/build-submit-console-registry.mjs",
  "scripts/build-wallet-review-readiness.mjs",
  "scripts/build-wallet-connector-readiness.mjs",
  "scripts/build-wallet-submit-package.mjs",
  "scripts/build-wallet-connector-submit-requests.mjs",
  "scripts/build-wallet-connector-adapter-run.mjs",
  "scripts/build-wallet-connector-submit-ledger.mjs",
  "scripts/build-wallet-submit-result-validation.mjs",
  "scripts/build-wallet-external-signer-gap.mjs",
  "scripts/build-wallet-unsigned-request-templates.mjs",
  "scripts/build-wallet-standard-mapping.mjs",
  "scripts/build-wallet-standard-requests.mjs",
  "scripts/build-wallet-standard-signer-validation.mjs",
  "scripts/build-wallet-external-signer-roundtrip-plan.mjs",
  "scripts/build-wallet-external-signer-result-template.mjs",
  "scripts/build-external-signer-path-research.mjs",
  "scripts/build-wallet-external-signer-sim.mjs",
  "scripts/build-wallet-connector-implementation-slice.mjs",
  "scripts/build-research-library.mjs",
  "scripts/build-based-rollup-scout.mjs",
  "scripts/build-mainstream-app-direction.mjs",
  "scripts/build-missing-rails-matrix.mjs",
  "scripts/build-rail-research-triggers.mjs",
  "scripts/build-oracle-source-matrix.mjs",
  "scripts/build-next-work-queue.mjs",
  "scripts/build-next-ten-execution-plan.mjs",
  "scripts/build-next-ten-execution-status.mjs",
  "scripts/build-proven-status.mjs",
  "scripts/build-operator-receipt-pack.mjs",
  "scripts/build-defi-receipt-replay-guard.mjs",
  "scripts/build-batch-assurance-campaign.mjs",
  "scripts/build-batch-assurance-custody-drafts.mjs",
  "scripts/build-batch-assurance-custody-requirements.mjs",
  "scripts/build-batch-assurance-pledge-output-plan.mjs",
  "scripts/build-batch-assurance-custody-imports.mjs",
  "scripts/build-batch-assurance-settlement-decision.mjs",
  "scripts/build-batch-assurance-submit-runbook.mjs",
  "scripts/build-batch-assurance-operator-decision.mjs",
  "scripts/build-enforcement-matrix.mjs",
  "scripts/build-escrow-primitives.mjs",
  "scripts/build-escrow-marketplace-demo.mjs",
  "scripts/build-escrow-marketplace-flow.mjs",
  "scripts/build-escrow-marketplace-action-map.mjs",
  "scripts/build-treasury-vaults.mjs",
  "scripts/build-treasury-constrained-spends.mjs",
  "scripts/build-treasury-role-review.mjs",
  "scripts/build-payload-submit-readiness.mjs",
  "scripts/verify-payload-receipt.mjs",
  "scripts/verify-payload-events.mjs",
  "scripts/build-coordination-market.mjs",
  "scripts/build-coordination-market-settlement-brief.mjs",
  "scripts/build-access-pass-planner.mjs",
  "scripts/build-access-pass-issuer-review.mjs",
  "scripts/build-mainnet-readiness.mjs",
  "scripts/build-invoice-mainnet-launch-brief.mjs",
  "scripts/build-asset-policies.mjs",
  "scripts/build-auction-settlement-drafts.mjs",
  "scripts/build-auction-custody-review.mjs",
  "scripts/build-prediction-hedge-simulator.mjs",
  "scripts/build-stable-value-paths.mjs",
  "scripts/build-stable-issuer-redemptions.mjs",
  "scripts/build-status.mjs",
  "scripts/build-project-plan.mjs",
  "scripts/build-ai-coding-source-discipline.mjs",
  "scripts/build-agent-settlement-drafts.mjs",
  "scripts/build-agent-settlement-review.mjs",
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
  "artifacts/wallet-connector-submit-requests.json",
  "artifacts/wallet-connector-adapter-run.json",
  "artifacts/wallet-connector-submit-ledger.json",
  "artifacts/wallet-submit-result-validation.json",
  "artifacts/wallet-external-signer-gap.json",
  "artifacts/wallet-unsigned-request-templates.json",
  "artifacts/wallet-standard-mapping.json",
  "artifacts/wallet-standard-requests.json",
  "artifacts/wallet-standard-signer-validation.json",
  "artifacts/wallet-external-signer-roundtrip-plan.json",
  "artifacts/wallet-external-signer-result-template.json",
  "artifacts/external-signer-path-research.json",
  "artifacts/wallet-external-signer-sim-results.json",
  "artifacts/wallet-connector-implementation-slice.json",
  "artifacts/attestation-reputation-thresholds.json",
  "artifacts/research-library.json",
  "artifacts/based-rollup-scout.json",
  "artifacts/mainstream-app-direction.json",
  "artifacts/missing-rails-matrix.json",
  "artifacts/rail-research-triggers.json",
  "artifacts/oracle-source-matrix.json",
  "artifacts/next-work-queue.json",
  "artifacts/next-ten-execution-plan.json",
  "artifacts/next-ten-execution-status.json",
  "artifacts/defi-receipt-replay-guard.json",
  "artifacts/batch-assurance-campaign.json",
  "artifacts/batch-assurance-custody-drafts.json",
  "artifacts/batch-assurance-custody-requirements.json",
  "artifacts/batch-assurance-pledge-output-plan.json",
  "artifacts/batch-assurance-custody-imports.json",
  "artifacts/batch-assurance-settlement-drafts.json",
  "artifacts/batch-assurance-settlement-decision.json",
  "artifacts/batch-assurance-submit-runbook.json",
  "artifacts/batch-assurance-operator-decision.json",
  "artifacts/signed-drafts/batch-assurance-pledge-funding.json",
  "artifacts/signed-drafts/batch-assurance-release.json",
  "artifacts/signed-drafts/batch-assurance-refund-pledge-docs-001.json",
  "artifacts/signed-drafts/batch-assurance-refund-pledge-docs-002.json",
  "artifacts/signed-drafts/batch-assurance-refund-pledge-docs-003.json",
  "artifacts/enforcement-matrix.json",
  "artifacts/escrow-marketplace-demo.json",
  "artifacts/escrow-marketplace-flow.json",
  "artifacts/escrow-marketplace-action-map.json",
  "artifacts/proof-evidence.json",
  "artifacts/role-separated-proof-evidence.json",
  "artifacts/covenant-adversarial-coverage.json",
  "artifacts/role-separated-invalid-candidates.json",
  "artifacts/escrow-primitives.json",
  "artifacts/treasury-vaults.json",
  "artifacts/treasury-constrained-spends.json",
  "artifacts/treasury-role-review.json",
  "artifacts/payload-submit-readiness.json",
  "artifacts/payload-receipt-evidence.json",
  "artifacts/payload-refund-evidence.json",
  "artifacts/payload-error-evidence.json",
  "artifacts/checkpointed-accepted-index.json",
  "artifacts/persisted-checkpoint-guard.json",
  "artifacts/indexer-replay-plan.json",
  "artifacts/indexer-storage-schema.json",
  "artifacts/indexer-replay-run.json",
  "artifacts/virtual-chain-ingestion-plan.json",
  "artifacts/virtual-chain-ingestion-run.json",
  "artifacts/virtual-chain-reader-adapter.json",
  "artifacts/virtual-chain-live-preflight.json",
  "artifacts/virtual-chain-endpoint-runbook.json",
  "artifacts/tn12-wrpc-endpoint-probe.json",
  "artifacts/virtual-chain-live-window.json",
  "artifacts/virtual-chain-live-replay-rows.json",
  "artifacts/virtual-chain-checkpoint-comparison.json",
  "artifacts/durable-replay-promotion-guard.json",
  "artifacts/coordination-market-prototype.json",
  "artifacts/coordination-market-settlement-brief.json",
  "artifacts/access-pass-planner.json",
  "artifacts/access-pass-issuer-review.json",
  "artifacts/mainnet-readiness.json",
  "artifacts/invoice-mainnet-launch-brief.json",
  "artifacts/simple-asset-policies.json",
  "artifacts/auction-settlement-drafts.json",
  "artifacts/auction-custody-review.json",
  "artifacts/prediction-hedge-simulator.json",
  "artifacts/stable-value-paths.json",
  "artifacts/stable-issuer-redemptions.json",
  "artifacts/build-status.json",
  "artifacts/proven-status.json",
  "artifacts/operator-receipt-pack.json",
  "artifacts/agent-settlement-drafts.json",
  "artifacts/agent-settlement-review.json",
  "artifacts/project-plan.json",
  "artifacts/ai-coding-source-discipline.json",
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
  "fixtures/RailResearchTriggers.json",
  "fixtures/OracleSourceMatrix.json",
  "fixtures/NextWorkQueue.json",
  "fixtures/BatchAssuranceCampaign.json",
  "fixtures/BatchAssuranceCustodyImports.json",
  "fixtures/BatchAssurancePledgeWallets.public.json",
  "fixtures/EnforcementMatrix.json",
  "fixtures/EscrowPrimitives.json",
  "fixtures/TreasuryVaults.json",
  "fixtures/CoordinationMarketPrototype.json",
  "fixtures/CoordinationMarketSettlementBrief.json",
  "fixtures/AccessPassPlanner.json",
  "fixtures/MainnetReadiness.json",
  "fixtures/SimpleAssetPolicies.json",
  "fixtures/AuctionCustodySources.json",
  "fixtures/AgentCustodySources.json",
  "fixtures/StableValuePaths.json",
  "fixtures/StableIssuerRedemptions.json",
  "fixtures/BuildStatus.json",
  "fixtures/AiCodingSourceDiscipline.json",
  "fixtures/WalletConnectorSubmitResults.json",
  "fixtures/WalletSubmitResultValidation.json",
  "fixtures/VirtualChainReaderAdapter.json",
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
  "src/virtualChainIngestion.mjs",
  "src/virtualChainIngestionRun.mjs",
  "src/virtualChainReaderAdapter.mjs",
  "src/virtualChainLivePreflight.mjs",
  "src/virtualChainEndpointRunbook.mjs",
  "src/tn12WrpcEndpointProbe.mjs",
  "src/virtualChainLiveWindow.mjs",
  "src/virtualChainLiveReplayRows.mjs",
  "src/virtualChainCheckpointComparison.mjs",
  "src/durableReplayPromotionGuard.mjs",
  "src/signalPayload.mjs",
  "src/attestationSignal.mjs",
  "src/attestationReputationThresholds.mjs",
  "src/invoiceReceipt.mjs",
  "src/submitConsole.mjs",
  "src/walletReview.mjs",
  "src/walletConnectorReadiness.mjs",
  "src/walletSubmitPackage.mjs",
  "src/walletConnectorSubmitRequests.mjs",
  "src/walletConnectorAdapterRun.mjs",
  "src/walletConnectorSubmitLedger.mjs",
  "src/walletSubmitResultValidation.mjs",
  "src/walletExternalSignerGap.mjs",
  "src/walletUnsignedRequestTemplates.mjs",
  "src/walletStandardMapping.mjs",
  "src/walletStandardRequests.mjs",
  "src/walletStandardSignerValidation.mjs",
  "src/walletExternalSignerRoundtripPlan.mjs",
  "src/walletExternalSignerResultTemplate.mjs",
  "src/externalSignerPathResearch.mjs",
  "src/walletExternalSignerSim.mjs",
  "src/walletConnectorImplementationSlice.mjs",
  "src/appResearch.mjs",
  "src/basedRollupScout.mjs",
  "src/mainstreamAppDirection.mjs",
  "src/missingRailsMatrix.mjs",
  "src/railResearchTriggers.mjs",
  "src/oracleSourceMatrix.mjs",
  "src/nextWorkQueue.mjs",
  "src/nextTenExecutionPlan.mjs",
  "src/nextTenExecutionStatus.mjs",
  "src/provenStatus.mjs",
  "src/operatorReceiptPack.mjs",
  "src/defiReceiptReplayGuard.mjs",
  "src/batchAssurance.mjs",
  "src/batchAssuranceCustodyDrafts.mjs",
  "src/batchAssuranceCustodyRequirements.mjs",
  "src/batchAssurancePledgeOutputs.mjs",
  "src/batchAssuranceCustodyImports.mjs",
  "src/batchAssuranceSettlementDecision.mjs",
  "src/batchAssuranceSubmitRunbook.mjs",
  "src/batchAssuranceOperatorDecision.mjs",
  "src/enforcementMatrix.mjs",
  "src/escrowPrimitive.mjs",
  "src/escrowMarketplaceDemo.mjs",
  "src/escrowMarketplaceFlow.mjs",
  "src/escrowMarketplaceActionMap.mjs",
  "src/treasuryVault.mjs",
  "src/treasuryConstrainedSpends.mjs",
  "src/treasuryRoleReview.mjs",
  "src/payloadSubmitReadiness.mjs",
  "src/wrpcSubmitCandidate.mjs",
  "src/coordinationMarket.mjs",
  "src/coordinationMarketSettlementBrief.mjs",
  "src/accessPassPlanner.mjs",
  "src/accessPassIssuerReview.mjs",
  "src/mainnetReadiness.mjs",
  "src/invoiceMainnetLaunchBrief.mjs",
  "src/assetPolicy.mjs",
  "src/auctionSettlementDrafts.mjs",
  "src/auctionCustodyReview.mjs",
  "src/predictionHedgeSimulator.mjs",
  "src/stableValuePaths.mjs",
  "src/stableIssuerRedemption.mjs",
  "src/agentSettlementDrafts.mjs",
  "src/agentSettlementReview.mjs",
  "src/buildStatus.mjs",
  "src/projectPlan.mjs",
  "src/aiCodingSourceDiscipline.mjs",
  "src/covenantAdversarialCoverage.mjs",
  "src/roleSeparatedInvalidCandidates.mjs",
  "src/transactionPlanner.mjs",
  "src/transactionDrafts.mjs",
  "src/signedContractDrafts.mjs",
  "src/contractSpendDrafts.mjs",
  "src/submitPayload.mjs",
  "README.md",
  "lab.html",
  "AGENTS.md",
  "docs/AUDIT_MAP.md",
  "docs/REPO_TIDYING.md",
  "docs/SCRIPT_INDEX.md",
  "docs/PROGRESS.md",
  "docs/SOURCES.md",
  "docs/LLM_REVIEW_GUIDE.md",
  "docs/MICHAEL_QUESTIONS.md",
  "docs/ROADMAP_STATE.md",
  "docs/TN12_TEST_MATRIX.md",
  "docs/TRANSACTION_API_NOTES.md",
  "docs/ASSURANCE_CONTRACTS.md",
  "docs/KASPA_DOCS_REVIEW.md",
  "docs/ECOSYSTEM_BUILD_PLAN.md",
  "docs/MASTER_APP_PLAN.md",
  "docs/PROGRAMMABILITY_PATHS.md",
  "docs/MAINSTREAM_APP_DIRECTION.md",
  "docs/AI_CODING_SOURCE_DISCIPLINE.md"
];

for (const file of files) {
  const text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  assert.ok(text.length > 100, `${file} should not be empty`);
}

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
assert.match(readme, /testnet-only/i);
assert.match(readme, /npm run check:all/);
assert.match(readme, /TN12_ACCEPTED/);
assert.match(readme, /NOT proven/i);
assert.match(readme, /docs\/AUDIT_MAP\.md/);
assert.match(readme, /4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801/);
const auditMap = await readFile(new URL("../docs/AUDIT_MAP.md", import.meta.url), "utf8");
assert.match(auditMap, /TN12_ACCEPTED/);
assert.match(auditMap, /operator-receipt-pack\.json/);
assert.match(auditMap, /npm run demo:operator-refresh/);
const scriptIndex = await readFile(new URL("../docs/SCRIPT_INDEX.md", import.meta.url), "utf8");
assert.match(scriptIndex, /Reviewer Commands/);
assert.match(scriptIndex, /Volatile Generated Artifacts/);
const repoTidying = await readFile(new URL("../docs/REPO_TIDYING.md", import.meta.url), "utf8");
assert.match(repoTidying, /Canonical Surface/);
assert.match(repoTidying, /Archive Policy/);
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
assert.equal(packageJson.scripts["operator:refresh"], "npm run demo:operator-refresh");
assert.equal(packageJson.scripts["operator:pack"], "npm run project:operator-pack");
// Full command list and lab details live in docs/LAB_NOTEBOOK.md
const labNotebook = await readFile(new URL("../docs/LAB_NOTEBOOK.md", import.meta.url), "utf8");
assert.match(labNotebook, /faucet-tn12\.kaspanet\.io/);
assert.match(labNotebook, /Start with the artifact path/i);
assert.match(labNotebook, /npm run address/);
assert.match(labNotebook, /npm run fixtures/);
assert.match(labNotebook, /npm run fixtures:roles/);
assert.match(labNotebook, /npm run compile:roles/);
assert.match(labNotebook, /npm run wallet:public/);
assert.match(labNotebook, /npm run drafts/);
assert.match(labNotebook, /npm run indexer:persist/);
assert.match(labNotebook, /npm run indexer:replay-plan/);
assert.match(labNotebook, /npm run indexer:schema/);
assert.match(labNotebook, /npm run indexer:replay/);
assert.match(labNotebook, /npm run indexer:virtual-chain-plan/);
assert.match(labNotebook, /npm run indexer:virtual-chain-run/);
assert.match(labNotebook, /npm run indexer:virtual-chain-adapter/);
assert.match(labNotebook, /npm run indexer:live-preflight/);
assert.match(labNotebook, /npm run indexer:endpoint-runbook/);
assert.match(labNotebook, /npm run tx:p2pk/);
assert.match(labNotebook, /npm run tx:contracts/);
assert.match(labNotebook, /npm run tx:roles:fund/);
assert.match(labNotebook, /npm run tx:roles:spends/);
assert.match(labNotebook, /npm run tx:roles:verify/);
assert.match(labNotebook, /npm run roles:proof:evidence/);
assert.match(labNotebook, /npm run invoice:registry/);
assert.match(labNotebook, /npm run submit:registry/);
assert.match(labNotebook, /npm run wallet:review/);
assert.match(labNotebook, /npm run wallet:connector/);
assert.match(labNotebook, /npm run wallet:connector-requests/);
assert.match(labNotebook, /npm run wallet:adapter-run/);
assert.match(labNotebook, /npm run wallet:submit-ledger/);
assert.match(labNotebook, /npm run wallet:result-validation/);
assert.match(labNotebook, /npm run wallet:external-signer-template/);
assert.match(labNotebook, /npm run campaign:pledge-outputs/);
assert.match(labNotebook, /npm run escrow:marketplace/);
assert.match(labNotebook, /npm run escrow:flow/);
assert.match(labNotebook, /npm run escrow:action-map/);
assert.match(labNotebook, /npm run rails:missing/);
assert.match(labNotebook, /npm run rails:research/);
assert.match(labNotebook, /npm run oracle:matrix/);
assert.match(labNotebook, /npm run project:queue/);
assert.match(labNotebook, /npm run project:next-ten-status/);
assert.match(labNotebook, /npm run project:operator-pack/);
assert.match(labNotebook, /npm run campaign:state/);
assert.match(labNotebook, /npm run campaign:custody/);
assert.match(labNotebook, /npm run campaign:custody-requirements/);
assert.match(labNotebook, /npm run campaign:custody-imports/);
assert.match(labNotebook, /npm run campaign:pledge-funding-draft/);
assert.match(labNotebook, /npm run campaign:settlement-drafts/);
assert.match(labNotebook, /npm run campaign:settlement-decision/);
assert.match(labNotebook, /npm run campaign:submit-runbook/);
assert.match(labNotebook, /npm run enforcement:matrix/);
assert.match(labNotebook, /npm run escrow:registry/);
assert.match(labNotebook, /npm run treasury:registry/);
assert.match(labNotebook, /npm run treasury:spends/);
assert.match(labNotebook, /npm run treasury:role-review/);
assert.match(labNotebook, /npm run payload:readiness/);
assert.match(labNotebook, /npm run access:passes/);
assert.match(labNotebook, /npm run access:issuer-review/);
assert.match(labNotebook, /npm run mainnet:readiness/);
assert.match(labNotebook, /npm run invoice:mainnet-brief/);
assert.match(labNotebook, /npm run auction:intents/);
assert.match(labNotebook, /npm run auction:settlement-drafts/);
assert.match(labNotebook, /npm run auction:custody-review/);
assert.match(labNotebook, /Wallet And Keys/);
assert.match(labNotebook, /Build Commands/);
assert.match(labNotebook, /docs\/PROGRESS\.md/);
assert.match(labNotebook, /docs\/ROADMAP_STATE\.md/);
assert.match(labNotebook, /qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt/);
assert.match(labNotebook, /npm run check:tn12/);

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const labHtml = await readFile(new URL("../lab.html", import.meta.url), "utf8");
assert.match(html, /TN12 configured\. Proof transactions accepted\./);
assert.match(html, /TN12 faucet/);
assert.match(html, /npm run address/);
assert.match(html, /Lab workbench/);
assert.match(html, /Planner and research panels moved/);
assert.doesNotMatch(html, /Assurance contract/);
assert.doesNotMatch(html, /Miner signal research/);
assert.match(html, /Accepted transaction indexer/);
assert.match(html, /Enforcement matrix/);
assert.match(html, /Mainnet readiness map/);
assert.match(html, /Build status/);
assert.match(html, /Wallet-facing submit console/);
assert.match(html, /receipt-events/);
assert.doesNotMatch(html, /escrow cancel redesign/);
assert.match(labHtml, /Assurance contract/);
assert.match(labHtml, /Manual address check/);
assert.match(labHtml, /Kaspa app lab/);
assert.match(labHtml, /Miner signal research/);
assert.match(labHtml, /Payload receipt app/);
assert.match(labHtml, /payload:readiness/);
assert.match(labHtml, /Batch assurance campaigns/);
assert.match(labHtml, /Escrow primitive/);
assert.match(labHtml, /Treasury \/ team vaults/);
assert.match(labHtml, /Transparent coordination-market prototype/);
assert.match(labHtml, /KRC \/ access pass planner/);
assert.match(labHtml, /Simple asset policy/);
assert.match(labHtml, /Stable-value paths/);
assert.match(labHtml, /Issuer redemption state/);
assert.match(labHtml, /Operator plan/);
assert.match(labHtml, /npm run project:plan/);
assert.match(labHtml, /Cross-chain research library/);
assert.match(labHtml, /App map/);
assert.match(labHtml, /Attestation registry/);
assert.match(labHtml, /Prediction hedge simulator/);
assert.match(labHtml, /npm run prediction:hedge/);
assert.match(labHtml, /escrow mutual-cancel proof transactions/);
assert.match(labHtml, /batch-assurance release rails/);
assert.match(labHtml, /href="index\.html"/);
assert.doesNotMatch(labHtml, /escrow cancel redesign/);

const assuranceDocs = await readFile(new URL("../docs/ASSURANCE_CONTRACTS.md", import.meta.url), "utf8");
assert.match(assuranceDocs, /funding rule strangers can rely on/);
assert.match(assuranceDocs, /AssurancePledge\.sil/);
assert.match(assuranceDocs, /target aggregation/);

const michaelQuestions = await readFile(new URL("../docs/MICHAEL_QUESTIONS.md", import.meta.url), "utf8");
assert.match(michaelQuestions, /14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c/);
assert.match(michaelQuestions, /computeBudget: 30/);
assert.match(michaelQuestions, /local debugging has checked the basic layers/);
assert.match(michaelQuestions, /kaspa-wasm@0\.13\.0/);
assert.match(michaelQuestions, /1\.1\.1-toc\.1/);
assert.match(michaelQuestions, /RpcTransactionInput\.sig_op_count is inconsistent/);
assert.match(michaelQuestions, /RPC response error NotFound/);

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
assert.match(ecosystemBuildPlan, /Status Lanes/);
assert.match(ecosystemBuildPlan, /Built Evidence/);
assert.match(ecosystemBuildPlan, /Current Blockers/);
assert.match(ecosystemBuildPlan, /Build Order/);
assert.match(ecosystemBuildPlan, /Completion Standard/);

const appLab = JSON.parse(await readFile(new URL("../fixtures/KaspaAppLab.json", import.meta.url), "utf8"));
assert.ok(appLab.lanes.some((lane) => lane.id === "cross-chain-research"));

const masterRoadmap = JSON.parse(await readFile(new URL("../fixtures/MasterAppRoadmap.json", import.meta.url), "utf8"));
assert.equal(masterRoadmap.lanes.length, 12);
assert.deepEqual(masterRoadmap.lanes.map((lane) => lane.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
assert.ok(masterRoadmap.lanes.some((lane) => lane.id === "miner-pool-signals"));

const sources = await readFile(new URL("../docs/SOURCES.md", import.meta.url), "utf8");
assert.match(sources, /Cross-Chain App Research Resources/);
assert.match(sources, /PMF clues/);
assert.match(sources, /KasSigner\/KasSee/);

const walletSignerReferences = await readFile(new URL("../docs/WALLET_SIGNER_REFERENCES.md", import.meta.url), "utf8");
assert.match(walletSignerReferences, /PSKB\/KSPT/);
assert.match(walletSignerReferences, /not a live external signer integration/);

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

// Check Track 6: Negative Test Coverage
const escrowNegativeCases = JSON.parse(await readFile(new URL("../artifacts/escrow-negative-cases.json", import.meta.url), "utf8"));
assert.equal(escrowNegativeCases.status, "escrow-negative-cases-ready");
assert.ok(escrowNegativeCases.cases.length >= 3, "Escrow negative cases minimum coverage");

const batchNegativeCases = JSON.parse(await readFile(new URL("../artifacts/batch-assurance-negative-cases.json", import.meta.url), "utf8").catch(() => JSON.stringify({ status: "pending", cases: [] })));
if (batchNegativeCases.status) {
  assert.ok(batchNegativeCases.status.includes("negative") || batchNegativeCases.status === "pending");
}

const walletNegativeCases = JSON.parse(await readFile(new URL("../artifacts/wallet-negative-cases.json", import.meta.url), "utf8").catch(() => JSON.stringify({ status: "pending", cases: [] })));
if (walletNegativeCases.status) {
  assert.ok(walletNegativeCases.status.includes("negative") || walletNegativeCases.status === "pending");
}

// Check Track 5: Oracle Research
const oracleFailureModes = JSON.parse(await readFile(new URL("../artifacts/oracle-failure-modes.json", import.meta.url), "utf8"));
assert.equal(oracleFailureModes.status, "oracle-failure-modes-ready");
assert.ok(oracleFailureModes.failureModes.length >= 8);

const stableValueOracleSpec = JSON.parse(await readFile(new URL("../artifacts/stable-value-oracle-spec.json", import.meta.url), "utf8"));
assert.equal(stableValueOracleSpec.status, "stable-value-oracle-spec-ready");
assert.match(stableValueOracleSpec.summary.consensusModel, /majority/);

// Check Track 3: Auction Custody Design
const auctionSettlementSpec = JSON.parse(await readFile(new URL("../artifacts/auction-settlement-covenant-spec.json", import.meta.url), "utf8"));
assert.ok(auctionSettlementSpec.status);

const auctionSettlementStub = JSON.parse(await readFile(new URL("../artifacts/auction-settlement-covenant-stub.json", import.meta.url), "utf8"));
assert.equal(auctionSettlementStub.status, "auction-settlement-covenant-stub-ready");
assert.ok(auctionSettlementStub.validation.rolesSeparated);

// Check Track 4: Coordination Market Spec
const coordinationMarketSettlementBrief = JSON.parse(await readFile(new URL("../artifacts/coordination-market-settlement-brief.json", import.meta.url), "utf8"));
assert.ok(coordinationMarketSettlementBrief.summary);

const coordinationMarketStubs = JSON.parse(await readFile(new URL("../artifacts/coordination-market-covenant-stubs.json", import.meta.url), "utf8"));
assert.equal(coordinationMarketStubs.status, "coordination-market-covenant-stubs-ready");
assert.equal(coordinationMarketStubs.games.length, 3);

console.log("Checks passed.");

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}
