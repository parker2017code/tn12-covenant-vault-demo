import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildExternalSignerPayloadRequest } from "../src/externalSignerPayloadRequest.mjs";

const unsignedTemplatesPath = process.env.WALLET_UNSIGNED_TEMPLATES || "artifacts/wallet-unsigned-request-templates.json";
const outPath = process.env.OUT || "artifacts/external-signer-payload-request.json";

const unsignedTemplates = JSON.parse(await readFile(unsignedTemplatesPath, "utf8"));
const artifact = buildExternalSignerPayloadRequest({ unsignedTemplates });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`requestId=${artifact.request?.requestId || ""}`);

if (artifact.status !== "unsigned-payload-request-ready") {
  throw new Error(`External signer payload request failed: ${artifact.status}`);
}
