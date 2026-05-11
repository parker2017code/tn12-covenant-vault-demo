# Roadmap State

Reviewed: 2026-05-10

The repo should read as proof-first, not plan-first. Use generated artifacts for broad planning; keep prose short.

## Working Rails

| Rail | Current state | Next proof |
|---|---|---|
| Covenants | Vault, assurance, escrow, and role-separated paths accepted on TN12 | Fresh external-signer covenant spend |
| Payload receipts | 34 accepted payload events, including seven DeFi v1 receipts and one agent release wallet-review event | External-signer payload receipt |
| Batch assurance | Accepted pledge outputs and accepted release | Keep refund alternates non-selected; next signer work uses fresh requests |
| Replay/indexer | Checkpoint, live overlap, durable promotion guard | Live removed-block rollback evidence |
| Wallet submit | Review package, request templates, result validation | Real wallet-approved signed tx |

## Research Rails

Keep these out of proof language until they get accepted evidence or a working custody/indexer path:

- AMM / swaps / lending / liquidation.
- Prediction and hedge settlement.
- Stable-value issuance beyond issuer-indexed payload state.
- Bridges, source-chain anchors, vProgs, and ZK app execution.
- Coordination-market mechanisms beyond transparent planner demos.

## Priority Queue

Use artifacts instead of prose plans:

- `artifacts/next-work-queue.json`: ordered broad queue.
- `artifacts/next-ten-execution-status.json`: current 10-task slice.
- `artifacts/proven-status.json`: compact accepted-evidence, blocker, and percent boundary.
- `artifacts/operator-receipt-pack.json`: accepted evidence plus local-wallet command path.
- `artifacts/missing-rails-matrix.json`: missing DeFi/product rails.
- `artifacts/rail-research-triggers.json`: when to do deeper research.
- `artifacts/oracle-source-matrix.json`: oracle/source assumptions.

## Build Rule

Do not add another broad app lane unless it can attach to one of these verticals:

1. Payload receipt app.
2. Escrow/assurance covenant app.
3. Attestation/agent/prediction simulator.

Everything else stays an artifact, test, or short note until it has accepted evidence.
