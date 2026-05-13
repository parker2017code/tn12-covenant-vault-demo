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
- Recurring vault update, 2026-05-12: covenant-genesis funding and two script-enforced under-cap spends are accepted on TN12. The active one-window continuation fixture is `fixtures/RecurringTreasuryVaultCumulativeContinuationOutpoint.json`; the cumulative accepted spend is 65 tKAS under the 75 tKAS cap, and `artifacts/signed-drafts/recurring-treasury-vault-cumulative-over-cap.json` is locally rejected at 80 tKAS attempted window spend.
- Recurring vault window-reset update, 2026-05-12: `contracts/RecurringTreasuryVaultWindow.sil` adds a `reset_window` branch, accepted TN12 genesis funding, accepted TN12 reset spend `f99bb6f6552beac976b770448ef2d75748b4d7fbf66932e1156ea41493978759`, active reset continuation fixture `fixtures/RecurringTreasuryVaultWindowResetContinuationOutpoint.json`, and local rejects for early reset, stale-window reset, and over-cap reset.
- Blitz Mux update, 2026-05-12: accepted TN12 mux family genesis, route, worker return, second route, and timeout return are now summarized in `artifacts/blitz-mux-challenge-settlement.json` as normal worker settlement plus timeout settlement, with local bad-selector and too-early-timeout rejects.
- Blitz Worker B update, 2026-05-12: accepted TN12 route to Worker B `de614f26563bcedca34063dc2d1bb0532f1dfc0b1274d64870a6d4e36bd745f2` and accepted Worker B gain-minus-fee return `9985e4e92d5e877b1530ae00625be29429350bb6393c9da1ee5a9d92c9fa9eb2` are now part of the live flow artifact and visible experiment page.
- Vault negative-check update, 2026-05-12: `artifacts/covenant-heist-evidence.json` and the visible experiment section now show wrong-owner, wrong-destination, missing-continuation, cumulative-over-cap, early-reset, stale-reset, and over-cap-reset local rejects over the accepted recurring-vault rail.
- Coordination League update, 2026-05-12: `artifacts/coordination-market-evidence-dossier.json` is visible as a bounded coordination slice with three qualifying intendos, accepted payload/custody evidence, accepted release txid `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801`, and non-selected refund alternates.
- Scheduler Duel update, 2026-05-12: `artifacts/universal-scheduler-workbench.json` is visible as a bounded app-state slice with accepted intent, accepted executor bids, accepted execution receipt, matched payout transfer, and replay-blocked stale/duplicate/too-slow paths. It remains `INDEXER_DERIVED`, not protocol scheduling or autonomous custody.
- Wallet approval update, 2026-05-12: `artifacts/wallet-approval-summaries.json` translates the recurring-cap reset-window proof into wallet-readable fields: amount, cap, previous/next spent amount, covenant id, continuation output, explorer URL, and local reject prompts.

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
| 1 | Add a compact Blitz challenge variant only if it proves a new refusal path. | A new local reject or accepted/rejected TN12 row is added without pretending this is a full game. | No |
| 2 | Add new experiment evidence only when it is a real move. | New rows must be accepted evidence, safe rejection evidence, or wallet handoff evidence. | No |
| 3 | Add wallet-readable approval summaries. | At least one experiment emits an action/amount/destination/covenant/continuation summary a wallet could render as Approve/Reject. | No |
| 4 | Add sibling-input discovery for the asset proof. | The repo explains how the required sibling input is found from covenant id, outpoint, state, and replay state. | No |
| 5 | Build the Coordination TN12 settlement target. | Release/refund gets a covenant target plan, local checks, and accepted TN12 evidence or an exact blocker. | No |
| 6 | Build the Scheduler TN12 settlement target. | One eligible trigger gets a covenant target plan, local checks, and accepted TN12 evidence or an exact blocker. | No |
| 7 | Harden replay-derived lanes. | Scheduler or coordination replay has a second-verifier check, mismatch proof, checkpoint, or explicit proof-system blocker. | No |
| 8 | Split the giant focused/check command surface. | The current command wall is grouped into smaller reviewable domain runners without weakening gates. | No |
| 9 | Live rollback evidence. | A live TN12 removed-block window is captured and matched by the replay promotion guard. | No |
| 10 | User-wallet payload receipt. | A real wallet or throwaway signer returns bytes, submit succeeds, and replay observes the accepted txid. | Yes, unless a compatible throwaway signer exists |
| 11 | Code-surface split. | More `app.js`, `styles.css`, and `scripts/check.mjs` logic moves into smaller renderers, style sections, and focused checks without changing evidence semantics. | No |

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
   - Recurring cap: current active rail. Local-wallet under-cap spend, cap-window state, cumulative over-window block, DECL probe, compiled `RecurringTreasuryVault.sil`, owner-signature proof, accepted covenant-genesis funding, two accepted script-enforced under-cap spends, accepted `RecurringTreasuryVaultWindow.sil` reset-window spend, continuation fixtures, and local over-cap/early-reset/stale-reset rejects are built; next is wallet-readable approval summary and wallet-standard signing.
   - Partial unvault: local-wallet contract fixture that spends part of an output while relocking the remainder.
   - Policy update: local-wallet delayed admin/recovery update path with accepted update and early-update rejection evidence.
   - Guardian recovery: local-wallet m-of-n guardian path with accepted quorum spend and too-few/wrong-guardian negative evidence.
   - Done when each feature has a status label, artifact path, test, and UI boundary.
6. Covenant examples worth funding or extending after recurring caps.
   - ICC ownership demo: local contract, artifact, and negative tests are built.
   - Multiplexor demo: local contracts, artifact, worker return tests, timeout tests, accepted route spend, and accepted worker-return spend are built.
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
