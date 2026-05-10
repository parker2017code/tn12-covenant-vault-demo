/**
 * Test verifying real TN12 transactions with VirtualChainSync
 * This is what works with the actual REST API
 */

import { verifyTransactionAccepted, getGlobalVirtualChainSync } from "../src/virtualChainSync.mjs";
import { readFile } from "node:fs/promises";

console.log("=== TN12 Transaction Verification Test ===\n");

try {
  // Load the real accepted txids from the proof fixture
  const fixture = JSON.parse(await readFile("fixtures/AcceptedProofTransactions.json", "utf8"));
  const testTxids = fixture.transactions.slice(0, 3).map(t => t.txid);

  console.log(`1. Testing transaction verification against ${testTxids.length} real TN12 txids...\n`);

  const syncer = getGlobalVirtualChainSync();
  let verifiedCount = 0;

  for (const txid of testTxids) {
    const result = await syncer.verifyTransactionAcceptance(txid);
    if (result) {
      console.log(`   ✓ ${txid.substring(0, 20)}...`);
      console.log(`     Accepted: ${result.isAccepted}`);
      console.log(`     Blue score: ${result.acceptingBlockBlueScore}`);
      console.log(`     Inputs: ${result.inputs}, Outputs: ${result.outputs}`);
      if (result.isAccepted) verifiedCount++;
    }
  }

  console.log(`\n2. Summary`);
  console.log(`   Verified as accepted: ${verifiedCount}/${testTxids.length}`);
  console.log(`   All transactions still accepted on TN12: ${verifiedCount === testTxids.length ? "YES" : "NO"}`);

  if (verifiedCount === testTxids.length) {
    console.log("\n✓ VirtualChainSync: WORKING against live TN12");
    console.log("✓ Transaction verification: COMPLETE");
  }

} catch (err) {
  console.error("ERROR:", err.message);
  process.exit(1);
}
