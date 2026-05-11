export function buildExternalSignerPayloadRequest({ unsignedTemplates = {} } = {}) {
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const request = templates.find((template) =>
    template.status === "unsigned-request-template-ready"
    && template.class === "payload-app-state"
    && template.payload?.present === true
  );

  if (!request) {
    return {
      schema: "tn12-external-signer-payload-request/v1",
      network: unsignedTemplates.network || "kaspa-testnet-12",
      status: "blocked-no-payload-request",
      request: null,
      blockers: ["no ready unsigned payload-app-state template found"]
    };
  }

  return {
    schema: "tn12-external-signer-payload-request/v1",
    network: unsignedTemplates.network || "kaspa-testnet-12",
    status: "unsigned-payload-request-ready",
    liveExternalSignerReady: false,
    request: {
      requestId: request.requestId,
      label: request.label,
      class: request.class,
      sourceSignedDraftPath: request.sourceSignedDraftPath,
      transaction: request.transaction,
      payload: request.payload,
      preservation: request.preservation,
      requestedSignerAction: request.requestedSignerAction
    },
    acceptanceRule: [
      "External signer returns signed transaction bytes for this exact request.",
      "Returned transaction preserves previous outpoints, sequences, sigOpCount, outputs, and payload bytes.",
      "Submission uses a payload-preserving TN12 route.",
      "Accepted txid is observed by TN12 verification and replay/indexer checks."
    ],
    blockers: [
      "No real external signer has returned signed bytes for this request.",
      "No accepted TN12 txid has been promoted from this unsigned request."
    ],
    boundaries: [
      "This artifact is not a wallet integration.",
      "This artifact is not no-local-key signing evidence.",
      "This artifact is the smallest reviewable payload receipt request for an external signer."
    ]
  };
}
