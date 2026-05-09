import { createHash } from "node:crypto";

export function buildWalletStandardRequests({
  walletMapping = {},
  unsignedTemplates = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const selectedTemplates = selectTemplates(templates);
  const requests = selectedTemplates.map((template) => buildRequest({ template, network: unsignedTemplates.network }));
  const payloadRoundTrip = requests.find((request) => request.class === "payload-app-state") || null;
  const computeBudgetRoundTrip = requests.find((request) => request.preservation.computeBudgetInputs > 0) || null;
  const blocking = requests.flatMap((request) => request.blockers.map((blocker) => `${request.requestId}:${blocker}`));

  return {
    schema: "tn12-wallet-standard-requests/v1",
    network: unsignedTemplates.network || walletMapping.network || "kaspa-testnet-12",
    generatedAt,
    status: requests.length >= 2 && blocking.length === 0
      ? "wallet-standard-request-candidates-ready"
      : "wallet-standard-request-candidates-review",
    selectedStandard: walletMapping.selectedCandidate || "pskb-pskt",
    liveWalletIntegrationReady: false,
    summary: {
      sourceTemplates: templates.length,
      mappedRequests: requests.length,
      payloadRequests: requests.filter((request) => request.body?.transaction?.payload?.present).length,
      computeBudgetRequests: requests.filter((request) => request.preservation.computeBudgetInputs > 0).length,
      blocking: blocking.length
    },
    requests,
    firstRoundTrip: payloadRoundTrip ? {
      requestId: payloadRoundTrip.requestId,
      sourceSignedDraftPath: payloadRoundTrip.sourceSignedDraftPath,
      acceptance: "external signer returns signed transaction; submit through payload-preserving route; replay accepted txid and payload bytes"
    } : null,
    covenantRoundTrip: computeBudgetRoundTrip ? {
      requestId: computeBudgetRoundTrip.requestId,
      sourceSignedDraftPath: computeBudgetRoundTrip.sourceSignedDraftPath,
      acceptance: "external signer preserves tx version 1, sigOpCount compatibility field, and computeBudget before submit"
    } : null,
    blocking,
    boundaries: [
      "This is a repo-side wallet-standard candidate object, not an official PSKB/PSKT binary.",
      "It is intentionally field-by-field so a wallet adapter can reject any mutation before signing.",
      "No local private key, mnemonic, seed, or signature script is included.",
      "No-local-key signing is not claimed until one external signer round trip is accepted and replayed."
    ]
  };
}

function selectTemplates(templates) {
  const payload = templates.find((template) => template.class === "payload-app-state" && template.payload?.present);
  const computeBudget = templates.find((template) => Number(template.preservation?.computeBudgetInputs || 0) > 0);
  return [payload, computeBudget].filter(Boolean);
}

function buildRequest({ template = {}, network = "kaspa-testnet-12" } = {}) {
  const tx = template.transaction || {};
  const inputs = Array.isArray(tx.inputs) ? tx.inputs.map(mapInput) : [];
  const outputs = Array.isArray(tx.outputs) ? tx.outputs.map(mapOutput) : [];
  const payload = {
    present: Boolean(template.payload?.present),
    bytes: Number(template.payload?.bytes || 0),
    hash: template.payload?.hash || "",
    hexPreview: template.payload?.hexPreview || ""
  };
  const body = {
    network,
    format: "pskb-pskt-candidate-json",
    version: 1,
    sourceRequestId: template.requestId || "",
    transaction: {
      version: Number(tx.version ?? 0),
      lockTime: String(tx.lockTime ?? "0"),
      subnetworkId: String(tx.subnetworkId || "0000000000000000000000000000000000000000"),
      inputs,
      outputs,
      payload
    }
  };
  const blockers = [
    inputs.length === 0 ? "missing inputs" : "",
    outputs.length === 0 ? "missing outputs" : "",
    payload.present && payload.bytes === 0 ? "payload present but bytes missing" : "",
    inputs.some((input) => input.signatureScript !== "") ? "signature script was not stripped" : ""
  ].filter(Boolean);

  return {
    requestId: `${template.requestId || "unknown"}-standard`,
    sourceRequestId: template.requestId || "",
    sourceSignedDraftPath: template.sourceSignedDraftPath || "",
    label: template.label || "",
    class: template.class || "",
    status: blockers.length === 0 ? "wallet-standard-request-candidate-ready" : "wallet-standard-request-candidate-review",
    blockers,
    body,
    reviewFingerprint: sha256(body),
    preservation: {
      expectedTransactionIdAfterSigning: template.preservation?.expectedTransactionIdAfterSigning || "",
      originalSignedDraftFingerprint: template.preservation?.originalSignedDraftFingerprint || "",
      computeBudgetInputs: Number(template.preservation?.computeBudgetInputs || 0),
      mustPreserve: template.requestedSignerAction?.mustPreserve || [],
      requiredWalletChecks: template.preservation?.requiredWalletChecks || []
    },
    signerReturnContract: {
      required: [
        "signedTransaction",
        "transactionId",
        "reviewFingerprint",
        "payloadBytes",
        "inputBudgetReport",
        "signerName",
        "signerVersion"
      ],
      rejectWhen: [
        "reviewFingerprint changes",
        "payload bytes differ from request",
        "output amount or script changes",
        "previous outpoint changes",
        "computeBudget is dropped or rewritten on v1 covenant inputs",
        "network differs from request"
      ]
    }
  };
}

function mapInput(input = {}, index) {
  return {
    index,
    previousOutpoint: {
      transactionId: String(input.previousOutpoint?.transactionId || ""),
      index: Number(input.previousOutpoint?.index ?? 0)
    },
    sequence: String(input.sequence ?? "0"),
    sigOpCount: input.sigOpCount === undefined || input.sigOpCount === null ? null : Number(input.sigOpCount),
    computeBudget: input.computeBudget === undefined || input.computeBudget === null ? null : Number(input.computeBudget),
    signatureScript: ""
  };
}

function mapOutput(output = {}, index) {
  return {
    index,
    amount: String(output.amount ?? "0"),
    scriptPublicKey: {
      version: Number(output.scriptPublicKey?.version ?? 0),
      scriptPublicKey: String(output.scriptPublicKey?.scriptPublicKey || "")
    }
  };
}

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
