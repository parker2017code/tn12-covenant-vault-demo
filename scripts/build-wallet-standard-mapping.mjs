import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletStandardMapping } from "../src/walletStandardMapping.mjs";

const unsignedTemplatesPath = process.env.WALLET_UNSIGNED_TEMPLATES || "artifacts/wallet-unsigned-request-templates.json";
const signerReferencesPath = process.env.WALLET_SIGNER_REFERENCES || "docs/WALLET_SIGNER_REFERENCES.md";
const outPath = process.env.OUT || "artifacts/wallet-standard-mapping.json";

const unsignedTemplates = JSON.parse(await readFile(unsignedTemplatesPath, "utf8"));
const signerReferences = await readFile(signerReferencesPath, "utf8");
const mapping = buildWalletStandardMapping({ unsignedTemplates, signerReferences });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(mapping, null, 2)}\n`);

console.log(outPath);
console.log(`status=${mapping.status}`);
console.log(`selectedCandidate=${mapping.selectedCandidate}`);
console.log(`liveWalletIntegrationReady=${mapping.liveWalletIntegrationReady}`);
