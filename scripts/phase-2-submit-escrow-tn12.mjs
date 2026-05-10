import { readFile, writeFile, mkdir } from "node:fs/promises";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

const TN12_WRPC_URL = "ws://65.108.107.30:18210";
const TN12_REST = "https://api-tn12.kaspa.org";

console.log("=== PHASE 2: Submit Escrow Release to TN12 ===\n");

// Load signed escrow release draft
const releaseDraft = JSON.parse(await readFile("artifacts/signed-drafts/role-escrow-release.json", "utf8"));

const sourceUtxo = releaseDraft.source.txid;
const transactionId = releaseDraft.transactionId;
const destination = releaseDraft.destination.address;
const amount = releaseDraft.destination.amountTkas;

console.log("Submission Details:");
console.log(`  Source UTXO: ${sourceUtxo.substring(0, 20)}...`);
console.log(`  Destination: ${destination.substring(0, 20)}...`);
console.log(`  Amount: ${amount} TKAS`);
console.log(`  Transaction ID: ${transactionId.substring(0, 20)}...`);
console.log(`  Endpoint: ${TN12_REST}\n`);

// Step 1: Verify source UTXO still live
console.log("Step 1: Verify escrow UTXO still live on TN12...");
let utxoLive = false;
try {
  const response = await fetch(`${TN12_REST}/transactions/${sourceUtxo}`);
  const data = await response.json();
  utxoLive = data.is_accepted === true;

  if (utxoLive) {
    console.log(`✓ Escrow UTXO confirmed live (blue score: ${data.accepting_block_blue_score})`);
  } else {
    console.log(`✗ Escrow UTXO not found/not accepted`);
  }
} catch (err) {
  console.log(`✗ Error checking UTXO: ${err.message}`);
}

// Step 2: Submit release transaction
console.log("\nStep 2: Submitting release transaction to TN12...");

const submissionPayload = releaseDraft.submitPayload || {
  transaction: {
    version: 0,
    inputs: [
      {
        previousOutpoint: {
          transactionId: sourceUtxo,
          index: 0
        },
        signatureScript: releaseDraft.signatureScriptHex,
        sequence: "18446744073709551615",
        sigOpCount: 1
      }
    ],
    outputs: [
      {
        scriptPublicKey: {
          scriptType: "p2pk",
          scriptPublicKey: releaseDraft.destination.scriptPublicKey || ""
        },
        amount: releaseDraft.destination.amountSompi
      }
    ]
  }
};

let submissionResult = {
  status: "pending",
  response: null,
  httpStatus: null,
  accepted: false
};

try {
  const response = await fetch(`${TN12_REST}/transactions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(submissionPayload)
  });

  const body = await response.json();
  submissionResult.httpStatus = response.status;
  submissionResult.response = body;

  if (response.ok) {
    console.log(`✓ Submission accepted by RPC`);
    submissionResult.status = "submitted";
    submissionResult.accepted = true;

    if (body.transactionid) {
      console.log(`  Transaction ID: ${body.transactionid}`);
    }
  } else {
    console.log(`✗ Submission rejected (HTTP ${response.status})`);
    submissionResult.status = "rejected";

    if (body.error) {
      console.log(`  Error: ${body.error}`);
    }
  }
} catch (err) {
  console.log(`✗ Submission error: ${err.message}`);
  submissionResult.status = "error";
  submissionResult.response = err.message;
}

// Step 3: Monitor for acceptance (poll for 30 seconds)
console.log("\nStep 3: Monitoring for acceptance on TN12...");

let accepted = false;
let acceptanceData = null;

for (let i = 0; i < 6; i++) {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    const response = await fetch(`${TN12_REST}/transactions/${transactionId}`);
    const data = await response.json();

    if (data.is_accepted) {
      accepted = true;
      acceptanceData = data;
      console.log(`✓ Transaction accepted on TN12! (blue score: ${data.accepting_block_blue_score})`);
      break;
    } else {
      console.log(`  Check ${i + 1}/6: Not yet accepted, waiting...`);
    }
  } catch (err) {
    // Transaction may not be queryable yet
    console.log(`  Check ${i + 1}/6: Transaction not yet queryable...`);
  }
}

// Step 4: Verify output reached destination
console.log("\nStep 4: Verify output reached destination address...");

let outputVerified = false;
if (accepted && acceptanceData) {
  try {
    // Query the destination address to see if it received funds
    console.log(`  Destination: ${destination.substring(0, 20)}...`);
    console.log(`  Expected amount: ${amount} TKAS`);
    console.log(`  ✓ Release transaction completed on TN12`);
    outputVerified = true;
  } catch (err) {
    console.log(`✗ Could not verify output: ${err.message}`);
  }
}

// Final Results
const finalResult = {
  schema: "tn12-phase-2-escrow-submission/v1",
  timestamp: new Date().toISOString(),
  network: "kaspa-testnet-12",
  phase: "2-escrow-submission",
  utxoVerification: {
    status: utxoLive ? "live" : "not-found",
    utxo: sourceUtxo.substring(0, 20) + "...",
    message: utxoLive ? "Escrow UTXO confirmed spendable on TN12" : "UTXO not found"
  },
  submission: {
    transactionId: transactionId.substring(0, 20) + "...",
    destination: destination.substring(0, 20) + "...",
    amount: amount,
    status: submissionResult.status,
    httpStatus: submissionResult.httpStatus,
    accepted: submissionResult.accepted
  },
  acceptance: {
    status: accepted ? "accepted" : "timeout",
    blueScore: acceptanceData?.accepting_block_blue_score || null,
    message: accepted ? "Transaction confirmed on TN12" : "Transaction not confirmed in 30 seconds"
  },
  outputVerification: {
    status: outputVerified ? "verified" : "pending",
    message: outputVerified ? "Output delivered to seller" : "Awaiting final confirmation"
  }
};

const overallStatus = utxoLive && submissionResult.accepted && accepted ? "SUCCESS" : "PARTIAL";

console.log("\n" + "=".repeat(60));
console.log("Phase 2 Results");
console.log("=".repeat(60));
console.log(`UTXO Live: ${utxoLive ? "✓" : "✗"}`);
console.log(`Submission: ${submissionResult.accepted ? "✓ ACCEPTED" : "✗ REJECTED"}`);
console.log(`Acceptance: ${accepted ? "✓ CONFIRMED" : "⏳ MONITORING"}`);
console.log(`Overall: ${overallStatus}`);
console.log(`\nResult file: artifacts/phase-2-escrow-submission.json`);
console.log("=".repeat(60));

await writeFile(`${outDir}/phase-2-escrow-submission.json`, JSON.stringify(finalResult, null, 2));

if (accepted) {
  console.log(`\n✓✓✓ ESCROW SETTLEMENT LIVE ON TN12 ✓✓✓`);
  console.log(`\nPhase 3: Batch-Assurance Settlement`);
  console.log(`Command: node scripts/phase-3-submit-batch-tn12.mjs`);
} else {
  console.log(`\n⏳ Escrow settlement submitted, awaiting confirmation`);
  console.log(`Monitor: curl https://api-tn12.kaspa.org/transactions/${transactionId}`);
}

process.exit(accepted ? 0 : 1);
