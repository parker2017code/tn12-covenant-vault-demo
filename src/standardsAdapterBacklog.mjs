export function buildStandardsAdapterBacklog({
  provenStatus = {},
  acceptedActivity = {},
  playgroundSession = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedTxids = Number(playgroundSession.summary?.acceptedTxids || 0);
  const acceptedTransfers = Number(acceptedActivity.summary?.acceptedTransferRows || 0);
  const payloadEvents = Number(provenStatus.acceptedEvidence?.payloadEvents || 0);
  const lanes = [
    lane({
      id: "x402-http-payment-adapter",
      label: "x402-style HTTP payment adapter",
      standard: "HTTP 402 / x402",
      status: "BUILDABLE_NEXT",
      fit: "API and agent payments can map a 402 payment request to a TN12 invoice, accepted transfer, receipt, and retry token.",
      proof: acceptedTxids >= 3 && acceptedTransfers >= 18,
      next: "Build a local HTTP 402 demo endpoint that returns payment requirements, accepts a TN12 txid proof, verifies it through the reducer, and releases a mock resource.",
      source: "https://docs.x402.org/"
    }),
    lane({
      id: "iso20022-payment-metadata",
      label: "ISO 20022-style payment metadata",
      standard: "ISO 20022 message mapping",
      status: "ADAPTER_ONLY",
      fit: "Payment initiation/remittance fields can be represented as payload receipt metadata and reconciled against accepted transfers.",
      proof: payloadEvents >= 40 && acceptedTransfers >= 18,
      next: "Create a pacs/pain-inspired JSON mapping for payer, payee, amount, remittance reference, accepted txid, and reconciliation status.",
      source: "https://www.iso20022.org/"
    }),
    lane({
      id: "dti-asset-identifier-map",
      label: "Digital Token Identifier style asset map",
      standard: "ISO 24165 DTI-style identifiers",
      status: "ADAPTER_ONLY",
      fit: "Asset receipts, access passes, and future native assets need stable identifiers that are separate from marketing tickers.",
      proof: payloadEvents >= 40,
      next: "Add an asset-id registry artifact with issuer, symbol, network, asset class, receipt txid, and no-claim status.",
      source: "https://www.iso.org/standard/85546.html"
    }),
    lane({
      id: "native-asset-access-pass",
      label: "Native asset / access pass rail",
      standard: "Kaspa Toccata asset rules and ecosystem pass workflows",
      status: "TOCCATA_TRACK",
      fit: "Access passes, coupons, tickets, and closed-loop credits can use accepted receipts now and covenant/native-asset rules later.",
      proof: payloadEvents >= 40,
      next: "Bind one pass issuance, transfer, and redemption flow to accepted receipts and an issuer review artifact.",
      source: "https://docs.kaspa.org/programmability"
    }),
    lane({
      id: "attestation-oracle-envelope",
      label: "Attestation and oracle envelope",
      standard: "Verifiable credential / oracle metadata pattern",
      status: "BUILDABLE_NEXT",
      fit: "External facts should enter as explicit source, reporter, timestamp, dispute, and confidence records before any market or insurance action uses them.",
      proof: payloadEvents >= 40,
      next: "Create one generic event-attestation envelope and negative cases for stale, conflicting, missing-quorum, and unauthenticated inputs.",
      source: "https://www.w3.org/TR/vc-data-model-2.0/"
    }),
    lane({
      id: "agent-task-settlement",
      label: "Agent task settlement receipts",
      standard: "Agent commerce / task receipt pattern",
      status: "BUILDABLE_NEXT",
      fit: "Agents need small agreements: task description, payment, completion proof, dispute state, and release/refund status.",
      proof: payloadEvents >= 40,
      next: "Turn the existing agent invoice/escrow receipts into a minimal agent task API with accepted txid replay.",
      source: "https://docs.x402.org/"
    }),
    lane({
      id: "wallet-signing-standard",
      label: "Wallet signing and human intent review",
      standard: "Unsigned request / external signer convention",
      status: "MAINNET_READINESS_BLOCKER",
      fit: "Institutional or public use requires human-readable signing intents and returned signed bytes that validate before submit.",
      proof: provenStatus.readiness?.externalSignerAccepted === true,
      next: "Keep request templates and validators ready; only promote after a real external wallet signs, submit succeeds, and replay matches.",
      source: "artifacts/wallet-standard-requests.json"
    })
  ];
  const ready = lanes.filter((item) => item.proofAvailable).length;

  return {
    schema: "tn12-standards-adapter-backlog/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: "standards-adapter-backlog-ready",
    summary: {
      lanes: lanes.length,
      proofAvailableLanes: ready,
      buildableNextLanes: lanes.filter((item) => item.status === "BUILDABLE_NEXT").length,
      adapterOnlyLanes: lanes.filter((item) => item.status === "ADAPTER_ONLY").length,
      mainnetBlockedLanes: lanes.filter((item) => item.status === "MAINNET_READINESS_BLOCKER").length,
      liveProductClaims: 0,
      copiedBrandingClaims: 0,
      institutionalClaims: 0
    },
    lanes,
    rules: [
      "Use standards as adapters and message shapes, not as claims of certification or institutional adoption.",
      "Every adapter needs a source message, a TN12 txid or receipt, a reducer rule, and a negative case.",
      "Do not claim ISO compliance, x402 compatibility, DTI registration, or production custody until a working integration proves that exact claim."
    ]
  };
}

function lane({ id, label, standard, status, fit, proof, next, source }) {
  return {
    id,
    label,
    standard,
    status,
    proofAvailable: Boolean(proof),
    fit,
    next,
    source
  };
}
