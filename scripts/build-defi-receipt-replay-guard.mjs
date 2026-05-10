import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiReceiptReplayGuard } from "../src/defiReceiptReplayGuard.mjs";

const outPath = process.env.OUT || "artifacts/defi-receipt-replay-guard.json";
const paths = [
  "artifacts/payload-defi-v1-live-receipt-evidence.json",
  "artifacts/payload-defi-v1-repeat-receipt-evidence.json",
  "artifacts/payload-defi-v1-multi-wallet-a-evidence.json",
  "artifacts/payload-defi-v1-multi-wallet-b-evidence.json"
];
const receiptEvidence = await Promise.all(paths.map(readJson));
const first = receiptEvidence[0];
const duplicateCandidates = [
  candidateFromEvidence(first),
  candidateFromEvidence(first)
];
const staleCandidates = [
  { txid: "unknown-defi-receipt-txid", subject: "defi-v1-stale-receipt", walletAddress: "kaspatest:unknown" }
];

const guard = buildDefiReceiptReplayGuard({ receiptEvidence, duplicateCandidates, staleCandidates });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(guard, null, 2)}\n`);

console.log(outPath);
console.log(`status=${guard.status}`);
console.log(`acceptedReceipts=${guard.summary.acceptedReceipts}`);
console.log(`negativeCasesCaught=${guard.summary.negativeCasesCaught}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function candidateFromEvidence(evidence) {
  return {
    txid: evidence.txid,
    subject: evidence.payload?.decoded?.payload?.subject || "",
    walletAddress: evidence.output?.expected?.destination || evidence.output?.observed?.address || evidence.output?.actual?.address || ""
  };
}
