/**
 * Builds and optionally submits invalid P2SH covenant spend attempts for adversarial rejection evidence.
 * Each attempt uses a fresh outpoint but a wrong signer — expect script-execution rejection from TN12.
 *
 * Usage:
 *   node scripts/build-adversarial-invalid-spend-attempts.mjs          # dry-run, write artifacts
 *   node scripts/build-adversarial-invalid-spend-attempts.mjs --submit  # submit and capture rejection bodies
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  buildVaultRecoverySpendDraft,
  buildAssuranceReleaseSpendDraft,
  buildEscrowReleaseSpendDraft
} from "../src/contractSpendDrafts.mjs";

const shouldSubmit = process.argv.includes("--submit");
const outDir = "artifacts/adversarial";
await mkdir(outDir, { recursive: true });

const roleWallets = JSON.parse(await readFile(".local/tn12-role-wallets.json", "utf8"));
const publicRoles = JSON.parse(await readFile("fixtures/RoleSeparatedWallets.public.json", "utf8"));
const vaultOutpoint = JSON.parse(await readFile("fixtures/RoleVaultContractOutpoint.json", "utf8"));
const assuranceOutpoint = JSON.parse(await readFile("fixtures/RoleAssuranceContractOutpoint.json", "utf8"));
const escrowOutpoint = JSON.parse(await readFile("fixtures/RoleEscrowContractOutpoint.json", "utf8"));

// Merge private keys with public xOnlyPublicKey fields
const wallets = {};
for (const [role, data] of Object.entries(roleWallets.roles)) {
  wallets[role] = { ...data, xOnlyPublicKey: publicRoles.roles[role].xOnlyPublicKey };
}

const contractFeeSompi = 5000n;

// Case 1: Vault recovery with WRONG signer (pledgeRecipient instead of vaultRecovery)
// Expected: checkSig fails — pledgeRecipient key not encoded in vault constructor
const vaultWrongSigner = buildVaultRecoverySpendDraft({
  contractOutpoint: vaultOutpoint,
  wallet: wallets.pledgeRecipient,
  contractFeeSompi
});

// Case 2: Assurance release with WRONG signer (pledgeContributor instead of pledgeRecipient)
// Expected: checkSig fails — release branch encodes pledgeRecipient key
const assuranceWrongSigner = buildAssuranceReleaseSpendDraft({
  contractOutpoint: assuranceOutpoint,
  wallet: wallets.pledgeContributor,
  contractFeeSompi
});

// Case 3: Escrow release with WRONG signer (escrowSeller instead of escrowBuyer)
// Expected: checkSig fails — release branch requires escrowBuyer authorization
const escrowWrongSigner = buildEscrowReleaseSpendDraft({
  contractOutpoint: escrowOutpoint,
  wallet: wallets.escrowSeller,
  destinationWallet: wallets.escrowBuyer,
  contractFeeSompi
});

const cases = [
  {
    id: "vault-wrong-signer",
    contract: "DelayedRecoveryVault",
    entrypoint: "recover",
    invalidation: "wrong-signer",
    correctRole: "vaultRecovery",
    usedRole: "pledgeRecipient",
    expectedFailure: "checkSig fails — pledgeRecipient key not recognized by vault recover branch",
    draft: vaultWrongSigner,
    outpoint: `${vaultOutpoint.txid}:${vaultOutpoint.outputIndex}`
  },
  {
    id: "assurance-wrong-signer",
    contract: "AssurancePledge",
    entrypoint: "releaseAssurance",
    invalidation: "wrong-signer",
    correctRole: "pledgeRecipient",
    usedRole: "pledgeContributor",
    expectedFailure: "checkSig fails — pledgeContributor key not recognized by assurance release branch",
    draft: assuranceWrongSigner,
    outpoint: `${assuranceOutpoint.txid}:${assuranceOutpoint.outputIndex}`
  },
  {
    id: "escrow-wrong-signer",
    contract: "Escrow",
    entrypoint: "releaseEscrow",
    invalidation: "wrong-signer",
    correctRole: "escrowBuyer",
    usedRole: "escrowSeller",
    expectedFailure: "checkSig fails — escrowSeller key not recognized by escrow release branch",
    draft: escrowWrongSigner,
    outpoint: `${escrowOutpoint.txid}:${escrowOutpoint.outputIndex}`
  }
];

const results = [];

for (const c of cases) {
  const draftPath = `${outDir}/${c.id}.json`;
  const artifact = {
    schema: "tn12-adversarial-invalid-spend/v1",
    network: "kaspa-testnet-12",
    generatedAt: new Date().toISOString(),
    id: c.id,
    contract: c.contract,
    entrypoint: c.entrypoint,
    invalidation: c.invalidation,
    correctRole: c.correctRole,
    usedRole: c.usedRole,
    expectedFailure: c.expectedFailure,
    sourceOutpoint: c.outpoint,
    transactionId: c.draft.transactionId,
    submitPayload: c.draft.submitPayload,
    status: shouldSubmit ? null : "built-not-submitted"
  };

  if (shouldSubmit) {
    const resp = await fetch("https://api-tn12.kaspa.org/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(c.draft.submitPayload)
    });
    const body = await resp.json().catch(() => resp.text());
    artifact.submissionResult = {
      httpStatus: resp.status,
      body,
      submittedAt: new Date().toISOString()
    };
    if (resp.status === 200) {
      artifact.status = "unexpectedly-accepted";
      console.error(`UNEXPECTED ACCEPTANCE: ${c.id} — txid ${c.draft.transactionId}`);
    } else {
      artifact.status = "rejected-as-expected";
    }
  }

  await writeFile(draftPath, `${JSON.stringify(artifact, null, 2)}\n`);
  results.push({ id: c.id, txid: c.draft.transactionId, status: artifact.status, httpStatus: artifact.submissionResult?.httpStatus });
  console.log(`${c.id}: txid=${c.draft.transactionId} status=${artifact.status}`);
}

const summaryPath = `${outDir}/adversarial-summary.json`;
const summary = {
  schema: "tn12-adversarial-summary/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  fundingTxid: vaultOutpoint.txid,
  submitted: shouldSubmit,
  cases: results
};
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`\nSummary written to ${summaryPath}`);
console.log(`Total cases: ${cases.length}, submitted: ${shouldSubmit}`);
