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

## Next Build Order

1. Recurring treasury vault.
   - State: `amount`, `spentInWindow`, `windowStart`, required destination.
   - Positive: under-cap continuation.
   - Negative: over cap, wrong destination, missing continuation, wrong role.
   - First prove locally with the Rust debugger or a Rust harness that can
     construct covenant-bound outputs. Keep local-wallet cap evidence separate
     until accepted script spend exists.
2. ICC ownership demo.
   - One action/asset branch accepts authorization from a sibling covenant input.
   - Use witness hints; do not scan every input if a direct witness index works.
3. Multiplexor demo.
   - One router sends state to worker A or B and the worker returns to router.
   - Add timeout or rollback path if a bad selector can stall the state.
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
