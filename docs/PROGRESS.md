# Progress

Reviewed: 2026-05-10

This repo is a TN12 proof/app-state lab. Keep the public story simple: what is accepted, what is replayed, what is still blocked.

## Done

- Seven base covenant proof spends accepted on TN12.
- Seven role-separated positive paths accepted on TN12.
- Batch-assurance pledge outputs and 3-pledge release accepted on TN12.
- 30 payload events accepted on TN12, including four DeFi v1 receipts across three wallets.
- Adversarial rejection evidence exists for wrong signer, wrong selector, wrong output lock, wrong amount, and single-party cancel.
- Local gates cover proof evidence, payload matching, wallet review, signer-result validation, replay rows, duplicate/stale receipt guards, and UI smoke.

## Current Artifacts

| Area | Artifact |
|---|---|
| Proof table | `artifacts/proof-evidence.json` |
| Role-separated proof table | `artifacts/role-separated-proof-evidence.json` |
| Payload event evidence | `fixtures/PayloadEventEvidence.json` |
| Checkpoint index | `artifacts/checkpointed-accepted-index.json` |
| DeFi receipt guard | `artifacts/defi-receipt-replay-guard.json` |
| Durable replay guard | `artifacts/durable-replay-promotion-guard.json` |
| External signer path | `artifacts/external-signer-path-research.json` |
| Next 10-task status | `artifacts/next-ten-execution-status.json` |

## Blockers

| Blocker | State |
|---|---|
| External signer | Request templates and research are ready; no real user-approved signature yet. |
| Live removed-block rollback evidence | Local promotion readiness passes; full promotion is blocked until a live removed-block window is captured. |
| Batch-assurance alternate path | Release is accepted; refund path is non-selected and must not be submitted for the spent pledge set. |
| Product hardening | Wallet, indexer, monitoring, and recovery paths are not production-grade. |

## Current Percent

- TN12 DeFi/demo lane: `47-50%` after this local slice.
- After real external signer: `57-62%`.
- Mainnet deployment readiness: about `55-60%`.

## Commands

```sh
npm run check:all
npm run check:tn12
npm run project:next-ten-status
npm run indexer:durable-promotion-guard
npm run wallet:external-signer-research
```

## Next

1. Get one real external signer result for a payload receipt.
2. Get one real external signer result for a covenant spend.
3. Keep batch-assurance refund paths marked non-selected after the accepted release.
4. Capture live removed-block rollback evidence when available.
