# Progress

Reviewed: 2026-05-11

This repo is a TN12 proof/app-state lab. Keep the public story simple: what is accepted, what is replayed, what is still blocked.

## Done

- Seven base covenant proof spends accepted on TN12: minimal delayed owner/recovery vault, individual pledge release/refund, and buyer-controlled escrow primitives.
- Seven role-separated positive paths accepted on TN12.
- Batch-assurance pledge outputs and 3-pledge release accepted on TN12.
- 40 payload events accepted on TN12, including seven DeFi v1 receipts, one scheduler-intent receipt, three scheduler-bid receipts, one scheduler-execution receipt, one scheduler-covenant-binding receipt, and one agent release wallet-review event.
- 25 accepted local-key DeFi custody/activity transfer rows are recorded across user funding, pool deposits, pool payouts, and scheduler execution payout.
- One scheduler-intent payload, three scheduler-bid receipts, one scheduler-execution receipt, one scheduler-covenant-binding receipt, and one local-key payout are accepted on TN12 and reduced as executed trigger state.
- Adversarial rejection evidence exists for wrong signer, wrong selector, wrong output lock, wrong amount, and single-party cancel.
- Local gates cover proof evidence, payload matching, wallet review, signer-result validation, replay rows, duplicate/stale receipt guards, DeFi scenario/reducer/advanced simulation, artifact manifest guards, and UI smoke.
- `docs/AUDIT_MAP.md` is the canonical claim and enforcement-class map.

## Current Artifacts

| Area | Artifact |
|---|---|
| Proof table | `artifacts/proof-evidence.json` |
| Role-separated proof table | `artifacts/role-separated-proof-evidence.json` |
| Payload event evidence | `fixtures/PayloadEventEvidence.json` |
| Checkpoint index | `artifacts/checkpointed-accepted-index.json` |
| DeFi receipt guard | `artifacts/defi-receipt-replay-guard.json` |
| DeFi accepted activity ledger | `artifacts/defi-accepted-activity-ledger.json` |
| Scheduler intent registry | `artifacts/scheduler-intent-registry.json` |
| Scheduler covenant binding | `artifacts/scheduler-covenant-binding.json` |
| DeFi lab checks | `artifacts/full-defi-benchmark.json` |
| Real TN12 playground plan | `artifacts/playground-plan.json` |
| DeFi artifact manifest | `artifacts/defi-artifact-manifest.json` |
| DeFi scenario reducer | `artifacts/defi-scenario-reducer.json` |
| DeFi advanced simulation | `artifacts/defi-advanced-simulation.json` |
| DeFi multi-wallet pack | `artifacts/defi-multi-wallet-scenario-pack.json` |
| Durable replay guard | `artifacts/durable-replay-promotion-guard.json` |
| User-wallet path | `artifacts/external-signer-path-research.json` |
| Next steps | `docs/NEXT_STEPS.md` |
| Detailed task status | `artifacts/next-ten-execution-status.json` |
| Proof boundary artifact | `artifacts/proven-status.json` |
| Receipt pack artifact | `artifacts/operator-receipt-pack.json` |

## Demo Status

| Lane | State |
|---|---|
| Auction custody | 2 amount-matched local-testnet custody rows are ready for wallet review. |
| Agent custody | 2 amount-matched local-testnet custody rows are ready for wallet review. |
| Batch-assurance alternate path | Release is accepted; refund path is non-selected and must not be submitted for the spent pledge set. |
| DeFi accepted activity | Local users, wallet A/B, and pool/operator wallets have accepted TN12 funding, pool-deposit, and pool-payout transfers. |
| DeFi planner/indexer logic | Planner, scenario math, reducer promotion guard, AMM/liquidity hardening, lending sweeps, oracle failure cases, and multi-wallet role pack remain bounded to indexer/planner state where no script enforces the market rule. |
| Scheduler / TangVM-adjacent logic | One accepted scheduler-intent payload, three accepted scheduler-bid receipts, one accepted execution receipt, one accepted covenant-binding receipt, and one accepted local-key payout reduce into executed trigger state. This is indexer-derived and aligned with upstream vProgs scheduler ideas, not TangVM/UniSc implementation. |
| Product hardening | Wallet, indexer, monitoring, and recovery paths are not production-grade. |

## Deferred Mainnet-Readiness Rails

| Rail | State |
|---|---|
| User-wallet signing | Request templates and research are ready; no real user-approved signature yet. |
| Live removed-block rollback evidence | Local promotion readiness passes; full promotion is deferred until a live removed-block window is captured. |

## Current Percent

- TN12 DeFi/demo lane: `74-80%` as an accepted-activity and indexer-derived lab, not a production DeFi product.
- After real user-wallet signing: about `65-70%` mainnet deployment readiness.
- Mainnet deployment readiness: about `58-62%`.

## Commands

```sh
npm run check:all
npm run check:tn12
npm run demo:operator-refresh
npm run project:next-ten-status
npm run project:proven-status
npm run project:operator-pack
npm run defi:refresh
npm run indexer:durable-promotion-guard
npm run wallet:external-signer-research
```

## Next

1. Keep `defi:refresh`, `check:all`, and `check:tn12` green after DeFi artifact changes.
2. Add only review-state DeFi improvements unless a real custody/signer rail exists.
3. Keep batch-assurance refund paths marked non-selected after the accepted release.
4. Keep user-wallet signing and live rollback as mainnet-readiness rails.

See `docs/NEXT_STEPS.md` for the short execution queue.
