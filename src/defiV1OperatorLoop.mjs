export function buildDefiV1OperatorLoop({
  firstReceipt = {},
  repeatReceipt = {},
  fundedOutpoint = {},
  previousCurrentOutpoint = {},
  currentOutpoint = {},
  walletAddress = "",
  generatedAt = new Date().toISOString()
} = {}) {
  const receipts = [
    receiptRow("first-live-receipt", firstReceipt),
    receiptRow("repeat-live-receipt", repeatReceipt)
  ];
  const acceptedReceipts = receipts.filter((receipt) => receipt.accepted && receipt.payloadMatches);
  const staleOutpoints = [
    outpointRow("initial-funding-spent", fundedOutpoint, firstReceipt),
    outpointRow("first-change-spent", previousCurrentOutpoint, repeatReceipt)
  ];
  const current = {
    txid: currentOutpoint.txid || "",
    outputIndex: Number(currentOutpoint.outputIndex ?? -1),
    amountTkas: Number(currentOutpoint.amountTkas || 0),
    address: currentOutpoint.address || "",
    spendable: Boolean(
      currentOutpoint.txid
      && currentOutpoint.address === walletAddress
      && !staleOutpoints.some((outpoint) =>
        outpoint.txid === currentOutpoint.txid && outpoint.outputIndex === Number(currentOutpoint.outputIndex)
      )
    )
  };

  return {
    schema: "tn12-defi-v1-operator-loop/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: acceptedReceipts.length === receipts.length && staleOutpoints.every((outpoint) => outpoint.consumed) && current.spendable
      ? "repeatable-live-receipt-loop-ready"
      : "needs-review",
    wallet: {
      address: walletAddress,
      localKeyPath: ".local/tn12-defi-v1-wallet.json",
      boundary: "Local testnet wallet signing only; this is not proof of browser wallet or external signer readiness."
    },
    receipts,
    staleOutpointGuards: staleOutpoints,
    currentSpendableOutpoint: current,
    commands: {
      fetchCurrentUtxo: "TN12_ADDRESS=<wallet-address> OUTPOINT_PATH=artifacts/tn12-defi-v1-current-outpoint.json UTXOS_PATH=artifacts/tn12-defi-v1-current-utxos.json node scripts/fetch-funded-utxos.mjs",
      buildNextReceipt: "KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa FUNDING_OUTPOINT=artifacts/tn12-defi-v1-current-outpoint.json TN12_WALLET=.local/tn12-defi-v1-wallet.json OUT=artifacts/signed-drafts/<next-receipt>.json AMOUNT_TKAS=1 SIGNAL_KIND=order-receipt SIGNAL_SUBJECT=<subject> SIGNAL_VALUE=paid SIGNAL_NOTE=<note> node scripts/build-signed-payload-receipt-draft.mjs",
      submitNextReceipt: "KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa KASPA_WRPC_URL=ws://65.108.107.30:18210 KASPA_WRPC_ENCODING=json KASPA_WRPC_NETWORK_ID=testnet-12 KASPA_WRPC_SUBMIT_SHAPE=object node scripts/submit-signed-draft-wrpc.mjs artifacts/signed-drafts/<next-receipt>.json --submit",
      verifyAndIndex: "npm run payload:verify:events && npm run indexer:checkpoint && npm run indexer:persist"
    },
    next: [
      "Use the current spendable outpoint, never an already consumed outpoint, for the next local-wallet TN12 receipt.",
      "After each accepted receipt, refresh artifacts/tn12-defi-v1-current-outpoint.json before building the next transaction.",
      "Replace the local wallet path with external wallet signing before claiming user-wallet readiness."
    ]
  };
}

function receiptRow(id, evidence) {
  return {
    id,
    txid: evidence.txid || "",
    subject: evidence.payload?.decoded?.payload?.subject || "",
    value: evidence.payload?.decoded?.payload?.value || "",
    accepted: Boolean(evidence.accepted),
    payloadMatches: Boolean(evidence.payload?.matches && evidence.receiptMatches),
    outputMatches: Boolean(evidence.output?.matches),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function outpointRow(id, outpoint, spendingReceipt) {
  return {
    id,
    txid: outpoint.txid || "",
    outputIndex: Number(outpoint.outputIndex ?? -1),
    amountTkas: Number(outpoint.amountTkas || 0),
    consumedBy: spendingReceipt.txid || "",
    consumed: Boolean(
      spendingReceipt.txid
      && spendingReceipt.source?.txid === outpoint.txid
      && Number(spendingReceipt.source?.outputIndex) === Number(outpoint.outputIndex)
    )
  };
}
