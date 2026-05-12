# Contract Depth Map

Reviewed: 2026-05-12

The current `.sil` contracts are simple covenant primitives exercised end to
end on TN12. That is the accomplishment: compiled script, signed spend,
accepted txid, public verification, replay, and negative guards.

They are not full wallet products yet. Richer controls such as recurring caps,
dynamic whitelists, policy updates, partial unvaulting, pooled campaign
thresholds, and guardian recovery need deeper contracts or strict wallet-policy
state before they should be called script-enforced.

## Current Contracts

| Contract | Script Enforces | Planner / Indexer / Wallet Enforces | Not Enforced | Make It More Serious |
|---|---|---|---|---|
| `DelayedRecoveryVault.sil` | Owner signature, recovery signature, owner delay on withdrawal, exact value minus fee, owner/recovery P2PK destination. | Daily limits, guardian labels, request/cancel lifecycle, payroll templates, recurring-cap review. | Dynamic whitelist, cumulative spend caps, guardian quorum, partial unvault/relock, policy update. | Add one deeper vault contract with role separation, cap amount, relocked change output, delay, explicit branch selectors, and negative tests for wrong role, wrong output, over cap, early spend, and missing relock. |
| `AssurancePledge.sil` | Recipient release output, contributor refund after deadline, exact value minus fee. | Campaign target, pooled release decision, pledge aggregation, refund-set selection. | Native pooled threshold, batch refund safety, campaign-wide winner state. | Build a pooled assurance contract or stricter settlement contract that spends actual pledge outputs only after target state is proven. |
| `Escrow.sil` | Buyer release to seller, buyer timeout refund, buyer+seller cancel, exact value minus fee. | Marketplace action map, dispute workflow, wallet-review request routing, replay state. | Arbiter decision, staged milestones, partial release, evidence-based dispute result. | Add arbiter or milestone branch with negative tests for wrong signer, wrong output, early refund, and unauthorized cancel. |
| `AuctionSettlement.sil` | Seller and bidder signatures, reserve-price branch, seller payout or bidder refund. | Bid ranking, auction close, winner selection, delivery state, refund selection. | Full auction custody, oracle/delivery truth, anti-sniping, multi-bid pool settlement. | Tie selected bid state to accepted payload receipts and spend only the winning custody output. |
| `CoordinationMarket.sil` | Two-player signatures, game-type selector, positive pot, two-output distribution, timeout refund for player 1. | Stag/Intendo/Pack solver, threshold matching, capital source review, settlement brief. | Opacity, capital multiplexing, atomic Hunt execution, solver incentives, shared-capital safety. | Replace toy selector with a pack-bound settlement contract after transparent solver evidence is stable. |

## Active Deepening Rail

Recurring caps are the active rail.

Done now:

- one accepted local-wallet under-cap TN12 spend;
- one blocked over-cap wallet-policy row;
- one cap-window state artifact that blocks a second spend when cumulative
  spend would exceed the 75 TKAS window;
- one checked compiler probe for DECL-style covenant state arrays and
  `binding = cov` lowering;
- UI and tests that keep the label at wallet-policy/local-wallet.

Next:

1. Turn `contracts/probes/RecurringTreasuryDeclProbe.sil` into a real
   `RecurringTreasuryVault.sil` with cap amount, spent-in-window, window start,
   required destination, and continuation state.
2. Add relocked change output if the contract shape can express it cleanly.
3. Add negative candidates for wrong role, wrong output, over cap, early spend,
   and missing relock.
4. Fund a fresh TN12 output.
5. Submit one accepted under-cap script spend.
6. Only then move that exact path from wallet-policy to script-enforced.

## Source-Driven Design Notes

KIP-20 changes the bar for this repo. A serious covenant example should use
covenant lineage: a stable `covenant_id`, continuation outputs, and script
checks that bind the next state to the expected transition.

Silverscript DECL changes the implementation path. Instead of hand-writing all
`OpCov*` plumbing, use the declaration layer where it compiles, then keep manual
opcode work only for patterns the compiler does not lower yet.

KIP-21 sequence commitments add the later app-state rail. After one deeper
covenant primitive works, the next interesting public example is not another
card grid; it is a small lane watcher that turns accepted activity into a
replayable state proof.

The examples worth building, in order:

1. Recurring treasury vault: cap, spent window, destination, relock.
2. Guardian recovery: quorum branch, too-few/wrong-guardian negatives.
3. Partial unvault: spend one slice, relock the rest under the same covenant.
4. Dynamic whitelist: destination set update plus wrong-destination rejection.
5. ICC ownership demo: one covenant-owned asset/action authorized by a sibling
   covenant input.
6. Multiplexor demo: router contract hands state to one worker and returns.
7. Challenge/timeout demo: a claim can be challenged, timed out, or settled.
8. KIP-21 lane replay: accepted lane activity becomes a compact replay proof.

## Rule

Do not add another broad app lane until one deeper contract primitive has an
accepted positive path and a negative map.
