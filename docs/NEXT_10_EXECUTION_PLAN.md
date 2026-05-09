# Next 10 Execution Plan

Reviewed: 2026-05-09

This is the working order after the first five rail tasks landed. The rule is plain: build the wallet and indexer rails first, then push custody and settlement surfaces through those rails.

## Ten Tasks

1. Live wallet connector submit without local keys.
2. Durable node/RPC virtual-chain indexer.
3. Batch-assurance settlement-path review and submit decision.
4. Escrow marketplace/freelance flow on the accepted proof base.
5. Attestation signer provenance, reputation, quorum, and stale-signal thresholds.
6. Auction settlement/refund custody review.
7. Agent-task release/refund/hold custody review.
8. Treasury payroll and delayed-withdrawal role/source review.
9. Invoice mainnet-readiness brief.
10. Access-pass expiry and issuer review.

## Current Build Slices

- Wallet slice: `npm run wallet:implementation-slice`.
- Indexer slice: `npm run indexer:endpoint-runbook`.
- Settlement slice: `npm run campaign:submit-runbook`.
- Combined queue slice: `npm run project:next-ten`.

## Done For This Batch

- The queue names the next ten in one order.
- Tasks 6-10 now have review artifacts and checks.
- Public wording uses accepted evidence, working rails, and next dependency language.

## Next Commit Target

The next substantial commit should pick one of:

- wallet: map unsigned templates into a real PSKB/PSKT or wallet API object;
- indexer: test a configured TN12 virtual-chain endpoint;
- settlement: choose release or refund for batch assurance and record the submit decision.
