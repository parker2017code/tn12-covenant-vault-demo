# TN12 CLI From Zero

This guide is for someone starting with a terminal and no repo context.

TN12 is Kaspa testnet-12. The commands here are for testnet proof work, local review artifacts, and replay checks. They are not mainnet wallet commands.

If your goal is mainnet Kaspa terminal work, use public Kaspa node, wallet, SDK,
and explorer documentation. This repo can teach the pattern of verify, draft,
submit, and replay on testnet. It should not be copied into mainnet unless the
same command path exists in production tooling and you understand the key and
network boundaries.

The larger goal is not to make everyone depend on this repo or one explorer. It
is to make the verification path legible: run checks, inspect txids, compare
explorer data with local replay, and know when a full node or RPC query is the
next source of truth.

## What You Need

- A terminal.
- Git.
- Node.js `>=20.19.0 <25`.
- npm.
- Internet access for TN12 API/explorer verification.
- Optional: TN12 test coins (`tKAS`) from a faucet when you want to submit your own transactions.

Check the basics:

```sh
git --version
node --version
npm --version
```

If `node --version` is below `20.19.0`, install a current Node.js release before continuing.

## Get The Repo

```sh
git clone <repo-url>
cd tn12-covenant-vault-demo
npm ci
```

What happened:

- `git clone` copied the repo.
- `cd` moved your terminal into it.
- `npm ci` installed exactly the dependencies recorded in the lockfile.

## Start Safely: No Wallet, No tKAS

Run the local gate:

```sh
npm run check:all
```

Run the TN12 evidence gate:

```sh
npm run check:tn12
```

What these do:

- `check:all` checks local fixtures, reducers, negative cases, and UI wiring.
- `check:tn12` reads public TN12 evidence and verifies accepted txids, payload events, proof records, and checkpoint artifacts.
- Neither command needs private keys or tKAS.
- Both commands should pass before you trust the repo state.

## Make Fresh Testnet Role Wallets

This creates testnet-only wallet files.

```sh
npm run playground:wallets
```

What happens:

- Public `kaspatest:` addresses are printed.
- Private testnet key material is written under `.local/playground/`.
- `.local/` must never be committed or shared.
- The command refuses to overwrite existing playground wallets unless you run `npm run playground:wallets -- --force`.

At this point you have addresses, but they are not funded.

## Get TN12 tKAS

Use the TN12 faucet in a browser, or send testnet funds from your own TN12 wallet, to the printed `kaspatest:` addresses.

Then verify the funding on the TN12 explorer before building spends.

Important boundary:

- Faucet/testnet coins have no mainnet value.
- Do not paste mainnet private keys into this repo.
- Do not fund testnet role wallets with mainnet funds. They are different networks.

## Build A Playground Funding Draft

This builds a local signed draft that funds the fresh role wallets from a separate funded source wallet/outpoint.

```sh
npm run playground:funding-draft
```

Default inputs:

```txt
TN12_WALLET=.local/tn12-wallet.json
FUNDING_OUTPOINT=fixtures/FundedWalletOutpoint.json
```

Use your own funded source by overriding both:

```sh
TN12_WALLET=.local/my-tn12-source-wallet.json \
FUNDING_OUTPOINT=.local/my-funded-outpoint.json \
npm run playground:funding-draft
```

What happens:

- The command reads the source wallet and outpoint.
- It builds a draft transaction to fund the role addresses.
- It writes the draft under `.local/playground/`.
- It does not make the transaction accepted by itself.

## Broadcast Only When You Mean It

Any command with `--submit` can broadcast a real TN12 testnet transaction.

Example:

```sh
node scripts/submit-signed-draft.mjs .local/playground/funding-draft.json --submit
```

Before broadcasting, check:

- The draft is testnet-only.
- The inputs are yours.
- The outputs are the intended `kaspatest:` addresses.
- The fee and amount are expected.
- You are not using mainnet keys.

After broadcasting:

1. Copy the txid.
2. Open it in the TN12 explorer.
3. Wait for accepted status.
4. Re-run replay/indexer checks before trusting app state.

## Payload Receipts Need wRPC

Payload receipts need a submit route that preserves payload bytes.

Use the JSON wRPC route for payload receipts:

```sh
KASPA_WRPC_URL=<ws-or-wss-tn12-endpoint> \
KASPA_WRPC_ENCODING=json \
KASPA_WRPC_NETWORK_ID=testnet-12 \
KASPA_WRPC_SUBMIT_SHAPE=object \
node scripts/submit-signed-draft-wrpc.mjs <draft-path> --submit
```

Do not use the public REST submit route for payload receipts. This repo has already observed that route accepting a payment while dropping payload bytes.

## Mainnet Boundary

This repo does not give you a mainnet wallet product.

For mainnet use, the required product path is:

1. Prepare a human-readable request.
2. Review network, inputs, outputs, fees, payload, and intent.
3. Sign outside the repo with a mainnet-capable wallet.
4. Return signed bytes.
5. Validate the returned transaction fingerprint.
6. Submit through the correct route.
7. Promote app state only after accepted mainnet replay evidence.

That full user-wallet path is still a readiness gap here.

## Toccata And Mainnet Commands

TN12 is the place to practice covenant-shaped flows before mainnet activation
and production tooling are ready.

After Toccata or later protocol work is live, the command-line path should be
rebuilt from public release notes, official node/wallet/SDK docs, and accepted
mainnet evidence. Until then:

- TN12 commands prove testnet behavior.
- `.local/` wallet files are throwaway testnet material.
- wRPC payload routes here are testnet routes.
- Mainnet instructions must come from production wallet/node tooling.
- Any app state should still be promoted only after accepted transaction replay.

## Public Kaspa Command Reference

Use this as the bridge from TN12 practice to real Kaspa infrastructure.

### Current mainnet node path

Kaspa.org Build lists the Rusty Kaspa Docker quickstart:

```sh
docker run -d --name kaspad -p 16110:16110 kaspanet/rusty-kaspad:latest
```

Rusty Kaspa's README lists source-build mainnet commands:

```sh
git clone https://github.com/kaspanet/rusty-kaspa
cd rusty-kaspa
cargo run --release --bin kaspad
cargo run --release --bin kaspad -- --utxoindex
```

Use `--utxoindex` when wallet or UTXO queries need indexed UTXO state.

### Current terminal wallet/RPC entry

Rusty Kaspa documents `kaspa-cli` as the terminal RPC and wallet runtime:

```sh
cd cli
cargo run --release
```

Before creating wallets or signing transactions, inspect the CLI help, confirm
the selected network, confirm wallet file locations, and test with tiny amounts.

### Current generic testnet node path

Rusty Kaspa's README lists:

```sh
cargo run --release --bin kaspad -- --testnet
```

Older public hard-fork testnet guides used explicit suffixes, for example:

```sh
kaspad --testnet --netsuffix=10 --utxoindex
cargo run --bin kaspad --release -- --testnet --netsuffix=10 --utxoindex
```

For TN12/Toccata work, verify the current netsuffix, release, endpoint, and
flags from the active public Toccata/TN12 docs before running.

### wRPC JSON endpoint

Rusty Kaspa documents wRPC as optional and disabled by default. For JSON wRPC:

```sh
cargo run --release --bin kaspad -- --utxoindex --rpclisten-json=default
```

Use careful bind addresses on public machines. A public RPC endpoint is
infrastructure, not a wallet safety boundary.

### Sources

- Kaspa.org Build: node, SDK, query, explorer, and testnet resource map.
- `docs.kaspa.org`: integration docs for RPC, payloads, accepted transactions,
  and running node infrastructure.
- `kaspanet/rusty-kaspa`: current node, wallet, CLI, Docker, and wRPC commands.
- Kaspa.org hard-fork testnet posts: historical examples of netsuffix-specific
  testnet commands.

Useful source URLs:

- `https://kaspa.org/build`
- `https://docs.kaspa.org/`
- `https://github.com/kaspanet/rusty-kaspa`
- `https://github.com/kaspanet/rusty-kaspa/releases`
- `https://explorer.kaspa.org/`
- `https://faucet-testnet.kaspanet.io/`

### Maintainer reminder

When Toccata becomes mainnet behavior, update this file and the Kaspa Explained
command/status/source pages from public activation evidence, Rusty Kaspa
releases, official docs, and working tool commands. Until then, keep TN12
commands labeled as testnet practice.

## Safe Mental Model

- Checks read and verify.
- Builders create local artifacts.
- Wallet commands may write `.local/` testnet files.
- Submit commands broadcast when `--submit` is present.
- Accepted txids are the source of truth.
- Reducer state is review state until accepted spend/signing evidence exists.

## Black Screen To DeFi-Style Actions

Start here if you have a blank terminal and want to understand the whole path.

### 1. Learn The Shape Without Spending

```sh
npm ci
npm run check:all
npm run defi:accepted-activity
npm run defi:reducer
npm run defi:manifest
```

What you learn:

- `defi:accepted-activity` reads the accepted transfer ledger.
- `defi:reducer` turns accepted txids into review balances and blocked withdrawal rows.
- `defi:manifest` checks that the current DeFi artifacts exist and have no secret findings.
- No wallet funds move in this step.

To compare terminal output with the public walkthrough, open `playground.html`
and `results.html` from the repo or hosted page.

### 2. Create Testnet Wallets

```sh
npm run playground:wallets
```

This creates local testnet role wallets:

- operator
- pool
- user-a
- user-b
- executor
- observer

The private testnet keys stay under `.local/playground/`. The public addresses are what you fund.

### 3. Fund The Roles

Use the TN12 faucet or your own TN12 wallet to send testnet funds to the printed `kaspatest:` addresses.

Typical minimum learning path:

- Give `user-a` enough tKAS for a small deposit.
- Give `user-b` enough tKAS for a small deposit.
- Give `pool` enough tKAS for a small payout.

Then verify each funding transaction in the TN12 explorer.

### 4. Build Or Inspect The Action Draft

The current public playground shows the accepted pattern:

- User A deposits to the pool.
- User B deposits to the pool.
- Pool pays User B.
- Replay turns accepted txids into balances.
- Invalid withdrawals stay blocked.

For repo-local runs, commands are grouped by what they prove:

```sh
npm run playground:funding-draft
npm run defi:accepted-activity
npm run defi:reducer
npm run defi:multi-wallet
```

What this means:

- Funding drafts move testnet money between role wallets when submitted.
- Accepted-activity/reducer commands replay evidence.
- Multi-wallet artifacts show which roles and wallets are involved.
- AMM, lending, liquidation, oracle truth, and app-controlled pool custody still need separate product rails.

### 5. Submit Only Explicit Drafts

When a draft is ready and you intend to broadcast it:

```sh
node scripts/submit-signed-draft.mjs <draft-path> --submit
```

For payload receipts:

```sh
KASPA_WRPC_URL=<ws-or-wss-tn12-endpoint> \
KASPA_WRPC_ENCODING=json \
KASPA_WRPC_NETWORK_ID=testnet-12 \
KASPA_WRPC_SUBMIT_SHAPE=object \
node scripts/submit-signed-draft-wrpc.mjs <draft-path> --submit
```

Do not submit blindly. Read the draft first. Confirm network, inputs, outputs, amounts, fee, payload, and role intent.

### 6. Replay Before Believing The App State

After a submit:

```sh
npm run check:tn12
npm run defi:accepted-activity
npm run defi:reducer
npm run indexer:checkpoint
npm run indexer:persist
```

The important question is not “did a command run?” The important question is:

- Is the txid accepted on TN12?
- Do outputs or payload bytes match the draft?
- Is the txid new, not duplicated or stale?
- Does replay produce the expected balance or blocked-action row?

### 7. What Counts As Complex DeFi Here

Built enough to inspect:

- accepted multi-wallet deposits and payouts;
- accepted payload receipts;
- scheduler intent, bid, execution, and covenant-binding receipts;
- reducer balances and blocked withdrawal attempts;
- AMM/lending/oracle/liquidation simulations and failure cases.

Not built as app-controlled custody:

- AMM pool custody;
- lending custody;
- liquidation execution;
- oracle truth;
- production wallet signing;
- public-user wallet signing round trip.

So the CLI can take you from blank terminal to real TN12 wallet movement and replayed DeFi-style state. It does not yet take you to a production DeFi product that controls user funds.
