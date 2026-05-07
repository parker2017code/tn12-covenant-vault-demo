# TN12 Test Matrix

Reviewed: 2026-05-07

## Standard

Positive app-state transitions need accepted TN12 transaction evidence before they are marked done. Local reducer tests cover duplicate, stale, malformed, and unsafe cases. They do not replace a safe testnet transaction for a real state change.

Run `npm run payload:verify:events` to re-fetch and verify all accepted invoice payload events.

## TN12 Accepted

| Lane | State | Evidence |
|---|---|---|
| Vault | Recovery | `b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391` |
| Vault | Delayed withdrawal | `9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710` |
| Assurance | Individual release | `80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f` |
| Assurance | Individual refund | `faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61` |
| Escrow | Seller release | `825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d` |
| Escrow | DAA refund | `6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d` |
| Escrow | Mutual cancel | `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c` |
| Invoice | Paid payload receipt | `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e` |
| Invoice | Refund payload event | `4f24d99891d1bf79aab0dd66dcb31e6808ca766507f729f9be2c59048f4b7a13` |
| Invoice | Error payload event | `3738322fbe19c384b5472336f006560bceea3e004099eb50c2499874903b2c5c` |

## Local Reducer Tests

These are intentionally local because they model bad or duplicate input:

- mismatched invoice receipt,
- duplicate invoice receipt,
- signed-only refund,
- stale or unknown invoice record,
- duplicate access-pass redemption,
- txidless access-pass redemption,
- signed-only auction bid,
- below-reserve auction,
- signed-only pledge progress,
- disputed agent proof.

## Not Yet TN12 Tested

These should not be called complete until a safe TN12 transaction or accepted proof exists:

- wallet-review flow replacing local signing and shell submit,
- checkpointed accepted-transaction ingestion from RPC/node state,
- batch assurance release from multiple pledge outputs,
- batch assurance refund from multiple pledge outputs,
- access-pass redemption payload transaction,
- auction bid payload transaction and settlement/refund draft,
- agent task release/refund transaction lifecycle,
- treasury/team-vault constrained spend drafts,
- stable-value issuer issuance/redemption payload events,
- miner/pool attestation payload event,
- prediction/hedge simulator event payloads.

## Next Build Order

1. Wallet-review flow for payload receipt submission.
2. Checkpointed accepted indexing.
3. Batch assurance release/refund planning with accepted pledge outputs.
4. Access-pass redemption payload transaction.
5. Agent task release/refund drafts.
