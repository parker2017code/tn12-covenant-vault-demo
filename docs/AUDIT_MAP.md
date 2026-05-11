# Audit Map

Short path for an independent reviewer. This file maps public claims to evidence, commands, and status labels.

## Reviewer Commands

```sh
npm ci
npm run check:all
npm run check:tn12
npm run demo:operator-refresh
```

`npm run demo:operator-refresh` is the broadest local command. It verifies public TN12 evidence, rebuilds derived indexer/operator artifacts, and reruns local checks.

## Claim Map

| Claim | Status | Evidence | Command |
|---|---|---|---|
| Vault recovery and delayed withdrawal have accepted TN12 proof spends. | `TN12_ACCEPTED` | `artifacts/proof-evidence.json`, `docs/PROOF_INDEX.md` | `npm run proof:evidence` |
| Assurance release and refund have accepted TN12 proof spends. | `TN12_ACCEPTED` | `artifacts/proof-evidence.json`, `docs/PROOF_INDEX.md` | `npm run proof:evidence` |
| Escrow release, DAA refund, and mutual cancel have accepted TN12 proof spends. | `TN12_ACCEPTED` | `artifacts/proof-evidence.json`, `docs/TN12_TEST_MATRIX.md` | `npm run proof:evidence` |
| Role-separated vault, assurance, and escrow paths have accepted TN12 proof spends. | `TN12_ACCEPTED` | `artifacts/role-separated-proof-evidence.json` | `npm run roles:proof:evidence` |
| Payload receipts are accepted and indexed as app state. | `TN12_ACCEPTED` | `fixtures/PayloadEventEvidence.json`, `artifacts/checkpointed-accepted-index.json` | `npm run payload:verify:events` |
| Operator receipt pack is clean and current. | `LOCAL_TEST_ONLY` | `artifacts/operator-receipt-pack.json` | `npm run project:operator-pack` |
| Full refresh path is repeatable from the repo. | `LOCAL_TEST_ONLY` | `artifacts/proven-status.json`, `artifacts/operator-receipt-pack.json` | `npm run demo:operator-refresh` |
| Wrong-signer, wrong-selector, wrong-output, wrong-amount, and invalid cancel attempts are rejected. | `TN12_REJECTED` | `artifacts/adversarial/adversarial-summary.json` | `npm run check:negative` |
| External wallet signing is ready for mainnet-style custody. | `MAINNET_BLOCKED` | `artifacts/external-signer-path-research.json` | `npm run wallet:external-signer-research` |
| Live removed-block rollback promotion is production-ready. | `MAINNET_BLOCKED` | `artifacts/durable-replay-promotion-guard.json` | `npm run indexer:durable-promotion-guard` |
| AMM, lending, liquidation, oracle, bridge, and full DeFi are live. | `PLANNER_ONLY` | `artifacts/defi-research-backlog.json`, `artifacts/missing-rails-matrix.json` | `npm run defi:backlog` |

## Status Labels

| Label | Meaning |
|---|---|
| `TN12_ACCEPTED` | A public TN12 transaction or payload event is accepted and checked by repo commands. |
| `TN12_REJECTED` | A negative/adversarial path is rejected or locally guarded as expected. |
| `LOCAL_TEST_ONLY` | The repo can reproduce the behavior locally, but it is not a no-local-key wallet or production flow. |
| `PLANNER_ONLY` | The artifact is design, routing, or research state without accepted settlement evidence. |
| `MAINNET_BLOCKED` | The lane needs mainnet activation, external signing, production indexer behavior, or another named rail. |
