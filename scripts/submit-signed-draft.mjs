import { readFile } from "node:fs/promises";
import { buildSubmitPayload } from "../src/submitPayload.mjs";

const artifactPath = process.argv[2] || "artifacts/signed-drafts/split-funding.json";
const shouldSubmit = process.argv.includes("--submit");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const payload = artifact.submitPayload || buildSubmitPayload(artifact.signedTransaction);

if (!shouldSubmit) {
  console.log(JSON.stringify({
    status: "dry-run-not-submitted",
    endpoint: "https://api-tn12.kaspa.org/transactions",
    artifactPath,
    transactionId: artifact.transactionId,
    payload
  }, null, 2));
  process.exit(0);
}

if (artifact.requiresPayloadSubmitSupport && process.env.ALLOW_PAYLOAD_REST_SUBMIT !== "1") {
  throw new Error("This artifact carries a transaction payload. The TN12 REST submit OpenAPI schema does not list payload in SubmitTxModel, so set ALLOW_PAYLOAD_REST_SUBMIT=1 only after manually accepting that risk.");
}

const response = await fetch("https://api-tn12.kaspa.org/transactions", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});
const body = await response.json();
console.log(JSON.stringify({
  status: response.ok ? "submitted" : "submit-failed",
  httpStatus: response.status,
  body
}, null, 2));
