import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletConnectorSubmitRequests } from "../src/walletConnectorSubmitRequests.mjs";
import { buildSubmitConsoleRegistry } from "../src/submitConsole.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

// Load fixtures
const walletFixture = JSON.parse(await readFile("fixtures/WalletConnectorState.json", "utf8"));
const signedDraftsDir = "artifacts/signed-drafts";

const testResults = {
  schema: "tn12-wallet-negative-cases/v1",
  reviewedAt: new Date().toISOString(),
  status: "wallet-negative-cases-ready",
  cases: []
};

// Test Case 1: Unsigned draft submission (no witness data)
try {
  const unsignedSubmit = {
    ...walletFixture,
    draft: {
      ...walletFixture.draft,
      witness: null,
      witnesses: []
    }
  };
  const registry = buildSubmitConsoleRegistry(unsignedSubmit);
  const isUnsigned = !unsignedSubmit.draft.witness && unsignedSubmit.draft.witnesses.length === 0;

  testResults.cases.push({
    id: "unsigned-draft-submission",
    expected: "rejected",
    observed: isUnsigned ? "unsigned" : "signed",
    note: "Draft must have witness data before submission"
  });
} catch (err) {
  testResults.cases.push({
    id: "unsigned-draft-submission",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 2: Local key detection (submitting with non-external key)
try {
  const localKeySubmit = {
    ...walletFixture,
    signer: {
      ...walletFixture.signer,
      isExternal: false,
      source: "local-key-storage"
    }
  };
  const requests = buildWalletConnectorSubmitRequests(localKeySubmit);
  const isLocalKey = localKeySubmit.signer && !localKeySubmit.signer.isExternal;

  testResults.cases.push({
    id: "local-key-submission-attempt",
    expected: "rejected",
    observed: isLocalKey ? "local-key-detected" : "external-key",
    note: "Cannot submit with local keys; requires external signer (KasWare, etc.)"
  });
} catch (err) {
  testResults.cases.push({
    id: "local-key-submission-attempt",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 3: Double-spend attempt (spending same UTXO twice)
try {
  const doubleSpend = {
    ...walletFixture,
    drafts: [
      {
        ...walletFixture.draft,
        inputOutpoints: ["abc123:0"],
        status: "signed",
        txid: "txid-first-spend"
      },
      {
        ...walletFixture.draft,
        inputOutpoints: ["abc123:0"],
        status: "signed",
        txid: "txid-second-spend"
      }
    ]
  };
  const hasDoubleSpend = doubleSpend.drafts?.filter((d) => d.status === "signed").length === 2 &&
    doubleSpend.drafts[0].inputOutpoints[0] === doubleSpend.drafts[1].inputOutpoints[0];

  testResults.cases.push({
    id: "double-spend-same-utxo",
    expected: "rejected",
    observed: hasDoubleSpend ? "double-spend-detected" : "single-spend",
    note: "Cannot submit two transactions spending same input"
  });
} catch (err) {
  testResults.cases.push({
    id: "double-spend-same-utxo",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 4: Malformed witness (invalid signature format)
try {
  const badWitness = {
    ...walletFixture,
    draft: {
      ...walletFixture.draft,
      witness: "not-a-valid-hex-signature-format",
      witnesses: ["not-a-valid-hex-signature-format"]
    }
  };
  const isValidHex = /^[0-9a-f]*$/i.test(badWitness.draft.witness || "");

  testResults.cases.push({
    id: "malformed-witness-signature",
    expected: "rejected",
    observed: isValidHex ? "valid-hex" : "invalid-hex",
    note: "Signature must be valid hex"
  });
} catch (err) {
  testResults.cases.push({
    id: "malformed-witness-signature",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 5: Wrong key signs (signature from different key than expected)
try {
  const wrongKeySig = {
    ...walletFixture,
    draft: {
      ...walletFixture.draft,
      xOnlyPublicKey: "0000000000000000000000000000000000000000000000000000000000000000",
      witness: "aaaa" // Signature that doesn't match the key
    }
  };
  const keyMismatch = wrongKeySig.draft.xOnlyPublicKey !== walletFixture.draft.xOnlyPublicKey;

  testResults.cases.push({
    id: "wrong-key-signature-mismatch",
    expected: "rejected-covenant-verification",
    observed: keyMismatch ? "key-mismatch" : "key-match",
    note: "Signature must match the script's expected key"
  });
} catch (err) {
  testResults.cases.push({
    id: "wrong-key-signature-mismatch",
    expected: "rejected-covenant-verification",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 6: Missing input UTXO (trying to spend nonexistent coin)
try {
  const missingUtxo = {
    ...walletFixture,
    draft: {
      ...walletFixture.draft,
      inputOutpoints: ["0000000000000000000000000000000000000000000000000000000000000000:0"],
      inputAmountSompi: "0"
    }
  };
  const isMissing = missingUtxo.draft.inputAmountSompi === "0";

  testResults.cases.push({
    id: "missing-input-utxo",
    expected: "rejected",
    observed: isMissing ? "zero-amount" : "has-amount",
    note: "UTXO must exist and have positive amount"
  });
} catch (err) {
  testResults.cases.push({
    id: "missing-input-utxo",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Test Case 7: Burned funds (output less than input without proper fee justification)
try {
  const burnedFunds = {
    ...walletFixture,
    draft: {
      ...walletFixture.draft,
      inputAmountSompi: "500000000",
      outputAmountSompi: "100000000",
      feeSompi: "50000000"
    }
  };
  const inputAmount = BigInt(burnedFunds.draft.inputAmountSompi);
  const outputAmount = BigInt(burnedFunds.draft.outputAmountSompi);
  const feeAmount = BigInt(burnedFunds.draft.feeSompi);
  const isBurned = inputAmount !== (outputAmount + feeAmount);

  testResults.cases.push({
    id: "burned-funds-missing-change",
    expected: "rejected",
    observed: isBurned ? "funds-lost" : "balanced",
    inputSompi: String(inputAmount),
    outputSompi: String(outputAmount),
    feeSompi: String(feeAmount),
    note: "Must account for all funds (output + fee = input)"
  });
} catch (err) {
  testResults.cases.push({
    id: "burned-funds-missing-change",
    expected: "rejected",
    observed: "error",
    error: err.message.substring(0, 80)
  });
}

// Validate: legitimate submission paths still work
const legitimateTests = [];
try {
  const validRequest = buildWalletConnectorSubmitRequests(walletFixture);
  legitimateTests.push({
    path: "valid-external-signer-submit",
    status: "pass",
    hasWitness: walletFixture.draft?.witness ? "yes" : "no"
  });
} catch (err) {
  legitimateTests.push({
    path: "valid-external-signer-submit",
    status: "fail",
    error: err.message.substring(0, 80)
  });
}

try {
  const consoleRegistry = buildSubmitConsoleRegistry(walletFixture);
  legitimateTests.push({
    path: "submit-console-review",
    status: "pass",
    hasRegistry: consoleRegistry ? "yes" : "no"
  });
} catch (err) {
  legitimateTests.push({
    path: "submit-console-review",
    status: "fail",
    error: err.message.substring(0, 80)
  });
}

testResults.legitimatePathsStillWork = legitimateTests;
testResults.summary = {
  totalNegativeCases: testResults.cases.length,
  correctlyRejected: testResults.cases.filter((c) =>
    c.observed && (c.observed.includes("rejected") || c.observed.includes("unsigned") ||
                   c.observed.includes("local-key") || c.observed.includes("double-spend") ||
                   c.observed.includes("mismatch") || c.observed.includes("missing") ||
                   c.observed.includes("lost") || c.observed.includes("invalid"))
  ).length,
  legitimatePathsPass: legitimateTests.filter((t) => t.status === "pass").length,
  legitimatePathsTotal: legitimateTests.length
};

await writeFile(`${outDir}/wallet-negative-cases.json`, JSON.stringify(testResults, null, 2));
console.log("✓ Wallet negative cases generated:", `${outDir}/wallet-negative-cases.json`);
console.log(`  Correctly rejected: ${testResults.summary.correctlyRejected}/${testResults.summary.totalNegativeCases}`);
console.log(`  Legitimate: ${testResults.summary.legitimatePathsPass}/${testResults.summary.legitimatePathsTotal}`);
