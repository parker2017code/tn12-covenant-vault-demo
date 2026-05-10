export function buildWalletStandardSignerValidation({
  standardRequests = {},
  signerResults = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const requests = new Map((standardRequests.requests || []).map((request) => [request.requestId, request]));
  const results = Array.isArray(signerResults.results) ? signerResults.results : [];
  const validations = results.map((result) => validateResult({ result, request: requests.get(result.requestId) }));
  const resultRequestIds = new Set(results.map((result) => result.requestId));
  for (const request of requests.values()) {
    if (!resultRequestIds.has(request.requestId)) {
      validations.push(validateResult({
        result: {
          id: `${request.requestId}:pending-external-signer`,
          requestId: request.requestId,
          status: "pending-external-signer"
        },
        request
      }));
    }
  }
  const returned = validations.filter((item) => item.status !== "pending-external-signer");
  const accepted = returned.filter((item) => item.validation === "accepted");
  const rejected = returned.filter((item) => item.validation === "rejected");

  return {
    schema: "tn12-wallet-standard-signer-validation/v1",
    network: standardRequests.network || signerResults.network || "kaspa-testnet-12",
    generatedAt,
    status: rejected.length > 0 || validations.some((item) => item.status === "pending-external-signer")
      ? "wallet-standard-signer-validation-ready"
      : "wallet-standard-signer-validation-review",
    liveExternalSignerAccepted: accepted.length > 0,
    summary: {
      requests: requests.size,
      results: results.length,
      pending: validations.filter((item) => item.status === "pending-external-signer").length,
      accepted: accepted.length,
      rejected: rejected.length,
      negativeCasesCaught: rejected.filter((item) => item.id.startsWith("negative-")).length
    },
    validations,
    promotionRule: "A signer result can enter submit-result validation only if reviewFingerprint, txid, payload bytes, input budget report, signer metadata, route, and explicit user action all pass.",
    boundaries: [
      "This validates signer-return metadata; it does not sign or broadcast.",
      "Pending rows are expected until a real external signer integration exists.",
      "Accepted signer results still need payload-preserving submit and virtual-chain accepted evidence before app-state promotion."
    ]
  };
}

function validateResult({ result = {}, request }) {
  const reasons = [];
  if (!request) reasons.push("unknown request id");
  if (result.status === "pending-external-signer") {
    return {
      id: result.id || "",
      requestId: result.requestId || "",
      status: "pending-external-signer",
      validation: "pending",
      reasons: ["external signer has not returned a transaction yet"]
    };
  }

  if (request && result.reviewFingerprint !== request.reviewFingerprint) reasons.push("review fingerprint mismatch");
  if (request && result.transactionId !== request.preservation.expectedTransactionIdAfterSigning) reasons.push("transaction id mismatch");
  const expectedPayloadBytes = request?.body?.transaction?.payload?.bytes ?? null;
  if (expectedPayloadBytes !== null && Number(result.payloadBytes ?? -1) !== Number(expectedPayloadBytes)) reasons.push("payload bytes mismatch");
  if (!result.signerName) reasons.push("missing signer name");
  if (!result.signerVersion) reasons.push("missing signer version");
  if (!result.signedTransaction) reasons.push("missing signed transaction");
  if (result.userAction !== "approved") reasons.push("missing explicit user approval");
  if (!result.route) reasons.push("missing submit route");
  if (request && result.route && result.route !== expectedRoute(request)) reasons.push("submit route mismatch");

  const expectedInputs = request?.body?.transaction?.inputs || [];
  const budgetReport = Array.isArray(result.inputBudgetReport) ? result.inputBudgetReport : [];
  expectedInputs.forEach((input, index) => {
    const report = budgetReport[index] || {};
    if (Number(input.sigOpCount ?? -1) !== Number(report.sigOpCount ?? -1)) {
      reasons.push(`input ${index} sigOpCount mismatch`);
    }
    if ((input.computeBudget ?? null) !== (report.computeBudget ?? null)) {
      reasons.push(`input ${index} computeBudget mismatch`);
    }
  });

  return {
    id: result.id || "",
    requestId: result.requestId || "",
    status: result.status || "returned",
    validation: reasons.length === 0 ? "accepted" : "rejected",
    transactionId: result.transactionId || "",
    reasons
  };
}

function expectedRoute(request) {
  const payloadBytes = Number(request?.body?.transaction?.payload?.bytes || 0);
  return payloadBytes > 0 ? "payload-preserving-wrpc" : "json-wrpc";
}
