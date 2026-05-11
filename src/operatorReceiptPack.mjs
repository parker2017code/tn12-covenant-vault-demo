export function buildOperatorReceiptPack({
  provenStatus = {},
  checkpoint = {},
  proofEvidence = {},
  roleProofEvidence = {},
  payloadManifest = {},
  operatorLoop = {},
  submitLedger = {},
  auctionCustodyReview = {},
  agentSettlementReview = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedEvidence = provenStatus.acceptedEvidence || {};
  const localCommands = operatorLoop.commands || {};
  const demoReady = Array.isArray(provenStatus.demoBlockers) && provenStatus.demoBlockers.length === 0;
  const reviewProblems = buildReviewProblems({
    acceptedEvidence,
    payloadManifest,
    operatorLoop,
    checkpoint
  });

  return {
    schema: "tn12-operator-receipt-pack/v1",
    network: provenStatus.network || checkpoint.network || "kaspa-testnet-12",
    generatedAt,
    status: demoReady && reviewProblems.length === 0 ? "operator-receipt-pack-ready" : "operator-receipt-pack-review",
    currentPercent: provenStatus.currentPercent || "unknown",
    evidence: {
      checkpointRecords: Number(acceptedEvidence.checkpointRecords || checkpoint.summary?.total || 0),
      matchedRecords: Number(acceptedEvidence.matchedRecords || checkpoint.summary?.matched || 0),
      coreProofTransactions: Number(acceptedEvidence.proofTransactions || proofEvidence.summary?.accepted || 0),
      roleSeparatedProofTransactions: Number(acceptedEvidence.roleSeparatedProofTransactions || roleProofEvidence.summary?.accepted || 0),
      payloadEvents: Number(acceptedEvidence.payloadEvents || checkpoint.summary?.payloadEvents || 0),
      manifestEvents: Array.isArray(payloadManifest.events) ? payloadManifest.events.length : 0,
      outputEvidence: Number(acceptedEvidence.outputEvidence || checkpoint.summary?.outputEvidence || 0)
    },
    custody: {
      auctionReadyRows: Number(auctionCustodyReview.summary?.custodyReadyRows || 0),
      auctionAmountMatchedRows: Number(auctionCustodyReview.summary?.amountMatchedRows || 0),
      agentReadyRows: Number(agentSettlementReview.summary?.custodyReadyRows || 0),
      agentAmountMatchedRows: Number(agentSettlementReview.summary?.amountMatchedRows || 0)
    },
    wallet: {
      mode: "local-testnet-wallet",
      address: operatorLoop.wallet?.address || "",
      boundary: operatorLoop.wallet?.boundary || "Local testnet wallet only.",
      currentSpendableOutpoint: operatorLoop.currentSpendableOutpoint || null,
      acceptedReceipts: Array.isArray(operatorLoop.receipts)
        ? operatorLoop.receipts.filter((receipt) => receipt.accepted === true).map(summarizeReceipt)
        : [],
      ledgerAcceptedEvidenceRows: Number(submitLedger.summary?.acceptedEvidence || 0),
      ledgerPendingWalletSubmitRows: Number(submitLedger.summary?.pendingWalletSubmit || 0)
    },
    deferredMainnetRails: provenStatus.mainnetDeferredBlockers || [],
    reviewProblems,
    nextCommandPath: [
      command("fetch-current-utxo", localCommands.fetchCurrentUtxo),
      command("build-next-receipt", localCommands.buildNextReceipt),
      command("submit-next-receipt", localCommands.submitNextReceipt),
      command("verify-and-index", localCommands.verifyAndIndex),
      command("refresh-proven-status", "npm run project:proven-status"),
      command("refresh-operator-pack", "npm run project:operator-pack"),
      command("full-operator-refresh", "npm run demo:operator-refresh")
    ],
    receiptsToShowFirst: buildReceiptPointers({ operatorLoop, payloadManifest }),
    boundaries: [
      "This pack is for TN12 demo operation, not mainnet readiness.",
      "Local wallet receipts prove the repo path, not browser wallet or external signer readiness.",
      "Deferred mainnet rails remain explicit until external signer and live rollback evidence exist."
    ]
  };
}

function buildReviewProblems({ acceptedEvidence, payloadManifest, operatorLoop, checkpoint }) {
  const problems = [];
  const payloadEvents = Number(acceptedEvidence.payloadEvents || checkpoint.summary?.payloadEvents || 0);
  const manifestEvents = Array.isArray(payloadManifest.events) ? payloadManifest.events.length : 0;
  const receipts = Array.isArray(operatorLoop.receipts) ? operatorLoop.receipts : [];
  const current = operatorLoop.currentSpendableOutpoint || {};

  if (payloadEvents !== manifestEvents) problems.push("payload manifest count does not match accepted payload event count");
  if (!current.spendable) problems.push("current local-wallet outpoint is not marked spendable");
  if (receipts.length === 0) problems.push("no local-wallet receipts recorded");
  if (receipts.some((receipt) => !receipt.accepted || !receipt.payloadMatches || !receipt.txid)) {
    problems.push("one or more local-wallet receipts are not accepted and payload-matched");
  }
  if (Number(checkpoint.summary?.mismatches || 0) > 0) problems.push("checkpoint has mismatched records");

  return problems;
}

function command(id, value = "") {
  return {
    id,
    command: value,
    ready: Boolean(value)
  };
}

function summarizeReceipt(receipt) {
  return {
    id: receipt.id || "",
    txid: receipt.txid || "",
    subject: receipt.subject || "",
    value: receipt.value || "",
    acceptingBlockBlueScore: receipt.acceptingBlockBlueScore || null
  };
}

function buildReceiptPointers({ operatorLoop, payloadManifest }) {
  const loopSubjects = new Set((operatorLoop.receipts || []).map((receipt) => receipt.subject));
  return (payloadManifest.events || [])
    .filter((event) => /receipt|auction|agent/i.test(event.label || "") || loopSubjects.has(event.subject))
    .slice(0, 12)
    .map((event) => ({
      label: event.label || "",
      evidencePath: event.outPath || "",
      draftPath: event.draftPath || ""
    }));
}
