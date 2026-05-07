export function buildPayloadSubmitReadiness(input = {}) {
  const submitTxProperties = input.submitTxProperties || {};
  const fetchedTxProperties = input.fetchedTxProperties || {};
  const submitHasPayload = Object.keys(submitTxProperties).length
    ? Object.hasOwn(submitTxProperties, "payload")
    : Boolean(input.checks?.submitTxModelHasPayload);
  const fetchedHasPayload = Object.keys(fetchedTxProperties).length
    ? Object.hasOwn(fetchedTxProperties, "payload")
    : Boolean(input.checks?.fetchedTxModelHasPayload);
  const signedDraftHasPayload = input.signedDraftHasPayload ?? input.checks?.signedDraftHasPayload;
  const observedAttempt = input.observedAttempt || null;
  const acceptedReceipt = input.acceptedReceipt || null;
  const observedPayloadPreserved = observedAttempt
    ? Boolean(observedAttempt.payloadPreserved)
    : null;
  const observedPayloadDropped = observedAttempt
    ? observedAttempt.accepted === true && observedPayloadPreserved === false
    : false;
  const acceptedReceiptMatched = acceptedReceipt
    ? acceptedReceipt.accepted === true && acceptedReceipt.payload?.matches === true && acceptedReceipt.receiptMatches === true
    : false;

  return {
    schema: "tn12-payload-submit-readiness/v1",
    network: input.network || "kaspa-testnet-12",
    checkedAt: input.checkedAt || new Date().toISOString(),
    source: input.source || "https://api-tn12.kaspa.org/openapi.json",
    status: acceptedReceiptMatched
      ? "accepted-wrpc-payload-receipt-rest-blocked"
      : observedPayloadDropped
      ? "blocked-rest-submit-dropped-payload"
      : submitHasPayload
      ? "payload-submit-route-advertises-payload"
      : "blocked-rest-submit-schema-has-no-payload-field",
    checks: {
      submitTxModelHasPayload: submitHasPayload,
      fetchedTxModelHasPayload: fetchedHasPayload,
      signedDraftHasPayload: Boolean(signedDraftHasPayload),
      restSubmitAttempted: Boolean(observedAttempt),
      restSubmitPayloadPreserved: observedPayloadPreserved,
      acceptedWrpcPayloadReceiptMatched: acceptedReceiptMatched,
      safeToSubmitPayloadReceiptByDefault: acceptedReceiptMatched || (submitHasPayload && Boolean(signedDraftHasPayload) && !observedPayloadDropped)
    },
    observedAttempt,
    acceptedReceipt,
    next: acceptedReceiptMatched
      ? "Use the verified TN12 JSON wRPC route for payload receipts; keep the public REST submit failure as historical evidence only."
      : observedPayloadDropped
      ? "Do not use this REST submit route for payload receipts. It accepted the spend but produced an accepted transaction with no payload."
      : submitHasPayload
      ? "Submit one tiny signed payload receipt, verify accepted tx payload bytes, then mark the invoice paid."
      : "Do not submit the payload receipt through this REST route until a payload-preserving wallet/API route is verified.",
    boundary: acceptedReceiptMatched
      ? "The invoice receipt is accepted through JSON wRPC and matched by payload bytes. The REST no-payload transaction remains a payment/self-send proof, not invoice evidence."
      : observedPayloadDropped
      ? "The accepted transaction is only a payment/self-send proof. It is not an invoice receipt because the payload was not preserved."
      : "A signed transaction draft carrying payload bytes is not enough; the submit route must preserve those bytes before invoice state can become paid."
  };
}

export function extractOpenApiPayloadProperties(openapi = {}) {
  const schemas = openapi.components?.schemas || {};
  return {
    submitTxProperties: schemas.SubmitTxModel?.properties || {},
    fetchedTxProperties: schemas.TxModel?.properties || {}
  };
}
