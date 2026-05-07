# TN12 Covenant Vault Demo

TN12-configured prototype for a Kaspa covenant vault and assurance-contract app.

This is not a mainnet wallet, not investment advice, and not proof that Toccata or vProgs are live. The goal is to make covenant-style money rules understandable, compile Silverscript templates, build and submit TN12 proof transactions, and keep going without requiring this computer to run a full node.

## What It Does Now

- See `docs/PROGRESS.md` for the current lane-by-lane build state and next work.
- Designs a vault policy with owner, recovery, withdrawal delay, daily limit, guardian count, and memo fields.
- Produces a deterministic policy ID in the browser.
- Simulates vault funding, delayed withdrawal, cancel, and recovery paths.
- Designs an assurance contract policy with recipient, refund address, target, pledge progress, minimum pledge, and deadline.
- Exports JSON artifacts for both flows.
- Generates a local TN12 test address with `kaspa-wasm`.
- Includes first Silverscript templates:
  - `contracts/DelayedRecoveryVault.sil`
  - `contracts/AssurancePledge.sil`
  - `contracts/Escrow.sil`
- Compiles those templates into `artifacts/`.
- Builds a dry-run transaction intent plan for vault funding, delayed withdrawal, recovery, assurance pledge, release, and refund.
- Builds, signs, and submits TN12 split, P2SH contract-funding, and P2SH contract-spend transactions from local fixtures.
- Shows accepted proof transactions and a Kaspa ecosystem build queue in the local UI.
- Builds a transaction-payload signal artifact as the first step toward accepted-transaction app indexing.
- Builds a cross-chain research library that maps PMF, failure modes, and open-source code patterns into Kaspa status lanes.
- Builds batch assurance campaign state from multiple pledge records without claiming pooled covenant enforcement.
- Builds an enforcement matrix that separates script-enforced, planner/indexer, wallet-policy, documentation, and simulation-only claims.
- Builds an escrow primitive registry and first escrow Silverscript template for buyer-approved release, timeout refund, and mutual cancel planning.
- Builds treasury/team vault registry state for spend caps, delayed large withdrawals, recovery, and payroll templates.
- Builds a transparent pre-Staghunt coordination-market prototype with Stag, Intendo, Pack, toy Solver, and Hunt-plan artifacts.
- Builds KRC/access-pass planner state for issuer-backed coupons, memberships, tickets, and redeemable claims.
- Builds a mainnet-readiness map that separates payment/indexer paths from TN12/Toccata covenant paths.
- Builds simple asset policy artifacts for issuer-indexed assets now and possible covenant-native assets later.
- Builds an auction/intent prototype for accepted bid payloads, planner-side winner selection, and refund planning.
- Builds a DeFi research backlog for swaps, lending, stable-value, insurance, derivatives, prediction hedges, and portfolio automation.
- Builds an AI-agent commitment board for task offers, deposits, completion proofs, disputes, release planning, and refund planning.
- Builds a repo-level build-status map for what is built, blocked, naturally next, and research-only.

## What It Does Not Do Yet

- It does not connect to an external wallet UI.
- It does not run a local Kaspa full node.
- It does not implement pooled assurance target aggregation yet.
- It does not claim mainnet covenant support.
- It does not implement full vProgs, mature native DeFi, or cross-app atomic composition.

## Manual Address Checks

Create or reuse a TN12 test address:

```sh
npm run address
```

The script prints a `kaspatest:` address for the faucet and writes testnet-only wallet material to:

```txt
.local/tn12-wallet.json
```

`.local/` is ignored by git. Do not use that private key for mainnet funds.

Print public wallet metadata without printing the private key:

```sh
npm run wallet:public
```

Current saved address:

```txt
kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt
```

Fetched TN12 UTXO:

```txt
txid: f6ca76d93accf1a468de36ba35439bc8ca5cb2e1ba28f30b3220586e90bb0aee
index: 0
amount: 10000 TKAS
```

Refresh that fixture:

```sh
npm run utxos:fetch
```

Accepted TN12 proof transactions are tracked in `docs/STATUS.md`. The most important spends are:

```txt
vault recovery:  b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391
vault withdraw:  9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710
pledge release:  80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f
pledge refund:   faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61
```

Use a browser for faucet and explorer checks:

```txt
https://faucet-tn12.kaspanet.io/
https://tn12.kaspa.stream/
https://api-tn12.kaspa.org/
```

From this shell, the faucet returned a Cloudflare challenge, so token requests are manual. Treat all tokens as TN12-only and worthless.

## Silverscript Templates

Draft templates live in:

```txt
contracts/DelayedRecoveryVault.sil
contracts/AssurancePledge.sil
```

Build `silverc` from the Silverscript repo, then compile:

```sh
cd /home/parker2017/silverscript-tools
cargo build --release -p silverscript-lang --bin silverc
cd /home/parker2017/tn12-covenant-vault-demo
npm run fixtures
npm run compile:contracts
```

`npm run fixtures` derives public constructor args from the saved testnet wallet and writes public metadata to `fixtures/SavedWallet.public.json`. The private key stays in `.local/tn12-wallet.json`.

The compiled artifacts are written to `artifacts/`. The current assurance template is an individual pledge primitive: it can release a pledge to the recipient path or refund the contributor after the deadline. Campaign target aggregation still belongs in the app/planner layer until a pooled covenant or proof-backed design is added.

## Dry-Run Transaction Planner

Generate the current transaction intent plan:

```sh
npm run plan
```

Write one draft artifact per planned transaction:

```sh
npm run drafts
```

Build a signed local P2PK self-send draft from the fetched UTXO without broadcasting:

```sh
npm run tx:p2pk
```

This command proves local transaction construction and signing against the funded TN12 UTXO. It writes `artifacts/signed-drafts/self-send-p2pk.json` and does not submit anything to the network.

Build signed local contract-funding drafts for the vault and assurance pledge without broadcasting:

```sh
npm run tx:contracts
```

Those drafts both reference the same fetched UTXO. They are mutually exclusive unless the source funding is split first; broadcasting one would spend the source outpoint and invalidate the other.

Build the safer first broadcast candidate, a signed self-send split into separate vault and assurance buckets:

```sh
npm run tx:split
```

The default split sizes are small enough for the current post-proof wallet fixture. Override them only when the fetched UTXO is large enough:

```sh
VAULT_BUCKET_TKAS=100 ASSURANCE_BUCKET_TKAS=500 npm run tx:split
```

Fetch accepted split outputs into bucket fixtures:

```sh
npm run split:fetch
```

Fetch accepted P2SH contract outputs:

```sh
npm run contracts:fetch
```

Build signed P2SH spend drafts for vault withdraw/recover and assurance release/refund:

```sh
npm run tx:spends
```

Verify the accepted proof transactions and expected outputs through the public TN12 API:

```sh
npm run tx:verify
npm run proof:evidence
```

`npm run proof:evidence` resolves each proof spend's previous output and checks the important shape: P2SH (`p...`) contract input to expected P2PK (`q...`) wallet output.

Build the reusable accepted-transaction app-state snapshot:

```sh
npm run indexer:state
```

Build a compact transaction-payload receipt artifact for the accepted-transaction indexer lane:

```sh
npm run signal:payload
```

Build the invoice registry for the first payload receipt app:

```sh
npm run invoice:registry
```

This turns `fixtures/InvoiceReceipts.json` into `artifacts/invoice-registry.json`. An invoice stays draft/unpaid until an accepted TN12 transaction carries the matching receipt payload and the txid is added as an accepted receipt.

Check whether the public TN12 REST submit schema advertises payload submission:

```sh
npm run payload:readiness
```

This turns the current TN12 OpenAPI schema plus the signed payload draft into `artifacts/payload-submit-readiness.json`. If the submit model lacks a payload field, the invoice receipt must not be broadcast through that route by default.

Build a signed self-send draft that carries that receipt as transaction payload:

```sh
npm run tx:payload
```

This creates `artifacts/signed-drafts/payload-receipt-self-send.json`. It is intentionally marked as requiring payload-submit support verification before broadcast, because the TN12 REST OpenAPI submit model currently does not list a payload field even though fetched transactions expose payload data.

Inspect the REST submit payload without broadcasting:

```sh
npm run tx:submit:dry
```

Build the signed-draft review registry for the browser submit console:

```sh
npm run submit:registry
```

The submit console reads signed draft artifacts, shows input/output/payload summaries, and prints dry-run plus explicit submit commands. It does not read `.local/tn12-wallet.json` or expose private keys.

Build the cross-chain app research library:

```sh
npm run research:library
```

This turns `fixtures/CrossChainResearchLibrary.json` into `artifacts/research-library.json`. The library uses open-source apps and Kaspa docs as PMF/code-pattern research, then remaps every candidate to a live Kaspa, TN12/Toccata, roadmap, or research lane before any app claims are made.

Build the batch assurance campaign planner state:

```sh
npm run campaign:state
```

This turns `fixtures/BatchAssuranceCampaign.json` into `artifacts/batch-assurance-campaign.json`. Accepted pledge records count toward release readiness; signed-only or draft pledge records are visible as planned progress only.

Build the enforcement matrix:

```sh
npm run enforcement:matrix
```

This turns `fixtures/EnforcementMatrix.json` into `artifacts/enforcement-matrix.json`. It is the claim audit: browser features are not covenant guarantees unless marked `script`.

Build the escrow primitive registry:

```sh
npm run escrow:registry
```

This turns `fixtures/EscrowPrimitives.json` into `artifacts/escrow-primitives.json`. It is currently planner/indexer state only; accepted TN12 escrow covenant proofs are the next hardening step.

Build the treasury/team vault registry:

```sh
npm run treasury:registry
```

This turns `fixtures/TreasuryVaults.json` into `artifacts/treasury-vaults.json`. Current script proof covers delayed withdrawal and recovery primitives; payroll and spend caps remain wallet-policy/planner state until hardened.

Build the transparent coordination-market prototype:

```sh
npm run coordination:market
```

This turns `fixtures/CoordinationMarketPrototype.json` into `artifacts/coordination-market-prototype.json`. It is not a Hashdag/Staghunt implementation; it is a transparent toy planner for Stag, Intendo, Pack, Solver, and Hunt before opacity, capital multiplexing, composability, and atomic execution exist.

Build the access pass planner:

```sh
npm run access:passes
```

This turns `fixtures/AccessPassPlanner.json` into `artifacts/access-pass-planner.json`. Passes and redemptions are issuer/indexer flows, not native covenant-enforced tickets.

Build the mainnet-readiness map:

```sh
npm run mainnet:readiness
```

This turns `fixtures/MainnetReadiness.json` into `artifacts/mainnet-readiness.json`. It separates components that can become mainnet payment/indexer products from TN12/Toccata-only covenant work and research-only lanes.

Build the simple asset policy registry:

```sh
npm run asset:policies
```

This turns `fixtures/SimpleAssetPolicies.json` into `artifacts/simple-asset-policies.json`. It contrasts issuer-indexer asset state with future covenant-native asset rules; it is not a live native asset protocol.

Build the auction/intent prototype:

```sh
npm run auction:intents
```

This turns `fixtures/AuctionIntentPrototype.json` into `artifacts/auction-intents.json`. It ranks accepted bid payloads for planner-side winner/refund state, but it is not MEV-resistant and does not enforce atomic asset exchange.

Build the DeFi research backlog:

```sh
npm run defi:backlog
```

This turns `fixtures/DefiResearchBacklog.json` into `artifacts/defi-backlog.json`. It keeps AMMs, lending, stable-value, insurance, derivatives, prediction hedges, and portfolio automation in a research/missing-rails lane.

Build the AI-agent commitment board:

```sh
npm run agent:commitments
```

This turns `fixtures/AgentCommitments.json` into `artifacts/agent-commitments.json`. It tracks task offers, accepted proof payloads, disputes, release planning, and refund planning without claiming autonomous payouts.

Build the repo status map:

```sh
npm run build:status
```

This turns `fixtures/BuildStatus.json` into `artifacts/build-status.json`. It is the canonical local answer for what is built, what is blocked, what remains natural next, and which proof/readiness labels apply.

Actual submission is intentionally not the default. The submit helper requires an explicit `--submit` argument:

```sh
node scripts/submit-signed-draft.mjs artifacts/signed-drafts/vault-recovery.json --submit
```

Optional amounts:

```sh
npm run plan -- --vault-funding-tkas=25 --vault-withdrawal-tkas=5 --assurance-pledge-tkas=250
```

The planner reads the compiled Silverscript artifacts and emits JSON for:

- vault funding,
- vault delayed withdrawal,
- vault recovery,
- assurance pledge,
- assurance release,
- assurance refund.

It is intentionally not a broadcaster. It does not discover outputs, sign inputs, or submit to TN12. Its job is to make the next transaction-builder step concrete while keeping the assurance boundary explicit.

## Build Plan

1. Done: manual funding, outpoint fixtures, Silverscript compile artifacts, signed drafts, split funding, contract funding, vault recovery, vault delayed withdrawal, assurance release, assurance refund, and TN12 API verification.

2. Next: add wallet-facing UX that never exposes the private key, shows exact source outputs, and makes submit actions explicit.

3. Next: build batch assurance aggregation around multiple pledge outputs before claiming a real campaign product.

4. Next: add escrow as the next covenant primitive: buyer fund, seller release, timeout refund, mutual cancel.

5. Next: build an accepted-transaction indexer that reads outputs and payload receipts into app-state snapshots.

6. Next: keep miner-signal ideas in research until a transaction-payload, coinbase-payload, or pool-policy design is explicit. Do not claim arbitrary block-header app data.

7. Next: build a cross-chain app research library that studies open-source apps, PMF evidence, and failure modes from other ecosystems, then maps only the reusable patterns into Kaspa's live, TN12, roadmap, or research lanes.

8. Next: use the master app plan in `docs/MASTER_APP_PLAN.md` as the operating build order for payload receipts, submit review, batch assurance, escrow, treasury vaults, access passes, assets, auctions, DeFi research, cross-chain research, miner/pool signals, and AI-agent commitments.

## Run Locally

```sh
npm run serve
```

Open:

```txt
http://127.0.0.1:4176/
```

## Check

```sh
npm run check
npm run check:negative
npm run check:all
```

## Assurance Contracts

The strongest app lane is an assurance contract: contributors pledge funds toward a goal, funds release only if the goal is met before a deadline, and contributors can refund otherwise.

See `docs/ASSURANCE_CONTRACTS.md`.
