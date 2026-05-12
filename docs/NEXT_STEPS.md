# Next Steps

Reviewed: 2026-05-12

This file is the short queue. It does not replace generated artifacts; it points future work to the next concrete tasks without reopening old roadmap stacks.

## Current Position

- TN12 proof core is strong as an end-to-end evidence workflow: simple covenant primitives, role-separated paths, batch-assurance release, payload events, replay guards, and adversarial rejections are represented in artifacts and checks.
- The next technical jump is contract depth, not another shallow product lane. Recurring caps are the active rail, and DECL support now has a checked compiler probe.
- KIP-20, Silverscript DECL, ICC, multiplexor routing, and KIP-21 lane commitments are now the vocabulary for new work. Do not invent product copy around them until a repo artifact, script, or test exists.
- Mainnet deployment readiness percentages belong in `MAINNET_READINESS.md`, not public page copy.
- The next useful work is not another app idea. It is one end-to-end wallet, replay, and settlement slice.
- The latest local-wallet operator-pack receipt is accepted on TN12: `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`.
- The DeFi repo-local benchmark stays in generated artifacts. Public pages should use concrete counts and missing rails instead of score language.
- The current playground run has four accepted TN12 txs: role funding `85b5c6dcd537982812bd5c50e433c53d13d87f6d887e06e164e63a3b40a4f6e5`, User A pool deposit `83eae5c10342cf23095aa51875ce927671b1ae02336a756bac4a9d561525501c`, User B pool deposit `3bfca807f4402941a47135f3d7929301cdfdff07c0e271610e39744c777f759d`, and pool-to-User B payout `8e9d1134e22cbef141d74efad074723c300419c0e844484f37653d92044b9f78`.
- Live virtual-chain smoke check, 2026-05-12: current-tip read works with the local TN12 SDK and public wRPC endpoint. The old historical overlap start hash is no longer available from the public node, so keep the checked-in rich live-window artifact unless a new reachable historical start hash is captured.

## Completed In Current Cleanup Pass

- Public-language sweep and public guard expansion are committed.
- Command-path audit is committed: public command snippets now route through `docs/COMMAND_RUNBOOK.md` command classes.
- Clickable-affordance sweep has started: action-looking claim links now advertise `Open`, passive claim cards are visually quieter, and UI smoke tests assert the distinction.
- Rendered layout checks now cover desktop and mobile pages, horizontal overflow, mobile controls, local links, dynamic content, and empty live regions.
- Historical archive cleanup is committed: old session/status files are outside normal repo search and remain opt-in through `rg --no-ignore docs/archive`.

## Active Todo

Work in this order unless a gate or visible UI regression changes the sequence:

| Order | Task | Done When | Needs User? |
|---|---|---|---|
| 1 | Close recurring-vault live-submit boundary. | `artifacts/recurring-treasury-vault-live-submit-readiness.json` records whether the current route preserves output covenant binding, and focused tests enforce the answer. | No |
| 2 | Harden Rust live submit for recurring-vault spend. | The Rust route builds the exact funded-output spend, preserves the continuation output covenant binding, broadcasts the under-cap transition, and TN12 accepts the spend. | No |
| 3 | Decide whether Covenant-Owned Asset Duel gets funded TN12 preflight. | Local ICC proof is built; next step is either park it as local proof or fund one output and prove a guarded live-spend preflight. | No |
| 4 | Decide whether Blitz Mux Arena gets funded TN12 preflight. | Local mux/worker/timeout proof is built; next step is either park it as local proof or fund one mux output and prove route/return preflight. | No |
| 5 | Live rollback evidence. | A live TN12 removed-block window is captured and matched by the replay promotion guard. | No |
| 6 | User-wallet payload receipt. | A real wallet or throwaway signer returns bytes, submit succeeds, and replay observes the accepted txid. | Yes, unless a compatible throwaway signer exists |
| 7 | Code-surface split. | More `app.js`, `styles.css`, and `scripts/check.mjs` logic moves into smaller renderers, style sections, and focused checks without changing evidence semantics. | No |

## Next Defined Work

1. TN12 proof-core release candidate.
   - What it is: a tagged evidence snapshot for the proof core, not a product release.
   - It should include the exact commit hash, canonical proof count, txid list, fixture/artifact hashes, commands run, expected gate output, known blockers, and a clear "testnet only / no audit / no mainnet funds" boundary.
   - Done when the release notes can be reviewed without reading the whole repo.
2. TN12 public UI split.
   - What it is: separate the current broad lab surface into three reader jobs: Proof, Product Ideas, and Mainnet Readiness.
   - Proof should show accepted txids, scripts, verifier commands, and enforcement labels.
   - Product Ideas should hold vault, escrow, assurance, DeFi, scheduler, agents, auctions, and coordination concepts.
   - Mainnet Readiness should hold wallet signing, production indexer, rollback evidence, audit, and activation blockers.
   - Done when a normal reader can find "what is proven" without scrolling through app-lab concepts.
3. User-wallet signing round trip.
   - What it is: one real wallet or compatible throwaway signer returns transaction bytes, submit succeeds, and replay observes the accepted txid.
   - Done when the repo no longer has to describe user-wallet signing only as a request/template gap.
4. Live rollback evidence.
   - What it is: a live TN12 removed-block window captured from node/RPC data and matched by the replay promotion guard.
   - Done when local rollback matching is backed by a live observed rollback case.
5. Wallet-vault feature coverage.
   - What it is: turn the missing vault-product features into separate rails instead of one vague "vaults later" bucket.
   - Default path: local-wallet TN12 flow first. That proves address setup, transaction construction, accepted txid, replay, UI evidence, and negative guards with minimal overhead.
   - Dynamic whitelist: local-wallet destination-set artifact first; promote only after a script or wallet proves destination-set enforcement.
   - Recurring cap: current active rail. Local-wallet under-cap spend, cap-window state, cumulative over-window block, DECL probe, and compiled `RecurringTreasuryVault.sil` draft are built; next is negative candidates plus one accepted script spend.
   - Partial unvault: local-wallet contract fixture that spends part of an output while relocking the remainder.
   - Policy update: local-wallet delayed admin/recovery update path with accepted update and early-update rejection evidence.
   - Guardian recovery: local-wallet m-of-n guardian path with accepted quorum spend and too-few/wrong-guardian negative evidence.
   - Done when each feature has a status label, artifact path, test, and UI boundary.
6. Covenant examples worth funding or extending after recurring caps.
   - ICC ownership demo: local contract, artifact, and negative tests are built.
   - Multiplexor demo: local contracts, artifact, worker return tests, and timeout tests are built.
   - Challenge/timeout demo: an invalid or stalled transition is settled by a timeout path.
   - KIP-21 lane replay: accepted app activity is grouped into a lane and replayed into a compact state proof.
   - Done when the example has a contract or explicit compiler blocker, an artifact, a negative case, and a UI line.

## Where Older Queues Went

Older broad queues were folded into the active todo above. Historical planning notes stay in `docs/archive/` and generated artifact files; this file should stay short enough to scan before work starts.

## Do Not Do Next

- Do not buy signer hardware just to move the repo forward.
- Do not submit non-selected batch refund paths for already spent pledge outputs.
- Do not add AMM, lending, liquidation, oracle, bridge, or another broad app lane until one deeper contract primitive has an accepted positive path and a negative map.
- Do not call ICC, multiplexor routing, KIP-20 state, or KIP-21 lane proof "built" until the repo has a contract, generated artifact, and test for that exact claim.
- Use `npm run defi:accepted-activity` for real local-key TN12 DeFi activity: user funding, pool deposits, pool payouts, and reduced balances.
- Use `npm run defi:simulation` only for market logic that is not yet script-enforced: AMM math, lending health, liquidation review, oracle assumptions, and settlement planner checks over accepted receipt/indexer inputs, with live-product promotion blocked.
- Use `npm run defi:scenario` for deterministic AMM output, min-output rejection, oracle freshness, lending health-factor, and liquidation-review simulations over accepted TN12 receipt references.
- Use `npm run defi:reducer` to promote review-only state while blocking duplicate, missing, stale-oracle, slippage, liquidation-execution, and custody-promotion attempts.
- Use `npm run defi:advanced` for AMM LP/invariant checks, lending threshold sweeps, and oracle failure cases without custody promotion.
- Use `npm run defi:multi-wallet` to group scenario roles across accepted local-key TN12 receipt references without claiming user-wallet signing.
- Use `npm run defi:refresh` to rebuild the full DeFi accepted-activity plus planner/indexer suite and manifest in dependency order.
- Do not treat local replay success as live removed-block rollback evidence.

## Commands

```sh
npm run operator:refresh
npm run proof:verify
npm run project:operator-pack
npm run project:proven-status
npm run playground:wallets
npm run playground:funding-draft
npm run wallet:unsigned-requests
```
