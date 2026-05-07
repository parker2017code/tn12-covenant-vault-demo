# TN12 Test Matrix

Reviewed: 2026-05-07

## Standard

Positive app-state transitions need accepted TN12 transaction evidence before they are marked done. Local reducer tests cover duplicate, stale, malformed, and unsafe cases. They do not replace a safe testnet transaction for a real state change.

Run `npm run payload:verify:events` to re-fetch and verify every accepted payload event in `fixtures/PayloadEventEvidence.json`.

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
| Access pass | Workshop redemption payload | `59893fa4988540ef72643c803df692bbc1d3eaf9aded16339375178a9d22bd90` |
| Auction | Bid pass 001 payload | `e4ffbf97baa8f04d736ba90aeefa3032bacea16c184d9e80e4ded1f751f8385d` |
| Auction | Bid pass 002 payload | `512d4b5db7d940858324bad05e76b4543e346774f39bf53b1b3fecada3a0284f` |
| Auction | Bid voucher 001 payload | `e23c03271a5e0702cc104e36651c63270d0756d74c098310ffbac6fbe8964861` |
| Auction | Settlement planner event | `3808098b8d44047c38710088e5d3ee29eff6f57df2ac407aca4a610af71dde7e` |
| Auction | Refund planner event | `d8230790ca950e299541e30505cfdb9fb78bab3ba72fefa056bcd0e6c3bb2fa9` |
| Stable-value issuer | Issuance 001 payload | `95a5f2796eeb3a4cf23fd491b2b989a81b6d2a86cf846ab03ae0bc777ecf0f7b` |
| Stable-value issuer | Issuance 002 payload | `f899b5041c393c7e3d0c288b873c78179ec5530644f83f1f581b9e7f925f5162` |
| Stable-value issuer | Redemption 001 payload | `3f0e28f244674e15f79948e45eb5513e12e7fde7e3e2b591ecc9a65931989663` |
| Miner/watcher signal | Attestation payload | `a30ff2113c2821059d3c9332b9c1779cdb3fd77f1244187984841cd4ee07904d` |
| Agent commitments | Task invoice payload | `78bdc0a6483c71557735d847b284901220d65faea4bbc49656f6d7f3b53fe4e8` |
| Agent commitments | Task escrow payload | `040759dd36a61395f6a721263ba8c8aa08d595f5e18d84faa1c61de0bb43a755` |
| Agent commitments | Proof invoice payload | `f3c3a5774d6185e1048a08aca2bb0246895eddb54fd9113ae07ff82c184a7e1e` |
| Agent commitments | Proof escrow payload | `197bac31e46b59441910e75e6f65e96e6b478c88777879b489265f5b9189638a` |
| Agent commitments | Dispute escrow payload | `807b41bead247769509694aa34917b82a3adb288826912e522e3bb67e31877f0` |
| Agent commitments | Release planner event | `3119d9293d0e895d354075f7abe7b57f21bb2f4edd66b2cfe072bfd5ca6048b4` |
| Agent commitments | Dispute-hold planner event | `82a5283f061b3a95ac59d8e168e96da488590d516157f38a3d1cc75a764df382` |

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
- persisted node/RPC checkpoint ingestion with rollback handling,
- batch assurance release from multiple pledge outputs,
- batch assurance refund from multiple pledge outputs,
- auction custody settlement/refund transaction, atomic exchange, and asset delivery,
- agent task custody release/refund transactions and autonomous payout lifecycle,
- treasury/team-vault constrained spend drafts,
- prediction/hedge simulator event payloads.

## Next Build Order

1. Wallet-review flow for payload receipt submission.
2. Persisted node/RPC checkpoint ingestion with rollback handling.
3. Batch assurance release/refund planning with accepted pledge outputs.
4. Auction settlement/refund drafts.
5. Agent task release/refund drafts.
