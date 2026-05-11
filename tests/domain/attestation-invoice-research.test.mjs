import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAttestationRegistry } from "../../src/attestationSignal.mjs";
import { buildAttestationReputationThresholds } from "../../src/attestationReputationThresholds.mjs";
import {
  DEFAULT_INVOICE,
  buildInvoiceArtifact,
  buildInvoiceRegistry
} from "../../src/invoiceReceipt.mjs";
import { buildResearchLibrary } from "../../src/appResearch.mjs";
import { buildMissingRailsMatrix } from "../../src/missingRailsMatrix.mjs";
import { buildOracleSourceMatrix } from "../../src/oracleSourceMatrix.mjs";

const attestationRegistry = buildAttestationRegistry(await readJson("fixtures/AttestationSignals.json"));
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

const attestationThresholdArtifact = await readJson("artifacts/attestation-reputation-thresholds.json");
assert.equal(attestationThresholdArtifact.status, "attestation-thresholds-ready");
assert.equal(attestationThresholdArtifact.summary.influenceAllowedSignals, 0);
assert.equal(attestationThresholdArtifact.summary.dashboardInfluenceEnabled, false);

const invoiceArtifact = buildInvoiceArtifact(DEFAULT_INVOICE);
assert.equal(invoiceArtifact.schema, "kaspa-invoice-receipt-app/v1");
assert.equal(invoiceArtifact.status, "draft-needs-payload-submit");
assert.equal(invoiceArtifact.receipt.payload.kind, "invoice-receipt");

const invoiceRegistry = buildInvoiceRegistry(await readJson("fixtures/InvoiceReceipts.json"));
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

const researchLibrary = buildResearchLibrary(await readJson("fixtures/CrossChainResearchLibrary.json"));
assert.equal(researchLibrary.status, "research-inputs-not-protocol-claims");
assert.equal(researchLibrary.summary.total, 16);
assert.equal(researchLibrary.summary.lanes["live-kaspa"], 5);
assert.equal(researchLibrary.summary.lanes["tn12-toccata"], 3);
assert.equal(researchLibrary.summary.lanes.roadmap, 4);
assert.equal(researchLibrary.summary.lanes.research, 4);
assert.ok(researchLibrary.candidates.some((candidate) => candidate.id === "uniswap-amm"));
assert.ok(researchLibrary.candidates.some((candidate) => candidate.id === "wallet-api-send" && candidate.priority === "build-now"));

const missingRailsMatrix = buildMissingRailsMatrix(await readJson("fixtures/MissingRailsMatrix.json"));
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

const missingRailsArtifact = await readJson("artifacts/missing-rails-matrix.json");
assert.equal(missingRailsArtifact.summary.questions, 23);

const oracleMatrix = buildOracleSourceMatrix(await readJson("fixtures/OracleSourceMatrix.json"));
assert.equal(oracleMatrix.status, "oracle-source-matrix-ready");
assert.equal(oracleMatrix.summary.models, 6);
assert.equal(oracleMatrix.summary.custodyReadyModels, 0);
assert.ok(oracleMatrix.missingRails.includes("stale-feed pause rule"));
assert.ok(oracleMatrix.models.some((model) =>
  model.id === "cex-weighted-median"
  && model.currentKaspaLane === "research"
  && model.references.includes("kaskad-oracle-article")
));

const oracleMatrixArtifact = await readJson("artifacts/oracle-source-matrix.json");
assert.equal(oracleMatrixArtifact.status, "oracle-source-matrix-ready");
assert.equal(oracleMatrixArtifact.summary.models, 6);

console.log("Attestation, invoice, and research boundary tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
