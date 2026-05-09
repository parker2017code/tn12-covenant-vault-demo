# Core Lab Notes

Reviewed: 2026-05-09

This is the concise reading of the repo. The useful core is TN12 evidence and debugging notes. The rest is scaffolding unless it leads to another accepted transaction, a stricter check, or a clearer boundary.

## What is real

- Seven original TN12 covenant spends were accepted: vault recovery, vault delayed withdrawal, assurance release, assurance refund, escrow release, escrow DAA-score refund, and escrow mutual cancel.
- Seven role-separated positive paths were accepted after the repo stopped using one saved wallet for every role: vault recovery/withdrawal, assurance release/refund, and escrow release/refund/cancel.
- Twenty-six TN12 JSON wRPC payload events were accepted and matched by the app-state indexer.
- One batch-assurance pledge funding transaction was accepted with three amount-matched outputs: 45, 35, and 20 TKAS. Those outputs now satisfy the custody-import gate.
- The enforcement matrix is useful because it says which claims are script-enforced, planner/indexer, wallet-policy, simulation, documentation, or research.

## Debugging notes worth preserving

- Escrow cancel needed the TN12 transaction version 1 shape with `computeBudget=30` through local `kaspa-wasm 1.1.1-toc.1`.
- A bad `sigOpCount` setting produced a misleading script-unit failure. The accepted v1 route uses `computeBudget`, not v0-style `sigOpCount` for the covenant input.
- Timelocks that were treated like Unix seconds failed. The accepted timed paths use DAA-score style lock values.
- The public TN12 REST submit route is unsuitable for payload receipt proofs because it accepted a transaction while dropping payload bytes. JSON wRPC preserved payload bytes.
- Custody checks must key by full outpoint, not txid alone. One accepted transaction can carry several distinct pledge outputs.

## What is scaffolding

- The app lanes, priority queue, research library, DeFi backlog, prediction simulator, stable-value paths, AI-agent board, and coordination-market toy model are not products.
- Most of those artifacts are JSON fixture transforms. They are useful only when they keep language honest, expose a missing rail, or drive the next concrete TN12 transaction.
- Public-facing copy should lead with accepted txids and SDK lessons. Roadmap material should stay short and secondary.

## Current next work

1. Build signed batch-assurance release/refund drafts from the accepted 45/35/20 TKAS pledge outputs.
2. Keep wallet-submit work focused on a real no-local-key connector, not more handoff prose.
3. Keep durable indexing focused on live virtual-chain ingestion and rollback replay, not more fixture reshaping.
4. Reduce public language that makes scaffolding sound like product surface.
