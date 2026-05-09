import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletStandardRequests } from "../src/walletStandardRequests.mjs";

const walletMappingPath = process.env.WALLET_STANDARD_MAPPING || "artifacts/wallet-standard-mapping.json";
const unsignedTemplatesPath = process.env.WALLET_UNSIGNED_TEMPLATES || "artifacts/wallet-unsigned-request-templates.json";
const outPath = process.env.OUT || "artifacts/wallet-standard-requests.json";

const walletMapping = JSON.parse(await readFile(walletMappingPath, "utf8"));
const unsignedTemplates = JSON.parse(await readFile(unsignedTemplatesPath, "utf8"));
const requests = buildWalletStandardRequests({ walletMapping, unsignedTemplates });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(requests, null, 2)}\n`);

console.log(outPath);
console.log(`status=${requests.status}`);
console.log(`mappedRequests=${requests.summary.mappedRequests}`);
console.log(`blocking=${requests.summary.blocking}`);
