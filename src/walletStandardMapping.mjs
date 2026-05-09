export function buildWalletStandardMapping({ unsignedTemplates = {}, signerReferences = "", generatedAt = new Date().toISOString() } = {}) {
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const payloadTemplates = templates.filter((template) => template.payload.present);
  const computeBudgetTemplates = templates.filter((template) => template.preservation.computeBudgetInputs > 0);
  const candidates = [
    candidate("kaspa-wallet-api", "Kaspa wallet API", "research-mapping-needed", [
      "Needs a documented method that accepts unsigned transaction fields plus payload bytes.",
      "Must return a signed transaction without changing outputs, payload, lock time, or computeBudget."
    ]),
    candidate("pskb-pskt", "PSKB/PSKT partial transaction", "best-standard-candidate", [
      "Closest public naming match for partial signed Kaspa transaction handoff.",
      "Needs field-by-field mapping for payload bytes and tx version 1 computeBudget before integration."
    ]),
    candidate("kspt", "KSPT compact transport", "reference-candidate", [
      "KasSigner/KasSee references KSPT for QR transport.",
      "Useful for air-gapped review, but not proven compatible with these TN12 covenant drafts."
    ]),
    candidate("json-wrpc-signed-submit", "JSON wRPC signed submit", "submit-only-currently-working", [
      "Known to preserve payload bytes for already signed drafts.",
      "Does not solve external signing or no-local-key custody."
    ])
  ];
  const selected = candidates.find((item) => item.id === "pskb-pskt");

  return {
    schema: "tn12-wallet-standard-mapping/v1",
    network: unsignedTemplates.network || "kaspa-testnet-12",
    generatedAt,
    status: templates.length > 0 ? "wallet-standard-mapping-ready" : "wallet-standard-mapping-review",
    selectedCandidate: selected.id,
    liveWalletIntegrationReady: false,
    summary: {
      unsignedTemplates: templates.length,
      payloadTemplates: payloadTemplates.length,
      computeBudgetTemplates: computeBudgetTemplates.length,
      candidates: candidates.length,
      signerReferenceMentions: countMentions(signerReferences, ["KasSigner", "KasSee", "PSKB", "KSPT"])
    },
    candidates,
    requiredFieldMap: [
      "network",
      "transaction.version",
      "transaction.lockTime",
      "transaction.subnetworkId",
      "inputs.previousOutpoint",
      "inputs.sequence",
      "inputs.sigOpCount",
      "inputs.computeBudget",
      "outputs.amount",
      "outputs.scriptPublicKey",
      "payload.bytes",
      "payload.hash"
    ],
    firstImplementationTarget: {
      id: "payload-receipt-unsigned-sign",
      templateClass: "payload-app-state",
      reason: "Payload receipt signing is the smallest useful no-local-key path before covenant spends.",
      requiredProof: "External signer returns a signed transaction whose txid, payload bytes, and outputs match the unsigned template, then virtual-chain ingestion reports accepted evidence."
    },
    covenantImplementationTarget: {
      id: "v1-compute-budget-contract-sign",
      templateClass: "contract-proof",
      reason: "Escrow/vault/assurance spends need proof that tx version 1 computeBudget survives wallet signing.",
      requiredProof: "External signer returns a signed v1 transaction with computeBudget inputs preserved and no sigOpCount rewrite."
    },
    boundaries: [
      "This maps the next wallet standard target; it is not a live wallet connector.",
      "Unsigned templates are repo-derived templates, not yet PSKB, PSKT, KSPT, or wallet-API objects.",
      "JSON wRPC remains submit-only for already signed transactions.",
      "Do not claim no-local-key signing until one external signer round trip is accepted and replayed."
    ]
  };
}

function candidate(id, label, status, notes) {
  return { id, label, status, notes };
}

function countMentions(text, terms) {
  return terms.reduce((count, term) => count + (String(text).includes(term) ? 1 : 0), 0);
}
