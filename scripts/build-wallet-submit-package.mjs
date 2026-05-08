import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletSubmitPackage } from "../src/walletSubmitPackage.mjs";

const walletReviewPath = process.env.WALLET_REVIEW || "artifacts/wallet-review-readiness.json";
const walletConnectorPath = process.env.WALLET_CONNECTOR || "artifacts/wallet-connector-readiness.json";
const outPath = process.env.OUT || "artifacts/wallet-submit-package.json";

const walletReview = JSON.parse(await readFile(walletReviewPath, "utf8"));
const walletConnector = JSON.parse(await readFile(walletConnectorPath, "utf8"));
const submitPackage = buildWalletSubmitPackage({ walletReview, walletConnector });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(submitPackage, null, 2)}\n`);

if (submitPackage.status !== "wallet-submit-package-ready") {
  throw new Error(`Wallet submit package failed: ${submitPackage.status}`);
}

console.log(outPath);
console.log(`drafts=${submitPackage.summary.total}`);
console.log(`payloadDrafts=${submitPackage.summary.payloadDrafts}`);
console.log(`contractDrafts=${submitPackage.summary.contractDrafts}`);
