# Audit Map

Short path for an independent reviewer. This is the canonical claim file. It maps public claims to evidence, commands, status labels, and enforcement class. See `docs/CLAIM_VOCABULARY.md` for label definitions.

## Reviewer Commands

```sh
npm ci
npm run check:tn12
npm run operator:refresh
```

`npm run operator:refresh` is the broadest local command. It verifies public TN12 evidence, rebuilds derived indexer/operator artifacts, and reruns local checks. Reviewers who want the narrow path can stop after `npm run check:tn12`.

## Claim Map

| Claim | Status | Enforcement | Evidence | Command |
|---|---|---|---|---|
| Minimal delayed owner/recovery vault paths have accepted TN12 proof spends. | `TN12_ACCEPTED` | `SCRIPT_ENFORCED` for owner/recovery signatures, DAA/time lock, fixed output value, and owner/recovery P2PK destination. Daily limits, guardians, request/cancel lifecycle, and arbitrary destination policy are `PLANNER_ONLY` or `WALLET_POLICY`. | `artifacts/proof-evidence.json`, `docs/PROOF_INDEX.md`, `contracts/DelayedRecoveryVault.sil` | `npm run proof:records` |
| Individual pledge release/refund primitive paths have accepted TN12 proof spends. | `TN12_ACCEPTED` | `SCRIPT_ENFORCED` for recipient release output and contributor refund after deadline. Pooled target aggregation and campaign-level release decision are `PLANNER_ONLY` / `INDEXER_DERIVED`. | `artifacts/proof-evidence.json`, `docs/PROOF_INDEX.md`, `contracts/AssurancePledge.sil` | `npm run proof:records` |
| Buyer-controlled escrow primitive paths have accepted TN12 proof spends. | `TN12_ACCEPTED` | `SCRIPT_ENFORCED` for buyer release to seller, buyer timeout refund, and buyer+seller cancel. Arbiter/dispute adjudication is not in `Escrow.sil`. | `artifacts/proof-evidence.json`, `docs/TN12_TEST_MATRIX.md`, `contracts/Escrow.sil` | `npm run proof:records` |
| Role-separated vault, assurance, and escrow paths have accepted TN12 proof spends. | `TN12_ACCEPTED` | `SCRIPT_ENFORCED` for the same primitive paths under distinct-role fixtures. | `artifacts/role-separated-proof-evidence.json` | `npm run roles:proof:evidence` |
| Payload receipts are accepted and indexed as app state. | `TN12_ACCEPTED` | `INDEXER_DERIVED`; payload bytes are accepted, app meaning is repo/indexer interpretation. | `fixtures/PayloadEventEvidence.json`, `artifacts/checkpointed-accepted-index.json` | `npm run payload:verify:events` |
| Local-key DeFi users and pool/operator wallets execute funding, deposits, and payouts on TN12. | `TN12_ACCEPTED` | `LOCAL_KEY_CUSTODY_TEST`; transactions move real testnet TKAS between local wallets, but custody is operator/local-key controlled and not autonomous AMM/liquidation enforcement. | `artifacts/defi-accepted-activity-ledger.json`, `artifacts/tn12-defi-local-users-funding-001-evidence.json`, `artifacts/tn12-defi-user-01-pool-deposit-001-evidence.json` | `npm run defi:accepted-activity` |
| Operator receipt pack is clean and current. | `LOCAL_TEST_ONLY` | `INDEXER_DERIVED`; it packages accepted evidence and local replay state. | `artifacts/operator-receipt-pack.json` | `npm run project:operator-pack` |
| Full refresh path is repeatable from the repo. | `LOCAL_TEST_ONLY` | `LOCAL_TEST_ONLY`; it verifies, rebuilds, and smoke-tests repo artifacts. | `artifacts/proven-status.json`, `artifacts/operator-receipt-pack.json` | `npm run operator:refresh` |
| Wrong-signer, wrong-selector, wrong-output, wrong-amount, and invalid cancel attempts are rejected. | `TN12_REJECTED` | `SCRIPT_ENFORCED` where rejection is broadcast evidence; otherwise local negative guard. | `artifacts/adversarial/adversarial-summary.json` | `npm run check:negative` |
| External wallet signing is ready for mainnet-style custody. | `MAINNET_BLOCKED` | `WALLET_POLICY`; request templates exist, but no real wallet-approved signed bytes are accepted yet. | `artifacts/external-signer-path-research.json` | `npm run wallet:external-signer-research` |
| One payload receipt request is ready for external-signer review. | `LOCAL_TEST_ONLY` | `WALLET_POLICY`; unsigned request is extracted, but no signer result or accepted txid exists. | `artifacts/external-signer-payload-request.json` | `npm run wallet:external-signer-payload-request` |
| Live removed-block rollback promotion is ready for public use. | `MAINNET_BLOCKED` | `INDEXER_DERIVED`; local replay guard exists, live removed-block evidence is still missing. | `artifacts/durable-replay-promotion-guard.json` | `npm run indexer:durable-promotion-guard` |
| AMM, lending, liquidation, oracle, bridge, and full DeFi are live. | `PLANNER_ONLY` | `PLANNER_ONLY` / research for market semantics. Accepted local-key transfers now cover custody-adjacent activity, but AMM pricing, oracle truth, liquidation authority, autonomous custody, bridge validity, and external signing remain unenforced by script. | `artifacts/defi-artifact-manifest.json`, `artifacts/defi-accepted-activity-ledger.json`, `artifacts/defi-planner-simulation.json`, `artifacts/defi-scenario-simulation.json`, `artifacts/defi-scenario-reducer.json`, `artifacts/defi-advanced-simulation.json`, `artifacts/defi-multi-wallet-scenario-pack.json`, `artifacts/defi-backlog.json`, `artifacts/missing-rails-matrix.json`, `artifacts/oracle-source-matrix.json` | `npm run defi:refresh` |
| Full DeFi benchmark progress is 60% in this repo-local model. | `INDEXER_DERIVED` | The benchmark is a weighted repo-local roadmap, not production readiness. It marks accepted proof, receipts, local-key custody, scheduler execution, covenant binding, and deterministic replay as complete; external signer, live rollback evidence, AMM/lending/liquidation custody execution, and mainnet activation remain incomplete. | `artifacts/full-defi-benchmark.json` | `npm run defi:benchmark` |
| A public playground can let people perform real TN12 actions safely. | `LOCAL_TEST_ONLY` | The playground plan targets real TN12 session wallets, faucet funding, payload receipts, deposits, payouts, scheduler rows, verification, and replay. It forbids shared committed private keys and does not imply production custody or mainnet readiness. | `artifacts/playground-plan.json` | `npm run playground:plan` |
| TangVM, universal scheduler, or miner oracle consensus is implemented. | `RESEARCH_ONLY` | `INDEXER_DERIVED` pieces exist for receipts, attestations, replay, and trigger-like reducers. No protocol scheduler, TangVM runtime, autonomous callback system, or miner-majority oracle agreement is implemented here. | `docs/TANGVM_UNISC_BOUNDARY.md`, `artifacts/defi-scenario-reducer.json`, `artifacts/payload-miner-attestation-evidence.json` | `npm run defi:refresh` |
| Scheduler trigger intents can be registered, bid-ranked, and executed from accepted TN12 evidence. | `TN12_ACCEPTED` | `INDEXER_DERIVED` plus `PLANNER_ONLY` auction rows; accepted payloads register intent, bids, and execution; the reducer checks execution state; and local-key payout evidence matches the receipt. This is not protocol scheduling. | `artifacts/scheduler-intent-registry.json`, `artifacts/payload-scheduler-intent-pool-rebalance-001-evidence.json`, `artifacts/payload-scheduler-bid-fast-executor-001-evidence.json`, `artifacts/payload-scheduler-execution-receipt-001-evidence.json`, `artifacts/tn12-scheduler-execution-payout-user-03-evidence.json`, `docs/TANGVM_UNISC_BOUNDARY.md` | `npm run scheduler:intents` |
| Scheduler intent state can reference an accepted covenant primitive without upgrading the scheduler into script enforcement. | `TN12_ACCEPTED` | `INDEXER_DERIVED`; the binding payload is accepted and references an accepted vault recovery proof row. Only the referenced primitive has script-enforced semantics. | `artifacts/scheduler-covenant-binding.json`, `artifacts/payload-scheduler-covenant-binding-vault-001-evidence.json`, `artifacts/proof-evidence.json` | `npm run scheduler:covenant-binding` |

## Status Labels

| Label | Meaning |
|---|---|
| `TN12_ACCEPTED` | A public TN12 transaction or payload event is accepted and checked by repo commands. |
| `TN12_REJECTED` | A negative/adversarial path is rejected or locally guarded as expected. |
| `LOCAL_TEST_ONLY` | The repo can reproduce the behavior locally, but it is not a no-local-key wallet or production flow. |
| `LOCAL_KEY_CUSTODY_TEST` | Real TN12 testnet funds move under repo-held local keys; useful for custody-adjacent testing, not production custody. |
| `PLANNER_ONLY` | The artifact is design, routing, or research state without accepted settlement evidence. |
| `MAINNET_BLOCKED` | The lane needs mainnet activation, external signing, production indexer behavior, or another named rail. |

## Enforcement Labels

| Label | Meaning |
|---|---|
| `SCRIPT_ENFORCED` | A Silverscript/TN12 spend path constrains the transaction directly. |
| `INDEXER_DERIVED` | Repo logic derives state from accepted transactions, payload bytes, or replay artifacts. |
| `WALLET_POLICY` | The behavior depends on wallet review, signing UX, custody, or operator policy. |
| `PLANNER_ONLY` | The behavior is a plan, simulator, UI field, or artifact without script enforcement. |

## Primitive Names

The compiled contract names remain stable for artifact compatibility, but reviewer wording should use these narrower names:

| Artifact Name | Reviewer Name |
|---|---|
| `DelayedRecoveryVault.sil` | minimal delayed owner/recovery vault primitive |
| `AssurancePledge.sil` | individual pledge release/refund primitive |
| `Escrow.sil` | buyer-controlled escrow primitive |
