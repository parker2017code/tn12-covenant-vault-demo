# Deep Covenant Todo

Reviewed: 2026-05-12

This is the short handoff for the next deep work. Do not add broad app lanes
until these move.

## Current Evidence

- `RecurringTreasuryVault.sil` compiles.
- `artifacts/recurring-treasury-vault-state-proof.json` proves local
  state/output behavior: under-cap continuation passes; over-cap, wrong
  destination, and missing continuation fail.
- `artifacts/recurring-treasury-vault-owner-sig-proof.json` proves the full
  local `ownerSig` covenant path in Rust.
- `artifacts/recurring-treasury-vault-live-submit-readiness.json` records the
  old npm `kaspa-wasm@0.13.0` JS submit gap. Current live spends use the local
  TN12 `1.1.1-toc.1` WASM route and wRPC.
- `artifacts/recurring-treasury-vault-rust-submit-route-probe.json` proves the
  Rust RPC `SubmitTransactionRequest` model preserves output covenant binding
  and tx v1 `computeBudget`.
- `artifacts/recurring-treasury-vault-live-spend-preflight.json` covers the
  first accepted under-cap spend path.
- `artifacts/signed-drafts/recurring-treasury-vault-genesis-funding.json`
  created the accepted covenant-bound `RecurringTreasuryVault` output.
- `artifacts/recurring-treasury-vault-live-spend-evidence.json` records the
  first accepted script-enforced spend.
- `fixtures/RecurringTreasuryVaultContinuationOutpoint.json` records the first
  continuation output as active state with 25 tKAS spent in the window.
- `artifacts/recurring-treasury-vault-cumulative-spend-evidence.json` records a
  second accepted script-enforced spend from that continuation.
- `fixtures/RecurringTreasuryVaultCumulativeContinuationOutpoint.json` records
  the second continuation output as active state with 65 tKAS spent in the
  window.
- `artifacts/recurring-treasury-vault-cumulative-cap-proof.json` ties the two
  accepted spends to the locally rejected over-cap candidate.
- `contracts/RecurringTreasuryVaultWindow.sil` compiles and adds a reset
  branch instead of retrofitting reset behavior into the original same-window
  contract.
- `artifacts/recurring-treasury-vault-window-reset-proof.json` records the
  accepted TN12 reset-window spend, the reset continuation fixture, and local
  rejects for early reset, stale-window reset, and over-cap reset.
- `contracts/CovenantOwnedAssetDuel.sil` compiles.
- `artifacts/covenant-owned-asset-duel-proof.json` proves the local ICC
  sibling-input pattern: expected sibling covenant ID authorizes an asset move;
  wrong witness, missing sibling, and wrong sibling covenant ID fail.
- `fixtures/CovenantOwnedAssetDuelContractOutpoint.json` records an accepted
  TN12 covenant-genesis output for the Asset Duel preflight.
- `artifacts/covenant-owned-asset-duel-live-strike-evidence.json` records the
  accepted TN12 owner-marker output, live asset-duel genesis output, and
  two-input sibling-authorized strike spend.
- `artifacts/covenant-owned-asset-duel-live-negative-evidence.json` records
  local script-engine rejects for wrong witness, missing sibling, and wrong
  sibling covenant id using the accepted live owner/asset covenant ids.
- `contracts/BlitzMux.sil`, `contracts/BlitzWorkerA.sil`, and
  `contracts/BlitzWorkerB.sil` compile.
- `artifacts/blitz-mux-arena-proof.json` proves the local mux/worker pattern:
  mux routes to worker A or B, workers return state to mux, bad selector fails,
  timeout returns a pending worker state, and too-early timeout fails.
- `fixtures/BlitzMuxArenaContractOutpoint.json` records an accepted TN12
  covenant-genesis output for the Blitz Mux preflight.
- `artifacts/blitz-mux-family-artifacts.json` records the real template-hash
  family used for live routing.
- `artifacts/blitz-mux-live-flow-evidence.json` records the accepted TN12 mux
  route to Worker A, accepted Worker A return to mux, accepted second route to
  Worker A, accepted Worker A timeout return to mux, accepted route to Worker B,
  and accepted Worker B gain-minus-fee return to mux.
- `artifacts/blitz-mux-challenge-settlement.json` summarizes the accepted
  worker-return settlement, accepted timeout settlement, accepted Worker B
  settlement, and local challenge rejects for bad selector and too-early
  timeout.
- `artifacts/covenant-heist-evidence.json` turns the recurring-vault negative
  evidence into a bounded adversarial view: wrong owner, wrong destination,
  missing continuation, cumulative over-cap, early reset, stale reset, and
  over-cap reset all fail local script-engine checks against an accepted
  recurring-vault rail.
- `artifacts/coordination-market-evidence-dossier.json` is now surfaced as a
  bounded Coordination League slice: three qualifying intendos, accepted
  payload/custody evidence, accepted release txid, and non-selected refund
  alternates.
- `artifacts/universal-scheduler-workbench.json` is now surfaced as a bounded
  Scheduler Duel slice: accepted intent, accepted executor bids, accepted
  execution receipt, matched local-key payout, and replay-blocked stale,
  duplicate, or too-slow paths.

## Next Exact Tasks

1. Add a compact Blitz challenge variant only if it proves a new refusal path.
   - Current accepted path already covers Worker A return, Worker A timeout, and
     Worker B return.
   - Do not add another accepted row if it is only more volume.

2. Start the next partial experiment only as a vertical slice.
   - Covenant Heist now has a bounded local-reject artifact and visible section.
   - Coordination League now has a bounded visible section.
   - Scheduler Duel now has a bounded visible section.
   - Further experiment work should only add new accepted evidence, safe
     rejection evidence, or a real user-wallet handoff.
   - Keep the top three demos as the public proof set until the next candidate
     has accepted evidence or concrete local rejects.

3. Split the giant focused/check command surface.
   - The command wall is now a maintenance risk.
   - Preserve coverage while making the gate easier to read.

## Lessons To Apply

- Keep a clean loop while iterating: update this file, build the artifact,
  add/adjust the focused test, run the focused gate, then commit/push only a
  coherent proof slice.
- Every feature needs five plain answers: what it proves, what it makes
  possible, why Kaspa's fast UTXO/covenant model matters, why crypto is needed
  instead of a normal server, and what is still not proven. Keep those answers
  close to the public artifact or page, not buried only in chat.
- Covenant IDs track lineage; template hashes or state fields identify roles
  inside a contract family.
- Stateful examples need continuation outputs. Funding a contract output is not
  the same thing as a successful state transition.
- For serious examples, prove in layers: compile, local state proof, full
  signature-script proof, live submit, replay.
- REST-visible UTXO existence is not enough for covenant spends. The live input
  `covenant_id` must be known before signing a continuation transition.
- Funding a script hash is not covenant genesis. The funding transaction itself
  must carry output covenant binding.
- ICC means sibling authorization. One covenant can accept another input as
  authority without executing that other covenant inside itself.
- Mux/worker examples need an escape path. If a two-transaction route can get
  stuck, add timeout or rollback logic.
- Public copy should say what is proven by artifact and test. Do not call ICC,
  mux routing, or script-enforced recurring caps built until the matching
  contract, artifact, test, and accepted evidence exist.
