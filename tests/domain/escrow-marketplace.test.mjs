import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildEscrowPrimitive } from "../../src/escrowPrimitive.mjs";
import { buildEscrowMarketplaceDemo } from "../../src/escrowMarketplaceDemo.mjs";
import { buildEscrowMarketplaceFlow } from "../../src/escrowMarketplaceFlow.mjs";
import { buildEscrowMarketplaceActionMap } from "../../src/escrowMarketplaceActionMap.mjs";

const escrowFundingDraft = await readJson("artifacts/signed-drafts/escrow-funding.json");
assert.equal(escrowFundingDraft.contract, "Escrow");
assert.equal(escrowFundingDraft.status, "signed-not-broadcast");

const escrowReleaseDraft = await readJson("artifacts/signed-drafts/escrow-release.json");
const escrowRefundDraft = await readJson("artifacts/signed-drafts/escrow-refund.json");
const escrowCancelDraft = await readJson("artifacts/signed-drafts/escrow-cancel.json");
const escrowDaaRefundDraft = await readJson("artifacts/signed-drafts/escrow-daa-refund-proof-refund.json");
const escrowCancelProofDraft = await readJson("artifacts/signed-drafts/escrow-cancel-proof-cancel.json");

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

const escrowCancelAttempt = await readJson("artifacts/escrow-cancel-attempt.json");
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

const escrowRegistry = buildEscrowPrimitive(await readJson("fixtures/EscrowPrimitives.json"));
assert.equal(escrowRegistry.status, "planner-fixture-not-script-proof");
assert.equal(escrowRegistry.summary.total, 3);
assert.equal(escrowRegistry.summary.funded, 1);
assert.equal(escrowRegistry.summary.needsAction, 2);
assert.ok(escrowRegistry.escrows.some((escrow) =>
  escrow.escrowId === "escrow-freelance-001"
  && escrow.spendPaths.length === 3
));

const marketplace = buildEscrowMarketplaceDemo({
  escrowRegistry,
  walletConnectorRequests: await readJson("artifacts/wallet-connector-submit-requests.json"),
  proofEvidence: await readJson("artifacts/proof-evidence.json")
});
assert.equal(marketplace.status, "marketplace-demo-plan-ready");
assert.equal(marketplace.summary.listings, 3);
assert.equal(marketplace.summary.acceptedEscrowProofs, 3);
assert.equal(marketplace.summary.walletConnectorRequestsReady, true);
assert.ok(marketplace.listings.some((listing) =>
  listing.escrowId === "escrow-freelance-001"
  && listing.acceptedProofBackdrop === "release-refund-cancel-paths-accepted"
));

const marketplaceArtifact = await readJson("artifacts/escrow-marketplace-demo.json");
assert.equal(marketplaceArtifact.status, "marketplace-demo-plan-ready");
assert.equal(marketplaceArtifact.summary.listings, 3);

const marketplaceFlow = buildEscrowMarketplaceFlow({
  marketplaceDemo: marketplaceArtifact,
  unsignedTemplates: await readJson("artifacts/wallet-unsigned-request-templates.json"),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(marketplaceFlow.status, "escrow-marketplace-flow-ready");
assert.equal(marketplaceFlow.summary.flows, 3);
assert.equal(marketplaceFlow.summary.blockedOnWalletStandard, 3);

const marketplaceFlowArtifact = await readJson("artifacts/escrow-marketplace-flow.json");
assert.equal(marketplaceFlowArtifact.status, "escrow-marketplace-flow-ready");

const actionMap = buildEscrowMarketplaceActionMap({
  marketplaceFlow: marketplaceFlowArtifact,
  unsignedTemplates: await readJson("artifacts/wallet-unsigned-request-templates.json"),
  walletStandardRequests: await readJson("artifacts/wallet-standard-requests.json"),
  signerValidation: await readJson("artifacts/wallet-standard-signer-validation.json"),
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(actionMap.status, "escrow-action-map-ready");
assert.equal(actionMap.summary.actions, 5);
assert.ok(actionMap.summary.blockedActions >= 0);
assert.equal(actionMap.summary.liveExternalSignerAccepted, false);
assert.ok(actionMap.flows.some((flow) =>
  flow.escrowId === "escrow-freelance-001"
  && flow.actions.some((action) =>
    action.action === "mutual-cancel"
    && action.walletStandardRequestId === "ureq-d12412d8-standard"
  )
));
assert.ok(actionMap.flows.some((flow) =>
  flow.escrowId === "escrow-freelance-001"
  && flow.actions.some((action) =>
    action.action === "release"
    && action.walletStandardRequestId === "ureq-fda320a9-standard"
  )
));
assert.ok(actionMap.flows.some((flow) =>
  flow.escrowId === "escrow-freelance-001"
  && flow.actions.some((action) =>
    action.action === "timeout-refund"
    && action.walletStandardRequestId === "ureq-f5845e00-standard"
  )
));

const actionMapArtifact = await readJson("artifacts/escrow-marketplace-action-map.json");
assert.equal(actionMapArtifact.status, "escrow-action-map-ready");
assert.equal(actionMapArtifact.summary.actions, 5);
assert.ok(actionMapArtifact.summary.blockedActions <= 5);
assert.ok(actionMapArtifact.summary.simValidatedActions >= 0);

console.log("Escrow marketplace tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
