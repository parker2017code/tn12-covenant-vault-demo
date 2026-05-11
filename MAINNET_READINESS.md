# Mainnet Readiness

Reviewed: 2026-05-11

This file is about deployment readiness, not TN12 proof-core progress.

## Estimate

- Current mainnet deployment readiness: about 55-60%.
- After real external signer: about 65-70%.
- After production wallet/indexer hardening: about 70-75%.

## Proven On TN12

- Covenant spends: 16 proof paths across vault recovery/withdrawal, assurance release/refund, escrow release/refund/cancel, auction settlement/refund, and all seven role-separated positive paths.
- Payload state: 33 accepted payload events, including six DeFi v1 receipts across three wallets and one agent release wallet-review event.
- Batch assurance: accepted pledge outputs and accepted 3-pledge release tx `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801`.
- Live replay: public TN12 wRPC reads work, checkpoint overlap is recorded, and `artifacts/durable-replay-promotion-guard.json` passes deterministic replay plus local rollback matching.

## Still Not Mainnet-Ready

| Gap | Why it matters | Current artifact |
|---|---|---|
| External signer | Users must sign without this repo holding keys | `artifacts/external-signer-path-research.json`; unsigned request in `artifacts/external-signer-payload-request.json` |
| Live removed-block evidence | Local rollback matching is not the same as observing a live rollback window | `artifacts/durable-replay-promotion-guard.json` |
| Batch settlement follow-through | Release is accepted; alternate refund path must remain non-selected | `artifacts/batch-assurance-operator-decision.json` |
| Wallet/indexer hardening | Product state needs operational reliability | `artifacts/wallet-submit-result-validation.json` |

## Next Order

1. Run one real external signer round trip.
2. Keep batch-assurance refund paths marked non-selected after the accepted release.
3. Capture live removed-block rollback evidence when TN12 provides it.
4. Keep dashboard/docs proof-first: accepted evidence, gate output, blocker.
