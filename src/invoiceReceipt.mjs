import { buildSignalPayloadArtifact } from "./signalPayload.mjs";

export const DEFAULT_INVOICE = Object.freeze({
  invoiceId: "merchant-order-1337",
  merchant: "Kaspa App Lab",
  payerLabel: "TN12 demo wallet",
  amountTkas: 1,
  memo: "Payload receipt invoice demo",
  dueHours: 24,
  status: "draft"
});

export function normalizeInvoice(input = {}) {
  return {
    invoiceId: clean(input.invoiceId || DEFAULT_INVOICE.invoiceId, 64),
    merchant: clean(input.merchant || DEFAULT_INVOICE.merchant, 80),
    payerLabel: clean(input.payerLabel || DEFAULT_INVOICE.payerLabel, 80),
    amountTkas: clampNumber(input.amountTkas ?? DEFAULT_INVOICE.amountTkas, 0.00001, 100000000),
    memo: clean(input.memo || DEFAULT_INVOICE.memo, 180),
    dueHours: Math.round(clampNumber(input.dueHours ?? DEFAULT_INVOICE.dueHours, 1, 8760)),
    status: clean(input.status || DEFAULT_INVOICE.status, 32)
  };
}

export function buildInvoiceArtifact(input = {}, options = {}) {
  const invoice = normalizeInvoice(input);
  const receipt = buildSignalPayloadArtifact({
    kind: "invoice-receipt",
    subject: invoice.invoiceId,
    value: invoice.status,
    note: `${invoice.merchant}: ${invoice.memo}`
  });
  const paidReceipt = options.paidReceipt || null;
  const accepted = Boolean(paidReceipt?.accepted);

  return {
    schema: "kaspa-invoice-receipt-app/v1",
    network: "kaspa-testnet-12",
    status: accepted ? "accepted-receipt-indexed" : "draft-needs-payload-submit",
    invoice,
    payment: {
      amountTkas: invoice.amountTkas,
      amountSompi: tKasToSompi(invoice.amountTkas).toString(),
      route: "TN12 transaction payload receipt",
      submitBoundary: "Create a signed transaction with this receipt payload, then verify the accepted tx before marking paid."
    },
    receipt,
    acceptedReceipt: paidReceipt,
    appState: accepted
      ? `Invoice ${invoice.invoiceId} is paid by accepted payload receipt ${paidReceipt.txid}.`
      : `Invoice ${invoice.invoiceId} is not paid until an accepted transaction carries this receipt payload.`,
    boundaries: [
      "This is payment plus app data, not a smart-contract invoice settlement.",
      "Accepted transaction indexing is the source of app state.",
      "The existing signed draft proves local payload bytes; broadcast remains gated until payload submit support is verified."
    ]
  };
}

export function buildInvoiceRegistry(fixture = {}) {
  const invoices = (fixture.invoices || []).map((invoice) => {
    const paidReceipt = (fixture.acceptedReceipts || []).find((receipt) => receipt.invoiceId === invoice.invoiceId) || null;
    return buildInvoiceArtifact(invoice, { paidReceipt });
  });

  return {
    schema: "kaspa-invoice-registry/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: invoices.some((invoice) => invoice.status === "accepted-receipt-indexed")
      ? "has-accepted-receipts"
      : "drafts-ready-for-payload-submit",
    summary: {
      total: invoices.length,
      paid: invoices.filter((invoice) => invoice.status === "accepted-receipt-indexed").length,
      draft: invoices.filter((invoice) => invoice.status !== "accepted-receipt-indexed").length,
      totalTkas: invoices.reduce((sum, invoice) => sum + invoice.invoice.amountTkas, 0)
    },
    invoices,
    next: fixture.next || "Submit and verify one tiny TN12 payload receipt transaction, then add its txid as an accepted receipt."
  };
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function tKasToSompi(value) {
  return BigInt(Math.round(Number(value) * 100000000));
}
