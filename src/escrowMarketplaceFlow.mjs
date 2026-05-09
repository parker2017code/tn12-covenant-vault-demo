export function buildEscrowMarketplaceFlow({ marketplaceDemo = {}, unsignedTemplates = {}, generatedAt = new Date().toISOString() } = {}) {
  const listings = Array.isArray(marketplaceDemo.listings) ? marketplaceDemo.listings : [];
  const templates = Array.isArray(unsignedTemplates.templates) ? unsignedTemplates.templates : [];
  const contractTemplates = templates.filter((template) => template.class === "contract-proof");
  const flows = listings.map((listing) => buildFlow({ listing, contractTemplates }));

  return {
    schema: "tn12-escrow-marketplace-flow/v1",
    network: marketplaceDemo.network || unsignedTemplates.network || "kaspa-testnet-12",
    generatedAt,
    status: flows.length > 0 ? "escrow-marketplace-flow-ready" : "escrow-marketplace-flow-review",
    summary: {
      flows: flows.length,
      actionable: flows.filter((flow) => flow.state !== "needs-funding").length,
      blockedOnWalletStandard: flows.length,
      acceptedEscrowProofs: Number(marketplaceDemo.summary?.acceptedEscrowProofs || 0)
    },
    flows,
    globalGates: [
      "Render listing state and proof backdrop before any action button.",
      "Route every action through unsigned wallet request templates once standard mapping exists.",
      "Require accepted virtual-chain evidence before changing marketplace settlement state.",
      "Keep dispute handling as app-layer context unless an arbiter or mutual-cancel path is selected."
    ],
    boundaries: [
      "This is a marketplace workflow artifact, not a live marketplace.",
      "It uses accepted escrow proof paths as backdrop evidence, not fresh user custody.",
      "No transaction is signed or broadcast by this artifact."
    ]
  };
}

function buildFlow({ listing, contractTemplates }) {
  const enabledActions = (listing.primaryActions || []).filter((action) => action.enabled);
  return {
    escrowId: listing.escrowId,
    title: listing.title,
    state: listing.actionState,
    marketState: listing.marketState,
    proofBackdrop: listing.acceptedProofBackdrop,
    steps: [
      step("review-listing", "Show buyer, seller, amount, timeout, delivery hash, and proof backdrop.", true),
      step("select-action", `Available actions: ${enabledActions.map((action) => action.action).join(", ") || "none"}.`, enabledActions.length > 0),
      step("wallet-template", "Map the selected action to an unsigned wallet request template.", contractTemplates.length > 0),
      step("external-sign", "External signer reviews and signs without repo local keys.", false),
      step("accepted-replay", "Virtual-chain indexer confirms accepted txid before settlement state changes.", false)
    ],
    next: listing.actionState === "needs-funding"
      ? "Build funding template before release/refund/cancel review."
      : "Map one enabled action to the wallet-standard handoff after standard mapping is implemented."
  };
}

function step(id, detail, ready) {
  return { id, detail, ready };
}
