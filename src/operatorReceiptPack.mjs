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

  return {
    schema: "tn12-operator-receipt-pack/v1",
    network: provenStatus.network || checkpoint.network || "kaspa-testnet-12",
    generatedAt,
    status: demoReady ? "operator-receipt-pack-ready" : "operator-receipt-pack-review",
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
    nextCommandPath: [
      command("fetch-current-utxo", localCommands.fetchCurrentUtxo),
      command("build-next-receipt", localCommands.buildNextReceipt),
      command("submit-next-receipt", localCommands.submitNextReceipt),
      command("verify-and-index", localCommands.verifyAndIndex),
      command("refresh-proven-status", "npm run project:proven-status"),
      command("refresh-operator-pack", "npm run project:operator-pack")
    ],
    receiptsToShowFirst: buildReceiptPointers({ operatorLoop, payloadManifest }),
    boundaries: [
      "This pack is for TN12 demo operation, not mainnet readiness.",
      "Local wallet receipts prove the repo path, not browser wallet or external signer readiness.",
      "Deferred mainnet rails remain explicit until external signer and live rollback evidence exist."
    ]
  };
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
