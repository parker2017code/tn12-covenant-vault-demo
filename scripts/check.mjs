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
import { buildAcceptedAppState } from "../src/acceptedIndexer.mjs";

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
assert.ok(attestationRegistry.boundaries.some((boundary) => /block headers/.test(boundary)));
assert.ok(attestationRegistry.sources.some((source) => source.source === "pool-operator-gamma"));
const invoiceArtifact = buildInvoiceArtifact(DEFAULT_INVOICE);
assert.equal(invoiceArtifact.schema, "kaspa-invoice-receipt-app/v1");
assert.equal(invoiceArtifact.status, "draft-needs-payload-submit");
assert.equal(invoiceArtifact.receipt.payload.kind, "invoice-receipt");
const invoiceFixture = JSON.parse(await readFile(new URL("../fixtures/InvoiceReceipts.json", import.meta.url), "utf8"));
const invoiceRegistry = buildInvoiceRegistry(invoiceFixture);
assert.equal(invoiceRegistry.summary.total, 2);
assert.equal(invoiceRegistry.summary.paid, 0);
const proofFixture = JSON.parse(await readFile(new URL("../fixtures/AcceptedProofTransactions.json", import.meta.url), "utf8"));
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
assert.equal(acceptedState.summary.total, 4);
assert.equal(acceptedState.summary.matched, 4);
assert.equal(acceptedState.appState.vault.status, "proofs-accepted");

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
  "scripts/compile-silverscript.mjs",
  "scripts/build-transaction-drafts.mjs",
  "scripts/build-signed-p2pk-draft.mjs",
  "scripts/build-signed-contract-funding-drafts.mjs",
  "scripts/build-signed-split-draft.mjs",
  "scripts/build-signed-contract-spend-drafts.mjs",
  "scripts/fetch-contract-outpoints.mjs",
  "scripts/fetch-split-buckets.mjs",
  "scripts/build-signed-payload-receipt-draft.mjs",
  "scripts/verify-accepted-txs.mjs",
  "scripts/build-accepted-app-state.mjs",
  "scripts/submit-signed-draft.mjs",
  "scripts/plan-transactions.mjs",
  "scripts/build-signal-payload.mjs",
  "scripts/build-invoice-registry.mjs",
  "contracts/DelayedRecoveryVault.sil",
  "contracts/AssurancePledge.sil",
  "artifacts/DelayedRecoveryVault.json",
  "artifacts/AssurancePledge.json",
  "artifacts/signed-drafts/payload-receipt-self-send.json",
  "fixtures/FundedWalletOutpoint.example.json",
  "fixtures/FundedWalletOutpoint.json",
  "fixtures/SavedWallet.public.json",
  "fixtures/AcceptedProofTransactions.json",
  "fixtures/AcceptedAppState.json",
  "fixtures/EcosystemBuildQueue.json",
  "fixtures/VaultTemplates.json",
  "fixtures/KaspaAppLab.json",
  "fixtures/MinerSignalResearch.json",
  "fixtures/AttestationSignals.json",
  "fixtures/MasterAppRoadmap.json",
  "fixtures/InvoiceReceipts.json",
  "src/manualOutpoint.mjs",
  "src/acceptedIndexer.mjs",
  "src/signalPayload.mjs",
  "src/attestationSignal.mjs",
  "src/invoiceReceipt.mjs",
  "src/transactionPlanner.mjs",
  "src/transactionDrafts.mjs",
  "src/signedContractDrafts.mjs",
  "src/contractSpendDrafts.mjs",
  "src/submitPayload.mjs",
  "README.md",
  "AGENTS.md",
  "docs/STATUS.md",
  "docs/SOURCES.md",
  "docs/BUILD_PLAN.md",
  "docs/TRANSACTION_API_NOTES.md",
  "docs/ASSURANCE_CONTRACTS.md",
  "docs/KASPA_DOCS_REVIEW.md",
  "docs/ECOSYSTEM_BUILD_PLAN.md",
  "docs/GITHUB_HOSTING.md",
  "docs/MASTER_APP_PLAN.md"
];

for (const file of files) {
  const text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  assert.ok(text.length > 100, `${file} should not be empty`);
}

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
assert.match(readme, /faucet-tn12\.kaspanet\.io/);
assert.match(readme, /not a mainnet wallet/i);
assert.match(readme, /npm run address/);
assert.match(readme, /npm run fixtures/);
assert.match(readme, /npm run wallet:public/);
assert.match(readme, /npm run plan/);
assert.match(readme, /npm run drafts/);
assert.match(readme, /npm run tx:p2pk/);
assert.match(readme, /npm run tx:contracts/);
assert.match(readme, /npm run tx:split/);
assert.match(readme, /npm run invoice:registry/);
assert.match(readme, /Manual Address Checks/);
assert.match(readme, /Build Plan/);
assert.match(readme, /qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt/);

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
assert.match(html, /receipt-events/);
assert.match(html, /Master app plan/);
assert.match(html, /Attestation registry/);

const assuranceDocs = await readFile(new URL("../docs/ASSURANCE_CONTRACTS.md", import.meta.url), "utf8");
assert.match(assuranceDocs, /funding rule strangers can rely on/);
assert.match(assuranceDocs, /AssurancePledge\.sil/);
assert.match(assuranceDocs, /target aggregation/);

const buildPlan = await readFile(new URL("../docs/BUILD_PLAN.md", import.meta.url), "utf8");
assert.match(buildPlan, /Completed Proof Path/);
assert.match(buildPlan, /Next 20 Build Tasks/);
assert.match(buildPlan, /Accepted-transaction app-state snapshot/);

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
assert.match(masterPlan, /AI-Agent Commitment Board/);
assert.match(masterPlan, /No fake block-header claims|arbitrary app data can be placed in block headers/);

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

console.log("Checks passed.");
