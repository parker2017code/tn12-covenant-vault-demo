# Covenant Feature Coverage

Reviewed: 2026-05-12

This file answers one question: which covenant/vault features are actually
implemented, tested, demonstrated on TN12, local-only, or missing.

The current accomplishment is simple covenant primitives exercised end to end
on TN12, not advanced covenant products. See `docs/CONTRACT_DEPTH_MAP.md` for
the per-contract enforcement map and the active deeper-contract rail.

## External Baseline

Covenants usually mean transaction rules that restrict how a coin can be spent,
not only who can sign. Common features:

- fixed destination or destination whitelist,
- fixed amount, fee, or template shape,
- timelock or delayed withdrawal,
- recovery or clawback path,
- multi-role approval,
- refund and cancel paths,
- batch release or batch refund,
- spend caps or rate limits,
- state updates, partial withdrawals, or policy changes,
- app logic such as escrow, auctions, treasury spending, and pool settlement.

Useful references:

- Bitcoin Optech vault topic: https://bitcoinops.org/en/topics/vaults/
- Bitcoin covenant overview: https://www.spark.money/glossary/covenant
- Bitcoin timelocks: https://www.spark.money/research/bitcoin-timelocks-cltv-csv
- Plutus script purposes: https://plutus.cardano.intersectmbo.org/docs/working-with-scripts/script-purposes

## Implemented And Accepted On TN12

| Feature | TN12 status | Where |
|---|---|---|
| Owner delayed withdrawal | Accepted | `contracts/DelayedRecoveryVault.sil`, `artifacts/proof-evidence.json` |
| Recovery-key spend | Accepted | `contracts/DelayedRecoveryVault.sil`, `artifacts/proof-evidence.json` |
| Time/DAA-gated spend | Accepted | vault withdrawal, assurance refund, escrow refund, role-separated timed paths |
| Fixed P2PK destination | Accepted | proof records check destination output shape |
| Fixed output amount minus fee | Accepted | proof records and adversarial amount tests |
| Individual pledge release | Accepted | `contracts/AssurancePledge.sil`, `artifacts/proof-evidence.json` |
| Individual pledge refund | Accepted | `contracts/AssurancePledge.sil`, `artifacts/proof-evidence.json` |
| Escrow seller release | Accepted | `contracts/Escrow.sil`, `artifacts/proof-evidence.json` |
| Escrow buyer timeout refund | Accepted | `contracts/Escrow.sil`, `artifacts/proof-evidence.json` |
| Escrow buyer+seller cancel | Accepted | `contracts/Escrow.sil`, `artifacts/proof-evidence.json` |
| Role-separated vault, pledge, and escrow | Accepted | `artifacts/role-separated-proof-evidence.json` |
| Batch-assurance release output | Accepted | `artifacts/batch-assurance-release-evidence.json` |
| Auction settlement primitive | Accepted | `contracts/AuctionSettlement.sil`, `artifacts/proof-evidence.json` |

## Tested Locally Or As Rejection Evidence

| Feature | Status | Where |
|---|---|---|
| Wrong signer rejected/blocked | Negative guard | `artifacts/adversarial/*wrong-signer*.json`, `npm run check:negative` |
| Wrong entrypoint/selector rejected/blocked | Negative guard | `artifacts/adversarial/*wrong-selector*.json` |
| Wrong output lock rejected/blocked | Negative guard | `artifacts/adversarial/*wrong-output-lock*.json` |
| Wrong amount rejected/blocked | Negative guard | `artifacts/adversarial/*wrong-amount*.json` |
| Single-party escrow cancel blocked | Negative guard | `artifacts/adversarial/escrow-single-party-cancel.json` |
| 32 role-separated invalid candidates | Local review map | `artifacts/role-separated-invalid-candidates.json` |
| Treasury/team vault spend caps | Local model plus accepted under-cap TN12 spend | `artifacts/treasury-recurring-caps.json`, `npm run check:treasury` |
| Access pass issuer/gate checks | Local model | `artifacts/access-pass-gates.json`, `npm run check:access-pass` |

## Demonstrated App-State Around Covenants

These are real TN12 or replayed app-state rows. They are not extra covenant
opcodes.

| Feature | Status | Where |
|---|---|---|
| 40 accepted local-key transfer rows | TN12 accepted, local-key custody | `artifacts/defi-accepted-activity-ledger.json` |
| Complex DeFi role funding | TN12 accepted | `artifacts/complex-defi-multi-wallet-20260512-evidence.json` |
| Complex user deposits and pool payout | TN12 accepted | `artifacts/complex-defi-user-a-pool-deposit-20260512-evidence.json`, `artifacts/complex-defi-user-b-pool-deposit-20260512-evidence.json`, `artifacts/complex-defi-pool-user-b-payout-20260512-evidence.json` |
| Replay-derived balances | Indexer-derived | `artifacts/defi-scenario-reducer.json` |
| Scheduler intent, bids, execution, covenant payout | TN12 accepted plus indexer-derived trigger state and local payout rejects | `artifacts/scheduler-intent-registry.json`, `artifacts/scheduler-covenant-binding.json`, `artifacts/scheduler-covenant-payout-evidence.json`, `artifacts/scheduler-covenant-payout-negative-evidence.json` |
| Coordination market dossier | Evidence dossier plus accepted covenant release spends | `artifacts/coordination-market-evidence-dossier.json`, `artifacts/coordination-covenant-release-evidence.json` |

## Missing Or Not Productized

| Feature | Current state | What would make it real |
|---|---|---|
| Dynamic whitelists | Not implemented as script state | A covenant or wallet policy that proves the destination set and updates it safely |
| Recurring spend limits | Local-wallet TN12 evidence plus cap-window wallet-policy | Script-enforced cap with accepted positive and negative TN12 rows |
| Partial unvaulting | Not implemented | Spend path that lets part of an output leave while the rest stays locked |
| Policy update path | Not implemented | Explicit admin/recovery update transaction with delay and rejection tests |
| Guardian quorum / social recovery | Not implemented | Multi-signer recovery path with accepted and wrong-quorum negative evidence |
| User-wallet signing | Blocked | Real wallet returns signed bytes, submit succeeds, replay sees accepted txid |
| Autonomous AMM/lending/liquidation custody | Not implemented | Script or wallet policy controls settlement, not repo-held local keys |
| Mainnet activation | Blocked | Mainnet covenant support, review, wallet support, and production ops |

## Next Rails To Build

| Order | Feature | First build | Promotion target |
|---|---|---|---|
| 1 | Recurring spend limits | Accepted under-cap spend, cap-window state, and cumulative over-window block are built | Deeper `.sil` path that enforces cap amount and required destination |
| 2 | Dynamic whitelists | Wallet-policy destination-set artifact and UI check | Script or wallet-enforced destination set with off-list negative evidence |
| 3 | Guardian recovery | New guardian vault fixture | Accepted m-of-n recovery spend plus wrong/too-few guardian negative evidence |
| 4 | Partial unvaulting | New vault fixture with hot output plus relocked remainder | Accepted partial spend and replayed relock evidence |
| 5 | Policy update | Delayed admin/recovery update artifact | Accepted delayed update plus early-update rejection evidence |

The default first pass should use local TN12 wallets. That gives most of the
engineering proof with low overhead: address setup, signed draft, accepted
txid, replay, blocked bad case, UI evidence, and test coverage. The later
user-wallet pass proves custody UX without changing the core transaction route.

## Short Verdict

TN12 covers the simple covenant proof shape well: signatures, destinations,
amounts, delays, recovery, refund, cancel, role separation, batch release, and
negative guards.

It does not yet cover the richer wallet-vault product layer: dynamic
whitelists, recurring caps, partial unvaulting, policy updates, guardian
recovery, or user-wallet signing.
