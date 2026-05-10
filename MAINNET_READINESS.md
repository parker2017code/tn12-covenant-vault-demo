# Mainnet Readiness

Reviewed: 2026-05-10

This document is the canonical place for mainnet deployment readiness, not TN12 proof-core progress. When a percentage appears anywhere in this repo, read it as mainnet deployment readiness unless the line explicitly says it is TN12 proof-core only.

## Current estimate

- Mainnet deployment readiness: about 45%
- After the current repo-verifiable sweep lands: about 55-60%
- After live external signer plus live replay overlap plus one live settlement path: about 70-75%

## What is proven live on TN12

- Accepted covenant proof spends for vault recovery, vault delayed withdrawal, assurance release/refund, escrow release, escrow DAA-score refund, escrow mutual cancel, and role-separated positive paths.
- Accepted payload-state evidence for invoice, access-pass, auction, attestation, agent, prediction/hedge, stable-value issuer, and batch-assurance planner records.
- Verified public TN12 wRPC endpoint at `ws://tn12-node.kaspa.com:17210` using Borsh.
- Bounded live virtual-chain reads are reachable from the endpoint, including a checkpoint-derived start hash that returned 13,968 accepted transactions and 1,116 payload transactions. That window still produced zero checkpoint overlap, so it is live evidence of reachability and replay shape, not app-state promotion. An earlier checkpoint accepting block hash (`4c70d51f67ea293b54a3cfaebfc2c9a474b16ea371b297be95a07905007c2a25`) was not findable by the public endpoint, which leaves historical overlap blocked on reachable-window coverage.

## What is repo-only

- Wallet connector request bundles, submit ledgers, result validators, unsigned request templates, and the external-signer gap/template artifacts.
- Batch-assurance release and refund drafts.
- Escrow marketplace action maps and flow models.
- Durable indexer replay plans and bounded live-window adapter artifacts.
- Treasury spend-cap, access-pass, auction, agent, attestation, and invoice hardening artifacts.

## What is mock-only

- The wallet external signer stub and review-only signer simulations.
- Signed-local wallet drafts and ledger rows.
- UI-only or planner-only settlement and retry surfaces.

## Current blockers

| Blocker | Why it blocks mainnet readiness | What would clear it |
|---|---|---|
| Live external signer round trip | Proves the wallet path can hand off exact transaction bytes without this repo holding keys | One real unsigned/partial request, one signer return, one payload-preserving submit, one accepted replay |
| Live replay overlap | Proves live indexer promotion can safely overlap the known checkpoint window | A live window that overlaps the checkpoint and passes rollback/payload/proof matching |
| Batch-assurance settle choice | Proves one mutually exclusive settlement path end to end instead of leaving both modeled | An explicit decision plus one accepted submit path and one preserved alternate path as non-selected |
| Escrow marketplace demo | Proves the accepted escrow primitives can be shown as a usable product slice | A clean demo that moves through funding and one selected settlement path |
| Wallet/indexer hardening | Mainnet deployment needs operational reliability, not more proof artifacts | Better submit validation, replay safety, and state promotion rules |

## What I can do without user input

- Inspect repo artifacts, docs, checks, and replay assumptions
- Update status docs and canonical readiness notes
- Recommend a technical order for batch-assurance and wallet lanes
- Harden tests, guards, and claim boundaries

## What may need user input

- A real wallet or signer path to test, if you want a true external-signer round trip
- A specific replay start hash or overlap window, if you want a targeted live overlap test
- An explicit batch-assurance choice, if you want one settlement path submitted

## Recommended next order

1. External signer round trip.
2. Live replay overlap.
3. One batch-assurance settlement path.
4. Escrow marketplace demo.
5. Treasury / access-pass / auction / agent / attestation hardening.
