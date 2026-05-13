import { readFile, writeFile } from "node:fs/promises";

const targetPath = process.env.SCHEDULER_TARGET || "artifacts/scheduler-covenant-settlement-target.json";
const fundingDraftPath = process.env.SCHEDULER_FUNDING_DRAFT || "artifacts/signed-drafts/scheduler-covenant-payout-genesis-funding.json";
const contractOutpointPath = process.env.CONTRACT_OUTPOINT || "fixtures/SchedulerCovenantPayoutOutpoint.json";
const releaseDraftPath = process.env.SCHEDULER_RELEASE_DRAFT || "artifacts/signed-drafts/scheduler-covenant-payout-release.json";
const outPath = process.env.OUT || "artifacts/scheduler-covenant-payout-evidence.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const [target, fundingDraft, contractOutpoint, releaseDraft] = await Promise.all([
  readJson(targetPath),
  readJson(fundingDraftPath),
  readJson(contractOutpointPath),
  readJson(releaseDraftPath)
]);
const response = await fetch(`${endpointBase}/${releaseDraft.transactionId}`);
const releaseTx = response.ok ? await response.json() : null;
const accepted = Boolean(response.ok && releaseTx?.is_accepted);

const artifact = {
  schema: "tn12-scheduler-covenant-payout-evidence/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: accepted ? "accepted-covenant-payout-spend" : "covenant-payout-spend-not-accepted",
  funding: {
    txid: fundingDraft.transactionId,
    outputIndex: contractOutpoint.outputIndex,
    covenantId: contractOutpoint.covenantId || fundingDraft.covenantGenesis?.covenant?.covenantId || "",
    amountTkas: contractOutpoint.amountTkas,
    amountSompi: contractOutpoint.amountSompi,
    explorerUrl: contractOutpoint.explorerUrl
  },
  release: {
    txid: releaseDraft.transactionId,
    status: accepted ? "accepted" : "not-found-or-not-accepted",
    explorerUrl: `https://tn12.kaspa.stream/transactions/${releaseDraft.transactionId}`,
    amountTkas: releaseDraft.destination.amountTkas,
    amountSompi: releaseDraft.destination.amountSompi,
    destination: releaseDraft.destination.address,
    acceptingBlockBlueScore: releaseTx?.accepting_block_blue_score ?? null
  },
  schedulerContext: {
    intentTxid: target.currentEvidence?.intentTxid || "",
    winningBidTxid: target.currentEvidence?.winningBidTxid || "",
    executionReceiptTxid: target.currentEvidence?.executionReceiptTxid || "",
    previousLocalKeyPayoutTxid: target.currentEvidence?.executionTransferTxid || ""
  },
  summary: {
    liveProductClaims: 0,
    custodyActions: 0,
    scriptEnforces: [
      "operator signature",
      "exact payout amount",
      "recipient destination",
      "input value equals payout plus miner fee"
    ],
    replayStillChecks: target.targetV1?.replayMustStillCheck || []
  },
  boundaries: [
    "This upgrades the scheduler payout money movement to an accepted covenant spend.",
    "Scheduler trigger eligibility, winning-bid selection, and stale/duplicate blocking remain replay/indexer-derived.",
    "This is not protocol scheduling or autonomous custody."
  ]
};

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
