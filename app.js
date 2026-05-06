import {
  DEFAULT_POLICY,
  buildLifecycle,
  buildPolicyArtifact,
  normalizePolicy,
  policyId,
  validatePolicy
} from "./src/vaultPolicy.mjs";

const form = document.querySelector("#policy-form");
const policyIdNode = document.querySelector("#policy-id");
const issuesNode = document.querySelector("#issues");
const artifactNode = document.querySelector("#artifact");
const lifecycleNode = document.querySelector("#lifecycle");
const copyButton = document.querySelector("#copy-artifact");
const resetButton = document.querySelector("#reset-policy");

for (const [key, value] of Object.entries(DEFAULT_POLICY)) {
  const input = form.elements[key];
  if (input) input.value = value;
}

form.addEventListener("input", render);
resetButton.addEventListener("click", () => {
  for (const [key, value] of Object.entries(DEFAULT_POLICY)) {
    const input = form.elements[key];
    if (input) input.value = value;
  }
  render();
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(artifactNode.textContent);
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy JSON";
  }, 1200);
});

render();

async function render() {
  const data = Object.fromEntries(new FormData(form).entries());
  const policy = normalizePolicy(data);
  const id = await policyId(policy);
  const issues = validatePolicy(policy);
  const artifact = buildPolicyArtifact(policy, id);

  policyIdNode.textContent = id;
  artifactNode.textContent = JSON.stringify(artifact, null, 2);
  issuesNode.innerHTML = "";
  lifecycleNode.innerHTML = "";

  const issueItems = issues.length
    ? issues
    : ["Policy shape is valid for local simulation. Real TN12 signing and broadcast are not implemented yet."];

  for (const issue of issueItems) {
    const item = document.createElement("li");
    item.textContent = issue;
    issuesNode.append(item);
  }

  for (const step of buildLifecycle(policy)) {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${escapeHtml(step.name)}</strong><span>${escapeHtml(step.actor)}</span><p>${escapeHtml(step.detail)}</p>`;
    lifecycleNode.append(item);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
