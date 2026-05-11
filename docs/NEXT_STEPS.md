# Next Steps

Reviewed: 2026-05-11

This file is the short queue. It does not replace the generated artifacts; it points reviewers and future agents to the next concrete work without reopening broad roadmap claims.

## Current Position

- TN12 proof core is strong: base covenant spends, role-separated paths, batch-assurance release, payload events, replay guards, and adversarial rejections are represented in artifacts and checks.
- Mainnet deployment readiness is still about `58-62%`.
- Proof-lab auditability is roughly `91-93%` after the focused-check split, address validation pass, proof-record mutation coverage, status-artifact checks, generated-shape checks, reviewer-manifest checks, wallet-submit readiness checks, signer-return validation checks, submit-result promotion checks, attestation/invoice/research checks, batch-assurance checks, escrow-marketplace checks, treasury/access checks, market/DeFi/stable/agent checks, indexer replay/rollback checks, and count drift guards.
- The next useful work is not another app idea. It is one end-to-end custody/indexer/operator slice.
- The latest local-wallet operator-pack receipt is accepted on TN12: `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`.

## Autonomous Grand Plan Before User Input

These are the highest-impact things that can be advanced without asking for a real external wallet signature:

| Order | Work | Done When | Needs User? |
|---|---|---|---|
| 1 | DeFi scenario reducer and promotion guard. | Accepted scenario references reduce into review-only app state; duplicate, missing, stale-oracle, slippage, liquidation, and custody-promotion attempts are blocked. | No |
| 2 | AMM hardening. | Add/remove liquidity math, LP-share accounting, invariant checks, price-impact sweeps, and invalid reserve mutation tests. | No; first pass is `artifacts/defi-advanced-simulation.json` |
| 3 | Lending/liquidation hardening. | Collateral-ratio sweeps, liquidation threshold tests, stale/wrong oracle blocks, and no-executable-liquidation boundaries are deterministic. | No; first pass is `artifacts/defi-advanced-simulation.json` |
| 4 | Oracle failure matrix. | Stale, conflicting, unavailable, manipulated, missing-quorum, and fresh-but-not-truth inputs are executable negative cases. | No; first pass is `artifacts/defi-advanced-simulation.json` |
| 5 | Multi-wallet scenario pack. | Existing multi-wallet receipt references are grouped into user/operator roles with accepted-index replay and no external-signer claim. | No; first pass is `artifacts/defi-multi-wallet-scenario-pack.json` |
| 6 | Real TN12 DeFi activity ledger. | Local users are funded on-chain, pool deposits are accepted, pool payouts are accepted, and `artifacts/defi-accepted-activity-ledger.json` reduces those txids into balances. | No; first pass is accepted |
| 7 | Wallet/indexer hardening. | Unsigned request templates, signer-return validation, submit-result promotion, replay reducers, rollback fixtures, and no-secret checks stay green. | No |
| 8 | Reviewer/UI cleanup. | Public surfaces show accepted activity, planner/indexer state, and blocked market execution without adding product claims. | No |
| 9 | Scheduler/TangVM-adjacent prototype. | Accepted payloads register trigger intents, a reducer selects eligible triggers, and any local-key execution remains labeled `LOCAL_KEY_CUSTODY_TEST`; see `docs/TANGVM_UNISC_BOUNDARY.md`. | No |
| 10 | External signer roundtrip. | A real wallet returns signed bytes, submit succeeds, and accepted txid replay matches. | Yes |

## Current Reviewer-Hardening Queue

These are the practical cleanup tasks surfaced by the latest repo reviews and GitHub surface check. They improve auditability before adding more app lanes.

| Order | Task | Why It Matters | Blocked By User? |
|---|---|---|---|
| 1 | Keep splitting `scripts/check.mjs` into focused domain tests. | Smaller failures are easier for an outside reviewer to trust and debug. Wallet-submit, attestation/invoice/research, batch-assurance, escrow-marketplace, treasury/access, market/DeFi/stable/agent, and indexer-replay slices now have focused tests. | No |
| 2 | Add mutation coverage to proof-record tests. | The verifier should prove it catches bad source, amount, output, fee, and timing records. | No |
| 3 | Derive public counts from canonical artifacts. | README/UI/operator-pack count drift should fail a check instead of relying on manual updates. Payload, proof-path, role-separated, checkpoint/indexed, and operator receipt counts now have a stronger local guard. | No |
| 4 | Split `app.js` by proof page, lab page, renderers, and data loaders. | UI changes should not affect proof verification or unrelated lab panels. Shared formatting/form/data-loading helpers are now extracted; fixture/artifact fetches now use the shared loader, and the DeFi accepted-activity/planner surface is now in `src/ui/renderers/defiSimulationSurface.mjs`. More renderer/page extraction remains next. | No |
| 5 | Keep claim vocabulary close to public claims. | Reviewers should always know what is script-enforced, planner-only, indexer-derived, TN12-accepted, or mainnet-blocked. | No |
| 6 | Continue exact validation for addresses, txids, amounts, artifact shapes, signer returns, and rollback promotion. | Prefix checks and loose fixtures are acceptable for drafts, not reviewer evidence. Generated public artifacts, signer-return metadata, submit-result promotion rules, and rollback cases now have focused gates; deeper per-artifact schemas remain useful. | No |
| 7 | Keep historical reports archived and non-canonical. | The root and reviewer path should stay short enough to audit. | No |
| 8 | Move command, artifact, and count inventories toward manifest-driven checks. | Generated indexes should prevent docs, UI, and artifact packs from drifting. | No |
| 9 | Keep TangVM / universal-scheduler language scoped. | This repo can prototype event receipts, trigger reducers, and local-key execution aligned with upstream vProgs concepts; it cannot claim TangVM, UniSc, miner oracle consensus, or full vProgs. | No |

First pass is `artifacts/project-review-manifest.json`, generated by `npm run project:review-manifest`. It checks the reviewer command path, canonical docs, and high-signal artifacts.

## Next 5 Deployment-Readiness Tasks

| Order | Task | Why It Matters | Blocked By User? |
|---|---|---|---|
| 1 | Keep `operator:refresh` green after every proof/artifact change. | This is the reviewer gate for accepted evidence plus local replay and UI checks. | No |
| 2 | Route the next local-wallet TN12 spend through the operator receipt pack. | Proves the repo can turn a spend into a reviewer/operator receipt instead of only a raw txid. | Done for txid `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`; repeatable, not external-signer evidence |
| 3 | Keep batch-assurance release selected and refund alternates explicitly non-selected. | Prevents accidental double-claim language around the spent pledge set. | No |
| 4 | Prepare one unsigned external-signer payload receipt request. | Keeps the missing no-local-key signer rail concrete without pretending a wallet already signed it. | No; artifact path is `artifacts/external-signer-payload-request.json` |
| 5 | Only promote external signer status after a real wallet returns signed tx bytes and TN12 accepts the txid. | This is the main custody boundary for mainnet-style readiness. | Yes, unless a compatible throwaway signer is available |

## Next 90-95% Readiness Tasks

These are not all needed for the next commit, but they are the path from proof lab toward product infrastructure:

| Task | Clears |
|---|---|
| Real external-signer round trip | Repo no longer needs local keys for the selected demo path |
| Production wallet/indexer hardening | Focused tests now cover signer-return validation, submit-result promotion rules, missing-txid rollback, blue-score regression, and virtual-chain rollback rows; live external signing and live rollback evidence still remain |
| Live removed-block rollback capture | Replay promotion is backed by real TN12 rollback evidence |
| Fresh accepted payload receipt through the operator pack | Demonstrates the current user-facing receipt loop |
| Public docs stay proof-first after each change | Prevents roadmap/status drift |

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
npm run wallet:unsigned-requests
```
