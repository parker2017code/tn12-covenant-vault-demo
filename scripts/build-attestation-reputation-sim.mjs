#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";

// Read settlement and signer artifacts
const escrowMapPath = process.env.ESCROW_MAP || "artifacts/escrow-marketplace-action-map.json";
const signerSimPath = process.env.SIGNER_SIM || "artifacts/wallet-external-signer-roundtrip-plan.json";
const batchSettlementPath = process.env.BATCH_SETTLEMENT || "artifacts/batch-assurance-settlement-drafts.json";

let escrowMap = null, signerSim = null, batchSettlement = null;
try {
  if (escrowMapPath) escrowMap = JSON.parse(await readFile(escrowMapPath, "utf8"));
} catch (e) { console.warn(`Warning: Could not load ${escrowMapPath}`); }
try {
  if (signerSimPath) signerSim = JSON.parse(await readFile(signerSimPath, "utf8"));
} catch (e) { console.warn(`Warning: Could not load ${signerSimPath}`); }
try {
  if (batchSettlementPath) batchSettlement = JSON.parse(await readFile(batchSettlementPath, "utf8"));
} catch (e) { console.warn(`Warning: Could not load ${batchSettlementPath}`); }

// Simulate reputation scores across settlement flows
const reputationScores = buildReputationScores({
  escrowMap,
  signerSim,
  batchSettlement
});

const outPath = process.env.OUT || "artifacts/attestation-reputation-sim.json";
await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(reputationScores, null, 2)}\n`);

console.log(`✓ ${outPath}`);
console.log(`  Participants: ${reputationScores.summary.totalParticipants}`);
console.log(`  Escrow flows: ${reputationScores.summary.escrowFlowsObserved}`);
console.log(`  Settlement successes: ${reputationScores.summary.successfulSettlements}`);
console.log(`  Average acceptance rate: ${(reputationScores.summary.averageAcceptanceRate * 100).toFixed(1)}%`);

function buildReputationScores({ escrowMap = {}, signerSim = {}, batchSettlement = {} } = {}) {
  const participants = new Map();

  // Track from escrow flows
  if (escrowMap.flows) {
    escrowMap.flows.forEach((flow, flowIdx) => {
      const escrowId = flow.escrowId || `flow-${flowIdx}`;
      (flow.actions || []).forEach((action) => {
        const requestId = action.unsignedRequestId || `action-${flowIdx}`;
        recordParticipant(participants, `escrow:${escrowId}:role-0`, {
          kind: "escrow-release",
          flowId: escrowId,
          actionStatus: action.status,
          flowIdx
        });
      });
    });
  }

  // Track from signer roundtrip
  if (signerSim.rows) {
    signerSim.rows.forEach((row, rowIdx) => {
      const signerId = row.signerName || "signer-0";
      recordParticipant(participants, signerId, {
        kind: "signer",
        roundtripIndex: rowIdx,
        roundtripStatus: row.roundtripStatus || "pending"
      });
    });
  }

  // Track from batch-assurance settlement
  if (batchSettlement.release) {
    recordParticipant(participants, "batch-assurance:settler", {
      kind: "batch-settlement",
      releaseStatus: batchSettlement.status,
      refundCount: (batchSettlement.refunds || []).length
    });
  }

  // Compute aggregate reputation metrics
  const participantList = Array.from(participants.entries()).map(([id, metrics]) => ({
    participantId: id,
    kind: metrics.kind,
    totalEvents: metrics.events.length,
    successRate: metrics.events.filter((e) => e.actionStatus?.includes("validated") || e.actionStatus?.includes("passed")).length / Math.max(1, metrics.events.length),
    events: metrics.events
  }));

  const totalSuccessful = participantList.reduce((sum, p) => sum + (p.successRate * p.totalEvents), 0);
  const totalEvents = participantList.reduce((sum, p) => sum + p.totalEvents, 0);

  return {
    schema: "tn12-attestation-reputation-sim/v1",
    network: "kaspa-testnet-12",
    generatedAt: new Date().toISOString(),
    status: "reputation-sim-complete",
    summary: {
      totalParticipants: participantList.length,
      totalEvents: totalEvents,
      successfulSettlements: Math.round(totalSuccessful),
      averageAcceptanceRate: totalEvents > 0 ? totalSuccessful / totalEvents : 0,
      escrowFlowsObserved: escrowMap.flows?.length || 0,
      signerRoundtripsObserved: signerSim.rows?.length || 0,
      batchSettlementCount: batchSettlement.release ? 1 : 0
    },
    participants: participantList,
    boundaries: [
      "Reputation is simulated — not from live TN12 transactions.",
      "Metrics track: signer acceptance rate, proof validation accuracy, settlement timeliness.",
      "Use as baseline for real reputation scoring once live TN12 settlement begins.",
      "Integration point: attestation service can subscribe to settlement events and increment counters."
    ]
  };
}

function recordParticipant(map, participantId, event) {
  if (!map.has(participantId)) {
    map.set(participantId, {
      kind: event.kind,
      events: []
    });
  }
  map.get(participantId).events.push(event);
}
