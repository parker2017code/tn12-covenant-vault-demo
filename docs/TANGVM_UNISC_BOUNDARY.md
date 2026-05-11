# TangVM / Universal Scheduler Boundary

Reviewed: 2026-05-11

This repo can prototype pieces that point toward event-driven Kaspa apps. It does not implement TangVM, a protocol universal scheduler, miner oracle consensus, or full vProgs.

## Upstream Context

`kaspanet/vprogs` is a real early-development Rust monorepo for based computation on Kaspa: `https://github.com/kaspanet/vprogs`. Its public README describes a transaction scheduler, execution runtime, storage management, and layers for `core`, `storage`, `state`, `scheduling`, `transaction-runtime`, `node`, and `zk`.

That matters for this repo because we should align artifact shapes with scheduler/runtime concepts where useful. It does not mean this TN12 lab is itself the vProgs runtime.

## Working Definition

Universal scheduler / UniSc:
- A scheduler for event-dependent programs.
- Programs declare conditions over public variables, event values, accepted transactions, or app state.
- Watchers, operators, or automators compete or qualify to trigger the next action.
- The scheduler defines when triggers are eligible, how execution rights are assigned, and how bad or stale triggers are rejected.

TangVM:
- An application construct for programs whose state depends on external events or continuously updated variables.
- The envisioned stack includes event attestations, trigger rules, scheduler economics, and automated conditional execution.
- It is not proven here and should not be described as live in this repo.

## What This Repo Already Has

| Piece | Current TN12 Evidence | Label |
|---|---|---|
| Fast ordered receipts | 36 accepted payload events and 49 checkpointed records | `TN12_ACCEPTED` / `INDEXER_DERIVED` |
| Attestation-like payloads | Miner/watcher signal and prediction/agent payload receipts | `TN12_ACCEPTED` / `INDEXER_DERIVED` |
| Local replay state | Checkpoint, fixture replay, virtual-chain ingestion, durable replay guard | `INDEXER_DERIVED` |
| Trigger-like review rows | DeFi reducer blocks stale oracle, slippage, duplicate, liquidation, and custody-promotion rows | `PLANNER_ONLY` / `INDEXER_DERIVED` |
| Real local-key activity | Multi-wallet funding, pool deposits, pool payouts, and scheduler execution payout accepted on TN12 | `LOCAL_KEY_CUSTODY_TEST` |
| Covenant primitives | Vault, pledge, and escrow proof spends accepted on TN12 | `SCRIPT_ENFORCED` where the script actually constrains the spend |

## What We Can Build Next

| Prototype Slice | Done When | Label |
|---|---|---|
| Scheduler intent registry | Accepted payloads register trigger intents with subject, condition, deadline, bidder, and target action. | `TN12_ACCEPTED` / `INDEXER_DERIVED` |
| Trigger eligibility reducer | Repo reducer selects eligible triggers and rejects stale, duplicate, low-bid, wrong-event, or wrong-state triggers. | `INDEXER_DERIVED` |
| Scheduler auction artifact | Multiple trigger bids compete for execution rights under deterministic rules. | `PLANNER_ONLY` until enforced |
| Execution receipt | Accepted TN12 payload marks which trigger executed and which state/output it targeted. | `TN12_ACCEPTED` / `INDEXER_DERIVED` |
| Custody-adjacent execution | Local-key wallet transfers TKAS according to the selected trigger. | `LOCAL_KEY_CUSTODY_TEST` |
| Covenant-bound trigger | A trigger routes into an existing vault, pledge, or escrow primitive where the script enforces the narrow spend rule. | `SCRIPT_ENFORCED` for the primitive only |

## What Remains Out Of Scope

- No protocol-level scheduler.
- No miner-majority oracle agreement.
- No autonomous callbacks.
- No TangVM runtime.
- No full vProgs.
- No production custody.
- No guarantee that a trigger's external fact is true.

## Reviewer Rule

Use precise language:

- Say: "TN12 accepted event receipts plus indexer-derived scheduler prototype."
- Say: "local-key custody execution."
- Say: "aligned with upstream vProgs scheduler/runtime concepts."
- Do not say: "TangVM is implemented."
- Do not say: "universal scheduler is live."
- Do not say: "miner oracle consensus is proven."
