import { readFile, writeFile, mkdir } from "node:fs/promises";

/**
 * Auction settlement submission handler
 * Builds and submits winning bid settlement transactions to TN12
 */

const TN12_REST = "https://api-tn12.kaspa.org";

export async function submitAuctionSettlement({
  auctionOutpoint,
  sellerSignature,
  bidderSignature,
  sellerAddress,
  bidAmount,
  minerFeeSompi = 5000n
}) {
  const outDir = "artifacts";
  await mkdir(outDir, { recursive: true });

  console.log("=== Auction Settlement Submission ===\n");
  console.log(`Bid Amount: ${Number(bidAmount) / 100000000} TKAS`);
  console.log(`Seller: ${sellerAddress.substring(0, 20)}...`);
  console.log(`Endpoint: ${TN12_REST}\n`);

  // Step 1: Verify auction UTXO exists
  console.log("Step 1: Verify auction UTXO on TN12...");
  let auctionLive = false;
  try {
    const response = await fetch(`${TN12_REST}/transactions/${auctionOutpoint.txid}`);
    const data = await response.json();
    auctionLive = data.is_accepted === true;

    if (auctionLive) {
      console.log(`✓ Auction UTXO confirmed (blue score: ${data.accepting_block_blue_score})`);
    } else {
      console.log(`✗ Auction UTXO not found`);
    }
  } catch (err) {
    console.log(`✗ Error checking auction UTXO: ${err.message}`);
  }

  // Step 2: Build settlement transaction
  console.log("\nStep 2: Building settlement transaction...");

  const settlementTx = {
    schema: "tn12-auction-settlement-submission/v1",
    network: "kaspa-testnet-12",
    timestamp: new Date().toISOString(),
    auctionUTXO: auctionOutpoint.txid,
    submission: {
      status: auctionLive ? "ready" : "blocked",
      signatures: {
        seller: sellerSignature,
        bidder: bidderSignature
      },
      settlement: {
        bidAmount: bidAmount.toString(),
        sellerReceives: (bidAmount - BigInt(minerFeeSompi)).toString(),
        fee: minerFeeSompi.toString()
      },
      result: auctionLive ? "Can submit" : "UTXO not live"
    }
  };

  const settlementPath = `${outDir}/auction-settlement-submission.json`;
  await writeFile(settlementPath, JSON.stringify(settlementTx, null, 2));
  console.log(`✓ Settlement prepared: ${settlementPath}`);

  // Step 3: Attempt submission if UTXO is live
  if (auctionLive) {
    console.log("\nStep 3: Submitting to TN12...");

    const submitPayload = {
      transaction: {
        version: 0,
        inputs: [
          {
            previousOutpoint: {
              transactionId: auctionOutpoint.txid,
              index: 0
            },
            signatureScript: buildAuctionSignatureScript(sellerSignature, bidderSignature),
            sequence: "18446744073709551615",
            sigOpCount: 2
          }
        ],
        outputs: [
          {
            scriptPublicKey: {
              scriptType: "p2pk",
              scriptPublicKey: auctionOutpoint.sellerScriptPubKey || ""
            },
            amount: (bidAmount - BigInt(minerFeeSompi)).toString()
          }
        ]
      }
    };

    try {
      const response = await fetch(`${TN12_REST}/transactions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submitPayload)
      });

      const body = await response.json();

      if (response.ok) {
        console.log(`✓ Submission accepted`);
        settlementTx.submission.txid = body.transactionid;
        settlementTx.submission.status = "submitted";
      } else {
        console.log(`✗ Submission rejected: ${body.error}`);
        settlementTx.submission.status = "rejected";
        settlementTx.submission.error = body.error;
      }
    } catch (err) {
      console.log(`✗ Submission error: ${err.message}`);
      settlementTx.submission.status = "error";
      settlementTx.submission.error = err.message;
    }

    await writeFile(settlementPath, JSON.stringify(settlementTx, null, 2));
  }

  return settlementTx;
}

function buildAuctionSignatureScript(sellerSig, bidderSig) {
  // P2SH signature script: [seller_sig] [bidder_sig] [OP_2] [redeemScript]
  // In real implementation, would be proper Kaspa script bytes
  return "placeholder-auction-sig-script";
}
