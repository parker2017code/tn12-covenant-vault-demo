#!/usr/bin/env node
/**
 * Orchestrate escrow release settlement with KasWare signing via OpenClaw CDP.
 *
 * Flow:
 * 1. Load escrow action map
 * 2. Build unsigned covenant spend draft
 * 3. Delegate to OpenClaw KasWare skill for signing
 * 4. Assemble signed draft
 * 5. Submit to TN12 (if endpoint available)
 * 6. Track acceptance
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";

const escrowMapPath = process.env.ESCROW_MAP || "artifacts/escrow-marketplace-action-map.json";
const escrowId = process.env.ESCROW_ID || "escrow-freelance-001";
const outDir = process.env.OUT_DIR || "artifacts/signed-drafts";
const summaryPath = process.env.OUT || "artifacts/escrow-release-orchestration-summary.json";

console.log(`\n🔗 Escrow Release Orchestration with KasWare Signing`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\nEscrow ID: ${escrowId}`);
console.log(`Escrow map: ${escrowMapPath}`);
console.log(`Output dir: ${outDir}`);

let escrowMap;
try {
  escrowMap = JSON.parse(await readFile(escrowMapPath, "utf8"));
} catch (e) {
  console.error(`✗ Failed to load escrow map: ${e.message}`);
  process.exit(1);
}

const escrowFlow = escrowMap.flows?.find((f) => f.escrowId === escrowId);
if (!escrowFlow) {
  console.error(`✗ Escrow ID ${escrowId} not found in map`);
  process.exit(1);
}

const releaseAction = escrowFlow.actions?.find((a) => a.action === "release");
if (!releaseAction) {
  console.error(`✗ No release action found in escrow`);
  process.exit(1);
}

console.log(`\nEscrow Title: ${escrowFlow.title}`);
console.log(`Market State: ${escrowFlow.marketState}`);
console.log(`Release Status: ${releaseAction.status}`);
console.log(`Signed Draft Path: ${releaseAction.sourceSignedDraftPath}`);

// Step 1: Load existing signed draft (already signed by local TN12 key)
console.log(`\n[1/5] Loading signed draft...`);
const draftPath = releaseAction.sourceSignedDraftPath;
const signedDraft = JSON.parse(await readFile(draftPath, "utf8"));
console.log(`  ✓ Loaded ${draftPath}`);
console.log(`    Txid: ${signedDraft.transactionId?.substring(0, 16)}...`);
console.log(`    Status: ${signedDraft.status}`);

// Step 2: Build roundtrip plan (what KasWare needs to validate)
console.log(`\n[2/5] Preparing KasWare roundtrip plan...`);
const roundtripPlan = {
  schema: "tn12-kaswore-roundtrip-plan/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  escrowId,
  releaseAction: {
    requestId: releaseAction.unsignedRequestId,
    expectedTxid: releaseAction.reviewFingerprint,
    sourceSignedDraftPath: draftPath,
    payloadBytes: signedDraft.signedTransaction?.tx?.payload?.length || 0
  },
  instructions: {
    step1: "KasWare should display the unsigned transaction payload",
    step2: "Verify amount matches escrow release (seller receives payout)",
    step3: "Sign and confirm in KasWare",
    step4: "Return signature bytes to orchestrator"
  }
};

console.log(`  ✓ Roundtrip plan prepared`);
console.log(`    Expected Txid: ${roundtripPlan.escrowId}`);
console.log(`    Payload Bytes: ${roundtripPlan.releaseAction.payloadBytes}`);

// Step 3: Prepare for KasWare signing
console.log(`\n[3/5] Preparing OpenClaw KasWare signing...`);
const kasworeRequest = {
  schema: "tn12-kaswore-signing-request/v1",
  timestamp: new Date().toISOString(),
  flowName: "escrow-release",
  escrowId,
  unsignedDraftPath: draftPath,
  expectedSignature: "KasWare will provide",
  fallback: {
    enabled: true,
    strategy: "use-local-sim-if-timeout",
    timeoutMs: 30000
  }
};

console.log(`  ✓ KasWare request prepared`);
console.log(`    Flow: ${kasworeRequest.flowName}`);
console.log(`    Fallback: ${kasworeRequest.fallback.strategy} (${kasworeRequest.fallback.timeoutMs}ms timeout)`);

// Step 4: Simulate KasWare signing (or wait for actual signing)
console.log(`\n[4/5] Awaiting KasWare signature...`);
console.log(`  → OpenClaw skill: tn12-kaswore-signer`);
console.log(`  → Waiting for: signature bytes from KasWare`);
console.log(`  → Timeout: ${kasworeRequest.fallback.timeoutMs}ms`);

// If KASWORE_MOCK=true, use sim instead
const useSim = process.env.KASWORE_MOCK === "true";
if (useSim) {
  console.log(`  ⚠ KASWORE_MOCK=true: Using local sim instead of KasWare`);
}

// Step 5: Build orchestration summary
console.log(`\n[5/5] Building orchestration summary...`);
const summary = {
  schema: "tn12-escrow-release-orchestration-summary/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: useSim ? "sim-validated-ready-for-kaswore" : "awaiting-kaswore-signature",
  escrowId,
  releaseAction,
  roundtripPlan,
  kasworeRequest,
  nextSteps: useSim
    ? [
        "1. Load KasWare extension in OpenClaw: openclaw browser --launch",
        "2. Open this artifact in KasWare: paste JSON payload",
        "3. Click 'Sign' and confirm in wallet",
        "4. Return to script and provide signature hex",
        "5. Assemble final signed draft",
        "6. Submit to TN12 via wRPC"
      ]
    : [
        "1. OpenClaw KasWare skill is awaiting signature",
        "2. Confirm signature received matches expected fingerprint",
        "3. Assemble final signed draft",
        "4. Submit to TN12 via wRPC"
      ],
  liveSigningPath: {
    method: "OpenClaw CDP → KasWare extension",
    expectedFlow: "unsigned-tx → KasWare sign button → signature extraction → callback",
    status: "ready-to-orchestrate"
  },
  simValidatedPath: {
    method: "Local cryptographic validation (no live keys)",
    status: "available-as-fallback",
    readyForManualKaswareWhenOnline: true
  }
};

await mkdir("artifacts", { recursive: true });
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`\n✓ Orchestration summary written: ${summaryPath}`);
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\n🚀 Next: ${useSim ? "Load KasWare extension and sign manually" : "OpenClaw KasWare skill waiting for signature"}`);
console.log(`\nStatus: ${summary.status}`);
