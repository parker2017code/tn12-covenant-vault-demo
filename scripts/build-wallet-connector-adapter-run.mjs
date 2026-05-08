import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletConnectorAdapterRun } from "../src/walletConnectorAdapterRun.mjs";

const requestPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/wallet-connector-adapter-run.json";

const submitRequests = JSON.parse(await readFile(requestPath, "utf8"));
const adapterRun = buildWalletConnectorAdapterRun({ submitRequests });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(adapterRun, null, 2)}\n`);

console.log(outPath);
console.log(`status=${adapterRun.status}`);
console.log(`reviewReady=${adapterRun.summary.reviewReady}`);
console.log(`submitBroadcasts=${adapterRun.summary.submitBroadcasts}`);
