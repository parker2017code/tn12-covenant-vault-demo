# Next Steps

Reviewed: 2026-05-11

This file is the short queue. It does not replace generated artifacts; it points future work to the next concrete tasks without reopening old roadmap stacks.

## Current Position

- TN12 proof core is strong: base covenant spends, role-separated paths, batch-assurance release, payload events, replay guards, and adversarial rejections are represented in artifacts and checks.
- Mainnet deployment readiness is still about `58-62%`. The playground funding tx improves testnet execution evidence, not no-local-key signing or mainnet activation.
- Proof-lab auditability is roughly `95%`: accepted covenant proofs, role-separated paths, payload events, replay guards, adversarial rejections, full-DeFi benchmark artifacts, results/playground pages, and focused tests are now in place.
- The next useful work is not another app idea. It is one end-to-end custody/indexer/operator slice.
- The latest local-wallet operator-pack receipt is accepted on TN12: `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`.
- The current full-DeFi repo-local benchmark is `60%`: six of ten rails are complete, with external signer, live rollback evidence, AMM/lending/liquidation custody execution, and mainnet activation still incomplete.
- The current playground run has four accepted TN12 txs: role funding `85b5c6dcd537982812bd5c50e433c53d13d87f6d887e06e164e63a3b40a4f6e5`, User A pool deposit `83eae5c10342cf23095aa51875ce927671b1ae02336a756bac4a9d561525501c`, User B pool deposit `3bfca807f4402941a47135f3d7929301cdfdff07c0e271610e39744c777f759d`, and pool-to-User B payout `8e9d1134e22cbef141d74efad074723c300419c0e844484f37653d92044b9f78`.

## Active Todo

Work in this order unless a gate or visible UI regression changes the sequence:

| Order | Task | Done When | Needs User? |
|---|---|---|---|
| 1 | Public front-door compression. | `index.html` routes clearly to `results.html`, `playground.html`, and `lab.html` without proof-count walls above the fold. | No |
| 2 | Results/playground page pruning. | Long generated sections are collapsed by user job: observe, repeat with faucet, bring wallet, audit/build. | No |
| 3 | Clickable-affordance sweep. | Every visible txid opens TN12 explorer; every action-looking card links or is restyled as passive. | No |
| 4 | Command-path audit. | Every public command names prerequisites, writes/broadcasts behavior, expected output, and the next page or artifact to inspect. | No |
| 5 | Stale-completion cleanup. | Old `100%`, `complete`, `production-ready`, and similar artifacts are archived or renamed so normal repo search does not surface stale claims as current truth. | No |
| 6 | Code-surface split. | More `app.js`, `styles.css`, and `scripts/check.mjs` logic moves into smaller renderers, style sections, and focused checks without changing evidence semantics. | No |
| 7 | Manifest-driven inventory. | Counts, page links, command groups, and high-signal artifact lists are generated or checked from one source instead of manually duplicated. | No |
| 8 | External-signer payload receipt. | A real wallet or throwaway external signer returns bytes, submit succeeds, and replay observes the accepted txid. | Yes, unless a compatible throwaway signer exists |
| 9 | Live rollback evidence. | A live TN12 removed-block window is captured and matched by the replay promotion guard. | No |
| 10 | One concrete settlement vertical. | One narrow escrow/assurance/agent/invoice path moves from accepted evidence to user-run request, submit, replay, and blocked invalid action. | Maybe, only if fresh tKAS or external signing is needed |

## Where Older Queues Went

Older broad queues were folded into the active todo above. Historical planning notes stay in `docs/archive/` and generated artifact files; this file should stay short enough to scan before work starts.

## Do Not Do Next

- Do not buy signer hardware just to move the repo forward.
- Do not submit non-selected batch refund paths for already spent pledge outputs.
- Do not add AMM, lending, liquidation, oracle, or bridge claims until there is a narrower accepted custody/indexer path.
- Use `npm run defi:accepted-activity` for real local-key TN12 DeFi activity: user funding, pool deposits, pool payouts, and reduced balances.
- Use `npm run defi:simulation` only for market logic that is not yet script-enforced: AMM math, lending health, liquidation review, oracle assumptions, and settlement planner checks over accepted receipt/indexer inputs, with live-product promotion blocked.
- Use `npm run defi:scenario` for deterministic AMM output, min-output rejection, oracle freshness, lending health-factor, and liquidation-review simulations over accepted TN12 receipt references.
- Use `npm run defi:reducer` to promote review-only state while blocking duplicate, missing, stale-oracle, slippage, liquidation-execution, and custody-promotion attempts.
- Use `npm run defi:advanced` for AMM LP/invariant checks, lending threshold sweeps, and oracle failure cases without custody promotion.
- Use `npm run defi:multi-wallet` to group scenario roles across accepted local-key TN12 receipt references without claiming external-wallet signing.
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
