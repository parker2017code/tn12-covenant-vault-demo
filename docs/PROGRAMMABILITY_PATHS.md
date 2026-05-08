# Programmability Paths

Reviewed: 2026-05-08

This repo tracks three build surfaces. They should not be merged into one claim.

## Toccata L1

Toccata is the surface this repo can test directly on TN12 now:

- native L1 covenant programming;
- Silverscript contract compilation;
- covenant IDs and lineage;
- zk verification and sequencing foundations;
- accepted transaction and payload indexing.

This is the right surface for vaults, escrow, assurance contracts, wallet-reviewed transaction drafts, and durable accepted-state indexing.

## Based Rollups

A based rollup does not replace the L1 covenant work. It adds a richer execution surface around it.

For this project, a based rollup matters because it can support app logic that is awkward to express as direct UTXO covenant flows:

- EVM-style apps and familiar developer tooling;
- swaps, lending, auctions, games, and more complex state machines;
- stable-value and asset workflows that need richer execution;
- rollup-side UX with Kaspa ordering, settlement, or proof links.

Building on an available based-rollup stack is realistic. Building our own serious stack is a separate infrastructure project: execution, state commitments, prover path, bridge safety, indexer, explorer, wallet UX, and audits.

## vProgs

vProgs are the longer native verifiable-program direction. Current public material frames Toccata as a step toward that path, not the final form.

The useful planning distinction:

- standalone zk applications can arrive before full synchronous composition;
- canonical KAS bridge and native-asset / inter-covenant communication are separate milestones;
- proving should eventually scale with the app's activity, not total DAG activity;
- full synchronous composability remains roadmap until the runtime and protocol interfaces are testable.

## Repo Rule

Build in this order:

1. Keep L1 covenant proofs and payload app state working on TN12.
2. Finish wallet-reviewed submit and durable indexing.
3. Build real accepted pledge-output custody for batch assurance.
4. Add based-rollup scouting: endpoints, tooling, bridge model, wallet path, and one tiny app.
5. Add vProg readiness only as public inputs, state roots, bridge exits, native-asset assumptions, and inter-covenant assumptions.

Do not call a planner, simulator, or rollup experiment a protocol guarantee. Label each surface by what is actually verified.

## Current Repo Action

Run:

```sh
npm run rollup:scout
```

This writes `artifacts/based-rollup-scout.json`. It is the current project map for Maxim's PoC, Hans' runtime work, Michael's roadmap framing, and the next scouting tasks.
