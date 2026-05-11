import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildOperatorReceiptPack } from "../src/operatorReceiptPack.mjs";

const outPath = process.env.OUT || "artifacts/operator-receipt-pack.json";

const pack = buildOperatorReceiptPack({
  provenStatus: await readJson("artifacts/proven-status.json"),
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json"),
  proofEvidence: await readJson("artifacts/proof-evidence.json"),
  roleProofEvidence: await readJson("artifacts/role-separated-proof-evidence.json"),
  payloadManifest: await readJson("fixtures/PayloadEventEvidence.json"),
  operatorLoop: await readJson("artifacts/defi-v1-operator-loop.json"),
  submitLedger: await readJson("artifacts/wallet-connector-submit-ledger.json"),
  auctionCustodyReview: await readJson("artifacts/auction-custody-review.json"),
  agentSettlementReview: await readJson("artifacts/agent-settlement-review.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(pack, null, 2)}\n`);

console.log(outPath);
console.log(`status=${pack.status}`);
console.log(`currentPercent=${pack.currentPercent}`);
console.log(`payloadEvents=${pack.evidence.payloadEvents}`);
console.log(`custodyReadyRows=${pack.custody.auctionReadyRows + pack.custody.agentReadyRows}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
