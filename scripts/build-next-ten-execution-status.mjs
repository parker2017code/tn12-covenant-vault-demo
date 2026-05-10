import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildNextTenExecutionStatus } from "../src/nextTenExecutionStatus.mjs";

const outPath = process.env.OUT || "artifacts/next-ten-execution-status.json";
const status = buildNextTenExecutionStatus({
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json"),
  receiptGuard: await readJson("artifacts/defi-receipt-replay-guard.json"),
  walletRoundtrip: await readJson("artifacts/wallet-external-signer-roundtrip-plan.json"),
  signerValidation: await readJson("artifacts/wallet-standard-signer-validation.json"),
  signerSim: await readJson("artifacts/wallet-external-signer-sim-results.json"),
  liveAppState: await readJson("artifacts/virtual-chain-live-app-state.json"),
  durableReplayGuard: await readJson("artifacts/durable-replay-promotion-guard.json"),
  submitLedger: await readJson("artifacts/wallet-connector-submit-ledger.json"),
  defiLoop: await readJson("artifacts/defi-v1-operator-loop.json"),
  signerResearch: await readJson("artifacts/external-signer-path-research.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(status, null, 2)}\n`);

console.log(outPath);
console.log(`status=${status.status}`);
console.log(`completed=${status.summary.completed}/${status.summary.tasks}`);
console.log(`realizedGainPercent=${status.summary.realizedGainPercent}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
