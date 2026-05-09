import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletUnsignedRequestTemplates } from "../src/walletUnsignedRequestTemplates.mjs";

const submitPackagePath = process.env.WALLET_SUBMIT_PACKAGE || "artifacts/wallet-submit-package.json";
const outPath = process.env.OUT || "artifacts/wallet-unsigned-request-templates.json";

const submitPackage = JSON.parse(await readFile(submitPackagePath, "utf8"));
const draftArtifacts = {};

for (const intent of submitPackage.intents || []) {
  draftArtifacts[intent.path] = JSON.parse(await readFile(intent.path, "utf8"));
}

const templates = buildWalletUnsignedRequestTemplates({ submitPackage, draftArtifacts });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(templates, null, 2)}\n`);

console.log(outPath);
console.log(`status=${templates.status}`);
console.log(`templates=${templates.summary.templates}`);
console.log(`signatureScriptsStripped=${templates.summary.signatureScriptsStripped}`);
console.log(`standardMapped=${templates.standardMapped}`);

if (templates.status !== "unsigned-request-templates-ready") {
  throw new Error(`Wallet unsigned request templates failed: ${templates.status}`);
}
