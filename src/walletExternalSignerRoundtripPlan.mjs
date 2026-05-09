export function buildWalletExternalSignerRoundtripPlan({
  standardRequests = {},
  signerValidation = {},
  endpointRunbook = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const requests = Array.isArray(standardRequests.requests) ? standardRequests.requests : [];
  const pending = new Set((signerValidation.validations || [])
    .filter((row) => row.status === "pending-external-signer")
    .map((row) => row.requestId));
  const rows = requests.map((request, index) => buildRow({ request, index, pending }));
  const firstPayload = rows.find((row) => row.kind === "payload-receipt") || null;
  const firstCovenant = rows.find((row) => row.computeBudgetInputs > 0) || null;

  return {
    schema: "tn12-wallet-external-signer-roundtrip-plan/v1",
    network: standardRequests.network || "kaspa-testnet-12",
    generatedAt,
    status: rows.length > 0 ? "external-signer-roundtrip-plan-ready" : "external-signer-roundtrip-plan-review",
    liveWalletIntegrationReady: false,
    summary: {
      requests: rows.length,
      pendingExternalSigner: rows.filter((row) => row.pendingExternalSigner).length,
      payloadRequests: rows.filter((row) => row.kind === "payload-receipt").length,
      covenantRequests: rows.filter((row) => row.kind === "covenant-spend").length,
      computeBudgetRequests: rows.filter((row) => row.computeBudgetInputs > 0).length,
      liveEndpointTested: endpointRunbook.summary?.liveWindowReady === true,
      appStatePromoted: endpointRunbook.summary?.appStatePromoted === true
    },
    recommendedOrder: [
      firstPayload?.requestId || "",
      firstCovenant?.requestId || ""
    ].filter(Boolean),
    rows,
    signerReturnRequired: [
      "signedTransaction",
      "transactionId",
      "reviewFingerprint",
      "payloadBytes",
      "inputBudgetReport",
      "signerName",
      "signerVersion",
      "explicit user approval"
    ],
    acceptanceRule: "One row becomes live only after an external signer returns the exact fingerprint-preserving transaction, the tx is submitted through a payload-preserving route, and virtual-chain replay observes accepted matching evidence.",
    boundaries: [
      "This is a signer runbook, not a wallet integration.",
      "Do not use local private keys for the acceptance claim.",
      "Do not promote app state from a returned txid until accepted replay matches payload/output rules."
    ]
  };
}

function buildRow({ request, index, pending }) {
  const payloadBytes = Number(request.body?.transaction?.payload?.bytes || 0);
  const computeBudgetInputs = Number(request.preservation?.computeBudgetInputs || 0);
  return {
    order: index + 1,
    requestId: request.requestId || "",
    label: request.label || "",
    kind: payloadBytes > 0 ? "payload-receipt" : "covenant-spend",
    sourceSignedDraftPath: request.sourceSignedDraftPath || "",
    reviewFingerprint: request.reviewFingerprint || "",
    expectedTransactionIdAfterSigning: request.preservation?.expectedTransactionIdAfterSigning || "",
    payloadBytes,
    computeBudgetInputs,
    pendingExternalSigner: pending.has(request.requestId),
    requiredPreservation: request.preservation?.mustPreserve || [],
    next: payloadBytes > 0
      ? "Run this first: verify payload bytes and accepted replay before using it as the no-local-key proof."
      : "Run only after payload round trip works; preserve covenant input fields exactly."
  };
}
