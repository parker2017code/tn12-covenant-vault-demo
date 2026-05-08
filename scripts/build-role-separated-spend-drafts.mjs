import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  buildAssuranceRefundSpendDraft,
  buildAssuranceReleaseSpendDraft,
  buildEscrowCancelSpendDraft,
  buildEscrowRefundSpendDraft,
  buildEscrowReleaseSpendDraft,
  buildVaultRecoverySpendDraft,
  buildVaultWithdrawalSpendDraft
} from "../src/contractSpendDrafts.mjs";

const roleWallets = await readJson(".local/tn12-role-wallets.json");
const publicRoles = await readJson("fixtures/RoleSeparatedWallets.public.json");
const prefix = process.env.ROLE_SPEND_PREFIX || "role";
const vaultOutpoint = await readJson(process.env.VAULT_OUTPOINT || "fixtures/RoleVaultContractOutpoint.json");
const assuranceOutpoint = await readJson(process.env.ASSURANCE_OUTPOINT || "fixtures/RoleAssuranceContractOutpoint.json");
const escrowOutpoint = await readJson(process.env.ESCROW_OUTPOINT || "fixtures/RoleEscrowContractOutpoint.json");
const contractFeeSompi = BigInt(process.env.CONTRACT_FEE_SOMPI || "5000");
const lockTime = BigInt(process.env.ROLE_SPEND_LOCK_TIME || Math.floor(Date.now() / 1000));

const wallets = Object.fromEntries(Object.keys(roleWallets.roles).map((role) => [
  role,
  {
    ...roleWallets.roles[role],
    xOnlyPublicKey: publicRoles.roles[role].xOnlyPublicKey
  }
]));

assertDistinct("vault owner/recovery", wallets.vaultOwner, wallets.vaultRecovery);
assertDistinct("pledge contributor/recipient", wallets.pledgeContributor, wallets.pledgeRecipient);
assertDistinct("escrow buyer/seller", wallets.escrowBuyer, wallets.escrowSeller);

const drafts = [
  {
    path: draftPath("vault-withdrawal"),
    draft: buildVaultWithdrawalSpendDraft({
      contractOutpoint: vaultOutpoint,
      wallet: wallets.vaultOwner,
      contractFeeSompi,
      lockTime
    })
  },
  {
    path: draftPath("vault-recovery"),
    draft: buildVaultRecoverySpendDraft({
      contractOutpoint: vaultOutpoint,
      wallet: wallets.vaultRecovery,
      contractFeeSompi
    })
  },
  {
    path: draftPath("assurance-release"),
    draft: buildAssuranceReleaseSpendDraft({
      contractOutpoint: assuranceOutpoint,
      wallet: wallets.pledgeRecipient,
      contractFeeSompi
    })
  },
  {
    path: draftPath("assurance-refund"),
    draft: buildAssuranceRefundSpendDraft({
      contractOutpoint: assuranceOutpoint,
      wallet: wallets.pledgeContributor,
      contractFeeSompi,
      lockTime
    })
  },
  {
    path: draftPath("escrow-release"),
    draft: buildEscrowReleaseSpendDraft({
      contractOutpoint: escrowOutpoint,
      wallet: wallets.escrowBuyer,
      destinationWallet: wallets.escrowSeller,
      contractFeeSompi
    })
  },
  {
    path: draftPath("escrow-refund"),
    draft: buildEscrowRefundSpendDraft({
      contractOutpoint: escrowOutpoint,
      wallet: wallets.escrowBuyer,
      contractFeeSompi,
      lockTime
    })
  },
  {
    path: draftPath("escrow-cancel"),
    draft: buildEscrowCancelSpendDraft({
      contractOutpoint: escrowOutpoint,
      wallet: wallets.escrowBuyer,
      sellerWallet: wallets.escrowSeller,
      contractFeeSompi
    })
  }
];

await mkdir("artifacts/signed-drafts", { recursive: true });
for (const item of drafts) {
  await writeFile(item.path, `${JSON.stringify({
    ...item.draft,
    roleSeparated: true,
    mutualExclusionWarning: mutualExclusionWarning(item.draft.contract)
  }, null, 2)}\n`);
  console.log(`${item.path} transactionId=${item.draft.transactionId}`);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assertDistinct(label, a, b) {
  if (!a || !b || a.xOnlyPublicKey === b.xOnlyPublicKey) {
    throw new Error(`${label} roles must use distinct x-only public keys.`);
  }
}

function mutualExclusionWarning(contract) {
  if (contract === "DelayedRecoveryVault") {
    return "The role-vault withdrawal and recovery drafts spend the same role-separated vault output; only one can be accepted.";
  }
  if (contract === "AssurancePledge") {
    return "The role-assurance release and refund drafts spend the same role-separated assurance output; only one can be accepted.";
  }
  if (contract === "Escrow") {
    return "The role-escrow release, refund, and cancel drafts spend the same role-separated escrow output; only one can be accepted.";
  }
  return "Review source outpoint reuse before submit.";
}

function draftPath(name) {
  return `artifacts/signed-drafts/${prefix}-${name}.json`;
}
