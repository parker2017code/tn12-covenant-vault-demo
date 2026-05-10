# Repo Memory

Read this first when resuming TN12 work. Keep it short. Details belong in artifacts and purpose-built docs.

## Current State

- Repo: `/home/parker2017/tn12-covenant-vault-demo`
- Branch: `main`
- Remote: `https://github.com/parker2017code/tn12-covenant-vault-demo`
- Pages: `https://parker2017code.github.io/tn12-covenant-vault-demo/`
- Main gate: `npm run check:all`
- TN12 evidence gate: `npm run check:tn12`

## Proof Core

- Base covenant spends accepted on TN12: vault recovery, vault withdrawal, assurance release/refund, escrow release/refund/cancel.
- Role-separated positive paths accepted on TN12: all seven.
- Batch assurance accepted on TN12: pledge outputs plus 3-pledge release `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801`.
- Payload events accepted on TN12: 30, including four DeFi v1 receipts across three wallets.
- Adversarial rejections accepted as negative evidence: wrong signer, wrong selector, wrong output lock, wrong amount, single-party cancel.

## Current Blockers

1. External signer: four request templates exist, but no real user-approved signature yet.
2. Live removed-block rollback evidence: local rollback matching passes, but no live removed-block window has been captured.
3. Batch-assurance settlement choice: release-first is the default; do not submit mutually exclusive release and refund paths.
4. Product hardening: wallet/indexer/recovery/monitoring are not production-grade.

## Commands

```sh
npm run check:all
npm run check:tn12
npm run project:next-ten-status
npm run indexer:durable-promotion-guard
npm run wallet:external-signer-research
```

## Key Artifacts

| Need | Artifact |
|---|---|
| Proof table | `artifacts/proof-evidence.json` |
| Role-separated proof table | `artifacts/role-separated-proof-evidence.json` |
| Payload event evidence | `fixtures/PayloadEventEvidence.json` |
| DeFi receipt guard | `artifacts/defi-receipt-replay-guard.json` |
| Durable replay guard | `artifacts/durable-replay-promotion-guard.json` |
| External signer path | `artifacts/external-signer-path-research.json` |
| Next-ten status | `artifacts/next-ten-execution-status.json` |
| Mainnet readiness | `MAINNET_READINESS.md` |
| Compact progress | `docs/PROGRESS.md` |

## Rules

- Never print or commit `.local/*` private keys.
- Do not use mainnet keys.
- Do not call local-signer output external-wallet evidence.
- Positive app-state claims need accepted TN12 evidence or must be labeled local/planner/research.
- Do not use public TN12 REST submit for payload receipts; it previously dropped payload bytes.
- Keep docs proof-first. Avoid broad future-app prose unless it points to a concrete artifact.

## Next

1. Real external signer round trip for one payload receipt.
2. Real external signer round trip for one covenant spend.
3. Submit/replay one batch-assurance settlement path.
4. Capture live removed-block rollback evidence when available.
5. Continue repo cleanup only by reducing prose, not deleting evidence.
