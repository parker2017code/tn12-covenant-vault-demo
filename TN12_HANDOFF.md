# TN12 Handoff

Reviewed: 2026-05-11

Current readiness: about 58-62% mainnet deployment readiness.

What changed in this pass:
- Added one local-wallet operator-pack payload receipt accepted on TN12: `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`.
- Payload evidence is now 33 accepted events and 46 checkpointed records.
- Live TN12 replay overlap now exists from a chain-block anchor inside the checkpoint band.
- Batch-assurance release is accepted and indexed; refund paths remain non-selected for that spent pledge set.
- Mainnet readiness docs now separate proof-core progress from deployment readiness.
- The current next-ten execution status is artifact-backed: 5/10 local tasks complete, duplicate/stale DeFi receipt replay guard ready, and external signer tasks still blocked on a real wallet signature.
- Durable replay guard has local promotion readiness, but full promotion remains blocked until live removed-block evidence exists.
- External signer path research is now artifact-backed; real user approval remains required.
- DeFi simulation is now a larger review-only harness: planner simulation, deterministic scenario math, reducer promotion guard, AMM/liquidity hardening, lending sweeps, oracle failure cases, multi-wallet scenario pack, and manifest guard.
- `npm run defi:refresh` rebuilds the DeFi simulation suite in dependency order and `artifacts/defi-artifact-manifest.json` checks schemas, zero live-product claims, zero custody actions, zero external-signer claims, and no secret-like fields.

Current blockers:
- Live external signer round trip
- Live removed-block rollback evidence
- Real custody/source-of-funds review for settlement lanes
- Wallet/indexer hardening beyond fixture/local replay

What Claude should do next:
1. Keep the live replay promotion lane honest and bounded.
2. Keep the accepted batch-assurance release and non-selected refund paths explicit.
3. Finish the wallet/external-signer lane only if a real throwaway signer path exists.
4. Keep DeFi simulation review-only unless a real custody/signer rail exists.
5. Keep the readiness docs and artifacts synchronized.

Files to read first:
- `MAINNET_READINESS.md`
- `docs/PROGRESS.md`
- `docs/ROADMAP_STATE.md`
- `artifacts/virtual-chain-live-app-state.json`
- `artifacts/durable-replay-promotion-guard.json`
- `artifacts/external-signer-path-research.json`
- `artifacts/next-ten-execution-status.json`
- `artifacts/defi-receipt-replay-guard.json`
- `artifacts/defi-artifact-manifest.json`
- `artifacts/batch-assurance-operator-decision.json`

This handoff is for the next Codex/Claude pass. It is not a claim that mainnet is ready.
