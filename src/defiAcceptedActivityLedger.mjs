const POOL_DEPOSIT = "pool-deposit";
const POOL_PAYOUT = "pool-payout";

export function buildDefiAcceptedActivityLedger({
  payloadEvents = {},
  payloadEvidenceByPath = {},
  transferEvidenceByPath = {},
  poolAddress = "",
  generatedAt = new Date().toISOString()
} = {}) {
  const receiptRows = (payloadEvents.events || [])
    .filter((event) => /defi/i.test(event.label || ""))
    .map((event) => receiptRow(event, payloadEvidenceByPath[event.outPath]))
    .filter(Boolean);
  const transferRows = Object.entries(transferEvidenceByPath)
    .flatMap(([path, evidence]) => transferRowsFromEvidence(path, evidence, poolAddress))
    .filter(Boolean);
  const acceptedTransferRows = transferRows.filter((row) => row.accepted && row.matches);
  const balances = reduceBalances(acceptedTransferRows);
  const pool = {
    address: poolAddress,
    depositsTkas: sompiToTkas(sumSompi(acceptedTransferRows.filter((row) => row.kind === POOL_DEPOSIT))),
    payoutsTkas: sompiToTkas(sumSompi(acceptedTransferRows.filter((row) => row.kind === POOL_PAYOUT))),
    netTkas: sompiToTkas(
      sumSompi(acceptedTransferRows.filter((row) => row.kind === POOL_DEPOSIT))
      - sumSompi(acceptedTransferRows.filter((row) => row.kind === POOL_PAYOUT))
    )
  };
  const problems = [
    receiptRows.some((row) => !row.accepted || !row.payloadMatches) ? "one or more DeFi payload receipts are not accepted/matched" : "",
    transferRows.some((row) => !row.accepted || !row.matches) ? "one or more DeFi transfer rows are not accepted/matched" : "",
    acceptedTransferRows.length === 0 ? "no accepted DeFi transfer rows" : ""
  ].filter(Boolean);

  return {
    schema: "tn12-defi-accepted-activity-ledger/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: problems.length === 0 ? "accepted-activity-ledger-ready" : "accepted-activity-ledger-review",
    enforcement: "LOCAL_KEY_CUSTODY_TEST",
    summary: {
      acceptedReceiptRows: receiptRows.filter((row) => row.accepted && row.payloadMatches).length,
      acceptedTransferRows: acceptedTransferRows.length,
      poolDeposits: acceptedTransferRows.filter((row) => row.kind === POOL_DEPOSIT).length,
      poolPayouts: acceptedTransferRows.filter((row) => row.kind === POOL_PAYOUT).length,
      participantAddresses: new Set(acceptedTransferRows.flatMap((row) => [row.from, row.to]).filter(Boolean)).size,
      poolNetTkas: pool.netTkas,
      liveProductClaims: 0,
      externalSignerClaims: 0,
      autonomousCustodyClaims: 0,
      mainnetClaims: 0
    },
    pool,
    receiptRows,
    transferRows,
    balances,
    problems,
    boundaries: [
      "These rows are real accepted TN12 local-key transactions.",
      "Custody movement is operator/local-key custody, not autonomous AMM or liquidation enforcement.",
      "AMM pricing, oracle truth, and liquidation authority remain planner/indexer-derived until script or wallet policy enforces them."
    ]
  };
}

function receiptRow(event, evidence = {}) {
  return {
    label: event.label || "",
    evidencePath: event.outPath || "",
    txid: evidence.txid || "",
    accepted: evidence.accepted === true,
    payloadMatches: evidence.payload?.matches === true && evidence.receiptMatches === true,
    subject: evidence.payload?.decoded?.payload?.subject || evidence.invoiceId || "",
    value: evidence.payload?.decoded?.payload?.value || "",
    note: evidence.payload?.decoded?.payload?.note || "",
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function transferRowsFromEvidence(path, evidence = {}, poolAddress = "") {
  if (evidence.schema === "tn12-multi-p2pk-transfer-evidence/v1") {
    return (evidence.outputs || [])
      .filter((output) => output.label !== "change")
      .map((output) => transferRowFromOutput(path, evidence, output, poolAddress));
  }

  return [transferRowFromOutput(path, evidence, {
    label: labelFromPath(path),
    expected: {
      address: evidence.payment?.to || "",
      amountSompi: evidence.payment?.amountSompi || "0"
    },
    observed: evidence.output?.observed || null,
    matches: evidence.output?.amountMatches !== false && evidence.output?.addressMatches !== false && evidence.output?.matches !== false
  }, poolAddress)];
}

function transferRowFromOutput(path, evidence, output, poolAddress) {
  const to = output.expected?.address || output.observed?.address || "";
  const from = evidence.source?.address || "";
  const amountSompi = BigInt(output.expected?.amountSompi || output.observed?.amountSompi || 0);
  return {
    path,
    label: output.label || labelFromPath(path),
    kind: classifyTransfer({ path, to, from, poolAddress }),
    txid: evidence.txid || "",
    accepted: evidence.accepted === true,
    matches: output.matches === true,
    from,
    to,
    amountTkas: sompiToTkas(amountSompi),
    amountSompi: amountSompi.toString(),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function classifyTransfer({ path, to, from, poolAddress }) {
  if (/funding/.test(path)) return "user-funding";
  if (to === poolAddress) return POOL_DEPOSIT;
  if (from === poolAddress) return POOL_PAYOUT;
  return "transfer";
}

function labelFromPath(path) {
  return path.replace(/^artifacts\/|\.json$/g, "");
}

function reduceBalances(rows) {
  const balances = new Map();
  for (const row of rows) {
    const amount = BigInt(row.amountSompi);
    if (row.from) balances.set(row.from, (balances.get(row.from) || 0n) - amount);
    if (row.to) balances.set(row.to, (balances.get(row.to) || 0n) + amount);
  }
  return [...balances.entries()].map(([address, netSompi]) => ({
    address,
    netTkas: sompiToTkas(netSompi),
    netSompi: netSompi.toString()
  }));
}

function sumSompi(rows) {
  return rows.reduce((total, row) => total + BigInt(row.amountSompi || 0), 0n);
}

function sompiToTkas(sompi) {
  const sign = sompi < 0n ? "-" : "";
  const value = sompi < 0n ? -sompi : sompi;
  const whole = value / 100000000n;
  const fraction = value % 100000000n;
  if (fraction === 0n) return `${sign}${whole}`;
  return `${sign}${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
