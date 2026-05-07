import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  buildPayloadSubmitReadiness,
  extractOpenApiPayloadProperties
} from "../src/payloadSubmitReadiness.mjs";

const outPath = process.env.OUT || "artifacts/payload-submit-readiness.json";
const openapiUrl = process.env.OPENAPI_URL || "https://api-tn12.kaspa.org/openapi.json";
const signedDraftPath = process.env.PAYLOAD_DRAFT || "artifacts/signed-drafts/payload-receipt-self-send.json";
const observedAttemptPath = process.env.PAYLOAD_ATTEMPT || "fixtures/PayloadSubmitAttempt.json";

const [openapiResponse, signedDraftText] = await Promise.all([
  fetch(openapiUrl),
  readFile(signedDraftPath, "utf8")
]);

if (!openapiResponse.ok) {
  throw new Error(`OpenAPI fetch failed: ${openapiResponse.status} ${openapiResponse.statusText}`);
}

const openapi = await openapiResponse.json();
const signedDraft = JSON.parse(signedDraftText);
const observedAttempt = await readOptionalJson(observedAttemptPath);
const readiness = buildPayloadSubmitReadiness({
  network: "kaspa-testnet-12",
  checkedAt: new Date().toISOString(),
  source: openapiUrl,
  signedDraftHasPayload: Boolean(signedDraft.submitPayload?.transaction?.payload),
  observedAttempt,
  ...extractOpenApiPayloadProperties(openapi)
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(readiness, null, 2)}\n`);
console.log(outPath);
console.log(readiness.status);

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
