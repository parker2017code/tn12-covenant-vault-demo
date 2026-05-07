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
  const refundRecord = options.refundRecord || null;
  const refundReviews = options.refundReviews || [];
  const receiptReviews = options.receiptReviews || [];
  const errorRecords = options.errorRecords || [];
  const acceptedErrorRecord = options.acceptedErrorRecord || null;
  const refunded = Boolean(refundRecord?.accepted && refundRecord.status !== "needs-review");
  const errored = !refunded && Boolean(acceptedErrorRecord?.accepted && acceptedErrorRecord.status !== "needs-review");
  const accepted = !refunded && !errored && Boolean(paidReceipt?.accepted && paidReceipt.status !== "needs-review");
  const needsReview = !accepted && !refunded && !errored && (receiptReviews.length > 0 || refundReviews.length > 0 || errorRecords.length > 0);

  return {
    schema: "kaspa-invoice-receipt-app/v1",
    network: "kaspa-testnet-12",
    status: refunded
      ? "refunded-receipt-indexed"
      : errored
      ? "error-receipt-indexed"
      : accepted
      ? "accepted-receipt-indexed"
      : needsReview
      ? "invoice-review-needed"
      : "draft-needs-payload-submit",
    invoice,
    payment: {
      amountTkas: invoice.amountTkas,
      amountSompi: tKasToSompi(invoice.amountTkas).toString(),
      route: "TN12 transaction payload receipt",
      submitBoundary: "Create a signed transaction with this receipt payload, then verify the accepted tx before marking paid."
    },
    receipt,
    acceptedReceipt: paidReceipt,
    refundRecord,
    refundReviews,
    receiptReviews,
    acceptedErrorRecord,
    errorRecords,
    appState: refunded
      ? `Invoice ${invoice.invoiceId} is refunded by accepted transaction ${refundRecord.txid}.`
      : errored
      ? `Invoice ${invoice.invoiceId} has an accepted error event ${acceptedErrorRecord.txid}.`
      : accepted
      ? `Invoice ${invoice.invoiceId} is paid by accepted payload receipt ${paidReceipt.txid}.`
      : needsReview
      ? `Invoice ${invoice.invoiceId} has receipt records that need review before paid state.`
      : `Invoice ${invoice.invoiceId} is not paid until an accepted transaction carries this receipt payload.`,
    boundaries: [
      "This is payment plus app data, not a smart-contract invoice settlement.",
      "Accepted transaction indexing is the source of app state.",
      "The existing signed draft proves local payload bytes; broadcast remains gated until payload submit support is verified."
    ]
  };
}

export function buildInvoiceRegistry(fixture = {}) {
  const receiptRecords = classifyReceiptRecords(fixture.acceptedReceipts || [], fixture.invoices || []);
  const refundRecords = classifyRefundRecords(fixture.refunds || [], fixture.invoices || []);
  const errorRecords = classifyErrorRecords(fixture.errors || [], fixture.invoices || []);
  const invoices = (fixture.invoices || []).map((invoice) => {
    const matchingReceipts = receiptRecords.filter((receipt) => receipt.invoiceId === invoice.invoiceId);
    const paidReceipt = matchingReceipts.find((receipt) => receipt.status === "accepted-receipt") || null;
    const refundRecord = refundRecords.find((refund) => refund.invoiceId === invoice.invoiceId && refund.status === "accepted-refund") || null;
    const refundReviews = refundRecords.filter((refund) => refund.invoiceId === invoice.invoiceId && refund.status === "needs-review");
    const receiptReviews = matchingReceipts.filter((receipt) => receipt.status === "needs-review");
    const acceptedErrorRecord = errorRecords.find((error) => error.invoiceId === invoice.invoiceId && error.status === "accepted-error") || null;
    const invoiceErrors = errorRecords.filter((error) => error.invoiceId === invoice.invoiceId && error.status === "needs-review");
    return buildInvoiceArtifact(invoice, { paidReceipt, refundRecord, refundReviews, receiptReviews, acceptedErrorRecord, errorRecords: invoiceErrors });
  });
  const reviewReceipts = receiptRecords.filter((record) => record.status === "needs-review");
  const reviewRefunds = refundRecords.filter((record) => record.status === "needs-review");
  const reviewErrors = errorRecords.filter((record) => record.status === "needs-review");
  const reviewRecords = [...reviewReceipts, ...reviewRefunds, ...reviewErrors];

  return {
    schema: "kaspa-invoice-registry/v1",
    network: fixture.network || "kaspa-testnet-12",
    status: reviewRecords.length
      ? "receipt-review-needed"
      : invoices.some((invoice) => [
        "accepted-receipt-indexed",
        "refunded-receipt-indexed",
        "error-receipt-indexed"
      ].includes(invoice.status))
      ? "has-accepted-invoice-events"
      : "drafts-ready-for-payload-submit",
    summary: {
      total: invoices.length,
      paid: invoices.filter((invoice) => invoice.status === "accepted-receipt-indexed").length,
      refunded: invoices.filter((invoice) => invoice.status === "refunded-receipt-indexed").length,
      errors: invoices.filter((invoice) => invoice.status === "error-receipt-indexed").length,
      draft: invoices.filter((invoice) => invoice.status === "draft-needs-payload-submit").length,
      review: reviewRecords.length,
      duplicateReceipts: reviewReceipts.filter((receipt) => receipt.reviewReason === "duplicate-receipt").length,
      staleReceipts: reviewReceipts.filter((receipt) => receipt.reviewReason === "stale-or-unknown-invoice").length,
      refundReviews: reviewRefunds.length,
      errorReviews: reviewErrors.length,
      totalTkas: invoices.reduce((sum, invoice) => sum + invoice.invoice.amountTkas, 0)
    },
    invoices,
    receipts: receiptRecords,
    refunds: refundRecords,
    errors: errorRecords,
    next: fixture.next || "Submit and verify one tiny TN12 payload receipt transaction, then add its txid as an accepted receipt."
  };
}

export function classifyReceiptRecords(receipts = [], invoices = []) {
  const knownInvoiceIds = new Set(invoices.map((invoice) => invoice.invoiceId));
  const seenAcceptedByInvoice = new Set();

  return receipts.map((receipt) => {
    const invoiceKnown = knownInvoiceIds.has(receipt.invoiceId);
    const accepted = receipt.accepted === true;
    let status = accepted && invoiceKnown ? "accepted-receipt" : "needs-review";
    let reviewReason = null;

    if (!invoiceKnown) {
      status = "needs-review";
      reviewReason = "stale-or-unknown-invoice";
    } else if (!accepted) {
      status = "needs-review";
      reviewReason = "not-accepted";
    } else if (seenAcceptedByInvoice.has(receipt.invoiceId)) {
      status = "needs-review";
      reviewReason = "duplicate-receipt";
    } else {
      seenAcceptedByInvoice.add(receipt.invoiceId);
    }

    return {
      ...receipt,
      status,
      reviewReason
    };
  });
}

export function classifyRefundRecords(refunds = [], invoices = []) {
  const knownInvoiceIds = new Set(invoices.map((invoice) => invoice.invoiceId));
  const seenAcceptedByInvoice = new Set();

  return refunds.map((refund) => {
    const invoiceKnown = knownInvoiceIds.has(refund.invoiceId);
    const accepted = refund.accepted === true;
    let status = accepted && invoiceKnown ? "accepted-refund" : "needs-review";
    let reviewReason = null;

    if (!invoiceKnown) {
      status = "needs-review";
      reviewReason = "stale-or-unknown-invoice";
    } else if (!accepted) {
      status = "needs-review";
      reviewReason = "refund-not-accepted";
    } else if (seenAcceptedByInvoice.has(refund.invoiceId)) {
      status = "needs-review";
      reviewReason = "duplicate-refund";
    } else {
      seenAcceptedByInvoice.add(refund.invoiceId);
    }

    return {
      ...refund,
      status,
      reviewReason
    };
  });
}

export function classifyErrorRecords(errors = [], invoices = []) {
  const knownInvoiceIds = new Set(invoices.map((invoice) => invoice.invoiceId));
  const seenAcceptedByInvoice = new Set();

  return errors.map((error) => {
    const invoiceKnown = knownInvoiceIds.has(error.invoiceId);
    const accepted = error.accepted === true;
    let status = accepted && invoiceKnown ? "accepted-error" : "needs-review";
    let reviewReason = null;

    if (!invoiceKnown) {
      status = "needs-review";
      reviewReason = "stale-or-unknown-invoice";
    } else if (!accepted) {
      status = "needs-review";
      reviewReason = clean(error.reason || "invoice-error", 64);
    } else if (seenAcceptedByInvoice.has(error.invoiceId)) {
      status = "needs-review";
      reviewReason = "duplicate-error";
    } else {
      seenAcceptedByInvoice.add(error.invoiceId);
    }

    return {
      ...error,
      status,
      reviewReason
    };
  });
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
