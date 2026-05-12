import { fetchJson } from "../dataLoader.mjs";
import { cssEscape, escapeHtml, publicLaneText } from "../formatters.mjs";

export async function renderUniversalSchedulerWorkbench(documentRef = document) {
  const summaryNode = documentRef.querySelector("#scheduler-workbench-summary");
  const jobsNode = documentRef.querySelector("#scheduler-workbench-jobs");
  const predictionsNode = documentRef.querySelector("#scheduler-workbench-predictions");
  if (!summaryNode || !jobsNode || !predictionsNode) return;

  try {
    const workbench = await fetchJson("artifacts/universal-scheduler-workbench.json");
    summaryNode.innerHTML = `
      <article><span>Jobs</span><strong>${escapeHtml(workbench.summary.jobs)}</strong><p>Trigger, bid, binding, coordination, auction, and agent rows.</p></article>
      <article><span>TN12 evidence</span><strong>${escapeHtml(workbench.summary.acceptedEvidenceJobs)}</strong><p>Jobs with accepted transaction evidence.</p></article>
      <article><span>Replay checks</span><strong>${escapeHtml(workbench.summary.replayCheckedJobs)}</strong><p>Rows with deterministic checks over current artifacts.</p></article>
      <article><span>Blocked cases</span><strong>${escapeHtml(workbench.summary.blockedPredictions)}</strong><p>Expected bad paths that must not promote.</p></article>
      <article><span>Protocol scheduler</span><strong>${escapeHtml(workbench.summary.protocolSchedulerClaims)}</strong><p>Separate research work.</p></article>
      <article><span>Wallet settlement</span><strong>${escapeHtml(workbench.summary.autonomousCustodyClaims)}</strong><p>Needs wallet-reviewed settlement first.</p></article>
    `;

    jobsNode.innerHTML = "";
    if (workbench.runThisFirst) {
      jobsNode.append(renderFirstRunCard(documentRef, workbench.runThisFirst));
    }
    for (const job of workbench.jobs) {
      jobsNode.append(renderJobCard(documentRef, job));
    }

    predictionsNode.innerHTML = `
      <article><span>Expected behavior</span><strong>What should happen</strong><ul>${workbench.expectedBehavior.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
      <article><span>Next tests</span><strong>Predictions to break</strong><ul>${workbench.predictionsToTestNext.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
    `;
  } catch (error) {
    summaryNode.textContent = `Scheduler workbench unavailable: ${error.message}`;
  }
}

function renderFirstRunCard(documentRef, firstRun) {
  const article = documentRef.createElement("article");
  article.className = "scheduler-job scheduler-run-first";
  article.innerHTML = `
    <span>run first</span>
    <strong>${escapeHtml(firstRun.title)}</strong>
    <p>${escapeHtml(firstRun.userGoal)}</p>
    <p class="scheduler-observed">${escapeHtml(firstRun.expectedResult)}</p>
    <details open>
      <summary>Steps and evidence</summary>
      <ol>${firstRun.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      <p>${firstRun.currentEvidence.map((item) => `<code>${escapeHtml(item)}</code>`).join(" ")}</p>
      <p>${escapeHtml(publicLaneText(firstRun.nextUpgrade))}</p>
    </details>
  `;
  return article;
}

function renderJobCard(documentRef, job) {
  const article = documentRef.createElement("article");
  article.className = `scheduler-job scheduler-${cssEscape(job.replayCheck)}`;
  article.innerHTML = `
    <span>${escapeHtml(job.lane)} · ${escapeHtml(job.tn12Reality)}</span>
    <strong>${escapeHtml(job.title)}</strong>
    <p>${escapeHtml(job.expected)}</p>
    <p class="scheduler-observed">${escapeHtml(job.observed)}</p>
    <details>
      <summary>Evidence and blocked cases</summary>
      <p>${job.evidence.map((item) => `<code>${escapeHtml(item)}</code>`).join(" ")}</p>
      <ul>${job.blockedCases.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </details>
  `;
  return article;
}
