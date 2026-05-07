import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSignedContractFundingDraft } from "../src/signedContractDrafts.mjs";

const sourcePath = process.env.ESCROW_FUNDING_SOURCE || "fixtures/FundedWalletOutpoint.json";
const outPath = process.env.ESCROW_FUNDING_OUT || "artifacts/signed-drafts/escrow-funding.json";
const contractPath = process.env.ESCROW_CONTRACT_ARTIFACT || "artifacts/Escrow.json";
const lane = process.env.ESCROW_FUNDING_LANE || "escrow-funding";
const amountTkas = Number(process.env.ESCROW_FUNDING_TKAS || "50");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");

const funding = await readJson(sourcePath);
const wallet = await readJson(".local/tn12-wallet.json");
const escrowContract = await readJson(contractPath);

const draft = buildSignedContractFundingDraft({
  funding,
  wallet,
  contractArtifact: escrowContract,
  lane,
  amountTkas,
  minerFeeSompi
});

await mkdir("artifacts/signed-drafts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(draft, null, 2)}\n`);
console.log(`${outPath} transactionId=${draft.transactionId}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
