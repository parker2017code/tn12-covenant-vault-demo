import { readFile, writeFile, mkdir } from "node:fs/promises";
import { buildSubmitPayload } from "../src/submitPayload.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

const TN12_ENDPOINT = "https://api-tn12.kaspa.org/transactions";

console.log("=== Batch-Assurance Funding Submission to TN12 ===\n");

// Load batch funding draft
const draftPath = "artifacts/signed-drafts/batch-assurance-pledge-funding.json";
const draft = JSON.parse(await readFile(draftPath, "utf8"));

console.log(`Draft: ${draftPath}`);
console.log(`TxID: ${draft.transactionId}`);
console.log(`Status: ${draft.status}`);
console.log(`Endpoint: ${TN12_ENDPOINT}\n`);

if (draft.status !== "signed-not-broadcast") {
  console.error(`✗ Draft status is "${draft.status}", expected "signed-not-broadcast"`);
  process.exit(1);
}

// Build payload
const payload = draft.submitPayload || buildSubmitPayload(draft.signedTransaction);

console.log("Submitting...");
const response = await fetch(TN12_ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});

const body = await response.json();

const result = {
  schema: "tn12-batch-assurance-funding-submission/v1",
  timestamp: new Date().toISOString(),
  draftPath,
  transactionId: draft.transactionId,
  endpoint: TN12_ENDPOINT,
  httpStatus: response.status,
  submission: {
    status: response.ok ? "submitted" : "failed",
    response: body
  }
};

// Check if accepted
const isAccepted = body.transactionid === draft.transactionId || response.ok;

console.log(`\nStatus: ${response.ok ? "✓ SUBMITTED" : "✗ SUBMISSION FAILED"}`);
console.log(`HTTP: ${response.status}`);

if (body.transactionid) {
  console.log(`✓ Transaction accepted: ${body.transactionid}`);
  result.submission.accepted = true;
  result.submission.transactionId = body.transactionid;
}

if (body.error) {
  console.log(`Error: ${body.error}`);
  result.submission.error = body.error;
}

await writeFile(`${outDir}/tn12-batch-assurance-funding-submission.json`, JSON.stringify(result, null, 2));

console.log(`\nResult saved: ${outDir}/tn12-batch-assurance-funding-submission.json`);

process.exit(response.ok ? 0 : 1);
