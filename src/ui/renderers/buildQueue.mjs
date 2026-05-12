import { fetchJson } from "../dataLoader.mjs";
import { escapeHtml } from "../formatters.mjs";

export async function renderBuildQueue(documentRef = document) {
  const buildQueueNode = documentRef.querySelector("#build-queue");
  if (!buildQueueNode) return;

  try {
    const data = await fetchJson("fixtures/EcosystemBuildQueue.json");
    buildQueueNode.innerHTML = "";

    for (const item of data.items) {
      const article = documentRef.createElement("article");
      article.className = "queue-card";
      article.innerHTML = `
        <span>${escapeHtml(item.lane)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.why)}</p>
        <small>${escapeHtml(item.next)}</small>
      `;
      buildQueueNode.append(article);
    }
  } catch (error) {
    buildQueueNode.textContent = `Build queue unavailable: ${error.message}`;
  }
}
