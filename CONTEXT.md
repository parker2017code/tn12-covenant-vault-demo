# TN12 Covenant Vault Demo Context

Future agents should read `MEMORY.md` first, then this file before editing. `MEMORY.md` is the short routing layer; this file is the longer handoff for the local Kaspa TN12 vault, assurance, and app-indexer prototype.

## Repo And Preview

- Repo path: `/home/parker2017/tn12-covenant-vault-demo`
- Branch: `main`
- Local preview URL: `http://127.0.0.1:4176/`
- Preview command: `npm run serve`
- Main check command: `npm run check:all`
- Full public TN12 evidence command: `npm run check:tn12`
- TN12 proof check command: `npm run tx:verify`
- Role-separated proof check command: `npm run tx:roles:verify`
- Role-separated proof evidence command: `npm run roles:proof:evidence`
- Role-separated invalid-candidate command: `npm run roles:invalid-candidates`
- Payload-event check command: `npm run payload:verify:events`
- Accepted app-state snapshot command: `npm run indexer:state`
- Checkpointed accepted-index command: `npm run indexer:checkpoint`
- Persisted checkpoint guard command: `npm run indexer:persist`
- Wallet-review readiness command: `npm run wallet:review`
- Mainstream app direction command: `npm run mainstream:direction`
- Missing rails matrix command: `npm run rails:missing`
- Rail research trigger command: `npm run rails:research`
- Oracle source matrix command: `npm run oracle:matrix`
- Ordered project queue command: `npm run project:queue`
- Durable indexer schema command: `npm run indexer:schema`
- Durable indexer fixture replay command: `npm run indexer:replay`
- AI/source discipline command: `npm run ai:discipline`
- Current roadmap / lane map: `docs/ROADMAP_STATE.md`
- High-impact mainstream app direction: `docs/MAINSTREAM_APP_DIRECTION.md`
- AI/source discipline: `docs/AI_CODING_SOURCE_DISCIPLINE.md`
- TN12 tested/not-tested map: `docs/TN12_TEST_MATRIX.md`

The local preview server has been running on port `4176`. If it is not running, start it from this repo with `npm run serve`.

## Current Goal

Build a real TN12-configured Kaspa covenant app stack. The durable lane map is `docs/ROADMAP_STATE.md`; update it when proof status, roadmap status, or research boundaries change.

The immediate build shape is three real verticals first:

- invoice/receipt app: accepted-transaction app state and wallet/indexer rails, not the adoption thesis by itself,
- escrow/assurance app: TN12 covenant proof app,
- attestation/agent/prediction/coordination simulator: research-to-app bridge.

Do not build twenty fake apps at the same depth. Keep the rest of the lanes attached to those rails or clearly marked as research.

Current strategic source discipline:

- Generic merchant/POS payments are not the headline 2026 adoption vector; payment, receipt, wallet, and payload work are rails.
- Coordination markets, product activity, visible accepted on-chain state, liquidity, and L1-first app architecture get higher weight.
- Public AI-agent and open-source repo practices are useful when they are public and testable; unknown private company workflows stay marked unknown.
- Persistent agent rules should stay short and executable. Longer rationale belongs in `docs/AI_CODING_SOURCE_DISCIPLINE.md` and generated artifacts.

The current base includes:

- delayed recovery vaults,
- assurance contracts / public-funding rules,
- escrow release/refund paths,
- transaction planning and signing from manually verified TN12 outpoints,
- role-separated covenant proof fixtures and accepted role-separated spends,
- accepted-transaction indexing,
- payload receipts and accepted payload events,
- campaign batching and app-lane research.

The project no longer depends on a local full Kaspa node. It uses public TN12 REST endpoints, local fixtures, local signing, and explicit submit commands.

Current attestation provenance state:

- `npm run attestation:reputation` writes `artifacts/attestation-reputation-thresholds.json`.
- The artifact records signer provenance, active/revoked signer status, conflict sets, quorum thresholds, stale/unresolved/revoked signal states, and dashboard policy.
- `dashboardInfluenceEnabled` is currently `false`. Future dashboards should consume only `influenceAllowed` signals from that artifact, not raw registry `influenceReady` flags.

## Hard Boundaries

- Operating rule: do the work, verify it, then report what changed.
- TN12 evidence rule: positive app-state transitions need accepted TN12 transaction evidence before they are marked done. Local reducer tests are for adversarial, duplicate, stale, malformed, or unsafe cases; they do not replace a safe testnet transaction for real state changes.
- Testnet-only. Keep mainnet covenant activation out of the claims.
- Keep private keys private. `.local/tn12-wallet.json` may be read by signing scripts but must never be pasted into docs, source, UI, or chat.
- Mainnet addresses use `kaspa:`. TN12 addresses use `kaspatest:`.
- Public TN12 APIs, explorer data, and local fixtures are the default. Reintroduce local `kaspad` or `/home/parker2017/kaspa-node` only on direct request.
- Edit or publish `/home/parker2017/kaspa-explained` only when the user asks for that repo.
- For unclear protocol behavior, check artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK/API shape, node/network id, and Rusty Kaspa source/tests before escalating. A good escalation includes the txid, artifact path, endpoint response, source line, and smallest reproducer command.
- Miner-signal ideas start with transaction payloads. Coinbase payload or pool policy is later mining-software research.
- Research-trigger rule: when plans mention oracle/price feeds, Kaskad, lending, liquidation, collateral, miner/RTD sampling, bridge anchors, DEX, AMM, LP shares, or MEV, run or inspect `npm run rails:research` and keep claims in research until the first artifact exists.
- Broad-continuation rule: when the user asks what to build next overall, run or inspect `npm run project:queue`; current top order is wallet connector submit, durable virtual-chain indexer, accepted pledge outputs, batch-assurance settlement drafts, then escrow marketplace demo.

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

Escrow release:
825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d

Escrow DAA-score refund:
6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d
```

Escrow mutual cancel is now accepted on TN12. The original submit used `sigOpCount=1` and hit script-unit exhaustion (`used=200870`, `limit=109999`), but that is historical bad configuration only. A later submit used old JS SDK signing/reconstruction that did not preserve tx v1 `computeBudget`. The corrected cancel was rebuilt with local TN12 `kaspa-wasm 1.1.1-toc.1`, submitted through JSON wRPC to `testnet-12`, and accepted as `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c`.

Accepted payload events are listed in `fixtures/PayloadEventEvidence.json` and verified by `npm run payload:verify:events`. The current set covers invoice paid/refund/error, access-pass redemption, auction bids, stable-value issuer issuance/redemption, miner/watcher attestation, prediction/hedge review state, agent task/proof/dispute state, and batch-assurance pledge/release planner state.

`npm run indexer:checkpoint` rebuilds `artifacts/checkpointed-accepted-index.json` from public TN12 transaction reads. It currently tracks 33 accepted records: 7 proof spends and 26 payload events.

Fixtures:

- `fixtures/AcceptedProofTransactions.json`
- `fixtures/AcceptedAppState.json`
- `artifacts/checkpointed-accepted-index.json`

The accepted proof set currently has 7 records, 7 accepted, and 7 output-matched contract spends.

## Implemented Commands

Core:

```sh
npm run check
npm run serve
npm run address
npm run wallet:public
npm run tx:submit:wrpc
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
- `src/roleSeparatedInvalidCandidates.mjs`
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
- persisted checkpoint guard,
- wallet-review readiness builder,
- wallet-connector readiness builder,
- signal payload artifact builder.
- prediction-hedge simulator builder.

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
- setup/source discipline,
- AI/source discipline artifact builder.

## Assurance Contract Caveat

`AssurancePledge.sil` is an individual pledge primitive.

Current proof scope:

- individual pledge release works,
- individual pledge refund works,
- target aggregation is not yet enforced by the contract.

## Payload Receipt Caveat

The public TN12 REST submit route must not be used for payload receipts. On 2026-05-07 it accepted a self-send payment but dropped the payload:

```txt
Accepted no-payload tx:
d67880665f81a4bb9966a0fbcf77d31b8b501ddd4098b8e5861831e5bc044bb4

Expected payload txid:
ae807e8d81fd46ad5f0f9f77128851cb181a37e7b90105fb8e89f5595955a4d9
```

Use `npm run tx:submit:wrpc` to inspect the wRPC candidate. Actual broadcast requires `KASPA_WRPC_URL=<ws-or-wss-url>` and still must be verified by fetching the accepted transaction payload before invoice state changes.

That wRPC path now has one accepted receipt:

```txt
Accepted payload receipt:
34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e

Verification:
npm run payload:verify
```

`artifacts/payload-receipt-evidence.json` confirms the accepted transaction payload matches the signed draft, decodes to `order-receipt / merchant-order-1337 / paid`, and pays the expected 1 TKAS output.

Next assurance work must replace planner payload references with amount-matched pledge custody outputs before claiming release/refund settlement.

## Payload Receipt State

Current payload state:

- `src/signalPayload.mjs` builds a compact receipt artifact.
- `scripts/build-signal-payload.mjs` writes `artifacts/signal-payload.json`.
- `npm run signal:payload` passes and reports payload byte/transient-mass details.
- `npm run tx:payload` builds `artifacts/signed-drafts/payload-receipt-self-send.json` with payload bytes preserved in the signed transaction and submit payload candidate.
- `npm run payload:verify` writes `artifacts/payload-receipt-evidence.json` for accepted tx `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`.
- `src/acceptedIndexer.mjs` decodes accepted receipt payloads into `appState.receipts`.

Role-separated proof state:

- Accepted role-separated funding: `ce1a94b8ced52cbc73e8f79c173e6b3611fa0c57fa3a712db64da290f555f4e0`.
- Accepted role-separated vault recovery: `dbe2c3ea5cf7e93031db468a8906be16fdc1a2e4b6382d14d7d01e67e71274e0`.
- Accepted role-separated assurance release: `fe2fba8819f3022f62892215b1bc4316377ffb7e54f833549d30bd247d8fda32`.
- Accepted role-separated escrow release: `4f882d934700667819a4c7ad84f51a63e9db4e7b8989bfd65089410051f47382`.
- Accepted role-separated escrow cancel: `677b9c3925c3e9fa6b8c62a3db5c44587a21b2951006395f827574dff7c7bdfa`.
- Accepted role-separated DAA vault withdrawal: `cb7da9329250a82bfbe53ce6a25855402de1dc9fdc5d856daa25576088b90b11`.
- Accepted role-separated DAA assurance refund: `a35937e44d0b517020f19aa3b7908b9f6f7c47c4bd4222ecf5cddc72a6b411fa`.
- Accepted role-separated DAA escrow refund: `7ac59de80c482402dd0d97e135ad8064e6ac237bcaab0191ea1bef8faa4735c0`.
- The failed role-vault recovery attempt with `sigOpCount: 2` is historical. The accepted retry uses `sigOpCount: 1`, matching the single `checkSig` in `recover(sig recoverySig)`.
- The failed Unix-time expired spends are historical. The accepted timed proofs use DAA-style lock values, not Unix seconds.

Next payload steps:

1. Keep JSON wRPC as the verified payload receipt route and REST submit as historical no-payload evidence.
2. Replace local signing with wallet review and the connector spec before any production-style receipt flow.
3. Add duplicate-payment, stale-receipt, and refund/error state checks.
4. Move from REST txid pulls to checkpointed accepted-transaction indexing later.

Official docs note: the long-term accepted-transaction indexer should use checkpointed `getVirtualChainFromBlockV2` with high data verbosity when running against a node or RPC backend, because that exposes full transaction data including payloads and supports rollback handling. This repo is currently using REST txid pulls only because the local node workflow was removed.

Do not use the old REST tx `d67880665f81a4bb9966a0fbcf77d31b8b501ddd4098b8e5861831e5bc044bb4` as invoice evidence. It is a payment/self-send proof only.

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

Use restrained, source-first language. Concrete claim first, status label second. Cut filler contrast frames, dramatic adjective piles, faux-bold certainty, and polished LLM cadence words. Treat UI labels, docs, fixtures, generated artifacts, LLM context, and handoff notes as product surface that needs the same care as code.

## Kaspa Docs Review

A deeper pass through `https://docs.kaspa.org/` is recorded in:

```txt
docs/KASPA_DOCS_REVIEW.md
```

Key implications:

- Use Covenants for the current vault, assurance, treasury, escrow, and small state-machine work.
- Use the high-level Wallet API or the verified JSON wRPC route for payload receipts; REST submit did not preserve payload.
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
9. basic DeFi primitive backlog: lending, borrowing, swaps/AMMs, stable-value units, insurance/protection, derivatives, prediction hedge simulation, and portfolio automation,
10. miner/pool signal research app,
11. AI-agent commitment board.

## Next Build Plan

Pause note, 2026-05-08:

- Latest pushed commit at pause: `7bfd10c Refresh TN12 evidence artifacts`.
- Remote check and Pages deployment were green after `7bfd10c`.
- Local invalid-candidate artifact is wired through `npm run roles:invalid-candidates`.
- `artifacts/role-separated-invalid-candidates.json` maps 32 local-review-only role-separated mutations across wrong signer, selector, output lock, amount, timed lock shape, and single-party cancel.
- `npm run check:all` and `npm run check:tn12` passed after the invalid-candidate wiring.
- `docs/MAINSTREAM_APP_DIRECTION.md` records the high-impact app direction and keeps mainstream crypto use cases in the pipeline without converting research ideas into proof claims.
- `artifacts/mainstream-app-direction.json` is the generated version of the high-impact app direction.
- `artifacts/missing-rails-matrix.json` answers the first-principles rail questions for DEX/AMM, lending, perps/prediction, bridge/source-chain, and stable-value use cases before any product claims.
- `artifacts/indexer-storage-schema.json` defines the durable indexer storage contract.
- `artifacts/indexer-replay-run.json` materializes the current 33 accepted records into table-shaped replay rows and keeps app state ready only when mismatches and rollback segments are zero.
- Do not submit invalid TN12 transactions until a candidate is reviewed and backed by a fresh expendable output.

Recommended order from here:

1. Add wallet-review and wallet-connector flow for payload receipt submission.
2. Replace known-txid checkpoint input with node/RPC virtual-chain reads feeding the replay tables.
3. Build accepted pledge-output custody transactions for batch assurance settlement.
4. Fund fresh role-separated outputs before trying invalid spend submissions.
5. Add reputation thresholds and signer provenance before signals affect more app lanes.
6. Keep the Node 24 GitHub Actions workflow verified after future action-version changes.

## Verification Before Handoff

Run:

```sh
npm run check
npm run tx:verify
npm run tx:roles:verify
npm run roles:proof:evidence
npm run indexer:state
git diff --check
```

For UI changes, also check:

```sh
curl -sS http://127.0.0.1:4176/ | grep -E "TN12 configured|Accepted transaction indexer"
```
