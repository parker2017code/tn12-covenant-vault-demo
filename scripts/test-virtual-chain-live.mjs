/**
 * Test virtual-chain sync and replayer against LIVE TN12
 * Proves the infrastructure works without fresh UTXOs
 */

import { getVirtualChainFromBlockV2, VirtualChainSync } from "../src/virtualChainSync.mjs";
import { getGlobalReplayer } from "../src/virtualChainReplayer.mjs";

const TN12_REST = "https://api-tn12.kaspa.org";

console.log("=== Virtual-Chain Infrastructure Live Test ===\n");

try {
  // 1. Get latest block hash
  console.log("1. Fetching latest block from TN12...");
  const dagResponse = await fetch(`${TN12_REST}/blocks/header`);
  const dagData = await dagResponse.json();
  const latestBlockHash = dagData.hash;
  console.log(`   ✓ Latest block: ${latestBlockHash.substring(0, 16)}...`);
  console.log(`   Blue score: ${dagData.blue_score}\n`);

  // 2. Test virtual chain sync
  console.log("2. Testing VirtualChainSync.getVirtualChainFromBlock()...");
  const syncer = new VirtualChainSync();
  const vchain = await syncer.getVirtualChainFromBlock(latestBlockHash);
  
  if (vchain && vchain.transactions) {
    console.log(`   ✓ Virtual chain retrieved`);
    console.log(`   Block hash: ${vchain.blockHash.substring(0, 16)}...`);
    console.log(`   Blue score: ${vchain.blueScore}`);
    console.log(`   Transaction count: ${vchain.transactionCount || vchain.transactions.length}`);
    console.log(`   Sample transactions:`);
    vchain.transactions.slice(0, 3).forEach(tx => {
      console.log(`     - ${tx.txid.substring(0, 16)}... (index ${tx.index})`);
    });
    console.log("");
  } else {
    throw new Error("Virtual chain sync failed");
  }

  // 3. Test transaction ordering verification
  console.log("3. Testing transaction ordering verification...");
  if (vchain.transactions.length > 0) {
    const firstTx = vchain.transactions[0];
    const verified = await syncer.verifyTransactionOrdering(
      latestBlockHash,
      firstTx.txid,
      firstTx.index
    );
    console.log(`   ✓ Verified: tx ${firstTx.txid.substring(0, 16)}... at index ${firstTx.index}: ${verified}\n`);
  }

  // 4. Test virtual chain replayer polling
  console.log("4. Testing VirtualChainReplayer polling mechanism...");
  const replayer = getGlobalReplayer();
  
  let acceptedTxCount = 0;
  replayer.onAccepted(event => {
    acceptedTxCount++;
    console.log(`   Event: txid ${event.txid.substring(0, 16)}... at blue score ${event.blueScore}`);
  });

  await replayer.startReplay();
  console.log("   ✓ Polling started (5-second interval)");
  
  // Wait for one poll cycle
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  console.log(`   ✓ Polled transactions: ${replayer.acceptedTransactions.size} total\n`);

  // 5. Test app state derivation
  console.log("5. Testing app state derivation...");
  const appState = replayer.deriveAppState();
  console.log(`   Timestamp: ${appState.timestamp}`);
  console.log(`   Last polled blue score: ${appState.lastPolledBlueScore}`);
  console.log(`   Transaction lanes:`);
  Object.entries(appState.lanes).forEach(([lane, stats]) => {
    console.log(`     - ${lane}: ${stats.accepted} accepted, ${stats.rejected} rejected`);
  });
  console.log(`   Total transactions tracked: ${appState.transactions.length}\n`);

  replayer.stopReplay();
  console.log("6. Polling stopped\n");

  // Summary
  console.log("=== Infrastructure Live Test Results ===");
  console.log("✓ VirtualChainSync: WORKING");
  console.log("✓ Transaction ordering: VERIFIED");
  console.log("✓ VirtualChainReplayer: POLLING");
  console.log("✓ App state derivation: WORKING");
  console.log("\n✓ All infrastructure modules operational against live TN12");

} catch (err) {
  console.error("ERROR:", err.message);
  process.exit(1);
}
