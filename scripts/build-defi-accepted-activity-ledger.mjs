import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiAcceptedActivityLedger } from "../src/defiAcceptedActivityLedger.mjs";

const outPath = process.env.OUT || "artifacts/defi-accepted-activity-ledger.json";
const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
const poolWallet = await readJson("fixtures/DefiLocalPoolWallet.public.json");
const payloadEvidenceByPath = Object.fromEntries(await Promise.all(
  (payloadEvents.events || []).map(async (event) => [event.outPath, await readOptionalJson(event.outPath)])
));
const transferPaths = [
  "artifacts/tn12-defi-pool-deposit-001-evidence.json",
  "artifacts/tn12-defi-wallet-a-liquidity-deposit-001-evidence.json",
  "artifacts/tn12-defi-wallet-b-liquidity-deposit-001-evidence.json",
  "artifacts/tn12-defi-local-users-funding-001-evidence.json",
  "artifacts/tn12-defi-user-01-pool-deposit-001-evidence.json",
  "artifacts/tn12-defi-user-02-pool-deposit-001-evidence.json",
  "artifacts/tn12-defi-user-03-pool-deposit-001-evidence.json",
  "artifacts/tn12-defi-user-04-pool-deposit-001-evidence.json",
  "artifacts/tn12-defi-user-05-pool-deposit-001-evidence.json",
  "artifacts/tn12-defi-pool-swap-payout-user-01-evidence.json",
  "artifacts/tn12-defi-pool-withdraw-payout-user-02-evidence.json",
  "artifacts/tn12-scheduler-execution-payout-user-03-evidence.json",
  "artifacts/playground-funding-evidence.json",
  "artifacts/playground-funding-20260512-evidence.json",
  "artifacts/complex-defi-multi-wallet-20260512-evidence.json",
  "artifacts/playground-user-a-pool-deposit-evidence.json",
  "artifacts/playground-user-b-pool-deposit-evidence.json",
  "artifacts/playground-pool-user-b-payout-evidence.json"
];
const transferEvidenceByPath = Object.fromEntries(await Promise.all(
  transferPaths.map(async (path) => [path, await readOptionalJson(path)])
));
const labeledPoolAddresses = Object.values(transferEvidenceByPath)
  .flatMap((evidence) => evidence.outputs || [])
  .filter((output) => /:pool$|pool$/i.test(output.label || ""))
  .map((output) => output.expected?.address || output.observed?.address || "")
  .filter(Boolean);
const ledger = buildDefiAcceptedActivityLedger({
  payloadEvents,
  payloadEvidenceByPath,
  transferEvidenceByPath,
  poolAddress: poolWallet.address,
  poolAddresses: [
    poolWallet.address,
    "kaspatest:qpa69mcl63hffd8lral24ycnzt8spvdxr8wxvaxh0m52rhtzwfq5vythc2ehg",
    ...labeledPoolAddresses
  ]
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(outPath);
console.log(`status=${ledger.status}`);
console.log(`acceptedTransferRows=${ledger.summary.acceptedTransferRows}`);
console.log(`poolNetTkas=${ledger.summary.poolNetTkas}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch {
    return {};
  }
}
