import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  buildEscrowCancelSpendDraft,
  buildEscrowRefundSpendDraft,
  buildEscrowReleaseSpendDraft
} from "../src/contractSpendDrafts.mjs";

const wallet = await readJson(".local/tn12-wallet.json");
const publicWallet = await readJson("fixtures/SavedWallet.public.json");
const spendWallet = {
  ...wallet,
  xOnlyPublicKey: publicWallet.xOnlyPublicKey
};
const escrowOutpoint = await readJson(process.env.ESCROW_CONTRACT_OUTPOINT || "fixtures/EscrowContractOutpoint.json");
const contractFeeSompi = BigInt(process.env.CONTRACT_FEE_SOMPI || "5000");
const lockTime = BigInt(process.env.ESCROW_REFUND_LOCK_TIME || Math.floor(Date.now() / 1000));
const outPrefix = process.env.ESCROW_SPEND_PREFIX || "escrow";

const drafts = [
  {
    path: `artifacts/signed-drafts/${outPrefix}-release.json`,
    draft: buildEscrowReleaseSpendDraft({
      contractOutpoint: escrowOutpoint,
      wallet: spendWallet,
      contractFeeSompi
    })
  },
  {
    path: `artifacts/signed-drafts/${outPrefix}-refund.json`,
    draft: buildEscrowRefundSpendDraft({
      contractOutpoint: escrowOutpoint,
      wallet: spendWallet,
      contractFeeSompi,
      lockTime
    })
  },
  {
    path: `artifacts/signed-drafts/${outPrefix}-cancel.json`,
    draft: buildEscrowCancelSpendDraft({
      contractOutpoint: escrowOutpoint,
      wallet: spendWallet,
      sellerWallet: spendWallet,
      contractFeeSompi
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
