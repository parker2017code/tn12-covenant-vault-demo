export function buildSchedulerCovenantBinding({
  payloadEvents = {},
  payloadEvidenceByPath = {},
  proofEvidence = {},
  roleProofEvidence = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedBindings = (payloadEvents.events || [])
    .map((event) => bindingFromEvent(event, payloadEvidenceByPath[event.outPath]))
    .filter(Boolean);
  const proofRows = [
    ...(proofEvidence.proofs || proofEvidence.results || []),
    ...(roleProofEvidence.proofs || roleProofEvidence.results || [])
  ];
  const rows = acceptedBindings.map((binding) => evaluateBinding(binding, proofRows));
  const negativeRows = buildNegativeRows(rows);
  const problems = [
    rows.length === 0 ? "no accepted scheduler covenant bindings" : "",
    rows.some((row) => row.status !== "binding-ready") ? "one or more covenant bindings do not reference accepted proof evidence" : ""
  ].filter(Boolean);

  return {
    schema: "tn12-scheduler-covenant-binding/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: problems.length === 0 ? "scheduler-covenant-binding-ready" : "scheduler-covenant-binding-review",
    enforcement: "INDEXER_DERIVED",
    summary: {
      acceptedBindings: acceptedBindings.length,
      readyBindings: rows.filter((row) => row.status === "binding-ready").length,
      scriptEnforcedPrimitiveRefs: rows.filter((row) => row.primitiveStatus === "SCRIPT_ENFORCED_REFERENCE").length,
      blockedNegativeRows: negativeRows.filter((row) => row.status === "blocked").length,
      liveProductClaims: 0,
      custodyActions: 0,
      protocolSchedulerClaims: 0,
      externalSignerClaims: 0,
      autonomousCustodyClaims: 0,
      mainnetClaims: 0
    },
    rows,
    negativeRows,
    problems,
    boundaries: [
      "The binding receipt is accepted TN12 payload evidence.",
      "The scheduler-to-primitive relationship is indexer-derived.",
      "Only the referenced covenant proof spend has script-enforced semantics, and only for that primitive's narrow path.",
      "This is not TangVM, UniSc, a protocol scheduler, autonomous custody, or mainnet activation."
    ]
  };
}

function bindingFromEvent(event = {}, evidence = {}) {
  const payload = evidence.payload?.decoded?.payload || {};
  if (payload.kind !== "scheduler-covenant-binding") return null;
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
    intentTxid: parseNoteField(payload.note || "", "intent"),
    primitive: parseNoteField(payload.note || "", "primitive"),
    proofTxid: parseNoteField(payload.note || "", "proof"),
    entrypoint: parseNoteField(payload.note || "", "entrypoint"),
    enforcement: parseNoteField(payload.note || "", "enforcement"),
    acceptingBlockBlueScore: evidence.acceptingBlockBlueScore ?? null
  };
}

function evaluateBinding(binding, proofRows) {
  const proof = proofRows.find((row) => row.txid === binding.proofTxid);
  const entrypointMatches = !binding.entrypoint || proof?.entrypoint === binding.entrypoint;
  const primitiveMatches = !binding.primitive || String(proof?.lane || "").includes(binding.primitive);
  const proofAccepted = Boolean(proof?.accepted);
  const status = proofAccepted && entrypointMatches && primitiveMatches ? "binding-ready" : "binding-review";

  return {
    id: binding.subject,
    txid: binding.txid,
    sourceEvidencePath: binding.evidencePath,
    intentTxid: binding.intentTxid,
    primitive: binding.primitive,
    proofTxid: binding.proofTxid,
    entrypoint: binding.entrypoint,
    status,
    reason: status === "binding-ready" ? "accepted-binding-references-accepted-proof-row" : "binding-reference-mismatch",
    referencedProof: proof ? {
      label: proof.label || "",
      lane: proof.lane || "",
      entrypoint: proof.entrypoint || "",
      accepted: proof.accepted === true
    } : null,
    primitiveStatus: status === "binding-ready" ? "SCRIPT_ENFORCED_REFERENCE" : "UNRESOLVED_REFERENCE",
    bindingEnforcement: "INDEXER_DERIVED"
  };
}

function buildNegativeRows(rows) {
  const first = rows[0] || {};
  return [
    {
      id: "missing-proof-reference",
      status: "blocked",
      reason: "binding cannot promote without an accepted proof txid",
      subject: first.id || "missing-subject"
    },
    {
      id: "wrong-entrypoint-reference",
      status: "blocked",
      reason: "binding entrypoint must match the referenced proof row",
      expectedEntryPoint: first.entrypoint || "",
      observedEntryPoint: "wrong-entrypoint"
    },
    {
      id: "protocol-scheduler-upgrade",
      status: "blocked",
      reason: "accepted binding payload does not upgrade indexer-derived scheduler state into protocol scheduling"
    }
  ];
}

function parseNoteField(note, field) {
  const match = String(note).match(new RegExp(`${field}=([^;]+)`, "i"));
  return match?.[1]?.trim() || "";
}
