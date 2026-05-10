export function buildExternalSignerPathResearch({
  roundtripPlan = {},
  resultTemplate = {},
  signerValidation = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const rows = Array.isArray(roundtripPlan.rows) ? roundtripPlan.rows : [];
  const templates = Array.isArray(resultTemplate.templates) ? resultTemplate.templates : [];
  const recommended = new Set(roundtripPlan.recommendedOrder || []);
  const firstPass = rows.filter((row) => recommended.has(row.requestId));
  const pending = Number(signerValidation.summary?.pending || 0);
  const liveExternalSignerAccepted = signerValidation.liveExternalSignerAccepted === true;

  return {
    schema: "tn12-external-signer-path-research/v1",
    network: roundtripPlan.network || "kaspa-testnet-12",
    generatedAt,
    status: liveExternalSignerAccepted ? "external-signer-path-accepted" : "external-signer-path-ready-for-wallet-approval",
    summary: {
      requestRows: rows.length,
      templates: templates.length,
      recommendedFirstPass: firstPass.length,
      pendingExternalSigner: pending,
      liveExternalSignerAccepted,
      userApprovalRequired: !liveExternalSignerAccepted
    },
    recommendedPath: {
      first: firstPass[0]?.requestId || "",
      second: firstPass[1]?.requestId || "",
      browserWalletSurface: "KasWare window.kasware flow if it can return or submit the exact reviewed transaction",
      nonBrowserFallback: "Kaspa wallet API / PSKT-style handoff if browser wallet cannot preserve the current transaction fields"
    },
    requestChecklist: firstPass.map((row) => ({
      requestId: row.requestId,
      kind: row.kind,
      reviewFingerprint: row.reviewFingerprint,
      expectedTransactionIdAfterSigning: row.expectedTransactionIdAfterSigning,
      payloadBytes: row.payloadBytes,
      computeBudgetInputs: row.computeBudgetInputs,
      requiredPreservation: row.requiredPreservation
    })),
    sourceNotes: [
      {
        label: "KasWare integration docs",
        url: "https://docs.kasware.xyz/wallet/dev-base/kaspa",
        relevance: "Browser injection can request accounts and expose Kaspa signing methods, but the API is wallet-specific and may change."
      },
      {
        label: "Kaspa signing docs",
        url: "https://kaspa-mdbook.aspectron.com/transactions/signing.html",
        relevance: "External signing can be modeled as signing transaction/input hashes and applying signatures back to the transaction."
      },
      {
        label: "Kaspa Wallet API docs",
        url: "https://kaspa.aspectron.org/wallets/wallet-api/index.html",
        relevance: "A non-browser wallet API route can be used as a fallback if extension signing cannot preserve exact tx fields."
      }
    ],
    acceptanceRule: "Do not mark external signing complete until a real wallet returns the signed transaction for one recommended request, wallet-standard validation accepts it, submit/result validation records it, and virtual-chain replay observes the accepted txid.",
    boundaries: [
      "This artifact is research and orchestration; it does not connect to a browser or sign.",
      "OpenClaw/KasWare is useful only if it produces a real user-approved signature or submit result.",
      "Local signer simulation remains separate from no-local-key wallet evidence."
    ]
  };
}
