# TN12 Covenant Lab

A Kaspa TN12 testnet workspace for covenant scripts, payload receipts, and the debugging record needed to reproduce them. All keys and funds are testnet-only. Not a mainnet wallet. Not proof that Toccata covenants are live on mainnet.

When you ask how complete the project is, the percentage should be read as mainnet deployment readiness unless the answer explicitly says it is only talking about TN12 proof-core progress.

## What is accepted on TN12

| Primitive | Contract | Status | Txid |
|---|---|---|---|
| Vault recovery | `DelayedRecoveryVault.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Vault delayed withdrawal | `DelayedRecoveryVault.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Assurance release | `AssurancePledge.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Assurance refund | `AssurancePledge.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Escrow release | `Escrow.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Escrow DAA-score refund | `EscrowExpired.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Escrow mutual cancel | `Escrow.sil` | `TN12_ACCEPTED` | see `artifacts/proof-evidence.json` |
| Role-separated positive paths (all 7) | all contracts | `TN12_ACCEPTED` | see `artifacts/role-separated-proof-evidence.json` |
| Batch-assurance 3-pledge release | `AssurancePledge.sil` × 3 | `TN12_ACCEPTED` | `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801` |
| 30 payload events (invoice, multi-wallet DeFi v1 live receipts, access-pass, auction, attestation, agent, etc.) | payload tx | `TN12_ACCEPTED` | see `fixtures/PayloadEventEvidence.json` |
| Adversarial rejection — wrong-signer (3 cases) | all 3 contracts | `TN12_REJECTED` | see `artifacts/adversarial/adversarial-summary.json` |
| Adversarial rejection — wrong-selector (3 cases) | all 3 contracts | `TN12_REJECTED` | see `artifacts/adversarial/adversarial-summary.json` |
| Adversarial rejection — wrong-output-lock (3 cases) | all 3 contracts | `TN12_REJECTED` | see `artifacts/adversarial/adversarial-summary.json` |
| Adversarial rejection — wrong-output-amount (3 cases) | all 3 contracts | `TN12_REJECTED` | see `artifacts/adversarial/adversarial-summary.json` |
| Adversarial rejection — single-party escrow cancel | `Escrow.sil` | `TN12_REJECTED` | see `artifacts/adversarial/escrow-single-party-cancel.json` |

## What is NOT proven

- Mainnet covenant activation — covenant paths are `TN12/TOCCATA` lane only.
- Pooled threshold enforcement on-chain — batch target aggregation is `PLANNER_ONLY`.
- External wallet signing — all accepted proofs used local keys. Wallet connector is `SIGNED_NOT_BROADCAST` / planning only.
- Historical virtual-chain replay — `getVirtualChainFromBlockV2` requires the TN12 SDK build (`1.1.1-toc.1`); installed `kaspa-wasm` does not expose it.
- Full DeFi — the repo has accepted TN12 receipts and covenant proof primitives, but not AMM/lending/liquidation/oracle/custody production rails.

## Verify existing proofs

```sh
npm install
npm run check:all        # local gate: scripts, artifacts, UI smoke
npm run check:tn12       # full TN12 evidence gate
npm run tx:verify        # fetch and verify all accepted proof txids
npm run proof:evidence   # print accepted proof table
```

If these pass, you have verified the existing accepted evidence. You have not created a new covenant spend.

## Current blockers (in priority order)

| Blocker | What I do | What you do |
|---|---|---|
| External signer roundtrip | Wire the live wallet connector, preserve tx bytes, validate accepted replay | Only provide wallet access or a deployment decision if you want a specific signer path tested |
| Virtual-chain promotion | Test the live TN12 reader and prove checkpoint overlap plus reducer matching before promotion | Only provide a target start hash or a required replay window if you want a specific promotion test |
| Batch-assurance settle path | Pick and exercise one mutually exclusive settlement path end to end | Only choose release vs refund if you want that lane submitted |

1. **External signer roundtrip** — `artifacts/wallet-external-signer-roundtrip-plan.json` has 4 requests ready; local signer simulation in progress.
2. **Virtual-chain live indexer** — operational with local TN12 wasm build. `KASPA_WASM_MODULE=.../kaspa npm run indexer:live-window` calls `getVirtualChainFromBlockV2`, produces 46+ accepted-tx rows, forward-indexing capable. Checkpoint overlap with historic proofs not expected (near-tip only); see `artifacts/virtual-chain-live-app-state.json`.

## Deeper docs

| What you need | Where |
|---|---|
| Full accepted evidence with txids | `docs/CORE_LAB_NOTES.md` |
| Lane-by-lane build state | `docs/PROGRESS.md` |
| Shipped vs roadmap lane map | `docs/ROADMAP_STATE.md` |
| TN12 tested / not-tested map | `docs/TN12_TEST_MATRIX.md` |
| Debugging lessons (sigOpCount, computeBudget, DAA locks, payload route) | `docs/BUILDER_LESSONS.md` |
| Claim boundaries (what not to call this) | `docs/LLM_REVIEW_GUIDE.md` |
| Full lab notebook (original long README) | `docs/LAB_NOTEBOOK.md` |
| Canonical mainnet readiness summary | `MAINNET_READINESS.md` |
| AI/source discipline rules | `docs/AI_CODING_SOURCE_DISCIPLINE.md` |
| Priority queue (30 tasks) | `npm run project:queue` → `artifacts/next-work-queue.json` |
| Current 10-task execution slice | `npm run project:next-ten-status` → `artifacts/next-ten-execution-status.json` |
| DeFi receipt duplicate/stale guard | `npm run defi:receipt-guard` → `artifacts/defi-receipt-replay-guard.json` |

## Status labels used in this repo

| Label | Meaning |
|---|---|
| `TN12_ACCEPTED` | Transaction accepted on kaspa-testnet-12, verified by txid |
| `TN12_REJECTED` | Transaction rejected by kaspa-testnet-12 node (adversarial negative-path evidence) |
| `SIGNED_NOT_BROADCAST` | Signed locally, not submitted |
| `LOCAL_TEST_ONLY` | Script or artifact test only, no TN12 transaction |
| `PLANNER_ONLY` | App/indexer-layer logic, no on-chain enforcement |
| `WALLET_POLICY_ONLY` | Enforced by wallet convention, not by script |
| `RESEARCH_ONLY` | No build yet, conceptual lane |
| `MAINNET_APP_LAYER_CANDIDATE` | Usable on mainnet with standard tx/indexer work |
| `MAINNET_BLOCKED` | Waiting on Toccata activation or external tooling |

## Local preview

```sh
npm run serve   # starts on http://127.0.0.1:4176
```
