# Repo Memory

Read this first when resuming TN12 work. Keep it short. Details belong in artifacts and purpose-built docs.

## Current State

- Repo: `/home/parker2017/tn12-covenant-vault-demo`
- Branch: `main`
- Remote: `https://github.com/parker2017code/tn12-covenant-vault-demo`
- Pages: `https://parker2017code.github.io/tn12-covenant-vault-demo/`
- Main gate: `npm run check:all`
- TN12 evidence gate: `npm run check:tn12`
- Operating frame: build money rails first, covenant products second, based-app prototypes third, and treat full vProgs/synchronous composition as later architecture.
- Style frame: use direct product labels and concrete next actions. Say what a user can do, what evidence backs it, what is missing, and what to try next. Keep the detailed wording plan in `docs/COPY_CLEANUP_PLAN.md`.

## Proof Core

- Base covenant spends accepted on TN12: vault recovery, vault withdrawal, assurance release/refund, escrow release/refund/cancel.
- Role-separated positive paths accepted on TN12: all seven.
- Batch assurance accepted on TN12: pledge outputs plus 3-pledge release `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801`.
- Payload events accepted on TN12: 30, including four DeFi v1 receipts across three wallets.
- Adversarial rejections accepted as negative evidence: wrong signer, wrong selector, wrong output lock, wrong amount, single-party cancel.
- Based-app prototype work has started: DeFi reducers/replay, scheduler receipts, auction/intents, coordination/Stag, access-pass state, agent commitments, and payload receipt app state.
- Coordination-market work is transparent first: conditional commitments, compatible packs, solver output, wallet-reviewed settlement, and replayed evidence. The full research version adds privacy, capital multiplexing, solver incentives, censorship resistance, MEV resistance, and atomic execution.
- Universal scheduler work starts as app-job routing over accepted TN12 evidence: trigger, bid, execution, proof, solver, and settlement rows. Do not call it protocol automation until a protocol-level scheduler exists.

## Current Blockers

1. External signer: four request templates exist, but no real user-approved signature yet.
2. Live removed-block rollback evidence: local rollback matching passes, but full promotion stays blocked until a live removed-block window is captured.
3. Batch-assurance alternate path: release is accepted; do not submit refund paths for the spent pledge set.
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
| Scheduler workbench | `artifacts/universal-scheduler-workbench.json` |
| Durable replay guard | `artifacts/durable-replay-promotion-guard.json` |
| External signer path | `artifacts/external-signer-path-research.json` |
| Next-ten status | `artifacts/next-ten-execution-status.json` |
| Mainnet readiness | `MAINNET_READINESS.md` |
| Compact progress | `docs/PROGRESS.md` |

## Rules

- Never print or commit `.local/*` private keys.
- Do not use mainnet keys.
- Do not call local-signer output external-wallet evidence.
- Positive app-state labels should say exactly what backs them: accepted TN12 evidence, local-key TN12 activity, planner/indexer replay, or research prototype.
- Do not use public TN12 REST submit for payload receipts; it previously dropped payload bytes.
- Keep docs proof-first. Avoid broad future-app prose unless it points to a concrete artifact.

## Next

1. Make the self-serve lane runbook the public route into money rails, covenant products, and based-app prototypes.
2. Use the scheduler workbench to turn DeFi, coordination, auction, and agent rows into user-run job flows.
3. Real external signer round trip for one payload receipt.
4. Real external signer round trip for one covenant spend.
5. Turn one based-app prototype into a user-run vertical: fund, submit, replay, block invalid action.
6. Capture live removed-block rollback evidence when available.
