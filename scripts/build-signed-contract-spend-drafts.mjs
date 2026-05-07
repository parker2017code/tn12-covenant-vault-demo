import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  buildAssuranceRefundSpendDraft,
  buildAssuranceReleaseSpendDraft,
  buildVaultWithdrawalSpendDraft,
  buildVaultRecoverySpendDraft
} from "../src/contractSpendDrafts.mjs";

const wallet = await readJson(".local/tn12-wallet.json");
const publicWallet = await readJson("fixtures/SavedWallet.public.json");
const spendWallet = {
  ...wallet,
  xOnlyPublicKey: publicWallet.xOnlyPublicKey
};
const vaultOutpoint = await readJson("fixtures/VaultContractOutpoint.json");
const assuranceOutpoint = await readJson("fixtures/AssuranceContractOutpoint.json");
const contractFeeSompi = BigInt(process.env.CONTRACT_FEE_SOMPI || "5000");
const lockTime = BigInt(process.env.SPEND_LOCK_TIME || Math.floor(Date.now() / 1000));

const drafts = [
  {
    path: "artifacts/signed-drafts/vault-withdrawal.json",
    draft: buildVaultWithdrawalSpendDraft({
      contractOutpoint: vaultOutpoint,
      wallet: spendWallet,
      contractFeeSompi,
      lockTime
    })
  },
  {
    path: "artifacts/signed-drafts/vault-recovery.json",
    draft: buildVaultRecoverySpendDraft({
      contractOutpoint: vaultOutpoint,
      wallet: spendWallet,
      contractFeeSompi
    })
  },
  {
    path: "artifacts/signed-drafts/assurance-release.json",
    draft: buildAssuranceReleaseSpendDraft({
      contractOutpoint: assuranceOutpoint,
      wallet: spendWallet,
      contractFeeSompi
    })
  },
  {
    path: "artifacts/signed-drafts/assurance-refund.json",
    draft: buildAssuranceRefundSpendDraft({
      contractOutpoint: assuranceOutpoint,
      wallet: spendWallet,
      contractFeeSompi,
      lockTime
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
