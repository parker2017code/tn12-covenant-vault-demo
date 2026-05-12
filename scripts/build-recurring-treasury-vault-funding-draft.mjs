import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSignedContractFundingDraft } from "../src/signedContractDrafts.mjs";

const funding = await readJson(process.env.RECURRING_TREASURY_FUNDING_OUTPOINT || "fixtures/FundedWalletOutpoint.json");
const wallet = await readJson(".local/tn12-wallet.json");
const contractArtifact = await readJson("artifacts/RecurringTreasuryVault.json");
const amountTkas = Number(process.env.RECURRING_TREASURY_FUNDING_TKAS || "150");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");

const draft = buildSignedContractFundingDraft({
  funding,
  wallet,
  contractArtifact,
  lane: "recurring-treasury-vault-funding",
  amountTkas,
  minerFeeSompi
});

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile("artifacts/signed-drafts/recurring-treasury-vault-funding.json", `${JSON.stringify(draft, null, 2)}\n`);

console.log(`artifacts/signed-drafts/recurring-treasury-vault-funding.json transactionId=${draft.transactionId}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
