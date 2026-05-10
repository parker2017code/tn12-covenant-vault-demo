import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEscrowReleaseSpendDraft, buildEscrowCancelSpendDraft } from "../src/contractSpendDrafts.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

// Load fixtures
const roleEscrowFixture = JSON.parse(await readFile("fixtures/RoleEscrowContractOutpoint.json", "utf8"));
const rolesFixture = JSON.parse(await readFile("fixtures/RoleSeparatedWallets.public.json", "utf8"));

const buyerWallet = { xOnlyPublicKey: rolesFixture.roles.escrowBuyer.xOnlyPublicKey };
const sellerWallet = { xOnlyPublicKey: rolesFixture.roles.escrowSeller.xOnlyPublicKey };

const testResults = {
  schema: "tn12-escrow-negative-cases/v1",
  reviewedAt: new Date().toISOString(),
  status: "escrow-negative-cases-ready",
  cases: []
};

// Test Case 1: Release with wrong buyer key
try {
  const wrongBuyer = { xOnlyPublicKey: "0".repeat(64) };
  const draftWrongBuyer = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: wrongBuyer,
    destinationWallet: sellerWallet
  });
  testResults.cases.push({
    id: "release-wrong-buyer-key",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should reject wrong buyer key"
  });
} catch (err) {
  testResults.cases.push({
    id: "release-wrong-buyer-key",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 100)
  });
}

// Test Case 2: Cancel with wrong seller key
try {
  const wrongSeller = { xOnlyPublicKey: "f".repeat(64) };
  const draftWrongSeller = buildEscrowCancelSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: wrongSeller
  });
  testResults.cases.push({
    id: "cancel-wrong-seller-key",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should reject wrong seller key"
  });
} catch (err) {
  testResults.cases.push({
    id: "cancel-wrong-seller-key",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 100)
  });
}

// Test Case 3: Release to wrong recipient
try {
  const wrongRecipient = { xOnlyPublicKey: "a".repeat(64) };
  const draftWrongRecip = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerWallet,
    destinationWallet: wrongRecipient
  });
  testResults.cases.push({
    id: "release-wrong-recipient",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should reject wrong recipient address"
  });
} catch (err) {
  testResults.cases.push({
    id: "release-wrong-recipient",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 100)
  });
}

// Test Case 4: Release with excessive fee (zero output)
try {
  const zeroDraft = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerWallet,
    destinationWallet: sellerWallet,
    contractFeeSompi: BigInt(roleEscrowFixture.amountSompi) + 1n
  });
  testResults.cases.push({
    id: "release-zero-output",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should reject zero output"
  });
} catch (err) {
  testResults.cases.push({
    id: "release-zero-output",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 100)
  });
}

// Test Case 5: Verify legitimate paths still work
const legitimateTests = [];
try {
  const releaseDraft = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerWallet,
    destinationWallet: sellerWallet
  });
  if (releaseDraft && releaseDraft.txid) {
    legitimateTests.push({
      path: "release",
      status: "pass",
      txidPrefix: releaseDraft.txid.substring(0, 16)
    });
  } else {
    legitimateTests.push({ path: "release", status: "fail", error: "No txid" });
  }
} catch (err) {
  legitimateTests.push({
    path: "release",
    status: "fail",
    error: err.message.substring(0, 100)
  });
}

try {
  const cancelDraft = buildEscrowCancelSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: sellerWallet
  });
  if (cancelDraft && cancelDraft.txid) {
    legitimateTests.push({
      path: "cancel",
      status: "pass",
      txidPrefix: cancelDraft.txid.substring(0, 16)
    });
  } else {
    legitimateTests.push({ path: "cancel", status: "fail", error: "No txid" });
  }
} catch (err) {
  legitimateTests.push({
    path: "cancel",
    status: "fail",
    error: err.message.substring(0, 100)
  });
}

testResults.legitimatePathsStillWork = legitimateTests;
testResults.summary = {
  totalNegativeCases: testResults.cases.length,
  correctlyRejected: testResults.cases.filter((c) => c.observed === "rejected").length,
  legitimatePathsPass: legitimateTests.filter((t) => t.status === "pass").length,
  legitimatePathsTotal: legitimateTests.length
};

await writeFile(`${outDir}/escrow-negative-cases.json`, JSON.stringify(testResults, null, 2));
console.log("✓ Escrow negative cases:", `${outDir}/escrow-negative-cases.json`);
console.log(`  Rejected: ${testResults.summary.correctlyRejected}/${testResults.summary.totalNegativeCases}`);
console.log(`  Legitimate: ${testResults.summary.legitimatePathsPass}/${testResults.summary.legitimatePathsTotal}`);
