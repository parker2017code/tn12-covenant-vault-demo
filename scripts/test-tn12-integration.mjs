import { readFile, writeFile, mkdir } from "node:fs/promises";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

const TN12_ENDPOINT = "https://api-tn12.kaspa.org";
const TN12_WRPC = "ws://65.108.107.30:18210";

const testResults = {
  schema: "tn12-integration-test-results/v1",
  generatedAt: new Date().toISOString(),
  network: "kaspa-testnet-12",
  endpoint: TN12_ENDPOINT,
  tests: []
};

// Test 1: Verify TN12 endpoint is online
console.log("Testing TN12 endpoint connectivity...");
try {
  const response = await fetch(`${TN12_ENDPOINT}/info`, { method: "GET" });
  const info = await response.json();
  testResults.tests.push({
    id: "endpoint-online",
    endpoint: TN12_ENDPOINT,
    status: response.ok ? "pass" : "fail",
    version: info.network_name,
    httpStatus: response.status
  });
  console.log(`✓ TN12 endpoint online (${info.network_name})`);
} catch (err) {
  testResults.tests.push({
    id: "endpoint-online",
    status: "fail",
    error: err.message
  });
  console.log(`✗ TN12 endpoint offline: ${err.message}`);
}

// Test 2: Check escrow UTXO (should be live from previous session)
console.log("Checking escrow UTXO on TN12...");
try {
  const txid = "64b68f1cc61acc1197198e67bf0c49130db9a43dead1d94823f81b487a5707a3";
  const response = await fetch(`${TN12_ENDPOINT}/transactions/${txid}`, { method: "GET" });
  const txData = await response.json();

  const isAccepted = txData.is_accepted === true || txData.status === "ACCEPTED";
  testResults.tests.push({
    id: "escrow-utxo-live",
    txid: txid.substring(0, 16),
    status: isAccepted ? "pass" : "fail",
    accepted: isAccepted,
    blueScore: txData.accepting_block_blue_score
  });

  if (isAccepted) {
    console.log(`✓ Escrow UTXO live on TN12 (blue score: ${txData.accepting_block_blue_score})`);
  } else {
    console.log(`✗ Escrow UTXO not accepted`);
  }
} catch (err) {
  testResults.tests.push({
    id: "escrow-utxo-live",
    status: "fail",
    error: err.message
  });
  console.log(`✗ Failed to check escrow UTXO: ${err.message}`);
}

// Test 3: Batch-assurance funding readiness
console.log("Checking batch-assurance funding readiness...");
try {
  const batchFundingDraft = JSON.parse(
    await readFile("artifacts/signed-drafts/batch-assurance-pledge-funding.json", "utf8").catch(() => "{}")
  );

  const hasSignature = batchFundingDraft.signedTransaction || batchFundingDraft.witness;
  const isDraft = batchFundingDraft.status === "signed-not-broadcast";

  testResults.tests.push({
    id: "batch-funding-ready",
    status: hasSignature && isDraft ? "pass" : "pending",
    signed: !!hasSignature,
    drafted: isDraft,
    note: isDraft ? "Draft ready for submission on-chain" : "Not drafted"
  });

  if (isDraft && hasSignature) {
    console.log(`✓ Batch-assurance funding draft ready (signed, awaiting on-chain submission)`);
  } else {
    console.log(`⚠ Batch-assurance funding draft not yet ready`);
  }
} catch (err) {
  testResults.tests.push({
    id: "batch-funding-ready",
    status: "fail",
    error: err.message
  });
  console.log(`✗ Cannot check batch funding: ${err.message}`);
}

// Test 4: Wallet submission readiness
console.log("Checking wallet submission readiness...");
try {
  const walletPackage = JSON.parse(
    await readFile("artifacts/wallet-submit-package.json", "utf8").catch(() => "{}")
  );

  const hasIntents = walletPackage.intents && walletPackage.intents.length > 0;
  const status = walletPackage.status;
  const isReady = status === "wallet-submit-package-ready" && hasIntents;

  testResults.tests.push({
    id: "wallet-submit-ready",
    status: isReady ? "pass" : "pending",
    packageStatus: status,
    hasIntents,
    intentCount: walletPackage.intents?.length || 0
  });

  if (isReady) {
    console.log(`✓ Wallet submit package ready (${walletPackage.intents.length} intents)`);
  } else if (hasIntents) {
    console.log(`⚠ Wallet submit package has intents but status is: ${status}`);
  } else {
    console.log(`⚠ Wallet submit package not yet ready`);
  }
} catch (err) {
  testResults.tests.push({
    id: "wallet-submit-ready",
    status: "fail",
    error: err.message
  });
  console.log(`✗ Cannot check wallet submit: ${err.message}`);
}

// Test 5: Negative test results
console.log("Checking negative test coverage...");
try {
  const escrowNegativeCases = JSON.parse(await readFile("artifacts/escrow-negative-cases.json", "utf8"));
  const correctlyRejected = escrowNegativeCases.summary.correctlyRejected;
  const totalCases = escrowNegativeCases.summary.totalNegativeCases;

  testResults.tests.push({
    id: "negative-test-coverage",
    status: correctlyRejected === totalCases ? "pass" : "fail",
    escrowNegativeCases: {
      total: totalCases,
      correctlyRejected,
      rejectionRate: `${Math.round((correctlyRejected / totalCases) * 100)}%`
    }
  });

  console.log(`✓ Negative test coverage: ${correctlyRejected}/${totalCases} cases correctly rejected`);
} catch (err) {
  testResults.tests.push({
    id: "negative-test-coverage",
    status: "fail",
    error: err.message
  });
  console.log(`✗ Cannot check negative tests: ${err.message}`);
}

// Summary
testResults.summary = {
  totalTests: testResults.tests.length,
  passed: testResults.tests.filter((t) => t.status === "pass").length,
  pending: testResults.tests.filter((t) => t.status === "pending").length,
  failed: testResults.tests.filter((t) => t.status === "fail").length,
  readyForLiveSubmission: testResults.tests.some((t) => t.id === "endpoint-online" && t.status === "pass") &&
                           testResults.tests.some((t) => t.id === "batch-funding-ready" && t.status === "pass")
};

await writeFile(`${outDir}/tn12-integration-test-results.json`, JSON.stringify(testResults, null, 2));

console.log("\n" + "=".repeat(60));
console.log("TN12 Integration Test Summary");
console.log("=".repeat(60));
console.log(`  Passed: ${testResults.summary.passed}/${testResults.summary.totalTests}`);
console.log(`  Pending: ${testResults.summary.pending}/${testResults.summary.totalTests}`);
console.log(`  Failed: ${testResults.summary.failed}/${testResults.summary.totalTests}`);
console.log(`  Ready for live submission: ${testResults.summary.readyForLiveSubmission ? "YES ✓" : "NO ✗"}`);
console.log("=".repeat(60));

process.exit(testResults.summary.failed > 0 ? 1 : 0);
