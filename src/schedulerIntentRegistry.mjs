export function buildSchedulerIntentRegistry({
  payloadEvents = {},
  payloadEvidenceByPath = {},
  acceptedActivity = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedIntents = (payloadEvents.events || [])
    .map((event) => schedulerIntentFromEvent(event, payloadEvidenceByPath[event.outPath]))
    .filter(Boolean);
  const context = buildContext(acceptedActivity);
  const triggerRows = acceptedIntents.map((intent) => evaluateTrigger(intent, context));
  const negativeRows = buildNegativeRows({ acceptedIntents, context });
  const problems = [
    acceptedIntents.length === 0 ? "no accepted scheduler intent payloads" : "",
    triggerRows.some((row) => row.status !== "eligible") ? "one or more accepted scheduler intents are not eligible" : ""
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
      blockedNegativeRows: negativeRows.filter((row) => row.status === "blocked").length,
      executionReceipts: triggerRows.filter((row) => row.executionReceiptTxid).length,
      liveProductClaims: 0,
      protocolSchedulerClaims: 0,
      externalSignerClaims: 0,
      autonomousCustodyClaims: 0,
      mainnetClaims: 0
    },
    context,
    acceptedIntents,
    triggerRows,
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
  if (payload.kind !== "scheduler-intent" && !/scheduler/i.test(event.label || "")) return null;
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

function buildContext(acceptedActivity = {}) {
  return {
    source: "artifacts/defi-accepted-activity-ledger.json",
    poolNetTkas: String(acceptedActivity.summary?.poolNetTkas || acceptedActivity.pool?.netTkas || "0"),
    acceptedTransferRows: Number(acceptedActivity.summary?.acceptedTransferRows || 0),
    poolDeposits: Number(acceptedActivity.summary?.poolDeposits || 0),
    poolPayouts: Number(acceptedActivity.summary?.poolPayouts || 0)
  };
}

function evaluateTrigger(intent, context) {
  const poolNet = decimalStringToScaled(context.poolNetTkas);
  const threshold = decimalStringToScaled(intent.condition.thresholdTkas || "0");
  const eligible = intent.condition.metric === "poolNetTkas"
    && intent.condition.operator === ">="
    && poolNet >= threshold;

  return {
    id: intent.subject,
    txid: intent.txid,
    sourceEvidencePath: intent.evidencePath,
    metric: intent.condition.metric,
    operator: intent.condition.operator,
    thresholdTkas: intent.condition.thresholdTkas,
    observedTkas: context.poolNetTkas,
    action: intent.action,
    status: eligible ? "eligible" : "blocked",
    reason: eligible ? "condition-met" : "condition-not-met",
    executionMode: eligible ? "local-key-review-required" : "none",
    executionReceiptTxid: ""
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
    }
  ];
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

function decimalStringToScaled(value) {
  const [whole, fraction = ""] = String(value || "0").split(".");
  return BigInt(whole || "0") * 100000000n + BigInt(fraction.padEnd(8, "0").slice(0, 8) || "0");
}
