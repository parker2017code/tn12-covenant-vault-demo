import { readFile, writeFile, mkdir } from "node:fs/promises";

/**
 * Coordination market submission handler
 * Submits game outcomes (stag-hunt, prisoner's dilemma, coordination)
 */

const TN12_REST = "https://api-tn12.kaspa.org";

const GAME_TYPES = {
  STAG_HUNT: 0,
  PRISONERS_DILEMMA: 1,
  COORDINATION: 2
};

const PAYOFF_STRUCTURES = {
  [GAME_TYPES.STAG_HUNT]: {
    name: "Stag Hunt",
    both_stag: { player1: 4, player2: 4 },
    both_hare: { player1: 3, player2: 3 },
    one_stag: { player1: 0, player2: 5 }
  },
  [GAME_TYPES.PRISONERS_DILEMMA]: {
    name: "Prisoner's Dilemma",
    both_cooperate: { player1: 3, player2: 3 },
    both_defect: { player1: 1, player2: 1 },
    one_defect: { player1: 0, player2: 5 }
  },
  [GAME_TYPES.COORDINATION]: {
    name: "Coordination",
    both_a: { player1: 2, player2: 2 },
    both_b: { player1: 1, player2: 1 },
    mixed: { player1: 0, player2: 0 }
  }
};

export async function submitCoordinationOutcome({
  gamePoolOutpoint,
  player1Signature,
  player2Signature,
  gameType,
  player1Address,
  player2Address,
  poolAmount,
  minerFeeSompi = 5000n
}) {
  const outDir = "artifacts";
  await mkdir(outDir, { recursive: true });

  const gameInfo = PAYOFF_STRUCTURES[gameType];

  console.log("=== Coordination Market Settlement ===\n");
  console.log(`Game: ${gameInfo.name}`);
  console.log(`Pool: ${Number(poolAmount) / 100000000} TKAS`);
  console.log(`Player 1: ${player1Address.substring(0, 20)}...`);
  console.log(`Player 2: ${player2Address.substring(0, 20)}...`);
  console.log(`Endpoint: ${TN12_REST}\n`);

  // Step 1: Verify game pool exists
  console.log("Step 1: Verify game pool on TN12...");
  let poolLive = false;
  try {
    const response = await fetch(`${TN12_REST}/transactions/${gamePoolOutpoint.txid}`);
    const data = await response.json();
    poolLive = data.is_accepted === true;

    if (poolLive) {
      console.log(`✓ Game pool confirmed (blue score: ${data.accepting_block_blue_score})`);
    } else {
      console.log(`✗ Game pool not found`);
    }
  } catch (err) {
    console.log(`✗ Error checking pool: ${err.message}`);
  }

  // Step 2: Calculate agreed payoffs
  console.log("\nStep 2: Calculating payoff distribution...");

  // In real implementation, would decode the agreed outcome from signatures
  // For now, assume mutual cooperation (if available)
  const payoffs = gameInfo.both_cooperate || gameInfo.both_a;
  const player1Payout = (BigInt(payoffs.player1) * BigInt(100000000));
  const player2Payout = (BigInt(payoffs.player2) * BigInt(100000000));

  console.log(`Player 1 payout: ${Number(player1Payout) / 100000000} TKAS`);
  console.log(`Player 2 payout: ${Number(player2Payout) / 100000000} TKAS`);

  // Step 3: Build settlement
  const settlementTx = {
    schema: "tn12-coordination-settlement/v1",
    network: "kaspa-testnet-12",
    timestamp: new Date().toISOString(),
    gamePoolUTXO: gamePoolOutpoint.txid,
    game: {
      type: gameType,
      name: gameInfo.name
    },
    submission: {
      status: poolLive ? "ready" : "blocked",
      signatures: {
        player1: player1Signature,
        player2: player2Signature
      },
      settlement: {
        poolAmount: poolAmount.toString(),
        player1Payout: player1Payout.toString(),
        player2Payout: player2Payout.toString(),
        fee: minerFeeSompi.toString()
      },
      result: poolLive ? "Can submit" : "Pool not live"
    }
  };

  const settlementPath = `${outDir}/coordination-settlement-submission.json`;
  await writeFile(settlementPath, JSON.stringify(settlementTx, null, 2));
  console.log(`✓ Settlement prepared: ${settlementPath}`);

  // Step 4: Attempt submission if pool is live
  if (poolLive) {
    console.log("\nStep 4: Submitting to TN12...");

    const submitPayload = {
      transaction: {
        version: 0,
        inputs: [
          {
            previousOutpoint: {
              transactionId: gamePoolOutpoint.txid,
              index: 0
            },
            signatureScript: buildCoordinationSignatureScript(
              player1Signature,
              player2Signature,
              gameType
            ),
            sequence: "18446744073709551615",
            sigOpCount: 2
          }
        ],
        outputs: [
          {
            scriptPublicKey: {
              scriptType: "p2pk",
              scriptPublicKey: gamePoolOutpoint.player1ScriptPubKey || ""
            },
            amount: player1Payout.toString()
          },
          {
            scriptPublicKey: {
              scriptType: "p2pk",
              scriptPublicKey: gamePoolOutpoint.player2ScriptPubKey || ""
            },
            amount: player2Payout.toString()
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

function buildCoordinationSignatureScript(player1Sig, player2Sig, gameType) {
  // P2SH signature script: [player1_sig] [player2_sig] [gameType] [redeemScript]
  return "placeholder-coordination-sig-script";
}

export { GAME_TYPES, PAYOFF_STRUCTURES };
