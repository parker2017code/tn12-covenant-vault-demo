import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletReviewReadiness } from "../src/walletReview.mjs";

const registryPath = process.env.SUBMIT_REGISTRY || "artifacts/submit-console-registry.json";
const outPath = process.env.OUT || "artifacts/wallet-review-readiness.json";
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const readiness = buildWalletReviewReadiness(registry);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(readiness, null, 2)}\n`);

if (readiness.status !== "wallet-review-ready") {
  throw new Error(`Wallet review readiness failed: ${readiness.summary.ready}/${readiness.summary.total} ready`);
}

console.log(outPath);
console.log(`ready=${readiness.summary.ready}/${readiness.summary.total}`);
console.log(`payloadRouteReady=${readiness.summary.payloadRouteReady}/${readiness.summary.payloadDrafts}`);
