# TN12 Proof-Core Release Candidate

Reviewed: 2026-05-12

This is a release-candidate review note for the proof core. It is not a product
release, not a wallet release, not a DeFi release, and not a mainnet readiness
claim.

## Scope

This snapshot packages the evidence a reviewer should check first:

- accepted TN12 proof transactions,
- accepted payload receipt evidence,
- checkpointed replay/indexer artifacts,
- command gates,
- known blockers.

## Canonical Counts

| Evidence | Count | Source |
|---|---:|---|
| Core proof/funding/settlement rows | 9 | `artifacts/proof-evidence.json` |
| Role-separated positive proof rows | 7 | `artifacts/role-separated-proof-evidence.json` |
| Accepted proof txs total | 16 | `artifacts/proven-status.json` |
| Payload events | 40 | `fixtures/PayloadEventEvidence.json` |
| Checkpointed accepted records | 53 | `artifacts/checkpointed-accepted-index.json` |
| Playground accepted txs | 4 | `artifacts/playground-plan.json` |

## Core Proof Txids

| Path | Txid |
|---|---|
| Vault recovery | `b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391` |
| Vault delayed withdrawal | `9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710` |
| Assurance release | `80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f` |
| Assurance refund | `faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61` |
| Escrow release | `825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d` |
| Escrow DAA refund | `6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d` |
| Escrow mutual cancel | `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c` |
| Auction settlement funding | `6d663293ccbebddddf81e14146c13ac4039fe3047d6d429043d57d5c9717fbea` |
| Auction settlement | `523ce10f82f353fc9e9a1c5ac330efde376024491e5baf0eec4f9b0ec6faa236` |

## Role-Separated Txids

| Path | Txid |
|---|---|
| Role-separated vault recovery | `dbe2c3ea5cf7e93031db468a8906be16fdc1a2e4b6382d14d7d01e67e71274e0` |
| Role-separated assurance release | `fe2fba8819f3022f62892215b1bc4316377ffb7e54f833549d30bd247d8fda32` |
| Role-separated escrow release | `4f882d934700667819a4c7ad84f51a63e9db4e7b8989bfd65089410051f47382` |
| Role-separated escrow cancel | `677b9c3925c3e9fa6b8c62a3db5c44587a21b2951006395f827574dff7c7bdfa` |
| Role-separated DAA vault withdrawal | `cb7da9329250a82bfbe53ce6a25855402de1dc9fdc5d856daa25576088b90b11` |
| Role-separated DAA assurance refund | `a35937e44d0b517020f19aa3b7908b9f6f7c47c4bd4222ecf5cddc72a6b411fa` |
| Role-separated DAA escrow refund | `7ac59de80c482402dd0d97e135ad8064e6ac237bcaab0191ea1bef8faa4735c0` |

## Artifact Hashes

These hashes identify the current evidence files in this candidate.

```txt
3e0df2849c4c3ef395cf59079673a921c7adbf34dcca097ea78b28a23af54aef  artifacts/proven-status.json
794b638b5dedbf38b0ed2991946024e3f4173c3ccce61699906ad538de023482  artifacts/proof-evidence.json
703242b978972dfa920d1c9639b2382eb1336d7807429fa8b378c503fd6172d0  artifacts/role-separated-proof-evidence.json
8ba0102f314a4530d35bd75c4571c3548b5e5f595f43eb865915d4a55079a5f7  fixtures/PayloadEventEvidence.json
7c7f10a131e2a64d977ffbc3110013e58fc50d01ab85f298821f0d118572c884  artifacts/checkpointed-accepted-index.json
13d88ed9d39ca82a8e2ca7b82e46dcbcc8058ad0ba052d4fece7bb388006734d  artifacts/playground-plan.json
```

## Verification Commands

```sh
npm ci
npm run check:all
npm run check:tn12
npm run proof:records
```

Optional full refresh:

```sh
npm run demo:operator-refresh
```

## Boundary

- Testnet only.
- No independent security audit has been completed.
- Do not use with mainnet funds.
- Not a mainnet wallet.
- Not mainnet covenant activation evidence.
- Not production DeFi custody.
- User-wallet signing remains a readiness gap until a real wallet returns signed
  bytes, submit succeeds, and replay observes the accepted txid.

## Release Candidate Done When

This note can become a tagged proof-core release note after:

1. the commit hash is inserted,
2. `npm run check:all` and `npm run check:tn12` pass on that commit,
3. txids and hashes are rechecked after any artifact refresh,
4. the GitHub release repeats the boundary above.

## Tag Checklist

Use this before creating a Git tag or GitHub release.

```sh
git status --short
git rev-parse HEAD
npm run check:all
npm run check:tn12
npm run proof:records
sha256sum artifacts/proven-status.json artifacts/proof-evidence.json artifacts/role-separated-proof-evidence.json fixtures/PayloadEventEvidence.json artifacts/checkpointed-accepted-index.json artifacts/playground-plan.json
```

Checklist:

- Working tree is clean.
- Commit hash is copied into the release notes.
- Proof count is still 16.
- Payload count is still 40.
- Checkpoint count is still 53.
- Boundary text says testnet only, no independent audit, no mainnet funds.
- Release title uses proof-core language, not product or mainnet language.
