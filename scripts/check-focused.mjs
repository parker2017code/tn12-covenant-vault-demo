import { spawnSync } from "node:child_process";

const groups = {
  core: [
    "tests/core/amounts.test.mjs",
    "tests/core/address.test.mjs",
    "tests/core/policy-artifacts.test.mjs",
    "tests/core/transaction-plan.test.mjs"
  ],
  proof: [
    "tests/proof/proof-records.test.mjs"
  ],
  artifacts: [
    "tests/artifacts/status-artifacts.test.mjs",
    "tests/artifacts/generated-shapes.test.mjs",
    "tests/artifacts/project-review-manifest.test.mjs"
  ],
  wallet: [
    "tests/domain/wallet-submit-readiness.test.mjs",
    "tests/domain/wallet-approval-summaries.test.mjs",
    "tests/domain/wrpc-submit-guard.test.mjs"
  ],
  indexer: [
    "tests/domain/indexer-replay.test.mjs"
  ],
  covenants: [
    "tests/domain/attestation-invoice-research.test.mjs",
    "tests/domain/batch-assurance.test.mjs",
    "tests/domain/escrow-marketplace.test.mjs",
    "tests/domain/treasury-access.test.mjs",
    "tests/domain/treasury-recurring-caps.test.mjs",
    "tests/domain/silverscript-decl-support.test.mjs",
    "tests/domain/recurring-treasury-vault-status.test.mjs",
    "tests/domain/recurring-treasury-vault-negatives.test.mjs",
    "tests/domain/recurring-treasury-vault-state-proof.test.mjs",
    "tests/domain/recurring-treasury-vault-owner-sig-proof.test.mjs",
    "tests/domain/recurring-treasury-vault-live-submit-readiness.test.mjs",
    "tests/domain/recurring-treasury-vault-rust-submit-route-probe.test.mjs",
    "tests/domain/recurring-treasury-vault-rpc-data-route.test.mjs",
    "tests/domain/recurring-treasury-vault-genesis-funding-draft.test.mjs",
    "tests/domain/recurring-treasury-vault-live-spend-preflight.test.mjs",
    "tests/domain/recurring-treasury-vault-live-spend-draft.test.mjs",
    "tests/domain/recurring-treasury-vault-live-spend-evidence.test.mjs",
    "tests/domain/recurring-treasury-vault-continuation-outpoint.test.mjs",
    "tests/domain/recurring-treasury-vault-cumulative-spend.test.mjs",
    "tests/domain/recurring-treasury-vault-cumulative-cap-proof.test.mjs",
    "tests/domain/recurring-treasury-vault-window-reset-proof.test.mjs",
    "tests/domain/covenant-heist-evidence.test.mjs",
    "tests/domain/silverscript-build-depth-review.test.mjs",
    "tests/domain/covenant-owned-asset-duel-proof.test.mjs",
    "tests/domain/covenant-owned-asset-duel-live-strike.test.mjs",
    "tests/domain/covenant-owned-asset-duel-live-negatives.test.mjs",
    "tests/domain/sibling-input-discovery.test.mjs",
    "tests/domain/blitz-mux-arena-proof.test.mjs",
    "tests/domain/blitz-mux-family-artifacts.test.mjs",
    "tests/domain/blitz-mux-live-flow-evidence.test.mjs",
    "tests/domain/blitz-mux-challenge-settlement.test.mjs",
    "tests/domain/covenant-experiment-genesis-preflights.test.mjs",
    "tests/domain/covenant-experiment-map.test.mjs"
  ],
  research: [
    "tests/domain/market-agent-defi.test.mjs",
    "tests/domain/mainnet-readiness.test.mjs",
    "tests/domain/defi-planner-simulation.test.mjs",
    "tests/domain/defi-scenario-simulation.test.mjs",
    "tests/domain/defi-scenario-reducer.test.mjs",
    "tests/domain/defi-advanced-simulation.test.mjs",
    "tests/domain/defi-multi-wallet-scenario-pack.test.mjs",
    "tests/domain/defi-accepted-activity-ledger.test.mjs",
    "tests/domain/defi-artifact-manifest.test.mjs",
    "tests/domain/scheduler-intent-registry.test.mjs",
    "tests/domain/scheduler-covenant-binding.test.mjs",
    "tests/domain/universal-scheduler-workbench.test.mjs",
    "tests/domain/coordination-market-evidence.test.mjs",
    "tests/domain/full-defi-benchmark.test.mjs",
    "tests/domain/playground-plan.test.mjs",
    "tests/domain/playground-session.test.mjs",
    "tests/domain/playground-actions.test.mjs",
    "tests/domain/reviewer-settlement-flow.test.mjs",
    "tests/domain/standards-adapter-backlog.test.mjs",
    "tests/domain/self-serve-lane-runbook.test.mjs",
    "scripts/check-counts.mjs"
  ]
};

const requested = process.argv.slice(2);
const selected = requested.length === 0 || requested.includes("all")
  ? Object.keys(groups)
  : requested;

for (const group of selected) {
  const files = groups[group];
  if (!files) {
    console.error(`Unknown focused check group: ${group}`);
    console.error(`Known groups: ${Object.keys(groups).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n[check-focused] ${group} (${files.length})`);
  for (const file of files) {
    const result = spawnSync(process.execPath, [file], {
      stdio: "inherit",
      env: process.env
    });
    if (result.status !== 0) {
      console.error(`[check-focused] failed: ${file}`);
      process.exit(result.status || 1);
    }
  }
}

console.log("\nFocused checks passed.");
