# TN12 Handoff

Reviewed: 2026-05-10

Current readiness: about 55-60% mainnet deployment readiness.

What changed in this pass:
- Live TN12 replay overlap now exists from a chain-block anchor inside the checkpoint band.
- Batch-assurance operator decision is release-first review, with external signer acceptance still missing.
- Mainnet readiness docs now separate proof-core progress from deployment readiness.
- The current next-ten execution status is artifact-backed: 6/10 local tasks complete, duplicate/stale DeFi receipt replay guard ready, and external signer tasks still blocked on a real wallet signature.
- Durable replay promotion guard now passes deterministic fixture replay, live checkpoint overlap, duplicate-free live txids, and local rollback matching. Live removed-block rollback evidence is still useful when available.
- External signer path research is now artifact-backed; real user approval remains required.

Current blockers:
- Live external signer round trip
- Live removed-block rollback evidence
- One accepted batch-assurance settlement path
- Escrow marketplace demo
- Wallet/indexer hardening

What Claude should do next:
1. Keep the live replay promotion lane honest and bounded.
2. Continue the release-first batch-assurance review path.
3. Finish the wallet/external-signer lane only if a real throwaway signer path exists.
4. Keep the readiness docs and artifacts synchronized.

Files to read first:
- `MAINNET_READINESS.md`
- `docs/PROGRESS.md`
- `docs/ROADMAP_STATE.md`
- `artifacts/virtual-chain-live-app-state.json`
- `artifacts/durable-replay-promotion-guard.json`
- `artifacts/external-signer-path-research.json`
- `artifacts/next-ten-execution-status.json`
- `artifacts/defi-receipt-replay-guard.json`
- `artifacts/batch-assurance-operator-decision.json`

This handoff is for the next Codex/Claude pass. It is not a claim that mainnet is ready.
