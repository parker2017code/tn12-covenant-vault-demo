# Builder Lessons

These are the durable rules from the escrow cancel fix. They are for future TN12 and app-prototype work, not mainnet claims.

## Accepted State Beats Local Confidence

- A local txid match is useful, but it is not proof that the app state changed.
- After submit, fetch the transaction and record `is_accepted`, accepting block data, and expected outputs.
- Preserve failed artifacts, but label the failure plainly: bad config, stale SDK, submit-surface mismatch, or protocol rejection.

## SDK And Submit Surface Are Part Of Consensus Work

- For TN12/Toccata tx version 1, inputs use `computeBudget`, not `sigOpCount`.
- The npm `kaspa-wasm@0.13.0` constructor can create a local object, but it does not preserve the v1 `computeBudget` field. That made the earlier cancel draft look better than it was.
- The local TN12 `kaspa-wasm 1.1.1-toc.1` constructor still needs a compatibility `sigOpCount` property, but the correct v1 shape is `sigOpCount: 0` plus `computeBudget: 30`.
- Public REST can lag protocol shape. In this case REST demanded `sigOpCount`, then rejected non-zero `sigOpCount` for tx version 1. The working route was JSON wRPC with the matching TN12 SDK.

## Use The SDK As Documented, Then Verify The Branch-Specific Differences

- Aspectron's SDK docs show `RpcClient` with an object constructor such as `new RpcClient({ url, networkId })`, not the older positional constructor shape.
- The same docs show `submitTransaction({ transaction, allowOrphan })`, which is the request shape this repo now uses for the current SDK.
- The Aspectron signing guide also shows `submitTransaction({ transaction, allowOrphan:false })` after signing. That matched the route that worked here.
- Branch-specific TN12 behavior still had to come from Rusty Kaspa source/tests and the local TN12 WASM build.

## Debugging Rule

When a protocol result looks impossible, widen the search before escalating:

1. Check the artifact fields and constructor inputs.
2. Check witness argument order and sighash/preimage shape.
3. Compare against accepted sibling spends.
4. Check SDK version and exported API shape.
5. Check network id, endpoint encoding, and submit wrapper shape.
6. Check upstream Rusty Kaspa source/tests.
7. Only then ask a domain expert, with the smallest reproducer and exact evidence.

## What Other Builders Should Copy

- Keep live, TN12/Toccata, and research claims separate.
- Make every app-state transition depend on accepted transaction evidence, not local drafts.
- Build dry-run, probe, submit, and verify commands as separate steps.
- Record endpoint/server version, network id, SDK version, tx version, and input mass field for every surprising result.
- Treat stale tooling as a first-class failure mode, not an afterthought.
