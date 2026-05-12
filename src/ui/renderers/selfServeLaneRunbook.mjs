import { fetchJson } from "../dataLoader.mjs";
import { cssEscape, escapeHtml, publicLaneText } from "../formatters.mjs";

export async function renderSelfServeLaneRunbook(documentRef = document) {
  const selfServeLanesNode = documentRef.querySelector("#self-serve-lanes");
  if (!selfServeLanesNode) return;

  try {
    const runbook = await fetchJson("artifacts/self-serve-lane-runbook.json");
    selfServeLanesNode.innerHTML = "";

    for (const lane of runbook.lanes) {
      const article = documentRef.createElement("article");
      article.className = `self-serve-card lane-${cssEscape(lane.status)}`;
      article.innerHTML = `
        <div class="self-serve-card-head">
          <span>${escapeHtml(publicLaneStatus(lane.status))}</span>
          <a href="${escapeHtml(lane.uiTarget)}">${escapeHtml(publicLaneText(lane.title))}</a>
        </div>
        <p><a class="button-link" href="${escapeHtml(lane.uiTarget)}">Open this lane</a></p>
        <p class="self-serve-layer">${escapeHtml(lane.stackLayer.replaceAll("-", " "))}</p>
        <div>
          <strong>Available now</strong>
          <ul>${lane.availableNow.map((item) => `<li>${escapeHtml(publicLaneText(item))}</li>`).join("")}</ul>
        </div>
        <details>
          <summary>How to run it</summary>
          <ol>${lane.runSteps.map((item) => `<li>${escapeHtml(publicLaneText(item))}</li>`).join("")}</ol>
        </details>
        <details>
          <summary>Evidence and commands</summary>
          <p>${lane.evidence.map((item) => artifactLink(item, publicLaneText(item))).join(" ")}</p>
          <p>${lane.commands.map((item) => `<code>${escapeHtml(publicLaneText(item))}</code>`).join(" ")}</p>
        </details>
        <p class="self-serve-open-rail"><strong>Missing piece:</strong> ${escapeHtml(publicLaneText(lane.openRail.join(" ")))}</p>
      `;
      selfServeLanesNode.append(article);
    }
  } catch (error) {
    selfServeLanesNode.textContent = `Self-serve runbook unavailable: ${error.message}`;
  }
}

function publicLaneStatus(status) {
  const labels = {
    "required-rail": "wallet",
    "research-play": "study",
    "play-next": "try next",
    "play-now": "try now",
    "design-now": "design",
    "start-here": "start"
  };
  return labels[status] || status.replaceAll("-", " ");
}

function artifactLink(path, label = path) {
  const value = String(path || "");
  const text = String(label || value);
  if (/^(artifacts|fixtures|docs|contracts|scripts|src)\//.test(value)) {
    return `<a href="${escapeHtml(value)}"><code>${escapeHtml(text)}</code></a>`;
  }
  return `<code>${escapeHtml(text)}</code>`;
}
