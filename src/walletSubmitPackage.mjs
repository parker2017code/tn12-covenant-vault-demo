export function buildWalletSubmitPackage({ walletReview = {}, walletConnector = {} } = {}) {
  const drafts = walletReview.drafts || [];
  const intents = drafts.map(buildIntent);
  const payloadIntents = intents.filter((intent) => intent.payload.present);
  const contractIntents = intents.filter((intent) => intent.class === "contract-proof");
  const ready = walletReview.status === "wallet-review-ready"
    && walletConnector.status === "wallet-connector-spec-ready"
    && intents.every((intent) => intent.status === "wallet-submit-ready");

  return {
    schema: "tn12-wallet-submit-package/v1",
    network: walletReview.network || walletConnector.network || "kaspa-testnet-12",
    status: ready ? "wallet-submit-package-ready" : "wallet-submit-package-blocked",
    summary: {
      total: intents.length,
      payloadDrafts: payloadIntents.length,
      contractDrafts: contractIntents.length,
      localSecretFields: Number(walletReview.summary?.registrySecretFields || 0),
      ready: intents.filter((intent) => intent.status === "wallet-submit-ready").length
    },
    routePolicy: {
      payload: "Use payload-preserving JSON wRPC or wallet submit. Do not use public REST submit for payload drafts.",
      contract: "Preserve exact transaction version, inputs, outputs, lock time, and computeBudget fields.",
      standard: "Require user review before signing or broadcasting."
    },
    requiredReviewFields: [
      "network",
      "draft path",
      "transaction id",
      "inputs",
      "outputs",
      "fee",
      "transaction version",
      "lock time",
      "payload bytes",
      "submit route"
    ],
    intents,
    firstPayloadIntents: payloadIntents.slice(0, 5),
    boundaries: [
      "This package is a wallet handoff artifact, not a live wallet connector.",
      "It does not read `.local/tn12-wallet.json` or private key material.",
      "It assumes a wallet or RPC client can preserve exact serialized transaction fields.",
      "Payload drafts remain blocked from public REST submit because REST dropped payload bytes in testing."
    ]
  };
}

function buildIntent(draft = {}) {
  const payloadPresent = Boolean(draft.payload?.present);
  const className = classifyDraft(draft);
  const ready = draft.status === "review-ready"
    && draft.network?.ok === true
    && draft.submit?.explicitSubmit === true
    && (!payloadPresent || draft.payload?.routeReady === true);

  return {
    path: draft.path,
    label: draft.label,
    lane: draft.lane,
    class: className,
    transactionId: draft.transactionId,
    status: ready ? "wallet-submit-ready" : "wallet-submit-blocked",
    route: payloadPresent ? "payload-preserving-wrpc-or-wallet" : "exact-transaction-wallet",
    payload: {
      present: payloadPresent,
      bytes: Number(draft.payload?.bytes || 0),
      routeReady: Boolean(draft.payload?.routeReady)
    },
    submit: {
      dryRunCommand: draft.submit?.dryRunCommand || "",
      reviewedSubmitCommand: draft.submit?.command || ""
    },
    requiredWalletChecks: [
      "Confirm kaspa-testnet-12.",
      "Display exact inputs, outputs, fees, version, lock time, and payload bytes.",
      "Require explicit user action.",
      ...(payloadPresent ? ["Reject public REST payload submit."] : []),
      ...(className === "contract-proof" ? ["Preserve computeBudget and contract script arguments exactly."] : [])
    ]
  };
}

function classifyDraft(draft) {
  const lane = String(draft.lane || "");
  const path = String(draft.path || "");
  if (draft.payload?.present) return "payload-app-state";
  if (/escrow|vault|assurance/.test(path) || /contract|spend/.test(lane)) return "contract-proof";
  if (/split|funding/.test(path)) return "funding";
  return "standard-payment";
}
