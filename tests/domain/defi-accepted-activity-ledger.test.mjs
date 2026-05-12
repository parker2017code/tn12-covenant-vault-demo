import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDefiAcceptedActivityLedger } from "../../src/defiAcceptedActivityLedger.mjs";

const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
const poolWallet = await readJson("fixtures/DefiLocalPoolWallet.public.json");
const payloadEvidenceByPath = Object.fromEntries(await Promise.all(
  payloadEvents.events.map(async (event) => [event.outPath, await readOptionalJson(event.outPath)])
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
  "artifacts/complex-defi-user-a-pool-deposit-20260512-evidence.json",
  "artifacts/complex-defi-user-b-pool-deposit-20260512-evidence.json",
  "artifacts/complex-defi-pool-user-b-payout-20260512-evidence.json",
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
  ],
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(ledger.schema, "tn12-defi-accepted-activity-ledger/v1");
assert.equal(ledger.status, "accepted-activity-ledger-ready");
assert.equal(ledger.enforcement, "LOCAL_KEY_CUSTODY_TEST");
assert.ok(ledger.summary.acceptedReceiptRows >= 7);
assert.equal(ledger.summary.acceptedTransferRows, 40);
assert.equal(ledger.summary.poolDeposits, 13);
assert.equal(ledger.summary.poolPayouts, 5);
assert.equal(ledger.summary.poolNetTkas, "326.5");
assert.equal(ledger.summary.externalSignerClaims, 0);
assert.equal(ledger.summary.autonomousCustodyClaims, 0);
assert.ok(ledger.transferRows.every((row) => row.accepted && row.matches));
assert.ok(ledger.pool.netTkas);

const artifact = await readJson("artifacts/defi-accepted-activity-ledger.json");
assert.equal(artifact.status, ledger.status);
assert.equal(artifact.summary.acceptedTransferRows, ledger.summary.acceptedTransferRows);

console.log("DeFi accepted activity ledger tests passed.");

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
