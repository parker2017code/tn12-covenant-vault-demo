import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAssuranceRefundSpendDraft } from "../src/contractSpendDrafts.mjs";

const outpointsPath = process.env.COORDINATION_REFUND_PLEDGE_OUTPOINTS || "fixtures/CoordinationCovenantRefundPledgeOutpoints.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const publicWalletPath = process.env.TN12_PUBLIC_WALLET || "fixtures/SavedWallet.public.json";
const walletRole = process.env.TN12_WALLET_ROLE || "";
const outPath = process.env.OUT || "artifacts/signed-drafts/coordination-covenant-refund-spends.json";
const draftDir = process.env.DRAFT_DIR || "artifacts/signed-drafts";
const contractFeeSompi = BigInt(process.env.CONTRACT_FEE_SOMPI || "5000");
const lockTime = BigInt(process.env.LOCK_TIME || Math.floor(Date.now() / 1000).toString());

const [outpointsArtifact, wallet, publicWallet] = await Promise.all([
  readJson(outpointsPath),
  readJson(walletPath),
  readJson(publicWalletPath)
]);
const privateWallet = selectWallet(wallet, walletRole);
const publicMetadata = selectWallet(publicWallet, walletRole);
const spendWallet = {
  ...privateWallet,
  xOnlyPublicKey: publicMetadata.xOnlyPublicKey
};
const outpoints = outpointsArtifact.outpoints || [];
if (outpoints.length === 0) {
  throw new Error("No coordination covenant refund pledge outpoints found.");
}

const drafts = outpoints.map((outpoint) => ({
  pledgeId: outpoint.pledgeId,
  outputIndex: outpoint.outputIndex,
  path: `${draftDir}/coordination-covenant-refund-${outpoint.pledgeId}.json`,
  draft: buildAssuranceRefundSpendDraft({
    contractOutpoint: outpoint,
    wallet: spendWallet,
    contractFeeSompi,
    lockTime
  })
}));

const artifact = {
  schema: "tn12-coordination-covenant-refund-drafts/v1",
  network: "kaspa-testnet-12",
  status: "signed-refund-spends-not-broadcast",
  source: {
    pledgeOutpoints: outpointsPath,
    fundingTxid: outpointsArtifact.fundingTxid
  },
  contractFeeSompi: contractFeeSompi.toString(),
  lockTime: lockTime.toString(),
  refunds: drafts.map((row) => ({
    pledgeId: row.pledgeId,
    sourceOutputIndex: row.outputIndex,
    draftPath: row.path,
    transactionId: row.draft.transactionId,
    amountTkas: row.draft.destination.amountTkas,
    amountSompi: row.draft.destination.amountSompi,
    destination: row.draft.destination.address,
    entrypoint: row.draft.entrypoint
  })),
  signedDrafts: drafts.map((row) => ({
    pledgeId: row.pledgeId,
    sourceOutputIndex: row.outputIndex,
    ...row.draft
  })),
  submitCommands: drafts.map((row) => ({
    pledgeId: row.pledgeId,
    command: `KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210 KASPA_WRPC_ENCODING=borsh KASPA_WRPC_NETWORK_ID=testnet-12 node scripts/submit-signed-draft-wrpc.mjs ${row.path} --submit`
  })),
  boundaries: [
    "These are signed refund candidates for fresh covenant pledge outputs.",
    "They use a separate fresh pledge funding transaction from the accepted release path, so the release/refund mutual exclusion remains explicit.",
    "The coordination threshold remains replay/planner evidence; these drafts only prove the individual pledge refund route."
  ]
};

await mkdir(draftDir, { recursive: true });
for (const row of drafts) {
  await writeFile(row.path, `${JSON.stringify({
    ...row.draft,
    pledgeId: row.pledgeId,
    sourceOutputIndex: row.outputIndex,
    coordinationCovenantRefund: true
  }, null, 2)}\n`);
}
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} refunds=${artifact.refunds.length}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function selectWallet(row, role) {
  if (!role) return row;
  const selected = row.roles?.[role];
  if (!selected) {
    throw new Error(`Wallet role ${role} not found.`);
  }
  return selected;
}
