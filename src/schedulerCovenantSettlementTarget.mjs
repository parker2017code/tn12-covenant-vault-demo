export function buildSchedulerCovenantSettlementTarget({
  workbench = {},
  intentRegistry = {},
  binding = {},
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

  return {
    schema: "tn12-scheduler-covenant-settlement-target/v1",
    network: workbench.network || intentRegistry.network || "kaspa-testnet-12",
    generatedAt,
    status: "fresh-covenant-settlement-output-required",
    experiment: "scheduler-receipt-evidence",
    purpose: "Turn the accepted scheduler receipt flow into a covenant settlement target without claiming protocol scheduling.",
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
      bindingEnforcement: binding.enforcement || ""
    },
    targetV1: {
      contractPattern: "guarded payout covenant output plus scheduler replay eligibility",
      preferredExistingContract: "contracts/RecurringTreasuryVaultWindow.sil",
      route: "fund a fresh covenant output with the payout amount, then spend it only to the intended recipient while replay confirms the scheduler intent, bid, and execution receipt",
      payout: {
        amountTkas: executionTransfer.amountTkas || "",
        destination: executionTransfer.to || "",
        intentSubject: executedTrigger.id || intent.subject || "",
        expectedExecutionReceipt: executionReceipt.txid || "",
        expectedWinningBid: winningBid.bidTxid || ""
      },
      scriptCanEnforce: [
        "payout amount",
        "destination output",
        "covenant continuation or terminal payout shape",
        "owner/operator signature if the selected contract requires it"
      ],
      replayMustStillCheck: [
        "intent receipt was accepted",
        "winning bid is valid under scheduler policy",
        "trigger source is current",
        "duplicate and stale execution rows are blocked",
        "execution receipt references the same intent and payout"
      ]
    },
    localChecksNeeded: [
      "build a fresh covenant payout output for the scheduler action",
      "prove exact destination and amount pass",
      "prove wrong destination, wrong amount, stale source, and duplicate execution fail",
      "tie the wallet approval prompt to the accepted intent, winning bid, execution receipt, and covenant output"
    ],
    nextTn12Run: [
      "fund a fresh covenant settlement output for the scheduler payout",
      "build one spend candidate after replay marks the trigger eligible",
      "submit the covenant spend and record accepted txid",
      "keep stale/duplicate/too-slow rows as blocked replay evidence",
      "upgrade only the payout spend to covenant-settlement evidence; keep scheduling itself indexer-derived"
    ],
    blockers: [
      "current payout transfer is local-key P2PK evidence, not a covenant spend",
      "scheduler eligibility remains replay/indexer-derived until a covenant, ZK proof, or protocol primitive verifies it",
      "wallet-standard signing is still separate from the local-key custody test"
    ],
    boundaries: [
      "This is a target artifact, not accepted scheduler covenant-settlement evidence.",
      "A covenant payout can constrain the money movement; it does not make the scheduler a protocol scheduler.",
      "Do not call Scheduler covenant-settled until a fresh covenant settlement output is spent on TN12."
    ]
  };
}
