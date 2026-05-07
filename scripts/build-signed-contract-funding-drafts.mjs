import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSignedContractFundingDraft } from "../src/signedContractDrafts.mjs";

const vaultFunding = await readJson("fixtures/VaultBucketOutpoint.json");
const assuranceFunding = await readJson("fixtures/AssuranceBucketOutpoint.json");
const wallet = await readJson(".local/tn12-wallet.json");
const vaultContract = await readJson("artifacts/DelayedRecoveryVault.json");
const assuranceContract = await readJson("artifacts/AssurancePledge.json");
const minerFeeSompi = BigInt(process.env.MINER_FEE_SOMPI || "5000");

const drafts = [
  {
    path: "artifacts/signed-drafts/vault-funding.json",
    draft: buildSignedContractFundingDraft({
      funding: vaultFunding,
      wallet,
      contractArtifact: vaultContract,
      lane: "vault-funding",
      amountTkas: Number(process.env.VAULT_FUNDING_TKAS || "25"),
      minerFeeSompi
    })
  },
  {
    path: "artifacts/signed-drafts/assurance-pledge.json",
    draft: buildSignedContractFundingDraft({
      funding: assuranceFunding,
      wallet,
      contractArtifact: assuranceContract,
      lane: "assurance-pledge",
      amountTkas: Number(process.env.ASSURANCE_PLEDGE_TKAS || "250"),
      minerFeeSompi
    })
  }
];

await mkdir("artifacts/signed-drafts", { recursive: true });
for (const item of drafts) {
  await writeFile(item.path, `${JSON.stringify(item.draft, null, 2)}\n`);
  console.log(`${item.path} transactionId=${item.draft.transactionId}`);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
