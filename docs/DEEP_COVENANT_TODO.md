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
- `artifacts/recurring-treasury-vault-live-submit-readiness.json` blocks live
  submit through npm `kaspa-wasm@0.13.0` because the checked JS route drops
  output covenant binding.

## Next Exact Tasks

1. Try live TN12 spend only after the submit route preserves covenant binding.
   - Build or reuse a Rust submit route, or use a JS SDK route that preserves
     `TransactionOutput.covenant`.
   - Spend the funded recurring-vault output only after the constructed
     transaction keeps the covenant-bound continuation output.
   - Record accepted txid, continuation state, explorer/API response, and replay
     result.
   - Keep the UI label below script-enforced until that accepted spend exists.

2. Build Covenant-Owned Asset Duel.
   - Pattern: ICC / sibling-input authorization.
   - Minimal contract shape: one tiny asset/action covenant and one sibling
     authority input.
   - Positive case: sibling input authorizes the asset/action transition.
   - Negative cases: missing sibling input and wrong sibling input.
   - Do not fake nested execution; the point is sibling authority.

3. Build Blitz Mux Arena.
   - Pattern: mux/worker routing from the chess branch, reduced to the smallest
     toy.
   - Minimal contract shape: one mux, two workers, shared state layout, template
     identity, worker return path.
   - Positive case: mux routes to worker, worker returns valid state.
   - Negative/liveness case: bad selector or stalled worker path resolves by
     timeout.

## Lessons To Apply

- Covenant IDs track lineage; template hashes or state fields identify roles
  inside a contract family.
- Stateful examples need continuation outputs. Funding a contract output is not
  the same thing as a successful state transition.
- For serious examples, prove in layers: compile, local state proof, full
  signature-script proof, live submit, replay.
- ICC means sibling authorization. One covenant can accept another input as
  authority without executing that other covenant inside itself.
- Mux/worker examples need an escape path. If a two-transaction route can get
  stuck, add timeout or rollback logic.
- Public copy should say what is proven by artifact and test. Do not call ICC,
  mux routing, or script-enforced recurring caps built until the matching
  contract, artifact, test, and accepted evidence exist.
