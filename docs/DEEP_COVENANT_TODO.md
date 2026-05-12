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
- `contracts/CovenantOwnedAssetDuel.sil` compiles.
- `artifacts/covenant-owned-asset-duel-proof.json` proves the local ICC
  sibling-input pattern: expected sibling covenant ID authorizes an asset move;
  wrong witness, missing sibling, and wrong sibling covenant ID fail.
- `fixtures/CovenantOwnedAssetDuelContractOutpoint.json` records an accepted
  TN12 covenant-genesis output for the Asset Duel preflight.
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
  route to Worker A and accepted Worker A return to mux.

## Next Exact Tasks

1. Build the Blitz Mux live timeout path.
   - The route/return path is accepted.
   - Start from a fresh pending-worker output or create a second mux route.
   - Submit a timeout transition only when the DAA age is high enough.
   - Keep challenge/settlement rows behind the timeout proof.

2. Build the Covenant-Owned Asset Duel live sibling-input path.
   - Pattern: ICC / sibling-input authorization.
   - Start from `fixtures/CovenantOwnedAssetDuelContractOutpoint.json`.
   - Add a sibling covenant input that authorizes the strike.
   - Keep wrong witness, missing sibling, and wrong sibling covenant id as
     negative evidence.
   - Do not fake nested execution; the point is sibling authority.

3. Add recurring-vault window reset behavior.
   - The accepted cumulative path proves one cap window.
   - Window reset needs its own accepted positive path and early/stale reset
     negative candidates.

## Lessons To Apply

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
