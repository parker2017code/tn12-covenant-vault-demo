export function buildWalletConnectorReadiness(walletReview = {}) {
  const drafts = walletReview.drafts || [];
  const payloadDrafts = drafts.filter((draft) => draft.payload?.present);
  const blockedDrafts = drafts.filter((draft) => draft.status !== "review-ready");
  const secretFree = Number(walletReview.summary?.registrySecretFields || 0) === 0;
  const payloadRouteReady = payloadDrafts.every((draft) => draft.payload?.routeReady);
  const specReady = walletReview.status === "wallet-review-ready"
    && secretFree
    && payloadRouteReady
    && blockedDrafts.length === 0;

  return {
    schema: "tn12-wallet-connector-readiness/v1",
    network: walletReview.network || "kaspa-testnet-12",
    status: specReady ? "wallet-connector-spec-ready" : "wallet-connector-blocked",
    summary: {
      drafts: drafts.length,
      payloadDrafts: payloadDrafts.length,
      blockedDrafts: blockedDrafts.length,
      registrySecretFields: Number(walletReview.summary?.registrySecretFields || 0),
      payloadRouteReady,
      specReady
    },
    requiredWalletCapabilities: [
      {
        id: "network-confirmation",
        status: "required",
        detail: "Display and enforce kaspa-testnet-12 before signing."
      },
      {
        id: "exact-transaction-review",
        status: "required",
        detail: "Show inputs, outputs, fees, lock time, transaction version, and payload bytes."
      },
      {
        id: "payload-preserving-submit",
        status: "required",
        detail: "Submit payload transactions through a route that preserves transaction payload bytes."
      },
      {
        id: "local-secret-exclusion",
        status: secretFree ? "ready" : "blocked",
        detail: "The published registry must not contain private keys, mnemonics, seeds, or secret fields."
      },
      {
        id: "explicit-user-action",
        status: "required",
        detail: "The wallet connector must require a user action before signing or broadcasting."
      },
      {
        id: "standard-partial-transaction-format",
        status: "research-required",
        detail: "Research PSKB/PSKT/KSPT compatibility before inventing a custom draft transport."
      }
    ],
    referenceImplementations: [
      {
        id: "kassigner",
        lane: "external-signer-reference",
        url: "https://github.com/InKasWeRust/KasSigner",
        relevance: "Air-gapped signer reference for offline key custody, PSKB/KSPT-style signing, and multisig conventions."
      },
      {
        id: "kassee",
        lane: "watch-only-companion-reference",
        url: "https://kassigner.org/",
        relevance: "Watch-only companion reference for kpub import, UTXO tracking, unsigned transaction construction, signed transaction broadcast, and private-key exclusion."
      }
    ],
    draftClasses: summarizeDraftClasses(drafts),
    blockedDrafts: blockedDrafts.map((draft) => ({
      path: draft.path,
      label: draft.label,
      status: draft.status
    })),
    boundaries: [
      "This is a connector specification artifact, not a live wallet integration.",
      "The browser must not read `.local/tn12-wallet.json` or any private key material.",
      "Payload drafts need a wallet or wRPC submit path that preserves payload bytes; public REST submit remains blocked for payload receipts.",
      "Contract spend drafts need the wallet to preserve exact transaction fields, including version 1 compute budget where present.",
      "KasSigner/KasSee is a reference boundary, not proof that this repo has a live external signer integration."
    ]
  };
}

function summarizeDraftClasses(drafts) {
  const classes = new Map();
  for (const draft of drafts) {
    const key = classifyDraft(draft);
    const current = classes.get(key) || {
      class: key,
      total: 0,
      payloadDrafts: 0,
      reviewReady: 0
    };
    current.total += 1;
    if (draft.payload?.present) current.payloadDrafts += 1;
    if (draft.status === "review-ready") current.reviewReady += 1;
    classes.set(key, current);
  }
  return [...classes.values()].sort((a, b) => a.class.localeCompare(b.class));
}

function classifyDraft(draft) {
  const lane = String(draft.lane || "");
  const path = String(draft.path || "");
  if (draft.payload?.present) return "payload-app-state";
  if (/escrow|vault|assurance/.test(path) || /contract|spend/.test(lane)) return "contract-proof";
  if (/split|funding/.test(path)) return "funding";
  return "standard-payment";
}
