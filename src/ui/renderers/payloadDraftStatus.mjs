import { fetchJson } from "../dataLoader.mjs";
import { escapeHtml, shortTxid } from "../formatters.mjs";

export async function renderPayloadDraftStatus(documentRef = document) {
  const payloadDraftStatusNode = documentRef.querySelector("#payload-draft-status");
  if (!payloadDraftStatusNode) return;

  try {
    const draft = await fetchJson("artifacts/signed-drafts/payload-receipt-self-send.json");
    payloadDraftStatusNode.innerHTML = `
      <article>
        <span>${escapeHtml(draft.status)}</span>
        <strong>${escapeHtml(shortTxid(draft.transactionId))}</strong>
        <p>${escapeHtml(draft.receipt.encoded.bytes)} payload bytes; accepted through TN12 JSON wRPC. Public REST submit did not preserve payload bytes in this test.</p>
        <small>${escapeHtml(draft.receipt.payload.kind)} / ${escapeHtml(draft.receipt.payload.subject)}</small>
      </article>
    `;
  } catch (error) {
    payloadDraftStatusNode.innerHTML = `
      <article>
        <span>draft-needed</span>
        <strong>Run npm run tx:payload</strong>
        <p>${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}
