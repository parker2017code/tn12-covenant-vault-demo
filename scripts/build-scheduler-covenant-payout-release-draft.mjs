import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSchedulerCovenantPayoutReleaseDraft } from "../src/contractSpendDrafts.mjs";

const targetPath = process.env.SCHEDULER_TARGET || "artifacts/scheduler-covenant-settlement-target.json";
const contractOutpointPath = process.env.CONTRACT_OUTPOINT || "fixtures/SchedulerCovenantPayoutOutpoint.json";
const operatorWalletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const operatorPublicPath = process.env.TN12_PUBLIC_WALLET || "fixtures/SavedWallet.public.json";
const recipientWalletPath = process.env.RECIPIENT_WALLET || ".local/tn12-defi-user-03.json";
const usersPublicPath = process.env.DEFI_USERS_PUBLIC || "fixtures/DefiLocalUserWallets.public.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/scheduler-covenant-payout-release.json";
const contractFeeSompi = BigInt(process.env.CONTRACT_FEE_SOMPI || "5000");

const [target, contractOutpoint, operatorWallet, operatorPublic, recipientWallet, usersPublic] = await Promise.all([
  readJson(targetPath),
  readJson(contractOutpointPath),
  readJson(operatorWalletPath),
  readJson(operatorPublicPath),
  readJson(recipientWalletPath),
  readJson(usersPublicPath)
]);
const payout = target.targetV1?.payout || {};
const recipientPublic = (usersPublic.users || usersPublic.wallets || []).find((row) => row.address === payout.destination);
if (!recipientPublic) {
  throw new Error(`Missing public recipient metadata for ${payout.destination}.`);
}
if (recipientWallet.address !== payout.destination) {
  throw new Error(`Recipient wallet ${recipientWallet.address} does not match payout destination ${payout.destination}.`);
}

const draft = buildSchedulerCovenantPayoutReleaseDraft({
  contractOutpoint,
  operatorWallet: {
    ...operatorWallet,
    xOnlyPublicKey: operatorPublic.xOnlyPublicKey
  },
  recipientWallet: {
    ...recipientWallet,
    xOnlyPublicKey: recipientPublic.xOnlyPublicKey
  },
  payoutSompi: tKasToSompi(payout.amountTkas),
  contractFeeSompi
});

const artifact = {
  ...draft,
  scheduler: {
    intentTxid: target.currentEvidence?.intentTxid || "",
    executionReceiptTxid: target.currentEvidence?.executionReceiptTxid || "",
    winningBidTxid: target.currentEvidence?.winningBidTxid || "",
    replayBoundary: "Scheduler eligibility remains INDEXER_DERIVED; this draft only constrains payout money movement."
  }
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);
console.log(`transactionId=${artifact.transactionId}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function tKasToSompi(value) {
  const [whole, fraction = ""] = String(value).split(".");
  return (BigInt(whole) * 100000000n + BigInt((fraction.padEnd(8, "0").slice(0, 8) || "0"))).toString();
}
