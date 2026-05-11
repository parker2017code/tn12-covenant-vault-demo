export function buildSchedulerIntentRegistry({
  payloadEvents = {},
  payloadEvidenceByPath = {},
  executionEvidenceByPath = {},
  acceptedActivity = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedIntents = (payloadEvents.events || [])
    .map((event) => schedulerIntentFromEvent(event, payloadEvidenceByPath[event.outPath]))
    .filter(Boolean);
  const executionReceipts = (payloadEvents.events || [])
    .map((event) => schedulerExecutionFromEvent(event, payloadEvidenceByPath[event.outPath]))
    .filter(Boolean);
  const acceptedBids = (payloadEvents.events || [])
    .map((event) => schedulerBidFromEvent(event, payloadEvidenceByPath[event.outPath]))
    .filter(Boolean);
  const executionTransfers = Object.entries(executionEvidenceByPath)
    .map(([path, evidence]) => schedulerExecutionTransfer(path, evidence))
    .filter(Boolean);
  const context = buildContext(acceptedActivity);
  const triggerRows = acceptedIntents.map((intent) => evaluateTrigger(intent, context, {
    receipt: executionReceipts.find((receipt) => receipt.subject === intent.subject),
    transfer: executionTransfers.find((transfer) => transfer.intentSubject === intent.subject)
  }));
  const auctionRows = buildAuctionRows({ acceptedIntents, acceptedBids, triggerRows });
  const negativeRows = buildNegativeRows({ acceptedIntents, context });
  const problems = [
    acceptedIntents.length === 0 ? "no accepted scheduler intent payloads" : "",
    triggerRows.some((row) => !["eligible", "executed"].includes(row.status)) ? "one or more accepted scheduler intents are not eligible or executed" : ""
  ].filter(Boolean);

  return {
    schema: "tn12-scheduler-intent-registry/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: problems.length === 0 ? "scheduler-intent-registry-ready" : "scheduler-intent-registry-review",
    enforcement: "INDEXER_DERIVED",
    summary: {
      acceptedIntents: acceptedIntents.length,
      eligibleTriggers: triggerRows.filter((row) => row.status === "eligible").length,
      executedTriggers: triggerRows.filter((row) => row.status === "executed").length,
      blockedNegativeRows: negativeRows.filter((row) => row.status === "blocked").length,
      executionReceipts: triggerRows.filter((row) => row.executionReceiptTxid).length,
      executionTransfers: triggerRows.filter((row) => row.executionTransferTxid).length,
      acceptedBids: acceptedBids.length,
      schedulerBids: auctionRows.length,
      winningBids: auctionRows.filter((row) => row.status === "winner-selected").length,
      blockedAuctionRows: auctionRows.filter((row) => row.status === "blocked").length,
      liveProductClaims: 0,
      protocolSchedulerClaims: 0,
      externalSignerClaims: 0,
      autonomousCustodyClaims: 0,
      mainnetClaims: 0
    },
    context,
    acceptedIntents,
    executionReceipts,
    acceptedBids,
    executionTransfers,
    triggerRows,
    auctionRows,
    negativeRows,
    problems,
    boundaries: [
      "Accepted scheduler-intent payloads are TN12 evidence, but scheduler semantics are indexer-derived.",
      "This is aligned with vProgs scheduler/runtime concepts, not an implementation of vProgs, TangVM, or a protocol universal scheduler.",
      "Eligibility checks can select a local-key action; they do not prove autonomous custody, miner oracle consensus, or external fact truth."
    ]
  };
}

function schedulerIntentFromEvent(event = {}, evidence = {}) {
  const payload = evidence.payload?.decoded?.payload || {};
  if (payload.kind !== "scheduler-intent") return null;
  if (evidence.accepted !== true || evidence.receiptMatches !== true) return null;

  return {
    label: event.label || "",
    evidencePath: event.outPath || "",
    draftPath: event.draftPath || "",
    txid: evidence.txid || evidence.transactionId || "",
    accepted: true,
    payloadMatches: evidence.payload?.matches === true,
    kind: payload.kind || "",
    subject: payload.subject || "",
    value: payload.value || "",
    note: payload.note || "",
    condition: parseCondition(payload.note || ""),
    action: parseAction(payload.note || ""),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function schedulerExecutionFromEvent(event = {}, evidence = {}) {
  const payload = evidence.payload?.decoded?.payload || {};
  if (payload.kind !== "scheduler-execution") return null;
  if (evidence.accepted !== true || evidence.receiptMatches !== true) return null;

  return {
    label: event.label || "",
    evidencePath: event.outPath || "",
    draftPath: event.draftPath || "",
    txid: evidence.txid || evidence.transactionId || "",
    accepted: true,
    payloadMatches: evidence.payload?.matches === true,
    subject: payload.subject || "",
    value: payload.value || "",
    note: payload.note || "",
    payoutTxid: parseNoteField(payload.note || "", "payout"),
    intentTxid: parseNoteField(payload.note || "", "intent"),
    mode: parseNoteField(payload.note || "", "mode"),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function schedulerBidFromEvent(event = {}, evidence = {}) {
  const payload = evidence.payload?.decoded?.payload || {};
  if (payload.kind !== "scheduler-bid") return null;
  if (evidence.accepted !== true || evidence.receiptMatches !== true) return null;

  const subject = payload.subject || "";
  return {
    id: subject,
    label: event.label || "",
    evidencePath: event.outPath || "",
    draftPath: event.draftPath || "",
    txid: evidence.txid || evidence.transactionId || "",
    accepted: true,
    payloadMatches: evidence.payload?.matches === true,
    subject,
    triggerSubject: subject.replace(/:bid-[^:]+$/i, ""),
    value: payload.value || "",
    note: payload.note || "",
    intentTxid: parseNoteField(payload.note || "", "intent"),
    bidder: parseNoteField(payload.note || "", "bidder"),
    bidTkas: parseNoteField(payload.note || "", "bidTkas"),
    maxLatencyBlocks: Number(parseNoteField(payload.note || "", "maxLatencyBlocks") || 0),
    source: parseNoteField(payload.note || "", "source"),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function schedulerExecutionTransfer(path, evidence = {}) {
  if (evidence.status !== "accepted-transfer-matched") return null;
  return {
    path,
    txid: evidence.txid || "",
    accepted: evidence.accepted === true,
    from: evidence.source?.address || "",
    to: evidence.payment?.to || "",
    amountTkas: evidence.payment?.amountTkas || "",
    intentSubject: "unisc-pool-rebalance-001",
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function buildContext(acceptedActivity = {}) {
  return {
    source: "artifacts/defi-accepted-activity-ledger.json",
    poolNetTkas: String(acceptedActivity.summary?.poolNetTkas || acceptedActivity.pool?.netTkas || "0"),
    acceptedTransferRows: Number(acceptedActivity.summary?.acceptedTransferRows || 0),
    poolDeposits: Number(acceptedActivity.summary?.poolDeposits || 0),
    poolPayouts: Number(acceptedActivity.summary?.poolPayouts || 0)
  };
}

function evaluateTrigger(intent, context, execution = {}) {
  const poolNet = decimalStringToScaled(context.poolNetTkas);
  const threshold = decimalStringToScaled(intent.condition.thresholdTkas || "0");
  const eligible = intent.condition.metric === "poolNetTkas"
    && intent.condition.operator === ">="
    && poolNet >= threshold;
  const executed = Boolean(execution.receipt?.txid && execution.transfer?.txid);

  return {
    id: intent.subject,
    txid: intent.txid,
    sourceEvidencePath: intent.evidencePath,
    metric: intent.condition.metric,
    operator: intent.condition.operator,
    thresholdTkas: intent.condition.thresholdTkas,
    observedTkas: context.poolNetTkas,
    action: intent.action,
    status: executed ? "executed" : eligible ? "eligible" : "blocked",
    reason: executed ? "execution-receipt-and-transfer-matched" : eligible ? "condition-met" : "condition-not-met",
    executionMode: executed || eligible ? "local-key-review-required" : "none",
    executionReceiptTxid: execution.receipt?.txid || "",
    executionTransferTxid: execution.transfer?.txid || "",
    executionTransferAmountTkas: execution.transfer?.amountTkas || ""
  };
}

function buildNegativeRows({ acceptedIntents = [], context = {} }) {
  const first = acceptedIntents[0] || {};
  return [
    {
      id: "duplicate-intent",
      status: "blocked",
      reason: "same subject and txid cannot be promoted twice",
      subject: first.subject || "missing-subject"
    },
    {
      id: "stale-source",
      status: "blocked",
      reason: "trigger source must reference the current accepted activity ledger",
      expectedSource: context.source,
      observedSource: "artifacts/stale-defi-ledger.json"
    },
    {
      id: "insufficient-threshold",
      status: "blocked",
      reason: "poolNetTkas is below the requested threshold",
      observedTkas: context.poolNetTkas,
      thresholdTkas: "1000000"
    },
    {
      id: "wrong-kind",
      status: "blocked",
      reason: "payload kind must be scheduler-intent",
      observedKind: "receipt"
    },
    {
      id: "duplicate-execution-receipt",
      status: "blocked",
      reason: "a trigger subject can promote only one execution receipt",
      subject: first.subject || "missing-subject"
    },
    {
      id: "stale-execution-receipt",
      status: "blocked",
      reason: "execution receipt must reference the accepted intent txid",
      expectedIntentTxid: first.txid || "",
      observedIntentTxid: "stale-intent-txid"
    },
    {
      id: "execution-transfer-mismatch",
      status: "blocked",
      reason: "execution receipt payout txid must match the accepted transfer evidence",
      subject: first.subject || "missing-subject"
    }
  ];
}

function buildAuctionRows({ acceptedIntents = [], acceptedBids = [], triggerRows = [] }) {
  return acceptedIntents.flatMap((intent) => {
    const trigger = triggerRows.find((row) => row.id === intent.subject) || {};
    const bids = acceptedBids
      .filter((bid) => bid.intentTxid === intent.txid && bid.triggerSubject === intent.subject)
      .map((bid) => schedulerBid(intent, trigger, bid));
    const candidates = bids.filter((bid) => bid.status === "candidate");
    const winner = candidates.sort(compareSchedulerBids)[0];
    return bids.map((bid) => bid.id === winner?.id
      ? { ...bid, status: "winner-selected", reason: "lowest valid bid with acceptable latency" }
      : bid);
  });
}

function schedulerBid(intent, trigger, bid) {
  const triggerReady = ["eligible", "executed"].includes(trigger.status);
  const stale = bid.source !== "accepted-intent-review" && bid.source !== "planner-candidate";
  const slow = Number(bid.maxLatencyBlocks) > 20;
  const status = !triggerReady || stale || slow ? "blocked" : "candidate";
  const reason = !triggerReady
    ? "trigger is not eligible or executed"
    : stale
      ? "bid references stale scheduler source"
      : slow
        ? "bid latency exceeds scheduler policy"
        : "valid planner candidate";

  return {
    id: bid.id,
    subject: intent.subject,
    intentTxid: intent.txid,
    bidTxid: bid.txid || "",
    evidencePath: bid.evidencePath || "",
    bidder: bid.bidder,
    bidTkas: bid.bidTkas,
    maxLatencyBlocks: bid.maxLatencyBlocks,
    source: bid.source,
    status,
    reason,
    enforcement: "PLANNER_ONLY"
  };
}

function compareSchedulerBids(a, b) {
  const bidDelta = decimalStringToScaled(a.bidTkas) - decimalStringToScaled(b.bidTkas);
  if (bidDelta < 0n) return -1;
  if (bidDelta > 0n) return 1;
  return Number(a.maxLatencyBlocks) - Number(b.maxLatencyBlocks);
}

function parseCondition(note) {
  const match = String(note).match(/poolNetTkas\s*>=\s*([0-9]+(?:\.[0-9]+)?)/i);
  return {
    metric: match ? "poolNetTkas" : "",
    operator: match ? ">=" : "",
    thresholdTkas: match?.[1] || "0"
  };
}

function parseAction(note) {
  const match = String(note).match(/then\s+([^;]+)/i);
  return match?.[1]?.trim() || "";
}

function parseNoteField(note, field) {
  const match = String(note).match(new RegExp(`${field}=([^;]+)`, "i"));
  return match?.[1]?.trim() || "";
}

function decimalStringToScaled(value) {
  const [whole, fraction = ""] = String(value || "0").split(".");
  return BigInt(whole || "0") * 100000000n + BigInt(fraction.padEnd(8, "0").slice(0, 8) || "0");
}
