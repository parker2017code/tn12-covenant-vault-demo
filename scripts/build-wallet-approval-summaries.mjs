import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletApprovalSummaries } from "../src/walletApprovalSummaries.mjs";

const outPath = process.env.OUT || "artifacts/wallet-approval-summaries.json";

const [resetProof, resetDraft, continuation, siblingDiscovery, muxLiveFlow, muxChallenge] = await Promise.all([
  readJson("artifacts/recurring-treasury-vault-window-reset-proof.json"),
  readJson("artifacts/signed-drafts/recurring-treasury-vault-window-reset.json"),
  readJson("fixtures/RecurringTreasuryVaultWindowResetContinuationOutpoint.json"),
  readJson("artifacts/sibling-input-discovery.json"),
  readJson("artifacts/blitz-mux-live-flow-evidence.json"),
  readJson("artifacts/blitz-mux-challenge-settlement.json")
]);

const artifact = buildWalletApprovalSummaries({
  resetProof,
  resetDraft,
  continuation,
  siblingDiscovery,
  muxLiveFlow,
  muxChallenge
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
