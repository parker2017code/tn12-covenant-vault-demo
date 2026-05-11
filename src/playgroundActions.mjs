export function buildPlaygroundActions({
  plan = {},
  session = {},
  reducer = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const actionRows = [
    row("payload-receipt", "Submit payload receipt", "TN12_ACCEPTED_TARGET", canStart(session, "operator"), "Create a receipt payload and verify accepted txid plus payload bytes."),
    row("pool-deposit", "Submit pool deposit transfer", "LOCAL_KEY_CUSTODY_TEST", canStart(session, "user-a") && canStart(session, "pool"), "Move small tKAS from user to pool and add the txid to replay."),
    row("pool-payout", "Submit pool payout transfer", "LOCAL_KEY_CUSTODY_TEST", canStart(session, "pool") && canStart(session, "user-b"), "Move small tKAS from pool to user and add the txid to replay."),
    row("scheduler-bid", "Submit scheduler bid receipt", "TN12_ACCEPTED_TARGET", canStart(session, "executor"), "Record an executor bid against a trigger intent."),
    row("proof-binding", "Submit proof binding receipt", "TN12_ACCEPTED_TARGET", canStart(session, "operator"), "Reference an accepted covenant proof row from app state."),
    row("replay-state", "Replay txids into state", "INDEXER_DERIVED", Number(session.summary?.acceptedTxids || 0) > 0, "Reduce accepted txids into receipt, transfer, and balance rows."),
    row("bad-withdrawal-check", "Run blocked withdrawal check", "REJECTED_BY_REDUCER", Number(reducer.summary?.blockedNegativeRows || 0) > 0, "Show over-balance or unsigned withdrawal attempts blocked before promotion.")
  ];

  return {
    schema: "tn12-playground-actions/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "playground-actions-ready",
    summary: {
      actions: actionRows.length,
      readyActions: actionRows.filter((item) => item.ready).length,
      realTn12Targets: actionRows.filter((item) => item.enforcement === "TN12_ACCEPTED_TARGET" || item.enforcement === "LOCAL_KEY_CUSTODY_TEST").length,
      reducerChecks: actionRows.filter((item) => /REDUCER|INDEXER/.test(item.enforcement)).length,
      liveProductClaims: 0,
      mainnetClaims: 0,
      custodyActions: 0,
      externalSignerClaims: 0,
      privateKeysIncluded: 0
    },
    actionRows,
    sourcePlanStatus: plan.status || "",
    boundaries: [
      "Ready means the role/session prerequisites are present.",
      "TN12_ACCEPTED_TARGET actions should produce accepted txids before they are marked complete.",
      "Reducer checks explain state and blocked attempts; they do not replace accepted transaction evidence."
    ]
  };
}

function row(id, label, enforcement, ready, detail) {
  return {
    id,
    label,
    enforcement,
    ready: Boolean(ready),
    detail
  };
}

function canStart(session, roleId) {
  return (session.roles || []).some((role) => role.id === roleId && role.funded === true && /^kaspatest:/.test(role.address));
}
