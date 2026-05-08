# TN12 Test Matrix

Reviewed: 2026-05-08

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
| Role-separated funding | Vault, assurance, escrow P2SH outputs | `ce1a94b8ced52cbc73e8f79c173e6b3611fa0c57fa3a712db64da290f555f4e0` |
| Role-separated vault | Recovery | `dbe2c3ea5cf7e93031db468a8906be16fdc1a2e4b6382d14d7d01e67e71274e0` |
| Role-separated assurance | Release | `fe2fba8819f3022f62892215b1bc4316377ffb7e54f833549d30bd247d8fda32` |
| Role-separated escrow | Seller release | `4f882d934700667819a4c7ad84f51a63e9db4e7b8989bfd65089410051f47382` |
| Role-separated funding | Unix-time expired batch, historical bad-time attempt | `935722ea25c6af83c9a8b883ad10300604175b87b79b9498f829881991851141` |
| Role-separated escrow | Mutual cancel | `677b9c3925c3e9fa6b8c62a3db5c44587a21b2951006395f827574dff7c7bdfa` |
| Role-separated funding | DAA-expired timed-path batch | `9b4210c4afa75eda5c1200523706676bc0e442c597ee0f15200ad0fe8943cc06` |
| Role-separated vault | DAA delayed withdrawal | `cb7da9329250a82bfbe53ce6a25855402de1dc9fdc5d856daa25576088b90b11` |
| Role-separated assurance | DAA refund | `a35937e44d0b517020f19aa3b7908b9f6f7c47c4bd4222ecf5cddc72a6b411fa` |
| Role-separated escrow | DAA refund | `7ac59de80c482402dd0d97e135ad8064e6ac237bcaab0191ea1bef8faa4735c0` |
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
| Prediction / hedge | Network stress market-update payload | `9f9766567fbe8032804583e48e6e9a1aa70f8bb4fbd30018dd45f32e9c0daca7` |
| Prediction / hedge | Miner revenue review prompt payload | `1d5a3c2404188e62663535692ee575a1cb96a069fa19ea7c67670975078c6f3d` |
| Agent commitments | Task invoice payload | `78bdc0a6483c71557735d847b284901220d65faea4bbc49656f6d7f3b53fe4e8` |
| Agent commitments | Task escrow payload | `040759dd36a61395f6a721263ba8c8aa08d595f5e18d84faa1c61de0bb43a755` |
| Agent commitments | Proof invoice payload | `f3c3a5774d6185e1048a08aca2bb0246895eddb54fd9113ae07ff82c184a7e1e` |
| Agent commitments | Proof escrow payload | `197bac31e46b59441910e75e6f65e96e6b478c88777879b489265f5b9189638a` |
| Agent commitments | Dispute escrow payload | `807b41bead247769509694aa34917b82a3adb288826912e522e3bb67e31877f0` |
| Agent commitments | Release planner event | `3119d9293d0e895d354075f7abe7b57f21bb2f4edd66b2cfe072bfd5ca6048b4` |
| Agent commitments | Dispute-hold planner event | `82a5283f061b3a95ac59d8e168e96da488590d516157f38a3d1cc75a764df382` |
| Batch assurance | Pledge docs 001 planner payload | `10d9ba2bf43182014b84fa0e20fb47ede10776860e6e4e940f315fa1e59fcca1` |
| Batch assurance | Pledge docs 002 planner payload | `9bd53c2708486a21cf8225d08e8a949bcfd603848794dadceb9f6c0bff5b3a86` |
| Batch assurance | Pledge docs 003 planner payload | `fb9f97d04f92f6ea0537e33e89531f4184336f29a33ef8d5ce3f0247a7a6a04d` |
| Batch assurance | Release-ready planner payload | `2b38ca70ca1b04a0d71d661826232d2f5d31a54e97091f342700522547dbdc12` |

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

## Local Invalid-Candidate Maps

- `npm run roles:invalid-candidates` writes `artifacts/role-separated-invalid-candidates.json`.
- The artifact maps 32 local review candidates across the seven accepted role-separated positive paths: wrong signer, wrong selector, wrong output lock, wrong amount, bad lock shape for timed branches, and single-party cancel.
- These are not signed invalid transactions and are not TN12 rejection evidence. Fresh expendable outputs are required before any safe rejection submission.

## Not Yet TN12 Tested

These should not be called complete until a safe TN12 transaction or accepted proof exists:

- wallet-review flow replacing local signing and shell submit,
- durable node/RPC checkpoint ingestion with virtual-chain rollback replay,
- role-separated covenant TN12 rejection attempts from fresh expendable outputs,
- batch assurance custody release from multiple amount-matched pledge outputs,
- batch assurance custody refund from multiple amount-matched pledge outputs,
- auction custody settlement/refund transaction, atomic exchange, and asset delivery,
- agent task custody release/refund transactions and autonomous payout lifecycle,
- treasury/team-vault constrained spend drafts,
- prediction/hedge settlement, real odds, custody, or automatic execution.

## Next Build Order

1. Wallet-review flow for payload receipt submission.
2. Durable node/RPC checkpoint ingestion with virtual-chain rollback replay.
3. Batch assurance amount-matched custody release/refund drafts.
4. Auction settlement/refund drafts.
5. Agent task release/refund drafts.
