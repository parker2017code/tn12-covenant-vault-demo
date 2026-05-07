# LLM Review Guide

Use this guide when reviewing the repo from GitHub, GitHub Pages, or a local checkout. The goal is to verify the public claim surface quickly without guessing.

## Start Here

1. Check the latest pushed commit on `main`.
2. Check whether GitHub Pages has deployed that commit.
3. Compare the public README with the live artifacts under GitHub Pages.
4. Verify the accepted TN12 txids through the TN12 API.
5. Report any gap between local state, pushed GitHub state, live Pages state, and chain state.

Useful public links:

```txt
Repo: https://github.com/parker2017code/tn12-covenant-vault-demo
Pages: https://parker2017code.github.io/tn12-covenant-vault-demo/
TN12 tx API: https://api-tn12.kaspa.org/transactions/{txid}
Proof evidence: https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/proof-evidence.json
Build status: https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/build-status.json
Enforcement matrix: https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/enforcement-matrix.json
```

Use cache-busted URLs when checking Pages after a fresh push:

```txt
https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/proof-evidence.json?v={commit}
```

## What Is Worth Checking

Primary proof state:

- `fixtures/AcceptedProofTransactions.json`: canonical list of accepted proof spends.
- `artifacts/proof-evidence.json`: resolved evidence that each proof spend consumed a TN12 P2SH (`p...`) output and paid the expected P2PK (`q...`) output.
- `fixtures/AcceptedAppState.json`: accepted transaction state used by the UI/indexer lane.
- `docs/STATUS.md`: human-readable txid and address list.

Claim boundaries:

- `fixtures/EnforcementMatrix.json`
- `artifacts/enforcement-matrix.json`
- `fixtures/BuildStatus.json`
- `artifacts/build-status.json`
- `docs/PROGRESS.md`
- `docs/BUILD_PLAN.md`

Submit/draft review:

- `fixtures/SubmitConsoleDrafts.json`
- `artifacts/submit-console-registry.json`
- `artifacts/signed-drafts/*.json`

Do not inspect or request `.local/tn12-wallet.json`. It is local testnet wallet material and is intentionally gitignored.

## Current Expected Proof Shape

The repo is allowed to claim accepted TN12 proof spends for:

- vault recovery;
- vault delayed withdrawal;
- individual assurance release;
- individual assurance refund;
- escrow release.

Each accepted proof spend should satisfy:

```txt
accepted: true
input previous output type: scripthash
input address prefix: kaspatest:p...
output type: pubkey
output address prefix: kaspatest:q...
output amount matches fixture
```

Escrow nuance:

- Escrow funding tx `6042f46571a1b983f9d823562813bd0a99793bfcae81aa15d5ac82268c3f8ba2` created the P2SH escrow output.
- Escrow release tx `825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d` consumed that output.
- Refund and cancel drafts for that same output are expected not to be accepted after release consumed it.
- Proving refund/cancel requires separate funded escrow outputs.

## Local Verification Commands

Run these from the repo root when local checkout access is available:

```sh
npm run check:all
npm run tx:verify
npm run proof:evidence
git diff --check
```

Optional regeneration commands:

```sh
npm run indexer:state
npm run submit:registry
npm run enforcement:matrix
npm run build:status
```

## What Is In Limbo

Treat these as work in progress unless a new accepted txid and fixture says otherwise:

- invoice/payment payload receipt: signed draft exists, accepted payload receipt does not;
- pooled assurance target aggregation: planner/indexer only, not script-enforced;
- escrow refund/cancel: drafts only until separate funded outputs are proven;
- treasury caps/payroll: wallet-policy/planner only;
- access passes/assets/auctions/agent commitments: planner/indexer artifacts unless tied to accepted payload receipts;
- prediction markets, DeFi, RTD/miner-oracle, Hashdag/Staghunt: research/prototype lanes only.

## Do Not Overclaim

Do not describe this repo as:

- a mainnet wallet;
- proof that Toccata covenants are live on mainnet;
- production-safe smart contracts;
- a full Hashdag/Staghunt coordination market implementation;
- live DeFi;
- arbitrary block-header data insertion.

Accurate label:

```txt
TN12 covenant/app primitive workshop with accepted vault, assurance, and escrow-release proof transactions.
```
