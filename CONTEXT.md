# TN12 Covenant Vault Demo Context

Future agents should read this file before editing. It is the current handoff for the local Kaspa TN12 vault, assurance, and app-indexer prototype.

## Repo And Preview

- Repo path: `/home/parker2017/tn12-covenant-vault-demo`
- Branch: `main`
- Local preview URL: `http://127.0.0.1:4176/`
- Preview command: `npm run serve`
- Main check command: `npm run check`
- TN12 proof check command: `npm run tx:verify`
- Accepted app-state snapshot command: `npm run indexer:state`

The local preview server has been running on port `4176`. If it is not running, start it from this repo with `npm run serve`.

## Current Goal

Build a real TN12-configured Kaspa covenant app stack, starting with:

- delayed recovery vaults,
- assurance contracts / public-funding rules,
- transaction planning and signing from manually verified TN12 outpoints,
- accepted-transaction indexing,
- payload receipts,
- later escrow and campaign batching.

The project no longer depends on a local full Kaspa node. It uses public TN12 REST endpoints, local fixtures, local signing, and explicit submit commands.

## Hard Boundaries

- Plain operating rule: be proactive with tooling and environment setup; do the work, verify it, then report what changed.
- This is testnet-only. Do not imply mainnet covenant activation.
- Do not use or print private keys. `.local/tn12-wallet.json` may be read by signing scripts but must never be pasted into docs, source, UI, or chat.
- Mainnet addresses use `kaspa:`. TN12 addresses use `kaspatest:`.
- Do not reintroduce local `kaspad` or `/home/parker2017/kaspa-node`; the user explicitly wanted node work removed.
- Do not edit or publish `/home/parker2017/kaspa-explained` from this repo unless explicitly asked.
- For miner-signal ideas, do not claim arbitrary app data can go into block headers. Use transaction payloads first; coinbase payload or pool policy is later mining-software research.

## Design Direction

The UI was aligned with the newer Kaspa Explained look:

- dark background,
- subtle grid,
- restrained panels,
- sticky nav,
- compact status pills,
- source/status discipline.

Files involved:

- `index.html`
- `styles.css`
- `app.js`

The hero should say this is TN12 configured with accepted proof transactions, not "local simulation".

## Wallet And Address State

Saved TN12 wallet:

```txt
.local/tn12-wallet.json
```

Public saved address:

```txt
kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt
```

Current public wallet metadata fixture:

```txt
fixtures/SavedWallet.public.json
```

Initial fetched 10,000 TKAS UTXO:

```txt
f6ca76d93accf1a468de36ba35439bc8ca5cb2e1ba28f30b3220586e90bb0aee:0
```

That initial UTXO has already been used during proof work. The current `fixtures/FundedWalletOutpoint.json` may point at a later change output, so refresh with `npm run utxos:fetch` before preparing new spend attempts.

## Accepted TN12 Proofs

These proof transactions are accepted and verified by `npm run tx:verify`:

```txt
Vault recovery:
b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391

Vault delayed withdrawal:
9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710

Assurance release:
80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f

Assurance refund:
faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61
```

Fixtures:

- `fixtures/AcceptedProofTransactions.json`
- `fixtures/AcceptedAppState.json`

The accepted app-state snapshot currently has 4 records, 4 accepted, 4 output-matched.

## Implemented Commands

Core:

```sh
npm run check
npm run serve
npm run address
npm run wallet:public
```

Fixtures and contracts:

```sh
npm run fixtures
npm run compile:contracts
```

Planning and drafts:

```sh
npm run plan
npm run drafts
npm run tx:p2pk
npm run tx:split
npm run tx:contracts
npm run tx:spends
```

Fetch/update fixtures:

```sh
npm run utxos:fetch
npm run split:fetch
npm run contracts:fetch
```

Submit and verify:

```sh
npm run tx:submit:dry
node scripts/submit-signed-draft.mjs <artifact-path> --submit
npm run tx:verify
```

Indexer and payload work:

```sh
npm run indexer:state
npm run signal:payload
```

`tx:submit:dry` is intentionally non-broadcast. Actual network submission requires explicit `--submit`.

## Implemented Source Areas

Contracts:

- `contracts/DelayedRecoveryVault.sil`
- `contracts/AssurancePledge.sil`

Core modules:

- `src/vaultPolicy.mjs`
- `src/assuranceContract.mjs`
- `src/manualOutpoint.mjs`
- `src/transactionPlanner.mjs`
- `src/transactionDrafts.mjs`
- `src/signedContractDrafts.mjs`
- `src/contractSpendDrafts.mjs`
- `src/submitPayload.mjs`
- `src/acceptedIndexer.mjs`
- `src/signalPayload.mjs`

Scripts:

- address/wallet helpers,
- Silverscript compile helper,
- constructor fixture generator,
- dry-run planner,
- signed transaction draft builders,
- REST submit helper,
- accepted transaction verifier,
- accepted app-state builder,
- signal payload artifact builder.

UI sections now include:

- vault designer,
- assurance designer,
- manual outpoint importer,
- accepted TN12 proof cards,
- accepted transaction indexer,
- vault templates,
- Kaspa app lab,
- miner signal research,
- signal payload artifact builder,
- setup/source discipline.

## Assurance Contract Caveat

`AssurancePledge.sil` is an individual pledge primitive.

Current proof scope:

- individual pledge release works,
- individual pledge refund works,
- target aggregation is not yet enforced by the contract.

Next assurance work must add campaign-level state, multi-pledge fixtures, and batch release/refund planning before claiming a real campaign product.

## Payload Receipt Work In Progress

The user asked to continue into payload receipt decoding, then asked to update the plan/context before proceeding. Payload implementation was started conceptually but not completed.

Current payload state:

- `src/signalPayload.mjs` builds a compact receipt artifact.
- `scripts/build-signal-payload.mjs` writes `artifacts/signal-payload.json`.
- `npm run signal:payload` passes and reports payload byte/transient-mass details.
- `npm run tx:payload` builds `artifacts/signed-drafts/payload-receipt-self-send.json` with payload bytes preserved in the signed transaction and submit payload candidate.
- `src/acceptedIndexer.mjs` has a receipts placeholder in `appState.receipts`.

Next payload steps:

1. Verify a payload-preserving submit route. Local testing showed `kaspa-wasm createTransaction(..., payload, ...)` needs a `Uint8Array`; a plain string created an empty payload.
2. The TN12 REST OpenAPI submit model checked on 2026-05-07 does not list a payload field, so payload artifacts are guarded from accidental `--submit`.
3. Add a fixture for a submitted/accepted payload txid only after a real TN12 payload transaction is broadcast and verified.
4. Extend `src/acceptedIndexer.mjs` and the UI to show decoded receipts from accepted payload transactions.

Official docs note: the long-term accepted-transaction indexer should use checkpointed `getVirtualChainFromBlockV2` with high data verbosity when running against a node or RPC backend, because that exposes full transaction data including payloads and supports rollback handling. This repo is currently using REST txid pulls only because the local node workflow was removed.

Do not fake an accepted payload transaction. Keep it as a draft until submitted and verified.

## Miner Signal Research Boundary

Current files:

- `fixtures/MinerSignalResearch.json`
- signal research UI in `index.html` and `app.js`

Correct framing:

- Transaction payload: good first app-data lane for receipts and metadata hashes.
- Coinbase payload: miner/pool-controlled surface, later research.
- Block header: not an arbitrary app-data channel.
- RTD-style miner sampling: later research requiring anti-spam, anti-bribery, pool centralization, and MEV analysis.

## Kaspa Explained Alignment

The app was aligned with Kaspa Explained framing:

- mainnet live: Kaspa PoW blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS,
- TN12: covenant testnet experimentation,
- Toccata: targeted hard-fork path,
- vProgs: roadmap architecture,
- RTD/miner signals/oracles: research lane.

Use restrained, source-first language. Do not hype or overstate.

## Kaspa Docs Review

A deeper pass through `https://docs.kaspa.org/` is recorded in:

```txt
docs/KASPA_DOCS_REVIEW.md
```

Key implications:

- Use Covenants for the current vault, assurance, treasury, escrow, and small state-machine work.
- Use the high-level Wallet API or an RPC-backed route for the first accepted payload receipt if REST submit does not preserve payload.
- Use checkpointed `getVirtualChainFromBlockV2` later for production-style accepted transaction indexing.
- Keep Based Apps, full vProgs, and Inline ZK out of current claims unless a later app actually needs shared-state concurrency, cross-app composition, or per-action proofs.

## Kaspa Explained Resource Pass

A broader pass through the Kaspa Explained repo is recorded in:

```txt
docs/ECOSYSTEM_BUILD_PLAN.md
```

That plan translates `application-layer.html`, `builder-guide.html`, `status.html`, `sources.html`, `adoption-metrics.html`, `kaspa-in-one-screen.html`, `CONTENT_BRIEF.md`, `CLAIMS.yml`, and `llms.txt` into a one-by-one app build queue for this repo.

Current app build order:

1. payload receipt / invoice app,
2. wallet-facing submit console,
3. batch assurance campaign,
4. escrow primitive,
5. KRC/access-pass planner,
6. treasury/team vault,
7. simple asset/redeemable claim,
8. auction/intent primitive,
9. miner/pool signal research app,
10. AI-agent commitment board.

## Next Build Plan

Recommended order from here:

1. Finish payload receipt draft support without broadcasting.
2. Build and inspect a signed self-send payload draft.
3. If the payload draft shape is correct, submit one tiny TN12 payload transaction with explicit `--submit`.
4. Add the accepted payload txid to fixtures after explorer/API verification.
5. Decode payload receipts in `src/acceptedIndexer.mjs`.
6. Surface decoded receipt events in the UI.
7. Start assurance campaign batching: multiple pledge fixtures, campaign state, batch release/refund drafts.
8. Start escrow primitive: `Escrow.sil`, funding draft, release draft, timeout refund draft, mutual cancel draft.
9. Add wallet-facing submit UI that displays exact inputs, outputs, fees, payload, and submit command before broadcast.
10. Add owner/recovery/recipient/refund key separation instead of using one saved test key for every role.

## Verification Before Handoff

Run:

```sh
npm run check
npm run tx:verify
npm run indexer:state
git diff --check
```

For UI changes, also check:

```sh
curl -sS http://127.0.0.1:4176/ | grep -E "TN12 configured|Accepted transaction indexer"
```
