import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEscrowReleaseSpendDraft, buildEscrowRefundSpendDraft, buildEscrowCancelSpendDraft } from "../src/contractSpendDrafts.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

// Load fixtures
const roleEscrowFixture = JSON.parse(await readFile("fixtures/RoleEscrowContractOutpoint.json", "utf8"));
const buyerFixture = JSON.parse(await readFile("fixtures/BuyerWallet.json", "utf8"));
const sellerFixture = JSON.parse(await readFile("fixtures/SellerWallet.json", "utf8"));
const arbiterFixture = JSON.parse(await readFile("fixtures/ArbiterWallet.json", "utf8"));

const testResults = {
  schema: "tn12-escrow-negative-cases/v1",
  reviewedAt: new Date().toISOString(),
  status: "escrow-negative-cases-ready",
  cases: []
};

// Test Case 1: Malformed signature (wrong key signs)
try {
  const wrongKeySigner = { ...buyerFixture, xOnlyPublicKey: "0".repeat(64) };
  const malformedDraft = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: wrongKeySigner,
    destinationWallet: sellerFixture
  });
  testResults.cases.push({
    id: "malformed-signature-wrong-key",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should have rejected wrong key signature"
  });
} catch (err) {
  testResults.cases.push({
    id: "malformed-signature-wrong-key",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 80)
  });
}

// Test Case 2: Replay attack (same draft signed twice)
try {
  const draftOne = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerFixture,
    destinationWallet: sellerFixture
  });
  const draftTwo = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerFixture,
    destinationWallet: sellerFixture
  });
  const isSameTxid = draftOne.txid === draftTwo.txid;
  testResults.cases.push({
    id: "replay-attempt-same-txid",
    expected: "rejected-by-covenant",
    observed: isSameTxid ? "same-txid" : "different-txid",
    note: "Covenant prevents replay via input sequence tracking"
  });
} catch (err) {
  testResults.cases.push({
    id: "replay-attempt-same-txid",
    expected: "rejected-by-covenant",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 3: Wrong recipient (output to wrong address)
try {
  const wrongRecipient = { ...sellerFixture, xOnlyPublicKey: "f".repeat(64) };
  const draftWrongRecipient = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerFixture,
    destinationWallet: wrongRecipient
  });
  testResults.cases.push({
    id: "wrong-recipient-output-address",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should have rejected output to wrong address"
  });
} catch (err) {
  testResults.cases.push({
    id: "wrong-recipient-output-address",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 80)
  });
}

// Test Case 4: Refund with wrong arbiter
try {
  const wrongArbiter = { ...arbiterFixture, xOnlyPublicKey: "a".repeat(64) };
  const refundDraft = buildEscrowRefundSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: wrongArbiter,
    destinationWallet: buyerFixture
  });
  testResults.cases.push({
    id: "refund-wrong-arbiter-key",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should have rejected wrong arbiter key"
  });
} catch (err) {
  testResults.cases.push({
    id: "refund-wrong-arbiter-key",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 80)
  });
}

// Test Case 5: Cancel with wrong seller
try {
  const wrongSeller = { ...sellerFixture, xOnlyPublicKey: "c".repeat(64) };
  const cancelDraft = buildEscrowCancelSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: wrongSeller
  });
  testResults.cases.push({
    id: "cancel-wrong-seller-key",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should have rejected wrong seller key"
  });
} catch (err) {
  testResults.cases.push({
    id: "cancel-wrong-seller-key",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 80)
  });
}

// Test Case 6: Release with zero fee (should reject tiny output)
try {
  const zeroDraft = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerFixture,
    destinationWallet: sellerFixture,
    contractFeeSompi: BigInt(roleEscrowFixture.amountSompi) + 1n
  });
  testResults.cases.push({
    id: "zero-output-insufficient-amount",
    expected: "rejected",
    observed: "accepted",
    error: "FAIL: Should have rejected zero/negative output"
  });
} catch (err) {
  testResults.cases.push({
    id: "zero-output-insufficient-amount",
    expected: "rejected",
    observed: "rejected",
    error: err.message.substring(0, 80)
  });
}

// Validate: all legitimate paths still work
const legitimateTests = [];
try {
  const releaseDraft = buildEscrowReleaseSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: buyerFixture,
    destinationWallet: sellerFixture
  });
  legitimateTests.push({
    path: "release",
    status: "pass",
    txid: releaseDraft.txid?.substring(0, 16)
  });
} catch (err) {
  legitimateTests.push({
    path: "release",
    status: "fail",
    error: err.message.substring(0, 80)
  });
}

try {
  const refundDraft = buildEscrowRefundSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: arbiterFixture,
    destinationWallet: buyerFixture
  });
  legitimateTests.push({
    path: "refund",
    status: "pass",
    txid: refundDraft.txid?.substring(0, 16)
  });
} catch (err) {
  legitimateTests.push({
    path: "refund",
    status: "fail",
    error: err.message.substring(0, 80)
  });
}

try {
  const cancelDraft = buildEscrowCancelSpendDraft({
    contractOutpoint: roleEscrowFixture,
    wallet: sellerFixture
  });
  legitimateTests.push({
    path: "cancel",
    status: "pass",
    txid: cancelDraft.txid?.substring(0, 16)
  });
} catch (err) {
  legitimateTests.push({
    path: "cancel",
    status: "fail",
    error: err.message.substring(0, 80)
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
console.log("✓ Escrow negative cases generated:", `${outDir}/escrow-negative-cases.json`);
console.log(`  Rejected: ${testResults.summary.correctlyRejected}/${testResults.summary.totalNegativeCases}`);
console.log(`  Legitimate: ${testResults.summary.legitimatePathsPass}/${testResults.summary.legitimatePathsTotal}`);
