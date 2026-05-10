#!/usr/bin/env node
/**
 * KasWare signer orchestration via OpenClaw.
 *
 * This spec describes how to integrate OpenClaw's browser CDP automation
 * with the external signer roundtrip flow.
 *
 * Flow:
 * 1. Claude builds unsigned payload and covenant drafts
 * 2. OpenClaw skill receives batch of draft paths
 * 3. OpenClaw CDP:
 *    - Launches Chromium with KasWare extension loaded
 *    - Passes each draft's unsigned tx to KasWare
 *    - Clicks sign button and waits for signature
 *    - Extracts signed tx payload
 *    - Returns to caller
 * 4. Claude assembles final signed drafts and submits
 *
 * This script generates the orchestration spec (not the actual signing).
 */

import { mkdir, writeFile } from "node:fs/promises";

const spec = {
  schema: "tn12-kaswore-signer-orchestration/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "spec-ready-for-openclaw-implementation",

  flowSteps: [
    {
      step: 1,
      name: "Prepare unsigned drafts",
      actor: "Claude",
      action: "Build payload and covenant spend drafts in standard format",
      output: [
        "artifacts/unsigned-drafts/payload-*.json",
        "artifacts/unsigned-drafts/covenant-spend-*.json"
      ]
    },
    {
      step: 2,
      name: "Load KasWare in managed browser",
      actor: "OpenClaw CDP",
      action: "Launch Chromium, load unpacked KasWare extension, activate in toolbar",
      requirements: [
        "KasWare extension unpacked at ~/.openclaw/extensions/kaswore/",
        "Chromium profile at ~/.openclaw/profiles/kaswore/",
        "CDP port configured (default 19001+)"
      ],
      cdpScript: `
        browser.navigate('data:text/html,<h1>KasWare Signer</h1>');
        // Wait for extension ready
        browser.waitForSelector('[role="button"]', { timeout: 5000 });
      `
    },
    {
      step: 3,
      name: "Sign each unsigned tx",
      actor: "OpenClaw CDP + KasWare",
      action: "For each draft: inject unsigned tx → click sign → extract signature",
      loop: "for each unsigned draft",
      cdpSteps: [
        "const draftJson = fs.readFileSync(draftPath);",
        "browser.evaluate((draft) => window.unsignedTx = draft, draftJson);",
        "await browser.click('[data-testid=\"sign-button\"]');",
        "await browser.waitForNavigation({ waitUntil: 'networkidle' });",
        "const signature = await browser.evaluate(() => window.signatureResult);"
      ]
    },
    {
      step: 4,
      name: "Assemble signed drafts",
      actor: "Claude + OpenClaw callback",
      action: "Receive signature bytes, reconstruct full signed tx, write artifact",
      output: [
        "artifacts/signed-drafts/payload-*.json (with signedTransaction.tx)",
        "artifacts/signed-drafts/covenant-spend-*.json (with submitPayload.transaction)"
      ]
    },
    {
      step: 5,
      name: "Submit to TN12",
      actor: "Claude",
      action: "Use signed drafts with wRPC endpoint to submit and get txid",
      requirement: "KASPA_WRPC_URL environment variable set"
    }
  ],

  openclawSkillSpec: {
    name: "tn12-kaswore-signer",
    triggers: [
      "claude message: 'sign and submit TN12 tx'",
      "claude message: 'use KasWare to sign these drafts'"
    ],
    inputs: {
      draftPaths: {
        type: "array",
        description: "List of unsigned draft JSON paths",
        example: [
          "artifacts/unsigned-drafts/payload-receipt.json",
          "artifacts/unsigned-drafts/covenant-cancel.json"
        ]
      },
      kasworeTab: {
        type: "string",
        description: "Browser tab identifier where KasWare is open",
        example: "uuid-of-kaswore-tab"
      }
    },
    outputs: {
      signatures: {
        type: "object",
        description: "Map of draft path to signature hex",
        example: { "covenant-cancel.json": "30450220..." }
      },
      signedDrafts: {
        type: "object",
        description: "Map of draft path to fully signed draft JSON",
        example: { "covenant-cancel.json": "fully signed draft object with signedTransaction field" }
      },
      status: {
        type: "string",
        enum: ["all-signed", "partial-signed", "signing-failed"]
      }
    },
    fallback: {
      description: "If KasWare unavailable, use local sim",
      action: "buildWalletExternalSignerSim() from src/walletExternalSignerSim.mjs",
      status: "sim-validated"
    }
  },

  kaswareSetupInstructions: {
    prerequisite: "KasWare extension file (either from GitHub or local build)",
    steps: [
      "1. openclaw browser --launch",
      "2. In opened Chrome: chrome://extensions",
      "3. Enable 'Developer Mode' (toggle in top-right)",
      "4. Click 'Load unpacked'",
      "5. Select /path/to/kaswore/extension/folder",
      "6. Pin extension to toolbar (for easier clicking)",
      "7. Close browser (OpenClaw will reuse it)"
    ],
    postSetup: "KasWare now available to OpenClaw CDP automation"
  },

  testPlan: [
    "1. Build one unsigned payload draft (no signing yet)",
    "2. Pass to OpenClaw KasWare skill with --dry-run",
    "3. Verify CDP can open KasWare and see unsigned tx",
    "4. Manual sign in KasWare (for first test)",
    "5. Verify signature extraction works",
    "6. Repeat with 4 drafts (full batch)",
    "7. Run escrow settlement flow end-to-end"
  ],

  boundaries: [
    "SIGNED_NOT_BROADCAST: signatures extracted but not submitted until final approval",
    "Local TN12 wasm signs the initial draft; KasWare signs the roundtrip",
    "Fallback to local sim if KasWare unavailable (status: sim-validated)",
    "Submit requires live KASPA_WRPC_URL endpoint"
  ]
};

const outPath = "artifacts/kaswore-signer-orchestration-spec.json";
await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`✓ ${outPath}`);
console.log(`\nOpenClaw KasWare integration spec:`);
console.log(`  Steps: ${spec.flowSteps.length}`);
console.log(`  Skill name: ${spec.openclawSkillSpec.name}`);
console.log(`  Status: ${spec.status}`);
console.log(`  Fallback: local sim (status: sim-validated)`);
console.log(`\nNext: Load KasWare extension, then test step 2 above.`);
