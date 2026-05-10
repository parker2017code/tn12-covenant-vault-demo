import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildProvenStatus } from "../src/provenStatus.mjs";

const outPath = process.env.OUT || "artifacts/proven-status.json";

const status = buildProvenStatus({
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json"),
  proofEvidence: await readJson("artifacts/proof-evidence.json"),
  roleProofEvidence: await readJson("artifacts/role-separated-proof-evidence.json"),
  signerValidation: await readJson("artifacts/wallet-standard-signer-validation.json"),
  durableReplayGuard: await readJson("artifacts/durable-replay-promotion-guard.json"),
  auctionCustodyReview: await readJson("artifacts/auction-custody-review.json"),
  agentSettlementReview: await readJson("artifacts/agent-settlement-review.json"),
  nextTenStatus: await readJson("artifacts/next-ten-execution-status.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(status, null, 2)}\n`);

console.log(outPath);
console.log(`status=${status.status}`);
console.log(`currentPercent=${status.currentPercent}`);
console.log(`blockers=${status.blockers.length}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
