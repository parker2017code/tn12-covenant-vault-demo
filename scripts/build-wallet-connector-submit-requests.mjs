import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletConnectorSubmitRequests } from "../src/walletConnectorSubmitRequests.mjs";

const submitPackagePath = process.env.WALLET_SUBMIT_PACKAGE || "artifacts/wallet-submit-package.json";
const outPath = process.env.OUT || "artifacts/wallet-connector-submit-requests.json";
const submitPackage = JSON.parse(await readFile(submitPackagePath, "utf8"));
const draftArtifacts = {};

for (const intent of submitPackage.intents || []) {
  draftArtifacts[intent.path] = JSON.parse(await readFile(intent.path, "utf8"));
}

const requests = buildWalletConnectorSubmitRequests({ submitPackage, draftArtifacts });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(requests, null, 2)}\n`);

console.log(outPath);
console.log(`status=${requests.status}`);
console.log(`requests=${requests.summary.requests}`);
console.log(`payloadRequests=${requests.summary.payloadRequests}`);

if (requests.status !== "connector-submit-requests-ready") {
  throw new Error(`Wallet connector submit requests failed: ${requests.status}`);
}
