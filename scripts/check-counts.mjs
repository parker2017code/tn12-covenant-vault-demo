import { readFile } from "node:fs/promises";

const [provenStatus, operatorPack, payloadEvents, readme, indexHtml, progress, mainnetReadiness] = await Promise.all([
  readJson("artifacts/proven-status.json"),
  readJson("artifacts/operator-receipt-pack.json"),
  readJson("fixtures/PayloadEventEvidence.json"),
  readText("README.md"),
  readText("index.html"),
  readText("docs/PROGRESS.md"),
  readText("MAINNET_READINESS.md")
]);

const expectedPayloadEvents = readPositiveInteger(provenStatus.acceptedEvidence?.payloadEvents, "acceptedEvidence.payloadEvents");
const expectedProofTransactions = readPositiveInteger(provenStatus.acceptedEvidence?.proofTransactions, "acceptedEvidence.proofTransactions");
const expectedRoleProofTransactions = readPositiveInteger(provenStatus.acceptedEvidence?.roleSeparatedProofTransactions, "acceptedEvidence.roleSeparatedProofTransactions");
const expectedCheckpointRecords = readPositiveInteger(provenStatus.acceptedEvidence?.checkpointRecords, "acceptedEvidence.checkpointRecords");
const observedPayloadEvents = Array.isArray(payloadEvents.events)
  ? payloadEvents.events.length
  : Number(payloadEvents.summary?.total || payloadEvents.length || 0);

if (observedPayloadEvents !== expectedPayloadEvents) {
  throw new Error(`Payload event fixture count mismatch: fixture=${observedPayloadEvents} proven-status=${expectedPayloadEvents}.`);
}

const operatorEvidence = operatorPack.evidence || {};
const operatorCountFields = [
  ["payloadEvents", expectedPayloadEvents],
  ["manifestEvents", expectedPayloadEvents],
  ["coreProofTransactions", expectedProofTransactions],
  ["roleSeparatedProofTransactions", expectedRoleProofTransactions],
  ["checkpointRecords", expectedCheckpointRecords],
  ["matchedRecords", expectedCheckpointRecords]
];

for (const [field, expected] of operatorCountFields) {
  const observed = readPositiveInteger(operatorEvidence[field], `operator-receipt-pack.evidence.${field}`);
  if (observed !== expected) {
    throw new Error(`Operator pack count mismatch for ${field}: operator=${observed} proven-status=${expected}.`);
  }
}

if (!Array.isArray(operatorPack.wallet?.acceptedReceipts) || operatorPack.wallet.acceptedReceipts.length < 4) {
  throw new Error("Operator pack must keep at least four accepted wallet receipts.");
}

const requiredSnippets = [
  [
    "README.md",
    readme,
    [
      [`${expectedPayloadEvents} payload events`, `${expectedPayloadEvents} accepted payload events`],
      [`${expectedRoleProofTransactions} role-separated`, `all ${expectedRoleProofTransactions}`]
    ]
  ],
  ["index.html", indexHtml, [`${expectedPayloadEvents}</strong>`, `${expectedRoleProofTransactions} role-separated`, `${expectedCheckpointRecords} indexed records`]],
  ["docs/PROGRESS.md", progress, [[`${expectedPayloadEvents} accepted payload events`, `${expectedPayloadEvents} payload events accepted`]]],
  ["MAINNET_READINESS.md", mainnetReadiness, [`${expectedPayloadEvents} accepted payload events`, `${expectedProofTransactions + expectedRoleProofTransactions} proof paths`, [`${expectedRoleProofTransactions} role-separated`, `all seven role-separated`]]]
];

for (const [path, text, requiredGroups] of requiredSnippets) {
  for (const group of requiredGroups) {
    const alternatives = Array.isArray(group) ? group : [group];
    if (!alternatives.some((phrase) => text.includes(phrase))) {
      throw new Error(`${path} missing canonical count phrase; expected one of: ${alternatives.join(" | ")}`);
    }
  }
}

console.log(`Count checks passed. payloadEvents=${expectedPayloadEvents}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readText(path) {
  return await readFile(path, "utf8");
}

function readPositiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`artifacts/proven-status.json missing ${label}.`);
  }
  return parsed;
}
