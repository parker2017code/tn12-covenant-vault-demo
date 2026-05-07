# Kaspa Docs Review

Review date: 2026-05-07

Source root: https://docs.kaspa.org/

## What Is Already Reflected

- Covenants are the right first lane for vaults, treasury controls, escrow-like flows, time/condition-based unlocking, and small asset-native state machines.
- Assurance target aggregation should not be overclaimed. The current repo proves individual pledge release/refund paths, not a complete shared campaign state.
- Transaction payloads are the right first app-data lane for receipts, campaign metadata hashes, and indexed app events.
- Accepted transaction indexing should become the app-state backbone before the UI claims that a vault, campaign, receipt, or escrow state changed.
- Running a node is useful for production indexing, but the local node workflow was intentionally removed here. This repo currently uses public TN12 REST txid pulls and local fixtures.

## Useful Additions From The Deeper Pass

1. **Wallet API is the better long-term send path.**
   The docs recommend the high-level Wallet API for JavaScript/Rust wallet creation, account activation, sending, events, and payload support. This matters because the TN12 REST submit schema currently omits a payload field, while the Wallet API explicitly supports payload bytes.

2. **Payload must be bytes.**
   The transaction-payload page uses `new TextEncoder().encode(...)`. Local testing matched that: passing `Uint8Array` to `kaspa-wasm createTransaction` preserved payload bytes; passing a plain string produced an empty payload.

3. **Production accepted indexing should use checkpoints.**
   The accepted-transactions page points to checkpointed pulls with `getVirtualChainFromBlockV2`, `minConfirmationCount`, high data verbosity, rollback handling, and saved checkpoints. That is the future backend/indexer shape. This repo’s current REST txid snapshot is the light local version.

4. **PNN/resolver can avoid local node setup for early integration.**
   The references page frames public node discovery as useful for development/testing, with self-hosted nodes reserved for production availability and indexing control.

5. **Based Apps and vProgs stay later.**
   Based Apps fit shared-state concurrency; full vProgs are forward-looking network composition. This keeps the current vault/assurance/escrow work in the covenant lane and keeps cross-app composition out of current claims.

6. **Inline ZK is not the next step.**
   Inline ZK is for per-action proofs, privacy, custom validity rules, or custom account models. The docs explicitly say to consider Covenants and Based Apps first. This supports the current plan: no ZK until plain covenant and indexing flows are clean.

## Plan Changes

- Keep `npm run tx:payload` as a signed draft only until a payload-preserving submit route is verified.
- Investigate the high-level Wallet API or RPC-backed submission as the likely route for the first accepted payload receipt transaction.
- Keep the accepted transaction indexer split into two tiers:
  - local tier: REST txid pulls from known fixtures,
  - later backend tier: checkpointed `getVirtualChainFromBlockV2` with rollback handling.
- Build escrow next in the covenant lane, not Based Apps.
- Build campaign batching as explicit multi-output/campaign state before any shared-state app claim.

## Relevant Docs

- https://docs.kaspa.org/integrate/getting-started
- https://docs.kaspa.org/integrate/wallet
- https://docs.kaspa.org/integrate/accepted-transactions
- https://docs.kaspa.org/integrate/transaction-payload
- https://docs.kaspa.org/integrate/kaspa-node
- https://docs.kaspa.org/programmability
- https://docs.kaspa.org/programmability/covenants
- https://docs.kaspa.org/programmability/based-apps
- https://docs.kaspa.org/programmability/full-vprogs
- https://docs.kaspa.org/programmability/inline-zk
- https://docs.kaspa.org/references
