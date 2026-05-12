# TN12 Covenant Lab

Kaspa testnet-12 repo for covenant proof spends, payload receipts, app-state prototypes, and replay guards. Testnet-only. It is not a mainnet wallet or mainnet activation record.

Percentages in this repo mean mainnet deployment readiness unless a line explicitly says TN12/demo progress.

## Canonical Status

Start here:

- `README.md`: public summary and verification commands.
- `artifacts/proven-status.json`: compact current counts, percent, and deferred rails.
- `artifacts/operator-receipt-pack.json`: accepted evidence plus the local-wallet command path.
- `docs/AUDIT_MAP.md`: canonical claim, status, and enforcement-class map.
- `docs/CLAIM_VOCABULARY.md`: short definitions for `SCRIPT_ENFORCED`, `PLANNER_ONLY`, `INDEXER_DERIVED`, and related labels.
- `docs/COMMAND_RUNBOOK.md`: command prerequisites, safety classes, and fresh playground route.
- `docs/CLI_FROM_ZERO.md`: blank-terminal path from install to TN12 playground, wallet drafts, submit boundaries, and DeFi-style replay.
- `docs/TANGVM_UNISC_BOUNDARY.md`: scheduler/TangVM/vProgs-adjacent boundary.
- `docs/PRODUCT_EXECUTION_PLAN.md`: money rails -> covenants -> based-app prototypes -> later vProgs operating plan.
- `docs/COPY_CLEANUP_PLAN.md`: public wording standard for pages and handoff docs.
- `docs/PUBLIC_FLOW_RULES.md`: public-page flow for non-expert readers; reviewer material stays reachable but not first.
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
| 40 payload events, including 7 DeFi v1 receipts, 1 scheduler-intent receipt, 3 scheduler-bid receipts, 1 scheduler-execution receipt, 1 scheduler-covenant-binding receipt, and 1 agent release wallet-review event | `TN12_ACCEPTED` | `fixtures/PayloadEventEvidence.json` |
| 25 accepted local-key DeFi custody/activity transfer rows across funded users, pool deposits, pool payouts, playground roles, and scheduler execution payout | `LOCAL_KEY_CUSTODY_TEST` | `artifacts/defi-accepted-activity-ledger.json` |
| 1 scheduler-intent payload, 3 scheduler-bid receipts, 1 scheduler-execution receipt, and 1 local-key payout reduced as executed trigger state | `TN12_ACCEPTED` / `INDEXER_DERIVED` / `LOCAL_KEY_CUSTODY_TEST` | `artifacts/scheduler-intent-registry.json` |
| 1 scheduler-covenant-binding receipt references an accepted vault recovery proof row | `TN12_ACCEPTED` / `INDEXER_DERIVED` / `SCRIPT_ENFORCED` reference | `artifacts/scheduler-covenant-binding.json` |
| Adversarial wrong-signer/selector/output/amount/cancel cases | `TN12_REJECTED` | `artifacts/adversarial/adversarial-summary.json` |

## Current Gaps

- Mainnet covenant activation.
- Full DeFi: current work has based-app prototype pieces, but no AMM, lending, liquidation, oracle, or production custody rail.
- No-local-key wallet signing: accepted proofs still used local testnet keys; this is deferred for mainnet-readiness.
- Pooled threshold enforcement: current batch target aggregation is planner/indexer logic.
- Production indexer reliability: local replay guards pass, but live removed-block rollback evidence is still useful.

## Deferred Mainnet-Readiness Work

| Rail | Current state | Clears when |
|---|---|---|
| External signer | `artifacts/external-signer-path-research.json` and 4 request templates are ready | An external wallet returns signed transaction bytes, submit succeeds, and replay sees the accepted txid |
| Live rollback evidence | `artifacts/durable-replay-promotion-guard.json` passes local rollback matching | A live TN12 removed-block window is captured and matched |
| Batch-assurance settlement | Release path is accepted and indexed; refund path is now the non-selected alternate | Post-submit alternate-path status stays explicit |

## Independent Verification

Prerequisite: Node.js `>=20.19.0 <25` and npm.

```sh
npm ci
npm run check:focused
npm run check:all
npm run check:tn12
npm run proof:records
npm run demo:operator-refresh
```

`npm run check:focused` runs the first split domain tests. `npm run check:all` is the local gate. `npm run check:tn12` verifies public TN12 evidence and canonical proof-record shape. `npm run demo:operator-refresh` verifies TN12, refreshes derived artifacts, rebuilds status packs, and reruns local checks.

Read `docs/COMMAND_RUNBOOK.md` before running wallet, faucet, or submit commands. Some snippets only rebuild local artifacts; others write testnet wallet material under `.local/` or broadcast TN12 transactions.

If you are starting from a blank terminal, use `docs/CLI_FROM_ZERO.md` first. It explains installation, local checks, fresh playground wallets, faucet funding, submit boundaries, replay, and which DeFi-style actions are real accepted TN12 transfers versus reducer or planner state.

## Useful Artifacts

| Need | Artifact |
|---|---|
| Evidence map | `docs/AUDIT_MAP.md` |
| Script groups | `docs/SCRIPT_INDEX.md` |
| Command runbook | `docs/COMMAND_RUNBOOK.md` |
| Blank-terminal CLI path | `docs/CLI_FROM_ZERO.md` |
| TangVM / scheduler boundary | `docs/TANGVM_UNISC_BOUNDARY.md` |
| Tidying map | `docs/REPO_TIDYING.md` |
| Next steps | `docs/NEXT_STEPS.md` |
| Project manifest | `artifacts/project-review-manifest.json` |
| Proof index | `docs/PROOF_INDEX.md` |
| Tested/not-tested matrix | `docs/TN12_TEST_MATRIX.md` |
| Mainnet readiness | `MAINNET_READINESS.md` |
| Current 10-task slice | `artifacts/next-ten-execution-status.json` |
| Proven status boundary | `artifacts/proven-status.json` |
| Operator receipt pack | `artifacts/operator-receipt-pack.json` |
| DeFi receipt guard | `artifacts/defi-receipt-replay-guard.json` |
| DeFi planner simulation | `artifacts/defi-planner-simulation.json` |
| DeFi scenario simulation | `artifacts/defi-scenario-simulation.json` |
| DeFi scenario reducer | `artifacts/defi-scenario-reducer.json` |
| DeFi advanced simulation | `artifacts/defi-advanced-simulation.json` |
| DeFi multi-wallet scenario pack | `artifacts/defi-multi-wallet-scenario-pack.json` |
| DeFi accepted activity ledger | `artifacts/defi-accepted-activity-ledger.json` |
| Scheduler intent registry | `artifacts/scheduler-intent-registry.json` |
| Scheduler workbench | `artifacts/universal-scheduler-workbench.json` |
| Full DeFi benchmark | `artifacts/full-defi-benchmark.json` |
| Accepted TN12 playground plan | `artifacts/playground-plan.json` |
| Accepted playground funding | `artifacts/playground-funding-evidence.json` |
| Accepted playground User A deposit | `artifacts/playground-user-a-pool-deposit-evidence.json` |
| Accepted playground User B deposit | `artifacts/playground-user-b-pool-deposit-evidence.json` |
| Accepted playground payout | `artifacts/playground-pool-user-b-payout-evidence.json` |
| Current playground session | `artifacts/playground-session.example.json` |
| Standards/adapters backlog | `artifacts/standards-adapter-backlog.json` |
| DeFi artifact manifest | `artifacts/defi-artifact-manifest.json` |
| Durable replay guard | `artifacts/durable-replay-promotion-guard.json` |
| External signer path | `artifacts/external-signer-path-research.json` |
| External signer payload request | `artifacts/external-signer-payload-request.json` |
| Full lab notebook | `docs/LAB_NOTEBOOK.md` |
| Product execution plan | `docs/PRODUCT_EXECUTION_PLAN.md` |
| Copy cleanup plan | `docs/COPY_CLEANUP_PLAN.md` |
| Public flow rules | `docs/PUBLIC_FLOW_RULES.md` |

## Local Preview

```sh
npm run serve
```

Open `index.html` for the proof/reviewer page. Open `results.html` for the artifact-backed results explainer. Open `playground.html` for the role/faucet playground plan. Open `lab.html` for the full builder workbench.

To create fresh local playground role wallets:

```sh
npm run playground:wallets
```

The command writes private TN12 testnet keys under `.local/playground/` and prints public `kaspatest:` role addresses.
If the local source wallet has a current funded UTXO, `npm run playground:funding-draft` builds a local-only multi-output funding draft under `.local/playground/` for those roles. By default it uses `TN12_WALLET=.local/tn12-wallet.json` and `FUNDING_OUTPOINT=fixtures/FundedWalletOutpoint.json`; override both when using your own funded TN12 source wallet.
The current public session records accepted role funding, two user-to-pool deposits, and a pool-to-user payout. Start at `playground.html` for clickable txids and the visual walk-through.
