import { readFile, writeFile, mkdir } from "node:fs/promises";
import { buildEscrowReleaseSpendDraft, buildEscrowCancelSpendDraft } from "../src/contractSpendDrafts.mjs";

const outDir = "artifacts/signed-drafts";
await mkdir(outDir, { recursive: true });

console.log("=== PHASE 1: Build Signed Settlement Drafts ===\n");

// Load keys from .local/
const roleWallets = JSON.parse(await readFile(".local/tn12-role-wallets.json", "utf8"));
const escrowUtxo = JSON.parse(await readFile("fixtures/RoleEscrowContractOutpoint.json", "utf8"));

const buyerKey = roleWallets.roles.escrowBuyer;
const sellerKey = roleWallets.roles.escrowSeller;

console.log("Loaded role keys:");
console.log(`  Buyer:  ${buyerKey.address.substring(0, 20)}...`);
console.log(`  Seller: ${sellerKey.address.substring(0, 20)}...`);
console.log(`\nEscrow UTXO: ${escrowUtxo.txid.substring(0, 20)}...:${escrowUtxo.outputIndex}`);
console.log(`Amount: ${escrowUtxo.amountTkas} TKAS\n`);

const results = {
  schema: "tn12-phase-1-settlement-drafts/v1",
  timestamp: new Date().toISOString(),
  network: "kaspa-testnet-12",
  phase: "1-key-integration",
  utxo: {
    txid: escrowUtxo.txid,
    index: escrowUtxo.outputIndex,
    amount: escrowUtxo.amountTkas
  },
  roles: {
    buyer: buyerKey.address.substring(0, 20) + "...",
    seller: sellerKey.address.substring(0, 20) + "..."
  },
  drafts: []
};

// Build Release Draft (buyer triggers, funds go to seller)
console.log("Building Release Draft (buyer → seller)...");
try {
  const releaseDraft = buildEscrowReleaseSpendDraft({
    contractOutpoint: escrowUtxo,
    wallet: buyerKey,
    destinationWallet: sellerKey
  });

  const releaseArtifact = {
    schema: "tn12-signed-escrow-release-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-ready-for-submission",
    timestamp: new Date().toISOString(),
    role: "escrowBuyer",
    action: "release",
    description: "Buyer triggers fund release to seller",
    transactionId: releaseDraft.txid,
    signedTransaction: releaseDraft.signedTransaction,
    inputs: releaseDraft.inputs?.length || 1,
    outputs: releaseDraft.outputs?.length || 1,
    fee: releaseDraft.fee ? String(releaseDraft.fee) : "5000",
    note: "Ready to submit to TN12 wRPC endpoint"
  };

  await writeFile(`${outDir}/escrow-release-PHASE1-SIGNED.json`, JSON.stringify(releaseArtifact, null, 2));

  results.drafts.push({
    type: "release",
    status: "signed",
    txid: releaseDraft.txid.substring(0, 20) + "...",
    file: `${outDir}/escrow-release-PHASE1-SIGNED.json`
  });

  console.log(`✓ Release draft: ${releaseDraft.txid.substring(0, 20)}...`);
} catch (err) {
  results.drafts.push({
    type: "release",
    status: "error",
    error: err.message
  });
  console.log(`✗ Release draft error: ${err.message}`);
}

// Build Cancel Draft (seller cancels)
console.log("Building Cancel Draft (seller cancels)...");
try {
  const cancelDraft = buildEscrowCancelSpendDraft({
    contractOutpoint: escrowUtxo,
    wallet: sellerKey
  });

  const cancelArtifact = {
    schema: "tn12-signed-escrow-cancel-draft/v1",
    network: "kaspa-testnet-12",
    status: "signed-ready-for-submission",
    timestamp: new Date().toISOString(),
    role: "escrowSeller",
    action: "cancel",
    description: "Seller cancels escrow and recovers funds",
    transactionId: cancelDraft.txid,
    signedTransaction: cancelDraft.signedTransaction,
    inputs: cancelDraft.inputs?.length || 1,
    outputs: cancelDraft.outputs?.length || 1,
    fee: cancelDraft.fee ? String(cancelDraft.fee) : "5000",
    note: "Ready to submit to TN12 wRPC endpoint"
  };

  await writeFile(`${outDir}/escrow-cancel-PHASE1-SIGNED.json`, JSON.stringify(cancelArtifact, null, 2));

  results.drafts.push({
    type: "cancel",
    status: "signed",
    txid: cancelDraft.txid.substring(0, 20) + "...",
    file: `${outDir}/escrow-cancel-PHASE1-SIGNED.json`
  });

  console.log(`✓ Cancel draft: ${cancelDraft.txid.substring(0, 20)}...`);
} catch (err) {
  results.drafts.push({
    type: "cancel",
    status: "error",
    error: err.message
  });
  console.log(`✗ Cancel draft error: ${err.message}`);
}

// Summary
results.summary = {
  totalDrafts: results.drafts.length,
  signed: results.drafts.filter((d) => d.status === "signed").length,
  failed: results.drafts.filter((d) => d.status === "error").length,
  nextStep: "Submit drafts to TN12 wRPC: ws://65.108.107.30:18210"
};

await writeFile(`artifacts/phase-1-settlement-drafts.json`, JSON.stringify(results, null, 2));

console.log("\n" + "=".repeat(60));
console.log("Phase 1 Complete: Signed Drafts Ready");
console.log("=".repeat(60));
console.log(`✓ Release draft: ${results.drafts.find((d) => d.type === "release")?.status || "error"}`);
console.log(`✓ Cancel draft: ${results.drafts.find((d) => d.type === "cancel")?.status || "error"}`);
console.log(`\nNext: Phase 2 - Submit to TN12`);
console.log(`Command: node scripts/phase-2-submit-escrow-tn12.mjs`);
console.log("=".repeat(60));

process.exit(results.summary.failed > 0 ? 1 : 0);
