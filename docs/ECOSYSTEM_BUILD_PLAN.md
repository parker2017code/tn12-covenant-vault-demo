# Ecosystem Build Plan

This repo is a TN12 proof/app-state lab. It should read as evidence first, plan second.

Source boundary:

- `kaspa-explained` is public research copy.
- This repo is engineering evidence: fixtures, artifacts, txids, gates, and handoff notes.
- Other-chain apps are research inputs, not proof that Kaspa supports the same execution model.

## Status Lanes

| Lane | Use it for | Do not claim |
|---|---|---|
| Live Kaspa | payments, payload receipts, wallets, explorers, KRC/indexer workflows | native smart contracts |
| TN12/Toccata | covenant proof spends, vault/assurance/escrow demos, role-separated scripts | mainnet product readiness |
| App-state/indexer | accepted tx reducers, checkpoint/replay, UI state from txids | consensus enforcement |
| Research | DeFi, oracles, Based Apps, vProgs, RTD/miner signals | shipped infrastructure |

## Built Evidence

| Rail | Current evidence |
|---|---|
| Vault | accepted recovery and delayed-withdrawal proof txs |
| Assurance | accepted release and refund proof txs |
| Escrow | accepted release, DAA refund, and mutual cancel proof txs |
| Role separation | seven accepted distinct-role positive paths |
| Payload receipts | accepted payload events and reducer checks |
| Batch assurance | accepted pledge outputs and accepted 3-pledge release output |
| Auction | accepted bid/settlement planner payloads and one accepted settlement tx |
| Access passes | accepted issue/redeem payload events |
| Stable-value planner | accepted issuer/redemption planner payload events |
| Agents | accepted task, proof, release, and dispute payload events |
| Indexer | 53 accepted matched checkpoint records |

Primary artifacts:

```txt
artifacts/proof-evidence.json
artifacts/role-separated-proof-evidence.json
artifacts/checkpointed-accepted-index.json
artifacts/batch-assurance-operator-decision.json
artifacts/next-ten-execution-status.json
```

## Current Blockers

- External signer: request templates exist; no real user-approved signed return yet.
- Live rollback: local replay/rollback fixtures pass; live removed-block evidence is still missing.
- Product hardening: wallet UX, monitoring, recovery, index storage, and operator controls are not production-grade.
- Full DeFi: no AMM, lending, liquidation, oracle, bridge, or production custody rail.

## Build Order

1. External signer round trip.
2. Live virtual-chain rollback evidence.
3. Auction custody settlement/refund vertical.
4. Agent task release/refund vertical.
5. Escrow marketplace demo wiring.
6. Durable index storage and replay promotion guard.
7. Treasury constrained-spend proof.
8. Access-pass issuer/redeemer UI.
9. DeFi missing-rails artifact updates only after evidence changes.
10. Public copy cleanup to keep proof claims short.

## Completion Standard

An app lane is real enough to promote only when it has:

1. a status label;
2. a fixture or source event;
3. a generated artifact;
4. a gate in `npm run check` or a named targeted command;
5. accepted TN12 evidence when the claim is about live acceptance;
6. indexer/replay state when the claim is about app state;
7. no private key exposure;
8. clear wallet/operator action.

## Commands

Use these instead of prose status when possible:

```sh
npm run check:all
npm run check:tn12
npm run project:next-ten-status
npm run project:queue
npm run rails:missing
npm run mainnet:readiness
```

## Guardrails

- Do not describe planner state as protocol enforcement.
- Do not describe local signing as wallet readiness.
- Do not describe TN12 acceptance as mainnet readiness.
- Do not describe research backlog as built DeFi.
- Keep based-rollup, vProg, oracle, RTD, and miner-signal claims in research lanes until artifacts and gates change.
