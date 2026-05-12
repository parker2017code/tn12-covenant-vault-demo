# Toccata Source Notes

Reviewed: 2026-05-12

This file keeps the current source-driven direction in one place. It is not
public product copy.

## What Changed

The next bar is deeper covenant engineering, not more app cards.

The current repo proves a lot of workflow: compiled scripts, accepted TN12
txids, replayed records, payload receipts, negative guards, and UI evidence.
That stays useful. But the stronger Toccata examples use covenant lineage,
state transitions, cross-covenant authorization, and lane-based replay.

## Sources To Track

| Source | What It Changes For TN12 |
|---|---|
| KIP-20 covenant IDs | Treat serious covenant examples as lineage/state systems. A valid next output should continue a stable `covenant_id` and carry checked state. |
| Silverscript DECL | Prefer compiler-lowered covenant declarations over hand-written `OpCov*` plumbing where the compiler supports it. |
| SilverScript KCC20 examples | Use `State[]`, owner identifiers, covenant-ID ownership, witness hints, and value-preservation checks as the model for better examples. |
| Michael Sutton `silverscript/chess` branch | Study mux/worker contracts, `League -> Player -> ChessMux -> ChessSettle`, challenge/timeout rules, and the book under `examples/chess/book`. Local clone: `/home/parker2017/michaelsutton-silverscript-chess`. |
| ICC discussion | Authorization can come from a sibling input owned by another script/covenant. Do not fake nested execution. |
| Multiplexor discussion | Large systems can route state to worker templates and back. This is the pattern for games, workflows, and complex peer-to-peer contracts. |
| Challenge/timeout discussion | Avoid expensive global checks by letting a party make a claim, giving the other party a challenge path, and settling by timeout. |
| KIP-21 / seq commitments | Later app-state examples should group accepted activity into lanes and prove replay from lane activity, not scan everything. |

## Current Repo Result

`contracts/probes/RecurringTreasuryDeclProbe.sil` compiles with the local
SilverScript compiler.

`artifacts/silverscript-decl-support.json` records:

- `#[covenant(binding = cov, from = 2, to = 2, mode = verification)]`;
- `State[] prev_states`;
- `State[] new_states`;
- generated covenant wrappers;
- `OpCov*` lowering signal.

That means the next step can be a real recurring treasury covenant attempt,
not another planning artifact.

`contracts/RecurringTreasuryVault.sil` now also compiles and the contract
output has accepted TN12 funding. That is still not enough to call recurring
caps script-enforced. The current source review found two practical blockers:

- the JS `kaspa-wasm` package used by this repo exposes
  `TransactionOutput(value, script_public_key)` and no exported
  `CovenantBinding` constructor, so the browser/Node submit path cannot yet
  build a covenant-bound continuation output;
- the Rust debugger can model `CovenantBinding` for local tests, but the
  current recurring-vault positive path still needs a typed `ownerSig` /
  redeem-script route for the generated DECL entrypoint.

The build-depth artifact is
`artifacts/silverscript-build-depth-review.json`; rebuild it with
`npm run covenant:build-depth`.

The state/output portion has a local SilverScript debugger proof:
`artifacts/recurring-treasury-vault-state-proof.json`. It proves under-cap
continuation and rejects over-cap, wrong destination, and missing continuation
for `contracts/probes/RecurringTreasuryVaultStateProbe.sil`. It deliberately
does not prove the full `ownerSig` path or live TN12 spend.

The full `ownerSig` path now has a local Rust proof:
`artifacts/recurring-treasury-vault-owner-sig-proof.json`. It signs the
transaction hash, builds the generated `__spend` sigscript, appends the redeem
script, and runs the txscript engine with covenant context. It proves valid
owner-signed under-cap continuation and rejects over-cap, wrong destination,
and missing continuation. It still does not prove live TN12 submission.

Live submit readiness is recorded in
`artifacts/recurring-treasury-vault-live-submit-readiness.json`. Current status
is `blocked-before-live-submit`: the installed npm `kaspa-wasm@0.13.0`
transaction constructor drops the output covenant binding. Do not broadcast a
recurring-vault spend through that route. The next live attempt needs either a
Rust submit route or a JS SDK route that preserves `TransactionOutput.covenant`
for the continuation output.

The Rust route now has a pre-broadcast probe:
`artifacts/recurring-treasury-vault-rust-submit-route-probe.json`. It shows the
Rust RPC `SubmitTransactionRequest` model preserves output covenant binding and
tx v1 `computeBudget`. It does not prove broadcast, mempool acceptance, or an
accepted TN12 recurring-vault spend.

The live-spend preflight is
`artifacts/recurring-treasury-vault-live-spend-preflight.json`. It matches the
compiled `RecurringTreasuryVault.sil` script to the accepted funded output and
confirms the output is still unspent by the public REST UTXO endpoint. It still
blocks submit because that REST UTXO response does not expose the input
`covenant_id`, which the continuation output must carry.

## Next Build Order

1. Recurring treasury vault.
   - State: `amount`, `spentInWindow`, `windowStart`, required destination.
   - Positive: under-cap continuation is locally proven in the state probe.
   - Negative: over cap, wrong destination, and missing continuation are
     locally proven in the state probe.
   - Owner signature: locally proven against the full contract in the Rust
     harness.
   - Current live boundary: blocked before submit through npm `kaspa-wasm`
     because output covenant binding is dropped.
   - Rust route probe: local RPC request model preserves covenant-bound
     continuation outputs.
   - Preflight: compiled script and funded output match; funded output is still
     unspent; submit is blocked until the input `covenant_id` is available.
   - Next: fetch `covenant_id` through RPC/data verbosity, convert the
     Rust-shaped request into a guarded submit, and record accepted TN12
     evidence if the network accepts it.
2. ICC ownership demo.
   - One action/asset branch accepts authorization from a sibling covenant input.
   - Use witness hints; do not scan every input if a direct witness index works.
   - First target: Covenant-Owned Asset Duel. One covenant-owned asset/action
     accepts a sibling input as authority, then rejects missing or wrong sibling
     authorization.
3. Multiplexor demo.
   - One router sends state to worker A or B and the worker returns to router.
   - Add timeout or rollback path if a bad selector can stall the state.
   - First target: Blitz Mux Arena. Keep it small: mux, two workers, return
     state, bad selector timeout.
4. Challenge/timeout demo.
   - Claim -> challenge -> timeout/settle.
   - This is the useful pattern for rules that are expensive to prove directly.
5. KIP-21 lane replay.
   - Take accepted TN12 app activity and make a lane-shaped replay artifact.
   - Show what would become proof input once the node exposes the final lane data.

## Chess Branch Lessons To Reuse

The chess branch is useful because it is not a toy one-file covenant. It shows
how a larger covenant system stays buildable:

- split large logic into mux plus workers instead of one huge script;
- keep one shared state layout across sibling templates when routing state;
- inject template hashes into state to avoid recursive template-hash cycles;
- use `validateOutputStateWithTemplate` when routing to a worker template;
- treat `covenant_id` as family membership, not role identity;
- validate role identity with template hashes;
- use leader/delegate shapes for multi-input transitions;
- carry durable counters such as `open_games` instead of proving global absence;
- add timeout escape paths wherever a two-transaction flow can stall;
- replace expensive global checks with challenge paths when a claim is cheaper
  to refute than to prove eagerly.

TN12 should borrow the patterns, not the chess product. The next version of the
treasury rail should stay small: one stateful recurring cap, one continuation
output, one negative map. Mux/ICC/challenge demos come after that.

## Public Copy Rule

Say this:

> Simple covenant primitives are accepted on TN12. The next rail is a stateful
> recurring treasury covenant using DECL/KIP-20 patterns.

Do not say this yet:

> TN12 has advanced stateful covenants, ICC, multiplexor routing, or lane proofs.

Those become public claims only after the repo has a contract, artifact, test,
and UI line for the exact feature.
