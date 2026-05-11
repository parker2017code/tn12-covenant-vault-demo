# Programmability Paths

Reviewed: 2026-05-08

This repo tracks four build surfaces. Use direct product labels instead of vague roadmap language.

## Money Rails

This is the live-product starting point:

- tKAS funding and explorer-checkable transfers;
- transaction payload receipts;
- accepted transaction replay;
- wallet and indexer UX;
- app state derived from accepted evidence.

This is the right surface for invoices, access-pass receipts, funding walkthroughs, role-wallet demos, and the first user-run playground flows.

## Toccata L1

Toccata is the surface this repo can test directly on TN12 now:

- native L1 covenant programming;
- Silverscript contract compilation;
- covenant IDs and lineage;
- zk verification and sequencing foundations;
- accepted transaction and payload indexing.

This is the right surface for vaults, escrow, assurance contracts, wallet-reviewed transaction drafts, and durable accepted-state indexing.

## Based Apps

A based app does not replace L1 covenant work. It adds richer app state around Kaspa ordering, commitments, proofs, settlement, and replay.

For this project, based-app prototypes are already in scope:

- DeFi reducers and blocked withdrawals;
- auctions and intents;
- coordination/Stag packs;
- agent commitments;
- access-pass and issuer/indexer state;
- scheduler receipts and covenant-binding app state.

ZK is one verification path for based apps, not the definition of every based app. A simple prototype can start with accepted transactions plus deterministic replay. A stronger based-zk app adds proof verification, state roots, exits, bridge safety, wallet UX, and audits.

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
5. Add based-zk/vProg readiness only as public inputs, state roots, bridge exits, native-asset assumptions, and inter-covenant assumptions.

Label each surface by what backs it: accepted transaction evidence, deterministic replay, script enforcement, wallet policy, or research prototype.

## Current Repo Action

Run:

```sh
npm run rollup:scout
```

This writes `artifacts/based-rollup-scout.json`. It is the current scouting map for based execution stacks, Hans' runtime work, Michael's roadmap framing, and the next tiny app tasks.
