# TN12 Handoff

Reviewed: 2026-05-11

Current readiness: about 58-62% mainnet deployment readiness.

What changed in this pass:
- Added one local-wallet operator-pack payload receipt accepted on TN12: `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`.
- Payload evidence is now 40 accepted events and 53 checkpointed records.
- DeFi accepted activity now includes 25 accepted local-key transfer rows: user funding, pool deposits, pool payouts, and scheduler execution payout in `artifacts/defi-accepted-activity-ledger.json`.
- Scheduler evidence now includes one accepted intent payload, three accepted bid receipts, one accepted execution receipt, and one accepted local-key payout reduced into executed trigger state in `artifacts/scheduler-intent-registry.json`.
- Scheduler covenant binding now includes one accepted payload receipt that references the accepted vault recovery proof row in `artifacts/scheduler-covenant-binding.json`.
- Live TN12 replay overlap now exists from a chain-block anchor inside the checkpoint band.
- Batch-assurance release is accepted and indexed; refund paths remain non-selected for that spent pledge set.
- Mainnet readiness docs now separate proof-core progress from deployment readiness.
- The current next-ten execution status is artifact-backed: 5/10 local tasks complete, duplicate/stale DeFi receipt replay guard ready, and external signer tasks still blocked on a real wallet signature.
- Durable replay guard has local promotion readiness, but full promotion remains blocked until live removed-block evidence exists.
- External signer path research is now artifact-backed; real user approval remains required.
- DeFi is now split into real accepted TN12 activity and planner/indexer-derived market logic: accepted receipts and local-key custody transfers are real TN12 evidence; AMM pricing, oracle truth, autonomous custody, and liquidation execution remain unenforced by script.
- `npm run defi:refresh` rebuilds the DeFi suite in dependency order and `artifacts/defi-artifact-manifest.json` checks schemas, zero live-product claims, zero external-signer claims, and no secret-like fields.
- TangVM / universal-scheduler language is bounded in `docs/TANGVM_UNISC_BOUNDARY.md`: the repo can prototype event receipts, trigger reducers, and local-key execution aligned with upstream vProgs concepts, but it does not implement TangVM, UniSc, miner oracle consensus, or full vProgs.

Current blockers:
- Live external signer round trip
- Live removed-block rollback evidence
- Production custody/source-of-funds review for settlement lanes
- Wallet/indexer hardening beyond fixture/local replay

What to do next:
1. Keep the live replay promotion lane honest and bounded.
2. Keep the accepted batch-assurance release and non-selected refund paths explicit.
3. Finish the wallet/external-signer lane only if a real throwaway signer path exists.
4. Execute anything that can safely be represented on-chain on TN12; keep only AMM pricing, oracle truth, autonomous custody, liquidation, and external-signer claims blocked until actually enforced.
5. Add a scheduler-intent prototype only if it stays accepted-payload/indexer-derived and does not claim TangVM/UniSc implementation.
6. Keep the readiness docs and artifacts synchronized.

Files to read first:
- `MAINNET_READINESS.md`
- `docs/PROGRESS.md`
- `docs/ROADMAP_STATE.md`
- `artifacts/virtual-chain-live-app-state.json`
- `artifacts/durable-replay-promotion-guard.json`
- `artifacts/external-signer-path-research.json`
- `artifacts/next-ten-execution-status.json`
- `artifacts/defi-receipt-replay-guard.json`
- `artifacts/defi-accepted-activity-ledger.json`
- `artifacts/defi-artifact-manifest.json`
- `artifacts/scheduler-intent-registry.json`
- `artifacts/batch-assurance-operator-decision.json`
- `docs/TANGVM_UNISC_BOUNDARY.md`

This handoff is for the next work pass. It is not a claim that mainnet is ready.
