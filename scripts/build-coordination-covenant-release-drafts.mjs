import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAssuranceReleaseSpendDraft } from "../src/contractSpendDrafts.mjs";

const outpointsPath = process.env.COORDINATION_PLEDGE_OUTPOINTS || "fixtures/CoordinationCovenantPledgeOutpoints.json";
const walletPath = process.env.TN12_WALLET || ".local/tn12-wallet.json";
const publicWalletPath = process.env.TN12_PUBLIC_WALLET || "fixtures/SavedWallet.public.json";
const outPath = process.env.OUT || "artifacts/signed-drafts/coordination-covenant-release-spends.json";
const contractFeeSompi = BigInt(process.env.CONTRACT_FEE_SOMPI || "5000");

const [outpointsArtifact, wallet, publicWallet] = await Promise.all([
  readJson(outpointsPath),
  readJson(walletPath),
  readJson(publicWalletPath)
]);
const spendWallet = {
  ...wallet,
  xOnlyPublicKey: publicWallet.xOnlyPublicKey
};
const outpoints = outpointsArtifact.outpoints || [];
if (outpoints.length === 0) {
  throw new Error("No coordination covenant pledge outpoints found.");
}

const drafts = outpoints.map((outpoint) => ({
  pledgeId: outpoint.pledgeId,
  outputIndex: outpoint.outputIndex,
  path: `artifacts/signed-drafts/coordination-covenant-release-${outpoint.pledgeId}.json`,
  draft: buildAssuranceReleaseSpendDraft({
    contractOutpoint: outpoint,
    wallet: spendWallet,
    contractFeeSompi
  })
}));

const artifact = {
  schema: "tn12-coordination-covenant-release-drafts/v1",
  network: "kaspa-testnet-12",
  status: "signed-release-spends-not-broadcast",
  source: {
    pledgeOutpoints: outpointsPath,
    fundingTxid: outpointsArtifact.fundingTxid
  },
  contractFeeSompi: contractFeeSompi.toString(),
  releases: drafts.map((row) => ({
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
    "These are signed release candidates for fresh covenant pledge outputs.",
    "The coordination threshold is still replay/planner evidence; these drafts only prove the pledge money can settle through AssurancePledge covenant paths.",
    "Submit each pledge once. Release and refund are mutually exclusive for the same output."
  ]
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
for (const row of drafts) {
  await writeFile(row.path, `${JSON.stringify({
    ...row.draft,
    pledgeId: row.pledgeId,
    sourceOutputIndex: row.outputIndex,
    coordinationCovenantRelease: true
  }, null, 2)}\n`);
}
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} releases=${artifact.releases.length}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
