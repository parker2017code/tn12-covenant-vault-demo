# Script Index

This repo has many scripts because it preserves proof construction, TN12 verification, local indexer replay, wallet review, and research lanes. Use this index instead of scanning `package.json` first.

## Reviewer Commands

| Need | Command |
|---|---|
| Install exactly from lockfile | `npm ci` |
| Minimal reviewer path | `npm ci && npm run check:tn12` |
| Focused domain tests | `npm run check:focused` |
| Local behavior gate | `npm run check:all` |
| Public TN12 evidence gate | `npm run check:tn12` |
| Full reviewer refresh | `npm run operator:refresh` |
| Compatibility alias for full refresh | `npm run demo:operator-refresh` |
| Public UI smoke check | `npm run check:ui` |

## Proof Commands

| Need | Command |
|---|---|
| Verify accepted proof txids from public TN12 API | `npm run tx:verify` |
| Rebuild accepted proof evidence | `npm run proof:evidence` |
| Verify canonical proof-record shape | `npm run proof:records` |
| Verify role-separated accepted proof txids | `npm run tx:roles:verify` |
| Rebuild role-separated proof evidence | `npm run roles:proof:evidence` |
| Verify accepted payload events | `npm run payload:verify:events` |

## Focused Test Files

| Domain | File |
|---|---|
| Core amount parsing and JSON-safe amount conversion | `tests/core/amounts.test.mjs` |
| Canonical proof-record verification | `tests/proof/proof-records.test.mjs` |

## Indexer Commands

| Need | Command |
|---|---|
| Build accepted checkpoint index | `npm run indexer:checkpoint` |
| Build persisted checkpoint guard | `npm run indexer:persist` |
| Build replay plan | `npm run indexer:replay-plan` |
| Build storage schema | `npm run indexer:schema` |
| Run fixture replay | `npm run indexer:replay` |
| Run virtual-chain fixture adapter | `npm run indexer:virtual-chain-run` |

## Operator Commands

| Need | Command |
|---|---|
| Rebuild compact proven status | `npm run project:proven-status` |
| Rebuild operator receipt pack | `npm run operator:pack` |
| Compatibility alias for operator pack | `npm run project:operator-pack` |
| Rebuild reviewer manifest | `npm run project:review-manifest` |
| Refresh DeFi v1 local-wallet receipt loop state | `npm run defi:v1-loop` |
| Build current next-work queue | `npm run project:queue` |

## Wallet And Mainnet-Readiness Commands

| Need | Command |
|---|---|
| Build wallet review surface | `npm run wallet:review` |
| Build external-signer research path | `npm run wallet:external-signer-research` |
| Build unsigned request templates | `npm run wallet:unsigned-requests` |
| Extract one external-signer payload request | `npm run wallet:external-signer-payload-request` |
| Build mainnet readiness map | `npm run mainnet:readiness` |

## Research And Planner Commands

| Need | Command |
|---|---|
| Missing DeFi/product rails | `npm run rails:missing` |
| Research trigger map | `npm run rails:research` |
| DeFi backlog | `npm run defi:backlog` |
| Oracle source matrix | `npm run oracle:matrix` |
| Refresh DeFi simulation suite | `npm run defi:refresh` |
| DeFi accepted activity ledger | `npm run defi:accepted-activity` |
| DeFi planner simulation | `npm run defi:simulation` |
| DeFi scenario simulation | `npm run defi:scenario` |
| DeFi scenario reducer / promotion guard | `npm run defi:reducer` |
| DeFi advanced simulation hardening | `npm run defi:advanced` |
| DeFi multi-wallet scenario pack | `npm run defi:multi-wallet` |
| DeFi artifact manifest | `npm run defi:manifest` |
| Cross-chain research library | `npm run research:library` |
| Refresh the core research guardrails | `npm run research:refresh` |

## Volatile Generated Artifacts

Some artifacts intentionally update timestamps or replay rows when rebuilt. This is expected after `npm run demo:operator-refresh`.

High-signal artifacts:

- `artifacts/proven-status.json`
- `artifacts/operator-receipt-pack.json`
- `artifacts/checkpointed-accepted-index.json`
- `artifacts/proof-evidence.json`
- `artifacts/role-separated-proof-evidence.json`

Low-signal diffs:

- timestamp-only changes in payload evidence files;
- replay `runAt` / `seen_at` fields;
- regenerated virtual-chain fixture rows with unchanged counts.

Do not treat timestamp-only diffs as new proof. Treat changed counts, txids, status labels, blocker lists, or review problems as material.
