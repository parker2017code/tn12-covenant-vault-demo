import { readFile } from "node:fs/promises";

const [provenStatus, payloadEvents, readme, progress, mainnetReadiness] = await Promise.all([
  readJson("artifacts/proven-status.json"),
  readJson("fixtures/PayloadEventEvidence.json"),
  readText("README.md"),
  readText("docs/PROGRESS.md"),
  readText("MAINNET_READINESS.md")
]);

const expectedPayloadEvents = Number(provenStatus.acceptedEvidence?.payloadEvents);
const observedPayloadEvents = Array.isArray(payloadEvents.events)
  ? payloadEvents.events.length
  : Number(payloadEvents.summary?.total || payloadEvents.length || 0);

if (!Number.isInteger(expectedPayloadEvents) || expectedPayloadEvents <= 0) {
  throw new Error("artifacts/proven-status.json missing acceptedEvidence.payloadEvents.");
}
if (observedPayloadEvents !== expectedPayloadEvents) {
  throw new Error(`Payload event fixture count mismatch: fixture=${observedPayloadEvents} proven-status=${expectedPayloadEvents}.`);
}

const requiredSnippets = [
  ["README.md", readme, [`${expectedPayloadEvents} payload events`, `${expectedPayloadEvents} accepted payload events`]],
  ["docs/PROGRESS.md", progress, [`${expectedPayloadEvents} accepted payload events`, `${expectedPayloadEvents} payload events accepted`]],
  ["MAINNET_READINESS.md", mainnetReadiness, [`${expectedPayloadEvents} accepted payload events`]]
];

for (const [path, text, acceptedPhrases] of requiredSnippets) {
  if (!acceptedPhrases.some((phrase) => text.includes(phrase))) {
    throw new Error(`${path} missing canonical payload count phrase for ${expectedPayloadEvents} payload events`);
  }
}

console.log(`Count checks passed. payloadEvents=${expectedPayloadEvents}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readText(path) {
  return await readFile(path, "utf8");
}
