import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildSubmitConsoleRegistry,
  summarizeSignedDraft
} from "../../src/submitConsole.mjs";
import { buildPayloadSubmitReadiness } from "../../src/payloadSubmitReadiness.mjs";
import { summarizeWrpcCandidate } from "../../src/wrpcSubmitCandidate.mjs";
import { buildWalletReviewReadiness } from "../../src/walletReview.mjs";
import { buildWalletConnectorReadiness } from "../../src/walletConnectorReadiness.mjs";
import { buildWalletSubmitPackage } from "../../src/walletSubmitPackage.mjs";
import { buildWalletConnectorSubmitRequests } from "../../src/walletConnectorSubmitRequests.mjs";
import { buildWalletConnectorAdapterRun } from "../../src/walletConnectorAdapterRun.mjs";
import { buildWalletStandardSignerValidation } from "../../src/walletStandardSignerValidation.mjs";
import { buildWalletSubmitResultValidation } from "../../src/walletSubmitResultValidation.mjs";

const payloadReadinessArtifact = await readJson("artifacts/payload-submit-readiness.json");
const payloadReadiness = buildPayloadSubmitReadiness(payloadReadinessArtifact);
assert.equal(payloadReadiness.status, "accepted-wrpc-payload-receipt-rest-blocked");
assert.equal(payloadReadiness.checks.submitTxModelHasPayload, false);
assert.equal(payloadReadiness.checks.fetchedTxModelHasPayload, true);
assert.equal(payloadReadiness.checks.signedDraftHasPayload, true);
assert.equal(payloadReadiness.checks.restSubmitAttempted, true);
assert.equal(payloadReadiness.checks.restSubmitPayloadPreserved, false);
assert.equal(payloadReadiness.checks.acceptedWrpcPayloadReceiptMatched, true);
assert.equal(payloadReadiness.checks.safeToSubmitPayloadReceiptByDefault, true);

const payloadReceiptDraft = await readJson("artifacts/signed-drafts/payload-receipt-self-send.json");
assert.equal(payloadReceiptDraft.submitPayload.transaction.outputs.length, 2);
assert.equal(payloadReceiptDraft.submitPayload.transaction.outputs[0].amount, 100000000);
assert.ok(payloadReceiptDraft.submitPayload.transaction.outputs[1].amount > 0);
assert.equal(payloadReceiptDraft.payment.minerFeeSompi, "5000");

const wrpcCandidate = summarizeWrpcCandidate(payloadReceiptDraft, {
  artifactPath: "artifacts/signed-drafts/payload-receipt-self-send.json"
});
assert.equal(wrpcCandidate.status, "needs-kaspa-wrpc-url");
assert.equal(wrpcCandidate.txidMatches, true);
assert.equal(wrpcCandidate.payloadBytes, 127);

const p2pkSelfSendDraft = await readJson("artifacts/signed-drafts/self-send-p2pk.json");
assert.ok(BigInt(p2pkSelfSendDraft.payment.changeSompi) > 0n);

const splitDraftArtifact = await readJson("artifacts/signed-drafts/split-funding.json");
const splitDraftSummary = summarizeSignedDraft(splitDraftArtifact, "artifacts/signed-drafts/split-funding.json");
assert.equal(splitDraftSummary.counts.inputs, 1);
assert.equal(splitDraftSummary.counts.outputs, 3);
assert.match(splitDraftSummary.submit.submitCommand, /--submit/);

const submitManifest = await readJson("fixtures/SubmitConsoleDrafts.json");
const submitArtifacts = {};
for (const draft of submitManifest.drafts) {
  submitArtifacts[draft.path] = await readJson(draft.path);
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
assert.ok(walletSubmitPackage.firstPayloadIntents.every((intent) =>
  intent.requiredWalletChecks.includes("Reject public REST payload submit.")
));

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

const walletConnectorRequestsArtifact = await readJson("artifacts/wallet-connector-submit-requests.json");
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

const walletConnectorAdapterArtifact = await readJson("artifacts/wallet-connector-adapter-run.json");
assert.equal(walletConnectorAdapterArtifact.status, "adapter-dry-run-ready");
assert.equal(walletConnectorAdapterArtifact.summary.reviewReady, 50);

const walletStandardRequests = await readJson("artifacts/wallet-standard-requests.json");
const signerValidation = buildWalletStandardSignerValidation({
  standardRequests: walletStandardRequests,
  signerResults: await readJson("fixtures/WalletStandardSignerResults.json"),
  generatedAt: "2026-05-11T00:00:00.000Z"
});
assert.equal(signerValidation.status, "wallet-standard-signer-validation-ready");
assert.equal(signerValidation.liveExternalSignerAccepted, false);
assert.equal(signerValidation.summary.accepted, 0);
assert.equal(signerValidation.summary.negativeCasesCaught, 3);
assert.ok(signerValidation.validations.some((validation) =>
  validation.validation === "rejected"
  && validation.reasons.includes("review fingerprint mismatch")
));
assert.ok(signerValidation.validations.some((validation) =>
  validation.status === "pending-external-signer"
  && validation.reasons.includes("external signer has not returned a transaction yet")
));

const signerValidationArtifact = await readJson("artifacts/wallet-standard-signer-validation.json");
assert.equal(signerValidationArtifact.summary.pending, signerValidation.summary.pending);
assert.equal(signerValidationArtifact.summary.negativeCasesCaught, signerValidation.summary.negativeCasesCaught);

const submitResultValidation = buildWalletSubmitResultValidation({
  adapterRun: walletConnectorAdapterArtifact,
  submitResults: await readJson("fixtures/WalletConnectorSubmitResults.json"),
  virtualChainRun: await readJson("artifacts/virtual-chain-ingestion-run.json"),
  validationFixture: await readJson("fixtures/WalletSubmitResultValidation.json"),
  runAt: "2026-05-11T00:00:00.000Z"
});
assert.equal(submitResultValidation.status, "wallet-submit-result-validation-ready");
assert.equal(submitResultValidation.summary.liveWalletPromotions, 0);
assert.equal(submitResultValidation.summary.caughtNegativeCases, submitResultValidation.summary.negativeCases);
assert.equal(submitResultValidation.summary.secretFields, 0);
assert.ok(submitResultValidation.promotionRules.some((rule) => /explicit user approval/.test(rule)));
assert.ok(submitResultValidation.negativeRows.every((row) => row.problems.length > 0));

const submitResultValidationArtifact = await readJson("artifacts/wallet-submit-result-validation.json");
assert.equal(submitResultValidationArtifact.status, "wallet-submit-result-validation-ready");
assert.equal(submitResultValidationArtifact.summary.liveWalletPromotions, 0);

console.log("Wallet submit readiness tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
