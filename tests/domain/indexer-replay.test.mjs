import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildAcceptedAppState } from "../../src/acceptedIndexer.mjs";
import { buildIndexerStorageSchema } from "../../src/indexerStorageSchema.mjs";
import { buildIndexerReplayRun } from "../../src/indexerReplayRun.mjs";
import { buildVirtualChainIngestionPlan } from "../../src/virtualChainIngestion.mjs";
import { buildVirtualChainIngestionRun } from "../../src/virtualChainIngestionRun.mjs";
import { buildVirtualChainReaderAdapter } from "../../src/virtualChainReaderAdapter.mjs";

const proofFixture = await readJson("fixtures/AcceptedProofTransactions.json");
const payloadEventManifest = await readJson("fixtures/PayloadEventEvidence.json");
const proofFixtureCount = proofFixture.transactions.length;
const payloadEventCount = payloadEventManifest.events.length;

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

const acceptedState = buildAcceptedAppState({
  proofFixture,
  transactions: fakeTransactions,
  fetchedAt: "2026-05-07T00:00:00.000Z"
});
assert.equal(acceptedState.summary.total, proofFixtureCount);
assert.equal(acceptedState.summary.matched, proofFixtureCount);
assert.equal(acceptedState.appState.vault.status, "proofs-accepted");
assert.equal(acceptedState.appState.escrow.status, "proofs-accepted");
assert.ok(acceptedState.records.some((record) =>
  record.entrypoint === "cancel"
  && record.accepted === true
  && record.txid === "14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c"
));

const checkpoint = await readJson("artifacts/checkpointed-accepted-index.json");
assert.equal(checkpoint.summary.total, proofFixtureCount + payloadEventCount + checkpoint.summary.outputEvidence);
assert.equal(checkpoint.summary.proofs, proofFixtureCount);
assert.equal(checkpoint.summary.payloadEvents, payloadEventCount);
assert.equal(checkpoint.summary.outputEvidence, 4);
assert.equal(checkpoint.summary.mismatches, 0);
assert.equal(checkpoint.status, "accepted-index-fully-matched");
assert.ok(checkpoint.records.some((record) =>
  record.kind === "accepted-output"
  && record.lane === "batch-assurance-pledge-output"
  && record.expected.subject === "pledge-docs-001"
  && record.output.observed.outputIndex === 0
));
assert.ok(checkpoint.records.some((record) =>
  record.kind === "accepted-output"
  && record.lane === "batch-assurance-settlement-output"
  && record.txid === "4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801"
  && record.matched
));
assert.ok(checkpoint.checkpoint.maxAcceptingBlockBlueScore > checkpoint.checkpoint.minAcceptingBlockBlueScore);

const persistedCheckpoint = await readJson("artifacts/persisted-checkpoint-guard.json");
assert.equal(persistedCheckpoint.status, "persisted-checkpoint-ready");
assert.equal(persistedCheckpoint.summary.recordCount, checkpoint.summary.total);
assert.equal(persistedCheckpoint.summary.mismatches, 0);
assert.equal(persistedCheckpoint.summary.rollbackDetected, false);

const replayPlan = await readJson("artifacts/indexer-replay-plan.json");
assert.equal(replayPlan.status, "durable-indexer-plan-ready");
assert.equal(replayPlan.currentCheckpoint.recordCount, checkpoint.summary.total);
assert.equal(replayPlan.currentCheckpoint.proofSpends, proofFixtureCount);
assert.equal(replayPlan.currentCheckpoint.payloadEvents, payloadEventCount);
assert.equal(replayPlan.currentCheckpoint.rollbackDetected, false);
assert.equal(replayPlan.target.dataVerbosity, "High");
assert.ok(replayPlan.buildOrder.some((step) => step.id === "rollback-replay"));
assert.ok(replayPlan.acceptanceCriteria.some((criterion) => criterion.includes("matched accepted payload bytes")));

const storageSchema = await readJson("artifacts/indexer-storage-schema.json");
assert.equal(storageSchema.status, "storage-schema-ready");
assert.equal(storageSchema.tables.length, 5);
assert.ok(storageSchema.tables.some((table) => table.name === "rollback_segments"));
assert.equal(storageSchema.sourceCheckpoint.recordCount, checkpoint.summary.total);

const rebuiltStorage = buildIndexerStorageSchema({
  replayPlan,
  checkpointIndex: checkpoint,
  generatedAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(rebuiltStorage.status, "storage-schema-ready");
assert.equal(rebuiltStorage.sourceCheckpoint.payloadEvents, payloadEventCount);

const replayRun = await readJson("artifacts/indexer-replay-run.json");
assert.equal(replayRun.status, "fixture-replay-ready");
assert.equal(replayRun.summary.records, checkpoint.summary.total);
assert.equal(replayRun.summary.payloadEvents, payloadEventCount);
assert.equal(replayRun.summary.proofSpends, proofFixtureCount);
assert.equal(replayRun.summary.appStateReady, true);
assert.equal(replayRun.tableCounts.accepted_transactions, checkpoint.summary.total);
assert.equal(replayRun.tableCounts.rollback_segments, 0);

const rebuiltReplayRun = buildIndexerReplayRun({
  checkpointIndex: checkpoint,
  storageSchema,
  runAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(rebuiltReplayRun.status, "fixture-replay-ready");
assert.ok(rebuiltReplayRun.reducerReadiness.some((item) =>
  item.lane === "invoice"
  && item.status === "ready-from-fixture-replay"
));

const walletConnectorRequests = await readJson("artifacts/wallet-connector-submit-requests.json");
const ingestionPlan = buildVirtualChainIngestionPlan({
  replayPlan,
  storageSchema,
  submitRequests: walletConnectorRequests,
  generatedAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(ingestionPlan.status, "virtual-chain-ingestion-contract-ready");
assert.equal(ingestionPlan.sourceCheckpoint.recordCount, checkpoint.summary.total);
assert.equal(ingestionPlan.readerContract.dataVerbosity, "High");
assert.ok(ingestionPlan.rollbackPolicy.openWhen.some((item) => /lower than/.test(item)));

const ingestionPlanArtifact = await readJson("artifacts/virtual-chain-ingestion-plan.json");
assert.equal(ingestionPlanArtifact.status, "virtual-chain-ingestion-contract-ready");

const ingestionRun = buildVirtualChainIngestionRun({
  ingestionPlan: ingestionPlanArtifact,
  checkpointIndex: checkpoint,
  submitRequests: walletConnectorRequests,
  runAt: "2026-05-08T00:00:00.000Z"
});
assert.equal(ingestionRun.status, "fixture-virtual-chain-run-ready");
assert.equal(ingestionRun.summary.virtualChainRows, checkpoint.summary.total);
assert.equal(ingestionRun.summary.payloadRows, payloadEventCount);
assert.equal(ingestionRun.summary.proofRows, proofFixtureCount);
assert.equal(ingestionRun.summary.rollbackRows, 0);
assert.equal(ingestionRun.summary.walletCandidateRows, 50);
assert.equal(ingestionRun.tables.wallet_submit_candidates.length, walletConnectorRequests.requests.length);
assert.ok(ingestionRun.tables.wallet_submit_candidates.some((row) =>
  row.txid === "34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e"
  && row.acceptedByVirtualChain
  && row.payloadMatches
  && row.outputMatched
  && row.promotionState === "accepted-matched"
));
assert.ok(ingestionRun.tables.wallet_submit_candidates.some((row) =>
  row.promotionState === "candidate-only"
));

const ingestionRunArtifact = await readJson("artifacts/virtual-chain-ingestion-run.json");
assert.equal(ingestionRunArtifact.status, "fixture-virtual-chain-run-ready");
assert.equal(ingestionRunArtifact.summary.virtualChainRows, checkpoint.summary.total);
assert.equal(ingestionRunArtifact.summary.walletCandidateRows, 50);

const readerAdapter = buildVirtualChainReaderAdapter({
  fixture: await readJson("fixtures/VirtualChainReaderAdapter.json"),
  checkpointIndex: checkpoint,
  ingestionRun: ingestionRunArtifact,
  generatedAt: "2026-05-09T00:00:00.000Z"
});
assert.equal(readerAdapter.status, "virtual-chain-reader-adapter-ready");
assert.equal(readerAdapter.endpoint.configEnv, "TN12_VIRTUAL_CHAIN_RPC_URL");
assert.equal(readerAdapter.endpoint.method, "getVirtualChainFromBlockV2");
assert.equal(readerAdapter.endpoint.dataVerbosity, "High");
assert.equal(readerAdapter.bounds.localNodeRequired, false);
assert.equal(readerAdapter.bounds.liveReadAttempted, false);
assert.equal(readerAdapter.cursor.persistTable, "checkpoint_watermarks");
assert.equal(readerAdapter.cursor.startBlueScore, checkpoint.checkpoint.maxAcceptingBlockBlueScore);
assert.ok(readerAdapter.rollbackHandling.detectWhen.some((item) => /disappear/.test(item)));
assert.ok(readerAdapter.retryBackoff.retryOn.includes("timeout"));
assert.ok(readerAdapter.retryBackoff.doNotRetryOn.includes("wrong-network"));
assert.equal(readerAdapter.matching.payload.currentMatchedRows, payloadEventCount);
assert.equal(readerAdapter.matching.proof.currentMatchedRows, proofFixtureCount);
assert.equal(readerAdapter.summary.acceptedCountsChanged, false);
assert.equal(readerAdapter.readinessChecks.fixtureReplayCompatible, true);

const readerAdapterArtifact = await readJson("artifacts/virtual-chain-reader-adapter.json");
assert.equal(readerAdapterArtifact.status, "virtual-chain-reader-adapter-ready");
assert.equal(readerAdapterArtifact.summary.virtualChainRows, checkpoint.summary.total);
assert.equal(readerAdapterArtifact.summary.localNodeRequired, false);

console.log("Indexer replay tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
