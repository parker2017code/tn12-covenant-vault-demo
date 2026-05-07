export function buildWalletReviewReadiness(registry = {}) {
  const drafts = (registry.drafts || []).map(reviewDraft);
  const serializedRegistry = JSON.stringify(registry);
  const registrySecretFields = findSecretFieldNames(serializedRegistry);
  const ready = drafts.every((draft) => draft.status === "review-ready") && registrySecretFields.length === 0;

  return {
    schema: "tn12-wallet-review-readiness/v1",
    network: registry.network || "kaspa-testnet-12",
    status: ready ? "wallet-review-ready" : "needs-review",
    summary: {
      total: drafts.length,
      ready: drafts.filter((draft) => draft.status === "review-ready").length,
      payloadDrafts: drafts.filter((draft) => draft.payload.present).length,
      payloadRouteReady: drafts.filter((draft) => draft.payload.present && draft.payload.route === "wrpc-required").length,
      explicitSubmitCommands: drafts.filter((draft) => draft.submit.explicitSubmit).length,
      registrySecretFields: registrySecretFields.length
    },
    drafts,
    registrySecretFields,
    boundaries: [
      "This artifact reviews published signed draft summaries only.",
      "It does not connect to a wallet, inspect private keys, or broadcast transactions.",
      "Payload drafts must use the payload-preserving wRPC or wallet route; REST submit remains blocked for payload receipts.",
      "A production wallet review should show exact inputs, outputs, fees, network, payload bytes, and route before asking the user to sign."
    ]
  };
}

function reviewDraft(draft = {}) {
  const networkOk = draft.network === "kaspa-testnet-12";
  const hasTransactionId = Boolean(draft.transactionId);
  const explicitSubmit = /--submit/.test(draft.submit?.submitCommand || "");
  const payloadPresent = Boolean(draft.payload?.present);
  const payloadRouteReady = !payloadPresent || (
    draft.requiresPayloadSubmitSupport === true
    && /submit-signed-draft-wrpc/.test(draft.submit?.submitCommand || "")
    && /REST submit route/.test(draft.submit?.boundary || "")
  );
  const status = networkOk && hasTransactionId && explicitSubmit && payloadRouteReady
    ? "review-ready"
    : "needs-review";

  return {
    path: String(draft.path || ""),
    label: String(draft.label || ""),
    lane: String(draft.lane || ""),
    transactionId: draft.transactionId || null,
    status,
    network: {
      value: draft.network || "",
      ok: networkOk
    },
    payload: {
      present: payloadPresent,
      bytes: Number(draft.payload?.bytes || 0),
      route: payloadPresent ? "wrpc-required" : "standard-submit",
      routeReady: payloadRouteReady
    },
    submit: {
      explicitSubmit,
      command: draft.submit?.submitCommand || "",
      dryRunCommand: draft.submit?.dryRunCommand || "",
      restSubmitCommand: draft.submit?.restSubmitCommand || null
    },
    checks: {
      hasTransactionId,
      hasInputs: Number(draft.counts?.inputs || 0) > 0,
      hasOutputs: Number(draft.counts?.outputs || 0) > 0
    }
  };
}

function findSecretFieldNames(serialized) {
  const patterns = [
    /"privateKey"\s*:/,
    /"mnemonic"\s*:/,
    /"seed"\s*:/,
    /"secret"\s*:/
  ];
  return patterns
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}
