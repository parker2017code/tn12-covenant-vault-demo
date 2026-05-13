export function buildSchedulerCovenantSettlementTarget({
  workbench = {},
  intentRegistry = {},
  binding = {},
  payoutEvidence = null,
  negativeEvidence = null,
  generatedAt = new Date().toISOString()
} = {}) {
  const executedTrigger = (intentRegistry.triggerRows || [])
    .find((row) => row.status === "executed") || {};
  const executionTransfer = (intentRegistry.executionTransfers || [])
    .find((row) => row.txid === executedTrigger.executionTransferTxid)
    || intentRegistry.executionTransfers?.[0]
    || {};
  const executionReceipt = (intentRegistry.executionReceipts || [])
    .find((row) => row.txid === executedTrigger.executionReceiptTxid)
    || intentRegistry.executionReceipts?.[0]
    || {};
  const intent = (intentRegistry.acceptedIntents || [])
    .find((row) => row.txid === executedTrigger.txid)
    || intentRegistry.acceptedIntents?.[0]
    || {};
  const winningBid = (intentRegistry.auctionRows || [])
    .find((row) => row.status === "winner-selected") || {};
  const bindingRow = (binding.rows || [])[0] || {};
  const acceptedPayout = payoutEvidence?.status === "accepted-covenant-payout-spend";
  const negativeRows = Array.isArray(negativeEvidence?.cases) ? negativeEvidence.cases : [];

  return {
    schema: "tn12-scheduler-covenant-settlement-target/v1",
    network: workbench.network || intentRegistry.network || "kaspa-testnet-12",
    generatedAt,
    status: acceptedPayout ? "accepted-covenant-payout-spend" : "fresh-covenant-settlement-output-required",
    experiment: "scheduler-receipt-evidence",
    purpose: acceptedPayout
      ? "Record the accepted scheduler covenant payout spend without claiming protocol scheduling."
      : "Turn the accepted scheduler receipt flow into a covenant settlement target without claiming protocol scheduling.",
    currentEvidence: {
      intentTxid: intent.txid || "",
      executionReceiptTxid: executionReceipt.txid || "",
      executionTransferTxid: executionTransfer.txid || "",
      executionTransferAmountTkas: executionTransfer.amountTkas || "",
      executionTransferDestination: executionTransfer.to || "",
      winningBidTxid: winningBid.bidTxid || "",
      bindingTxid: bindingRow.txid || "",
      bindingPrimitive: bindingRow.primitive || "",
      workbenchStatus: workbench.status || "",
      intentEnforcement: intentRegistry.enforcement || "",
      bindingEnforcement: binding.enforcement || "",
      covenantPayoutFundingTxid: payoutEvidence?.funding?.txid || "",
      covenantPayoutReleaseTxid: payoutEvidence?.release?.txid || "",
      covenantPayoutDestination: payoutEvidence?.release?.destination || "",
      covenantPayoutAmountTkas: payoutEvidence?.release?.amountTkas || "",
      covenantPayoutStatus: payoutEvidence?.status || "",
      covenantPayoutNegativeStatus: negativeEvidence?.status || "",
      covenantPayoutNegativeCases: negativeRows.filter((row) => row.expected === false).map((row) => row.id)
    },
    targetV1: {
      contractPattern: "guarded payout covenant output plus scheduler replay eligibility",
      preferredExistingContract: acceptedPayout ? "contracts/SchedulerCovenantPayout.sil" : "contracts/RecurringTreasuryVaultWindow.sil",
      route: acceptedPayout
        ? "accepted covenant output spent only to the intended recipient after replay-selected scheduler evidence"
        : "fund a fresh covenant output with the payout amount, then spend it only to the intended recipient while replay confirms the scheduler intent, bid, and execution receipt",
      payout: {
        amountTkas: payoutEvidence?.release?.amountTkas || executionTransfer.amountTkas || "",
        destination: payoutEvidence?.release?.destination || executionTransfer.to || "",
        intentSubject: executedTrigger.id || intent.subject || "",
        expectedExecutionReceipt: executionReceipt.txid || "",
        expectedWinningBid: winningBid.bidTxid || ""
      },
      scriptCanEnforce: [
        "operator signature",
        "payout amount",
        "destination output",
        "terminal payout shape",
        "input value equals payout plus miner fee"
      ],
      replayMustStillCheck: [
        "intent receipt was accepted",
        "winning bid is valid under scheduler policy",
        "trigger source is current",
        "duplicate and stale execution rows are blocked",
        "execution receipt references the same intent and payout"
      ]
    },
    acceptedCovenantPayout: acceptedPayout ? {
      fundingTxid: payoutEvidence.funding.txid,
      releaseTxid: payoutEvidence.release.txid,
      covenantId: payoutEvidence.funding.covenantId,
      destination: payoutEvidence.release.destination,
      amountTkas: payoutEvidence.release.amountTkas,
      scriptEnforces: payoutEvidence.summary?.scriptEnforces || []
    } : null,
    localNegativePayoutEvidence: negativeEvidence?.status ? {
      status: negativeEvidence.status,
      cases: negativeRows.map((row) => ({
        id: row.id,
        got: row.got,
        expected: row.expected,
        status: row.status
      }))
    } : null,
    localChecksNeeded: acceptedPayout ? [
      negativeEvidence?.status === "local-payout-negative-candidates-passed"
        ? "keep wrong recipient, wrong amount, and wrong input-value rows linked to wallet review"
        : "add local negative candidates for wrong destination and wrong payout amount",
      "tie the wallet approval prompt to the accepted intent, winning bid, execution receipt, and covenant output"
    ] : [
      "build a fresh covenant payout output for the scheduler action",
      "prove exact destination and amount pass",
      "prove wrong destination, wrong amount, stale source, and duplicate execution fail",
      "tie the wallet approval prompt to the accepted intent, winning bid, execution receipt, and covenant output"
    ],
    nextTn12Run: acceptedPayout ? [
      "keep stale/duplicate/too-slow rows as blocked replay evidence",
      negativeEvidence?.status === "local-payout-negative-candidates-passed"
        ? "keep wrong-recipient, wrong-amount, and wrong-input-value local payout rejects attached to review"
        : "add negative payout candidates locally before attempting broadcast-rejected rows",
      "connect the accepted covenant payout to a wallet-readable approval summary"
    ] : [
      "fund a fresh covenant settlement output for the scheduler payout",
      "build one spend candidate after replay marks the trigger eligible",
      "submit the covenant spend and record accepted txid",
      "keep stale/duplicate/too-slow rows as blocked replay evidence",
      "upgrade only the payout spend to covenant-settlement evidence; keep scheduling itself indexer-derived"
    ],
    blockers: [
      "scheduler eligibility remains replay/indexer-derived until a covenant, ZK proof, or protocol primitive verifies it",
      "wallet-standard signing is still separate from the local-key custody test"
    ],
    boundaries: [
      acceptedPayout
        ? "This upgrades only the payout money movement to accepted covenant-settlement evidence."
        : "This is a target artifact, not accepted scheduler covenant-settlement evidence.",
      "A covenant payout can constrain the money movement; it does not make the scheduler a protocol scheduler.",
      acceptedPayout
        ? "Do not call scheduler trigger eligibility protocol-enforced."
        : "Do not call Scheduler covenant-settled until a fresh covenant settlement output is spent on TN12."
    ]
  };
}
