export function buildInvoiceMainnetLaunchBrief({ mainnetReadiness = {}, invoiceRegistry = {}, livePreflight = {}, walletStandardMapping = {}, generatedAt = new Date().toISOString() } = {}) {
  const invoiceComponent = (mainnetReadiness.components || []).find((component) => component.id === "invoice-payload-receipts")
    || (mainnetReadiness.components || []).find((component) => /invoice|payload/i.test(component.name || ""));
  const blockers = [
    walletStandardMapping.liveWalletIntegrationReady ? "" : "wire live wallet integration for the mapped standard",
    livePreflight.status === "live-preflight-ready" ? "" : "configure durable virtual-chain endpoint preflight",
    "production duplicate/refund/error policy review",
    "operator monitoring and incident procedure"
  ].filter(Boolean);

  return {
    schema: "kaspa-invoice-mainnet-launch-brief/v1",
    network: "kaspa-mainnet-readiness-review",
    generatedAt,
    status: "invoice-mainnet-brief-ready",
    component: invoiceComponent || null,
    summary: {
      invoices: Number(invoiceRegistry.summary?.total || 0),
      paid: Number(invoiceRegistry.summary?.paid || 0),
      refunded: Number(invoiceRegistry.summary?.refunded || 0),
      errors: Number(invoiceRegistry.summary?.errors || 0),
      blockers: blockers.length
    },
    buildNow: [
      "accepted payment payload schema",
      "paid/refund/error reducer",
      "wallet review fields",
      "rollback-aware indexer contract"
    ],
    blockers,
    launchRule: "Mainnet launch path: wallet integration, live indexer replay, duplicate/refund policy, monitoring, and source drift review.",
    boundaries: [
      "This is a readiness brief.",
      "TN12 accepted payload evidence covers the app-state pattern.",
      "Invoice state comes from accepted replay."
    ]
  };
}
