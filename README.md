# TN12 Covenant Lab

Kaspa testnet-12 repo for covenant proof spends, payload receipts, and replay guards. Testnet-only. Not a mainnet wallet. Not proof that Toccata covenants are live on mainnet.

Percentages in this repo mean mainnet deployment readiness unless a line explicitly says TN12/demo progress.

## Canonical Status

Start here:

- `README.md`: public summary and verification commands.
- `artifacts/proven-status.json`: compact current counts, percent, and deferred rails.
- `artifacts/operator-receipt-pack.json`: accepted evidence plus the local-wallet command path.
- `docs/AUDIT_MAP.md`: canonical claim, status, and enforcement-class map.
- `docs/CLAIM_VOCABULARY.md`: short definitions for `SCRIPT_ENFORCED`, `PLANNER_ONLY`, `INDEXER_DERIVED`, and related labels.
- `MAINNET_READINESS.md`: deployment-readiness gaps only.
- `docs/NEXT_STEPS.md`: short current execution queue.
- `docs/PROOF_INDEX.md` and `docs/TN12_TEST_MATRIX.md`: txid-level evidence.

Older session/status reports are historical notes under `docs/archive/`, not canonical.

## Accepted On TN12

| Evidence | Status | Where |
|---|---|---|
| Minimal delayed owner/recovery vault primitive | `TN12_ACCEPTED` | `artifacts/proof-evidence.json` |
| Individual pledge release/refund primitive | `TN12_ACCEPTED` | `artifacts/proof-evidence.json` |
| Buyer-controlled escrow primitive | `TN12_ACCEPTED` | `artifacts/proof-evidence.json` |
| Role-separated positive paths, all 7 | `TN12_ACCEPTED` | `artifacts/role-separated-proof-evidence.json` |
| Batch-assurance 3-pledge release | `TN12_ACCEPTED` | `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801` |
| 33 payload events, including 6 DeFi v1 receipts and 1 agent release wallet-review event | `TN12_ACCEPTED` | `fixtures/PayloadEventEvidence.json` |
| Adversarial wrong-signer/selector/output/amount/cancel cases | `TN12_REJECTED` | `artifacts/adversarial/adversarial-summary.json` |

## NOT Proven

- Mainnet covenant activation.
- Full DeFi: no AMM, lending, liquidation, oracle, or production custody rail.
- No-local-key wallet signing: accepted proofs still used local testnet keys; this is deferred for mainnet-readiness.
- Pooled threshold enforcement: current batch target aggregation is planner/indexer logic.
- Production indexer reliability: local replay guards pass, but live removed-block rollback evidence is still useful.

## Deferred Mainnet-Readiness Rails

| Rail | Current state | Clears when |
|---|---|---|
| External signer | `artifacts/external-signer-path-research.json` and 4 request templates are ready | A real wallet returns signed tx bytes, submit succeeds, replay sees the accepted txid |
| Live rollback evidence | `artifacts/durable-replay-promotion-guard.json` passes local rollback matching | A live TN12 removed-block window is captured and matched |
| Batch-assurance settlement | Release path is accepted and indexed; refund path is now the non-selected alternate | Post-submit alternate-path status stays explicit |

## Independent Verification

```sh
npm ci
npm run check:focused
npm run check:all
npm run check:tn12
npm run proof:records
npm run demo:operator-refresh
```

`npm run check:focused` runs the first split domain tests. `npm run check:all` is the local gate. `npm run check:tn12` verifies public TN12 evidence and canonical proof-record shape. `npm run demo:operator-refresh` verifies TN12, refreshes derived artifacts, rebuilds status packs, and reruns local checks.

## Useful Artifacts

| Need | Artifact |
|---|---|
| Reviewer claim map | `docs/AUDIT_MAP.md` |
| Script groups | `docs/SCRIPT_INDEX.md` |
| Tidying map | `docs/REPO_TIDYING.md` |
| Next steps | `docs/NEXT_STEPS.md` |
| Proof index | `docs/PROOF_INDEX.md` |
| Tested/not-tested matrix | `docs/TN12_TEST_MATRIX.md` |
| Mainnet readiness | `MAINNET_READINESS.md` |
| Current 10-task slice | `artifacts/next-ten-execution-status.json` |
| Proven status boundary | `artifacts/proven-status.json` |
| Operator receipt pack | `artifacts/operator-receipt-pack.json` |
| DeFi receipt guard | `artifacts/defi-receipt-replay-guard.json` |
| DeFi planner simulation | `artifacts/defi-planner-simulation.json` |
| Durable replay guard | `artifacts/durable-replay-promotion-guard.json` |
| External signer path | `artifacts/external-signer-path-research.json` |
| External signer payload request | `artifacts/external-signer-payload-request.json` |
| Full lab notebook | `docs/LAB_NOTEBOOK.md` |

## Local Preview

```sh
npm run serve
```

Open `index.html` for the proof/reviewer page. Open `lab.html` for the full builder workbench.
