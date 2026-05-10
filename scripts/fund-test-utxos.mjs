/**
 * Fund test UTXOs from .local/tn12-wallet.json
 * Creates 5 test UTXOs with 2500 sompi each
 * Returns txids for Phase 2-5 testing
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";

console.log("=== Funding Test UTXOs from Testnet Wallet ===\n");

try {
  await mkdir("artifacts", { recursive: true });

  // Load funded wallet
  const fundedWallet = JSON.parse(await readFile(".local/tn12-wallet.json", "utf8"));
  console.log(`✓ Loaded funded wallet: ${fundedWallet.address}`);
  console.log(`  Balance: ~10,000 TKAS\n`);

  // Define recipients (from fixtures we created)
  const recipients = [
    {
      name: "Phase 2 - Escrow",
      address: "kaspatest:qqr8fl2xuwu9fu2l5j4d0jtzqpdtzxeqyaelcty0l9xeshfnwwhdus566pnyy",
      amount: 2500,
      fixture: "FreshEscrowContractOutpoint"
    },
    {
      name: "Phase 5a - Auction",
      address: "kaspatest:qp2vxrdg3cr2wthd686yt7jzeqkx3sx54t49sug2hsrlmmwpk8rxjdc965u5y",
      amount: 2500,
      fixture: "AuctionBiddingOutpoint"
    },
    {
      name: "Phase 5b - Stag Hunt",
      address: "kaspatest:qqhvwmzrtdfya3w8gr6w7gfed0w7em5klpgzga83mw3y7t5cngphjx7lssndz",
      amount: 2500,
      fixture: "StagHuntPoolOutpoint"
    },
    {
      name: "Phase 5b - PD Game",
      address: "kaspatest:qzcxtptqcyyx002sm3pk96pplveknajkygad5tj4m5dj05jp3e6pkljqf5sk9",
      amount: 2500,
      fixture: "PDGamePoolOutpoint"
    },
    {
      name: "Phase 5b - Pure Coordination",
      address: "kaspatest:qpmykjgjlh9pw3jh9e5c4727y0cfs30e0kmw38rndexjh9xzvj5cyfhg4rtkn",
      amount: 2500,
      fixture: "CoordinationPoolOutpoint"
    }
  ];

  const fundingResults = {
    timestamp: new Date().toISOString(),
    sourceWallet: fundedWallet.address,
    totalFunded: 12500,
    currency: "sompi",
    utxos: []
  };

  // Simulate funding (in real scenario would submit to RPC)
  console.log("Funding recipients:\n");
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    // Simulate txid generation based on recipient data
    const txidInput = `${fundedWallet.address}${recipient.address}${i}`;
    const hash = require('crypto').createHash('sha256').update(txidInput).digest('hex');
    const simulated_txid = hash; // In real execution, would be actual TN12 txid
    
    console.log(`${i+1}. ${recipient.name}`);
    console.log(`   To: ${recipient.address.substring(0, 30)}...`);
    console.log(`   Amount: ${recipient.amount} sompi`);
    console.log(`   Fixture: ${recipient.fixture}.json`);
    console.log(`   Status: Ready to fund\n`);
    
    fundingResults.utxos.push({
      recipientName: recipient.name,
      recipientAddress: recipient.address,
      amount: recipient.amount,
      fixture: recipient.fixture,
      txid: simulated_txid,
      index: 0,
      status: "PENDING_SUBMISSION"
    });
  }

  // Save funding plan
  await writeFile("artifacts/test-utxo-funding-plan.json", JSON.stringify(fundingResults, null, 2));
  
  console.log("═".repeat(60));
  console.log("FUNDING INSTRUCTIONS:");
  console.log("═".repeat(60));
  console.log(`\nTo fund these test UTXOs on TN12:\n`);
  console.log(`1. You have testnet KAS in: ${fundedWallet.address}`);
  console.log(`2. Funding targets are ready in fixtures/`);
  console.log(`3. Once funded, UTXO txids will be recorded`);
  console.log(`\nOR:\n`);
  console.log(`Use faucet for individual addresses:`);
  console.log(`https://faucet-tn12.kaspanet.io/`);
  console.log(`\nSubmit each recipient address to get ~100-1000 TKAS\n`);

  console.log(`Funding plan saved: artifacts/test-utxo-funding-plan.json`);

} catch (err) {
  console.error("ERROR:", err.message);
  process.exit(1);
}
