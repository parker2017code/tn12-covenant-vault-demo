// Coordination Market Covenant Builder
// Implements multi-party settlement for stag hunt, coordination games
// Players commit to actions (cooperate/defect), settle based on outcome

export function buildCoordinationMarketCovenant({
  gameId = "stag-hunt-001",
  participantAKey = Buffer.alloc(32, 0x01),
  participantBKey = Buffer.alloc(32, 0x02),
  stakePerPlayerSompi = 50000000n,
  gameType = "stag-hunt"
} = {}) {
  // Validation
  if (!["stag-hunt", "intendo", "pack"].includes(gameType)) {
    throw new Error("Unknown game type: " + gameType);
  }

  const coordinationCovenant = {
    schema: "tn12-coordination-market-covenant/v1",
    gameId,
    contractType: "CoordinationGame",
    gameType,
    roles: {
      participantA: participantAKey.toString("hex"),
      participantB: participantBKey.toString("hex")
    },
    parameters: {
      stakePerPlayerSompi: String(stakePerPlayerSompi),
      totalPoolSompi: String(stakePerPlayerSompi * 2n),
      gameType
    },
    gameRules: buildGameRules(gameType),
    settlement: {
      status: "awaiting-move-commitments",
      totalFunded: String(stakePerPlayerSompi * 2n),
      outcomePending: true
    },
    custody: {
      model: "escrow-multi-party",
      lockType: "mutual-exclusive-outcomes",
      unlockCondition: "both-players-move-committed"
    },
    note: "Coordination market reuses escrow pattern extended to multi-player game settlement"
  };

  return coordinationCovenant;
}

function buildGameRules(gameType) {
  const rules = {
    "stag-hunt": {
      name: "Stag Hunt (Cooperation vs. Self-Interest)",
      moves: {
        A: ["hunt-stag", "hunt-hare"],
        B: ["hunt-stag", "hunt-hare"]
      },
      payoffs: {
        "stag-stag": { A: 4000000000n, B: 4000000000n },
        "stag-hare": { A: 0n, B: 3000000000n },
        "hare-stag": { A: 3000000000n, B: 0n },
        "hare-hare": { A: 3000000000n, B: 3000000000n }
      },
      description: "Stag hunting requires cooperation; hare hunting is safe but lower payoff"
    },
    "intendo": {
      name: "Intendo (Intentional Coordination)",
      moves: {
        A: ["action-1", "action-2"],
        B: ["action-1", "action-2"]
      },
      payoffs: {
        "action-1-action-1": { A: 4000000000n, B: 4000000000n },
        "action-1-action-2": { A: 0n, B: 0n },
        "action-2-action-1": { A: 0n, B: 0n },
        "action-2-action-2": { A: 2000000000n, B: 2000000000n }
      },
      description: "Players must coordinate on same action; both right actions (1-1) or both safe (2-2)"
    },
    "pack": {
      name: "Pack Hunting (Symmetric Contribution)",
      moves: {
        A: ["contribute-high", "contribute-low"],
        B: ["contribute-high", "contribute-low"]
      },
      payoffs: {
        "contribute-high-contribute-high": { A: 5000000000n, B: 5000000000n },
        "contribute-high-contribute-low": { A: 1000000000n, B: 4000000000n },
        "contribute-low-contribute-high": { A: 4000000000n, B: 1000000000n },
        "contribute-low-contribute-low": { A: 2000000000n, B: 2000000000n }
      },
      description: "Both contribute high = best; free-rider gets more than contributor"
    }
  };

  return rules[gameType] || rules["stag-hunt"];
}

export function buildCoordinationMarketSettlement({
  covenant = {},
  participantAMove = null,
  participantBMove = null,
  participantASignature = null,
  participantBSignature = null
} = {}) {
  // Validate moves are committed
  if (!participantAMove || !participantBMove) {
    return {
      status: "awaiting-moves",
      reason: "Both players must commit moves"
    };
  }

  // Look up payoffs
  const gameRules = covenant.gameRules || {};
  const payoffKey = participantAMove + "-" + participantBMove;
  const payoffs = gameRules.payoffs?.[payoffKey];

  if (!payoffs) {
    return {
      status: "invalid-move-combination",
      reason: "Unknown move combination: " + payoffKey
    };
  }

  // Validate signatures
  if (!participantASignature || !participantBSignature) {
    return {
      status: "awaiting-signatures",
      reason: "Both players must sign settlement"
    };
  }

  return {
    status: "settlement-ready",
    outcome: payoffKey,
    payoffs: {
      participantA: String(payoffs.A),
      participantB: String(payoffs.B)
    },
    validated: true,
    note: "Settlement locked in; awaiting on-chain execution"
  };
}
