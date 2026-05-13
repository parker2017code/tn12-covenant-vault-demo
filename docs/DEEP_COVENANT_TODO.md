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
- `artifacts/wallet-approval-summaries.json` turns the recurring-cap reset-window
  proof into wallet-readable approval fields and reject prompts.
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
- `artifacts/sibling-input-discovery.json` explains how the required ICC
  sibling input is found from the owner covenant id, accepted owner-marker
  outpoint, witness index, and live negative coverage.
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

### Six-Experiment Priority

| Priority | Experiment | Current level | Next upgrade |
|---|---|---|---|
| 1 | Recurring cap proof | Accepted TN12 covenant spends, reset-window spend, continuation state, local rejects, first wallet approval summary | Extend wallet approval to real signer handoff |
| 2 | Sibling-authorized asset proof | Accepted TN12 owner marker, asset genesis, sibling-authorized strike, live-id local rejects, sibling-input discovery | Add wallet approval summary |
| 3 | Mux worker proof | Accepted TN12 family genesis, route/return, timeout return, Worker B route/return, local challenge rejects | Add wallet approval summary; add challenge only if it proves a new refusal path |
| 4 | Vault negative checks | Local script-engine rejects over accepted recurring-vault rail | Add TN12-safe invalid/rejection evidence or a fresh accepted challenge path with expendable outputs |
| 5 | Coordination release evidence | Accepted payload/custody/release receipts plus transparent replay evidence | Build a TN12 covenant settlement target for release/refund |
| 6 | Scheduler receipt evidence | Accepted intent/bid/execution receipts plus indexer-derived replay | Build a TN12 covenant settlement target for one eligible trigger |

Target state: all six get TN12 verticals. Current labels still matter while
building: the first three already have accepted covenant-spend evidence,
Vault negatives are local rejects over an accepted rail, and Coordination plus
Scheduler must not be called covenant-settlement until their settlement target
exists and is tested on TN12.

1. Add a compact Blitz challenge variant only if it proves a new refusal path.
   - Current accepted path already covers Worker A return, Worker A timeout, and
     Worker B return.
   - Do not add another accepted row if it is only more volume.

2. Push the remaining experiments toward TN12 verticals one at a time.
   - Vault negative checks now have a bounded local-reject artifact and visible section.
   - Coordination League now has a bounded visible section.
   - Scheduler Duel now has a bounded visible section.
   - Further experiment work should add accepted TN12 evidence, safe rejection
     evidence, a real covenant settlement target, or a user-wallet handoff.
   - Do not open a seventh experiment until all six have their best current TN12
     vertical or an explicit tooling/funding blocker.

3. Split the giant focused/check command surface.
   - The command wall is now a maintenance risk.
   - Preserve coverage while making the gate easier to read.

4. Extend the wallet-facing abstraction rail.
   - End users should not need JSON artifacts to approve a covenant path.
   - The first recurring-cap approval summary is built; extend this pattern to
     the asset and mux examples.
   - Define the minimum wallet prompt for each built pattern: action, amount,
     destination, covenant id, continuation output, required sibling input, and
     failure reason.
   - Done when each top proof pattern has a machine-readable approval summary
     that a wallet UI could render as Approve/Reject.

5. Extend sibling-input discovery for ICC examples.
   - The sibling-authorized asset proof now has a first discovery artifact for
     the current accepted owner-marker input.
   - Next, make the same fields wallet-readable in the approval summary and
     keep future asset moves tied to fresh live sibling and asset state.
   - Done when the Asset proof has both a discovery artifact and an approval
     summary that names the sibling outpoint, witness index, covenant id, and
     failure cases.

6. Harden replay-derived lanes.
   - Scheduler evidence is currently `INDEXER_DERIVED`; that is useful but not
     the same as protocol scheduling or autonomous custody.
   - Next hardening is deterministic replay checkpoints, mismatch proofs, or a
     later ZK/state-commitment sketch if KIP-21/vProg tooling makes that route
     realistic.
   - Done when the scheduler page/artifact can say what a second verifier checks
     independently of the first indexer.

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
