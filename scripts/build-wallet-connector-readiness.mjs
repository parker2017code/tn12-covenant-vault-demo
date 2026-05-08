import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletConnectorReadiness } from "../src/walletConnectorReadiness.mjs";

const walletReviewPath = process.env.WALLET_REVIEW || "artifacts/wallet-review-readiness.json";
const outPath = process.env.OUT || "artifacts/wallet-connector-readiness.json";
const walletReview = JSON.parse(await readFile(walletReviewPath, "utf8"));
const readiness = buildWalletConnectorReadiness(walletReview);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(readiness, null, 2)}\n`);

if (readiness.status !== "wallet-connector-spec-ready") {
  throw new Error(`Wallet connector readiness failed: ${readiness.status}`);
}

console.log(outPath);
console.log(`status=${readiness.status}`);
console.log(`drafts=${readiness.summary.drafts}`);
console.log(`payloadDrafts=${readiness.summary.payloadDrafts}`);
