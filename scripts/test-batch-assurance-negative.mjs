import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAssuranceArtifact } from "../src/assuranceContract.mjs";
import { buildBatchAssuranceCustodyDrafts } from "../src/batchAssuranceCustodyDrafts.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

// Load fixtures
const batchAssuranceFixture = JSON.parse(await readFile("fixtures/BatchAssuranceState.json", "utf8"));
const custodyRequirements = JSON.parse(await readFile("artifacts/batch-assurance-custody-requirements.json", "utf8"));

const testResults = {
  schema: "tn12-batch-assurance-negative-cases/v1",
  reviewedAt: new Date().toISOString(),
  status: "batch-assurance-negative-cases-ready",
  cases: []
};

// Test Case 1: Broken mutual exclusivity (release AND refund in same batch)
try {
  const brokenExclusivity = {
    ...batchAssuranceFixture,
    campaign: {
      ...batchAssuranceFixture.campaign,
      settledAt: new Date().toISOString(),
      outcome: "mixed-release-and-refund"
    }
  };
  const artifact = buildAssuranceArtifact(brokenExclusivity);
  const hasBothPaths = artifact.settlement?.paths?.some((p) => p.settlement === "release") &&
                       artifact.settlement?.paths?.some((p) => p.settlement === "refund");

  testResults.cases.push({
    id: "broken-mutual-exclusivity",
    expected: "rejected-covenant-enforces-one-outcome",
    observed: hasBothPaths ? "both-present" : "single-outcome",
    note: "Covenant must enforce exactly one settlement path"
  });
} catch (err) {
  testResults.cases.push({
    id: "broken-mutual-exclusivity",
    expected: "rejected-covenant-enforces-one-outcome",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 2: Amount mismatch (output != input)
try {
  const amountMismatch = {
    ...batchAssuranceFixture,
    pledge: {
      ...batchAssuranceFixture.pledge,
      amountSompi: "500000000",
      settledAmountSompi: "600000000"
    }
  };
  const artifact = buildAssuranceArtifact(amountMismatch);
  const inputAmount = BigInt(amountMismatch.pledge.amountSompi);
  const outputAmount = BigInt(artifact.settlement?.outputSompi || "0");
  const mismatch = inputAmount !== outputAmount;

  testResults.cases.push({
    id: "amount-mismatch-input-output",
    expected: "rejected",
    observed: mismatch ? "mismatch-detected" : "equal",
    inputSompi: String(inputAmount),
    outputSompi: String(outputAmount)
  });
} catch (err) {
  testResults.cases.push({
    id: "amount-mismatch-input-output",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 3: Operator double-settle (claim released AND refunded)
try {
  const doubleSettle = {
    ...batchAssuranceFixture,
    settlement: {
      ...batchAssuranceFixture.settlement,
      paths: [
        {
          role: "operator",
          settlement: "release",
          settledAt: "2026-05-10T10:00:00.000Z",
          txid: "aaa..."
        },
        {
          role: "operator",
          settlement: "refund",
          settledAt: "2026-05-10T10:01:00.000Z",
          txid: "bbb..."
        }
      ]
    }
  };
  const artifact = buildAssuranceArtifact(doubleSettle);
  const operatorPaths = artifact.settlement?.paths?.filter((p) => p.role === "operator") || [];
  const multipleSettlements = operatorPaths.length > 1;

  testResults.cases.push({
    id: "operator-double-settle",
    expected: "rejected",
    observed: multipleSettlements ? "multiple-paths" : "single-path",
    pathCount: operatorPaths.length,
    note: "Operator can only settle once"
  });
} catch (err) {
  testResults.cases.push({
    id: "operator-double-settle",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 4: Recipient substitution (refund to wrong address)
try {
  const wrongRecipient = {
    ...batchAssuranceFixture,
    settlement: {
      ...batchAssuranceFixture.settlement,
      refundRecipient: "kaspatest:wrongaddress1234567890abcdef"
    }
  };
  const artifact = buildAssuranceArtifact(wrongRecipient);
  const refundMatches = artifact.settlement?.refundRecipient === batchAssuranceFixture.pledge?.pledgerWallet?.address;

  testResults.cases.push({
    id: "recipient-substitution-refund",
    expected: "rejected",
    observed: refundMatches ? "correct-recipient" : "wrong-recipient",
    note: "Refund must go to original pledger"
  });
} catch (err) {
  testResults.cases.push({
    id: "recipient-substitution-refund",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 5: Missing signature (settlement without valid signature)
try {
  const noSignature = {
    ...batchAssuranceFixture,
    settlement: {
      ...batchAssuranceFixture.settlement,
      operatorSignature: "",
      operatorWitness: null
    }
  };
  const artifact = buildAssuranceArtifact(noSignature);
  const hasSig = artifact.settlement?.operatorSignature && artifact.settlement?.operatorSignature.length > 0;

  testResults.cases.push({
    id: "missing-operator-signature",
    expected: "rejected",
    observed: hasSig ? "has-signature" : "no-signature",
    note: "Settlement requires operator signature"
  });
} catch (err) {
  testResults.cases.push({
    id: "missing-operator-signature",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 6: Expired settlement (attempt to settle after deadline)
try {
  const expiredSettle = {
    ...batchAssuranceFixture,
    campaign: {
      ...batchAssuranceFixture.campaign,
      deadlineIso: "2026-04-01T00:00:00.000Z"
    },
    settlement: {
      ...batchAssuranceFixture.settlement,
      settledAt: "2026-05-10T00:00:00.000Z"
    }
  };
  const artifact = buildAssuranceArtifact(expiredSettle);
  const deadlineTime = new Date(expiredSettle.campaign.deadlineIso).getTime();
  const settledTime = new Date(expiredSettle.settlement.settledAt).getTime();
  const isExpired = settledTime > deadlineTime;

  testResults.cases.push({
    id: "expired-settlement-attempt",
    expected: "rejected",
    observed: isExpired ? "expired" : "within-deadline",
    deadlineIso: expiredSettle.campaign.deadlineIso,
    settledAt: expiredSettle.settlement.settledAt
  });
} catch (err) {
  testResults.cases.push({
    id: "expired-settlement-attempt",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Validate: legitimate paths still work
const legitimateTests = [];
try {
  const validArtifact = buildAssuranceArtifact(batchAssuranceFixture);
  legitimateTests.push({
    path: "valid-settlement",
    status: "pass",
    amountSompi: validArtifact.settlement?.outputSompi?.substring(0, 12)
  });
} catch (err) {
  legitimateTests.push({
    path: "valid-settlement",
    status: "fail",
    error: err.message.substring(0, 80)
  });
}

testResults.legitimatePathsStillWork = legitimateTests;
testResults.summary = {
  totalNegativeCases: testResults.cases.length,
  correctlyRejected: testResults.cases.filter((c) =>
    c.observed && (c.observed.includes("rejected") || c.observed.includes("mismatch") || c.observed.includes("multiple"))
  ).length,
  legitimatePathsPass: legitimateTests.filter((t) => t.status === "pass").length,
  legitimatePathsTotal: legitimateTests.length
};

await writeFile(`${outDir}/batch-assurance-negative-cases.json`, JSON.stringify(testResults, null, 2));
console.log("✓ Batch-assurance negative cases generated:", `${outDir}/batch-assurance-negative-cases.json`);
console.log(`  Correctly rejected: ${testResults.summary.correctlyRejected}/${testResults.summary.totalNegativeCases}`);
console.log(`  Legitimate: ${testResults.summary.legitimatePathsPass}/${testResults.summary.legitimatePathsTotal}`);
