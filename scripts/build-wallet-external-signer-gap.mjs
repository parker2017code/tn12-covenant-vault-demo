import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletExternalSignerGap } from "../src/walletExternalSignerGap.mjs";

const submitRequestsPath = process.env.WALLET_CONNECTOR_SUBMIT_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const adapterRunPath = process.env.WALLET_CONNECTOR_ADAPTER_RUN || "artifacts/wallet-connector-adapter-run.json";
const outPath = process.env.OUT || "artifacts/wallet-external-signer-gap.json";

const submitRequests = JSON.parse(await readFile(submitRequestsPath, "utf8"));
const adapterRun = JSON.parse(await readFile(adapterRunPath, "utf8"));
const gap = buildWalletExternalSignerGap({ submitRequests, adapterRun });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(gap, null, 2)}\n`);

console.log(outPath);
console.log(`status=${gap.status}`);
console.log(`signedLocalDrafts=${gap.summary.signedLocalDrafts}`);
console.log(`unsignedWalletSignRequests=${gap.summary.unsignedWalletSignRequests}`);
console.log(`liveNoLocalKeySigningReady=${gap.liveNoLocalKeySigningReady}`);

if (gap.status !== "external-signer-gap-documented") {
  throw new Error(`Wallet external signer gap failed: ${gap.status}`);
}
