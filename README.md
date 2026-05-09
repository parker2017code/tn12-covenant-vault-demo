# TN12 Covenant Lab Notes

Small Kaspa TN12 proof workspace for covenant scripts, payload receipts, and the debugging notes needed to reproduce them.

The core is accepted TN12 covenant spends, accepted payload receipts, role-separated repeat proofs, and the debugging notes needed to reproduce them. The app-lane material turns those rails into fixtures, checks, and next build tasks.

All local keys and funds in this repo are testnet-only.

Start with [`docs/CORE_LAB_NOTES.md`](docs/CORE_LAB_NOTES.md) for accepted TN12 evidence, debugging notes, and the shortest current status. Then use [`docs/PROJECT_COMPLETION_PLAN.md`](docs/PROJECT_COMPLETION_PLAN.md), [`MEMORY.md`](MEMORY.md), [`docs/LLM_REVIEW_GUIDE.md`](docs/LLM_REVIEW_GUIDE.md), [`docs/TN12_TEST_MATRIX.md`](docs/TN12_TEST_MATRIX.md), and [`docs/ROADMAP_STATE.md`](docs/ROADMAP_STATE.md) to verify done/WIP/future state, GitHub state, Pages artifacts, txids, and status labels.
The L1 covenant, based-rollup, and vProg boundary lives in [`docs/PROGRAMMABILITY_PATHS.md`](docs/PROGRAMMABILITY_PATHS.md).

High-impact app direction lives in [`docs/MAINSTREAM_APP_DIRECTION.md`](docs/MAINSTREAM_APP_DIRECTION.md). It is the research queue for the next useful wallet, indexer, custody, and settlement rails.
AI/source discipline lives in [`docs/AI_CODING_SOURCE_DISCIPLINE.md`](docs/AI_CODING_SOURCE_DISCIPLINE.md). It keeps source checks, current Kaspa context, and coding-agent rules in one place.

Protocol-debugging rule: unclear TN12, Silverscript, Rusty Kaspa, signing, submit, serialization, or covenant behavior starts with local evidence: artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK/API shape, node/network id, and upstream source/tests. Escalation needs a txid, artifact path, endpoint response, source line, and smallest reproducer command.
Resolved escalation notes are tracked in [`docs/MICHAEL_QUESTIONS.md`](docs/MICHAEL_QUESTIONS.md).
General builder lessons from the escrow cancel debugging pass are tracked in [`docs/BUILDER_LESSONS.md`](docs/BUILDER_LESSONS.md).

## Current Position

- Accepted proof core: vault recovery, vault delayed withdrawal, assurance release, assurance refund, escrow release, escrow DAA-refund, and escrow mutual cancel.
- Accepted role-separated proof passes: TN12 accepted all seven distinct-key positive paths: vault recovery/withdrawal, assurance release/refund, and escrow release/refund/cancel.
- Accepted invoice payload events: paid, refunded, and error states now have TN12 JSON wRPC transactions and evidence artifacts.
- Accepted batch-assurance custody outputs: TN12 accepted one funding transaction with 45/35/20 TKAS pledge outputs, and the custody-import gate now matches those exact outpoints.
- Escrow mutual cancel is now accepted on TN12. The old script-unit rejection came from `sigOpCount=1` bad configuration; the accepted path is the corrected tx version 1 `computeBudget=30` draft rebuilt with local TN12 `kaspa-wasm 1.1.1-toc.1`.
- Near-term app priority: payload invoice/receipt vertical slice, because it is closest to mainnet-capable Kaspa behavior.
- Strategic framing: invoice/receipt work is a payment and accepted-state rail, not the headline adoption thesis. Current source discipline down-ranks generic merchant/POS adoption language and moves usable product activity, coordination-market direction, and visible on-chain metrics higher.
- Toccata-oriented priority: keep vault, assurance, escrow, and treasury primitives clean so they are ready to adapt when covenant tooling stabilizes.
- Research priority: keep based rollups, ZK, anchors, vProgs, prediction markets, and coordination markets in roadmap lanes until the missing rails are explicit.

## What It Does Now

- See `docs/PROGRESS.md` for the current lane-by-lane build state and next work.
- See `docs/PROJECT_COMPLETION_PLAN.md` for the explicit done/WIP/continuing/future plan and the criteria for when this phase is finished.
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
  - `contracts/EscrowExpired.sil`
- Compiles those templates into `artifacts/`.
- Builds a dry-run transaction intent plan for vault funding, delayed withdrawal, recovery, assurance pledge, release, and refund.
- Builds, signs, and submits TN12 split, P2SH contract-funding, and P2SH contract-spend transactions from local fixtures.
- Shows accepted proof transactions and a Kaspa ecosystem build queue in the local UI.
- Builds a transaction-payload signal artifact as the first step toward accepted-transaction app indexing.
- Builds a cross-chain research library that maps PMF, failure modes, and open-source code patterns into Kaspa status lanes.
- Builds batch assurance campaign state from multiple pledge records without claiming pooled covenant enforcement.
- Imports accepted 45/35/20 TKAS batch-assurance pledge outputs and builds a custody-release review artifact from those matched outpoints.
- Builds an enforcement matrix that separates script-enforced, planner/indexer, wallet-policy, documentation, and simulation-only claims.
- Builds an escrow primitive registry and escrow Silverscript templates for buyer-approved release, DAA-score timeout refund, and mutual cancel planning.
- Builds treasury/team vault registry state for spend caps, delayed large withdrawals, recovery, and payroll templates.
- Builds a transparent pre-Staghunt coordination-market prototype with Stag, Intendo, Pack, toy Solver, Hunt-plan artifacts, and a settlement/app brief.
- Builds KRC/access-pass planner state for issuer-backed coupons, memberships, tickets, and redeemable claims.
- Builds a mainnet-readiness map that separates payment/indexer paths from TN12/Toccata covenant paths.
- Builds simple asset policy artifacts for issuer-indexed assets now and possible covenant-native assets later.
- Builds an auction/intent prototype for accepted bid payloads, planner-side winner selection, and refund planning.
- Builds a DeFi research backlog for swaps, lending, stable-value, insurance, derivatives, prediction hedges, and portfolio automation.
- Builds an AI-agent commitment board for task offers, deposits, completion proofs, disputes, release planning, and refund planning.
- Builds a repo-level build-status map for what is built, blocked, naturally next, and research-only.

## Next Rails

- Wire an external wallet UI for no-local-key signing.
- Keep wallet connector artifacts as review and state-ledger surfaces until the adapter is wired.
- Use public TN12 APIs and fixtures by default; bring back local node work only when needed.
- Build pooled assurance target aggregation after the current matched-output path is reviewed.
- Review one batch-assurance release or refund path; the current artifacts are signed and mutually exclusive.
- Keep mainnet covenant work in the Toccata/mainnet tooling lane.
- Track vProgs, mature native DeFi, and cross-app atomic composition as later rails.

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
npm run fixtures:roles
npm run compile:contracts
npm run compile:roles
```

`npm run fixtures` derives public constructor args from the saved testnet wallet and writes public metadata to `fixtures/SavedWallet.public.json`. The private key stays in `.local/tn12-wallet.json`.

`npm run fixtures:roles` creates role-separated testnet keys for the next proof pass and writes only public metadata plus constructor args to `fixtures/RoleSeparatedWallets.public.json` and `fixtures/role-separated/`. Private role keys stay in `.local/tn12-role-wallets.json`. `npm run compile:roles` compiles those role-separated constructor fixtures to `artifacts/role-separated/` without changing the historical accepted-proof artifacts.

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

Build signed local contract-funding drafts for the vault, assurance pledge, and escrow without broadcasting:

```sh
npm run tx:contracts
```

These drafts consume separate split buckets when those fixtures are current. Escrow funding and DAA-expired escrow refund funding have accepted TN12 proof in the current artifact set.

Build signed escrow spend drafts after accepted escrow funding has been fetched:

```sh
npm run tx:escrow:spends
```

Escrow release, refund, and cancel drafts are mutually exclusive for a single escrow output. The current release, DAA-refund, and mutual-cancel proofs use separate funded escrow outputs and are all accepted on TN12.

Build the safer first broadcast candidate, a signed self-send split into separate vault and assurance buckets:

```sh
npm run tx:split
npm run tx:roles:fund
```

The default split sizes are small enough for the current post-proof wallet fixture. Override them only when the fetched UTXO is large enough:

```sh
VAULT_BUCKET_TKAS=100 ASSURANCE_BUCKET_TKAS=500 npm run tx:split
```

Fetch accepted split outputs into bucket fixtures:

`npm run tx:roles:fund` builds `artifacts/signed-drafts/role-separated-funding.json`, a single reviewable transaction with role-separated vault, assurance, and escrow P2SH outputs. The current role-separated funding transaction is accepted on TN12:

```txt
ce1a94b8ced52cbc73e8f79c173e6b3611fa0c57fa3a712db64da290f555f4e0
```

```sh
npm run split:fetch
```

Fetch accepted P2SH contract outputs:

```sh
npm run contracts:fetch
```

After accepted role-separated funding, build role-separated spend drafts:

```sh
npm run tx:roles:spends
```

These drafts use distinct owner/recovery, contributor/recipient, and buyer/seller keys. The vault, assurance, and escrow role-separated drafts are mutually exclusive within each fresh contract output unless more role-separated outputs are funded.

Role-separated positive paths are accepted on TN12:

```txt
role-separated vault recovery:       dbe2c3ea5cf7e93031db468a8906be16fdc1a2e4b6382d14d7d01e67e71274e0
role-separated vault withdrawal:     cb7da9329250a82bfbe53ce6a25855402de1dc9fdc5d856daa25576088b90b11
role-separated assurance release:    fe2fba8819f3022f62892215b1bc4316377ffb7e54f833549d30bd247d8fda32
role-separated assurance refund:     a35937e44d0b517020f19aa3b7908b9f6f7c47c4bd4222ecf5cddc72a6b411fa
role-separated escrow release:       4f882d934700667819a4c7ad84f51a63e9db4e7b8989bfd65089410051f47382
role-separated escrow refund:        7ac59de80c482402dd0d97e135ad8064e6ac237bcaab0191ea1bef8faa4735c0
role-separated escrow cancel:        677b9c3925c3e9fa6b8c62a3db5c44587a21b2951006395f827574dff7c7bdfa
```

Historical failed attempts are preserved as configuration evidence only. The rejected role-vault recovery attempt with `sigOpCount: 2` was corrected to `sigOpCount: 1`. The rejected timed-path attempts used Unix seconds for the lock value; the accepted timed proofs use DAA-style lock value `6180000` and spend lockTime `6180001`.

Build signed P2SH spend drafts for vault withdraw/recover and assurance release/refund:

```sh
npm run tx:spends
```

Verify the accepted proof transactions and expected outputs through the public TN12 API:

```sh
npm run check:tn12
npm run tx:verify
npm run tx:roles:verify
npm run proof:evidence
npm run roles:proof:evidence
npm run covenant:adversarial
npm run roles:invalid-candidates
```

`npm run check:tn12` runs the full public TN12 evidence gate: historical proof transaction verification, role-separated proof verification, proof-shape evidence, payload-event verification, checkpoint rebuild, and persisted checkpoint guard. `npm run proof:evidence` and `npm run roles:proof:evidence` resolve each proof spend's previous output and check the important shape: P2SH (`p...`) contract input to expected P2PK (`q...`) wallet output.

`npm run covenant:adversarial` builds `artifacts/covenant-adversarial-coverage.json`. It is local coverage, not TN12 rejection evidence. It maps selector, witness, output-lock, amount, time-lock, input-mass, role-separation, and Silverscript-to-redeem-script checks for the seven accepted proof paths. It also keeps the current gaps visible: historical escrow cancel reused buyer/seller keys, the role-separated lane still needs fresh outputs for cancel/refund paths, and older vault/assurance accepted drafts need exact accepted-script preservation before they can be treated as clean script-mapping examples.

`npm run roles:invalid-candidates` builds `artifacts/role-separated-invalid-candidates.json`. It is local review material, not signed invalid transactions and not TN12 rejection evidence. The artifact maps 32 candidate mutations across the seven accepted role-separated proof paths: wrong signer, wrong selector, wrong output lock, wrong amount, bad lock shape for timed paths, and single-party cancel for mutual cancel. Fresh expendable outputs are still required before submitting any rejection proof.

Build the reusable accepted-transaction app-state snapshot:

```sh
npm run indexer:state
```

Build the checkpointed accepted-index artifact from public TN12 reads:

```sh
npm run indexer:checkpoint
npm run indexer:persist
npm run indexer:replay-plan
npm run indexer:schema
npm run indexer:replay
npm run indexer:virtual-chain-plan
npm run indexer:virtual-chain-run
npm run indexer:virtual-chain-adapter
npm run indexer:live-preflight
npm run indexer:endpoint-runbook
TN12_VIRTUAL_CHAIN_RPC_URL=<ws-or-wrpc-endpoint> npm run indexer:wrpc-probe
KASPA_WASM_MODULE=<tn12-sdk-path> TN12_VIRTUAL_CHAIN_RPC_URL=<ws-or-wrpc-endpoint> npm run indexer:live-window
```

This writes `artifacts/checkpointed-accepted-index.json`, `artifacts/persisted-checkpoint-guard.json`, `artifacts/indexer-replay-plan.json`, `artifacts/indexer-storage-schema.json`, `artifacts/indexer-replay-run.json`, `artifacts/virtual-chain-ingestion-plan.json`, `artifacts/virtual-chain-ingestion-run.json`, `artifacts/virtual-chain-reader-adapter.json`, `artifacts/virtual-chain-live-preflight.json`, `artifacts/virtual-chain-endpoint-runbook.json`, and optionally `artifacts/tn12-wrpc-endpoint-probe.json` plus `artifacts/virtual-chain-live-window.json`. The endpoint runbook is the next live-indexer checklist: configure `TN12_VIRTUAL_CHAIN_RPC_URL`, run the endpoint probe, read a bounded V2 live window through a TN12 SDK that exposes `getVirtualChainFromBlockV2`, compare returned rows, and persist only after rollback and payload/proof matching pass.

Build a compact transaction-payload receipt artifact for the accepted-transaction indexer lane:

```sh
npm run signal:payload
npm run attestation:reputation
```

`npm run attestation:reputation` writes `artifacts/attestation-reputation-thresholds.json`, the app-level source/signal gate for watcher, researcher, and pool attestations. It records signer provenance, conflict sets, source reputation, quorum thresholds, stale/unresolved/revoked states, and dashboard policy. Dashboard influence stays disabled unless accepted payload evidence, verified signatures, active signer provenance, resolved accuracy, no open conflict, source thresholds, and quorum thresholds all pass; the current fixture deliberately keeps influence disabled.

Build the invoice registry for the first payload receipt app:

```sh
npm run invoice:registry
```

This turns `fixtures/InvoiceReceipts.json` into `artifacts/invoice-registry.json`. An invoice stays draft/unpaid until an accepted TN12 transaction carries the matching receipt payload and the txid is added as an accepted receipt. The first accepted payload receipt is tx `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`.

Check whether the public TN12 REST submit schema advertises payload submission:

```sh
npm run payload:readiness
```

This turns the current TN12 OpenAPI schema, the signed payload draft, the observed REST submit attempt, and the accepted wRPC receipt evidence into `artifacts/payload-submit-readiness.json`. The public TN12 REST route accepted a spend but produced an accepted transaction with no payload, so that route must not be used for invoice receipts.

Build a signed self-send draft that carries that receipt as transaction payload:

```sh
npm run tx:payload
```

This creates `artifacts/signed-drafts/payload-receipt-self-send.json`. It is marked for the payload-aware route because the TN12 REST OpenAPI submit model does not list a payload field even though fetched transactions expose payload data. The first forced REST submit proved the caution was correct: accepted tx `d67880665f81a4bb9966a0fbcf77d31b8b501ddd4098b8e5861831e5bc044bb4` has no payload, while the JSON wRPC route accepted the matched payload-bearing tx.

Inspect the REST submit payload without broadcasting:

```sh
npm run tx:submit:dry
```

Inspect the wRPC payload-preserving submit candidate without broadcasting:

```sh
npm run tx:submit:wrpc
```

This reconstructs the signed transaction through `kaspa-wasm` and checks that the reconstructed txid still matches the payload-bearing draft. Actual wRPC broadcast is explicit and requires a trusted TN12 endpoint:

```sh
KASPA_WRPC_URL=<ws-or-wss-url> node scripts/submit-signed-draft-wrpc.mjs artifacts/signed-drafts/payload-receipt-self-send.json --submit
```

After broadcast, verify the accepted transaction payload with:

```sh
npm run payload:verify
```

This writes `artifacts/payload-receipt-evidence.json` and is the gate for marking invoice state paid.

Build the signed-draft review registry for the browser submit console:

```sh
npm run submit:registry
npm run wallet:review
npm run wallet:connector
npm run wallet:submit-package
npm run wallet:connector-requests
npm run wallet:adapter-run
npm run wallet:submit-ledger
npm run wallet:result-validation
npm run wallet:external-signer-gap
npm run wallet:unsigned-requests
npm run wallet:standard-map
npm run wallet:standard-requests
npm run wallet:standard-signer-validation
npm run wallet:implementation-slice
```

The submit console reads signed draft artifacts, shows input/output/payload summaries, and prints dry-run plus explicit submit commands. `npm run wallet:review` checks the published registry for testnet network, explicit submit commands, payload-route gating, and serialized secret fields. `npm run wallet:connector` writes the connector spec artifact. `npm run wallet:submit-package` writes the wallet handoff package for exact transaction review, payload-preserving submit, a no-local-key target, and explicit user action. `npm run wallet:connector-requests` writes `artifacts/wallet-connector-submit-requests.json`, the exact request bundle a connector should review. `npm run wallet:adapter-run` consumes that bundle into review sessions, preservation fingerprints, and not-submitted result rows. `npm run wallet:submit-ledger` writes `artifacts/wallet-connector-submit-ledger.json`, separating already accepted evidence rows from pending wallet-submit candidates. `npm run wallet:result-validation` writes `artifacts/wallet-submit-result-validation.json`, checking returned txids/routes against review-session fingerprints, payload bytes, v1 `computeBudget`, explicit user action, and accepted-evidence promotion rules. `npm run wallet:external-signer-gap` records the signed-local boundary. `npm run wallet:unsigned-requests` strips signature scripts into unsigned request templates. `npm run wallet:standard-map` selects PSKB/PSKT as the next standard candidate. `npm run wallet:standard-requests` writes two concrete candidate request objects: one payload receipt round trip and one v1 `computeBudget` covenant round trip. `npm run wallet:standard-signer-validation` checks returned signer metadata against those request fingerprints and catches mutation/compute-budget negative cases. `npm run wallet:implementation-slice` turns those into the next connector sequence.

Build the cross-chain app research library:

```sh
npm run research:library
npm run rollup:scout
npm run mainstream:direction
npm run rails:missing
npm run rails:research
npm run oracle:matrix
npm run project:queue
```

This turns `fixtures/CrossChainResearchLibrary.json` into `artifacts/research-library.json`, `fixtures/BasedRollupScout.json` into `artifacts/based-rollup-scout.json`, `fixtures/MainstreamAppDirection.json` into `artifacts/mainstream-app-direction.json`, `fixtures/MissingRailsMatrix.json` into `artifacts/missing-rails-matrix.json`, `fixtures/RailResearchTriggers.json` into `artifacts/rail-research-triggers.json`, `fixtures/OracleSourceMatrix.json` into `artifacts/oracle-source-matrix.json`, and `fixtures/NextWorkQueue.json` into `artifacts/next-work-queue.json`. The research library uses open-source apps and Kaspa docs as PMF/code-pattern research, then remaps every candidate to a live Kaspa, TN12/Toccata, roadmap, or research lane before any app claims are made. The mainstream direction artifact keeps the high-impact user-facing app targets in priority order. The missing-rails matrix answers the first-principles DEX, lending, perps, bridge, and stable-value dependency questions before any product claim. The rail research trigger registry routes oracle, Kaskad/lending, miner/RTD, bridge/source-chain, and DEX/AMM mentions to local sources, external sources, first questions, and the first artifact that must exist before claims are upgraded. The oracle matrix compares CEX weighted median, arbitrage-simulated fair price, signed reporter, miner/RTD, DCLOB, and source-chain anchor models before any oracle-backed app claim. The next-work queue is the single ordered answer for done, WIP, roadmap, and the next 30 tasks. The based-rollup scout tracks Maxim's TN12 based zk covenant rollup PoC, Hans' vProgs/runtime direction, Michael's covenant++ roadmap, and ecosystem rollup targets as planning inputs. It does not change current accepted TN12 proof claims.

Build the batch assurance campaign planner state:

```sh
npm run campaign:state
npm run campaign:custody
npm run campaign:custody-requirements
npm run campaign:pledge-outputs
npm run campaign:custody-imports
npm run campaign:pledge-funding-draft
npm run campaign:settlement-drafts
npm run campaign:settlement-decision
npm run campaign:submit-runbook
```

This turns `fixtures/BatchAssuranceCampaign.json` and `fixtures/BatchAssuranceCustodyImports.json` into the batch-assurance campaign, custody, funding, settlement, and submit-runbook artifacts. Accepted pledge records count toward release readiness; signed-only or draft pledge records are visible as planned progress only. The pledge-funding draft created 45/35/20 TKAS P2PK outputs, with generated pledge private keys stored only in `.local/tn12-batch-pledge-wallets.json` and public metadata in `fixtures/BatchAssurancePledgeWallets.public.json`; the rebuilt draft was accepted as `0b8196957a09832bc4469237ac75f315eba9c2f22678030eef92816a4e5cd69a`. `npm run campaign:submit-runbook` records the release/refund operator checklist before any submit.

Build the enforcement matrix:

```sh
npm run enforcement:matrix
```

This turns `fixtures/EnforcementMatrix.json` into `artifacts/enforcement-matrix.json`. It is the claim audit: browser features are not covenant guarantees unless marked `script`.

Build the escrow primitive registry:

```sh
npm run escrow:registry
npm run escrow:marketplace
npm run escrow:flow
```

This turns `fixtures/EscrowPrimitives.json` into `artifacts/escrow-primitives.json` and `artifacts/escrow-marketplace-demo.json`. The marketplace artifact maps buyer/seller listings, release/refund/cancel actions, accepted escrow proof backdrop, wallet connector dependency, and dispute boundaries. The repo also has `contracts/Escrow.sil`, `contracts/EscrowExpired.sil`, accepted escrow funding, an accepted escrow release proof, an accepted DAA-expired escrow refund proof, and an accepted mutual-cancel proof on a separate funded output.

Build the treasury/team vault registry:

```sh
npm run treasury:registry
npm run treasury:spends
npm run treasury:role-review
```

This turns `fixtures/TreasuryVaults.json` into `artifacts/treasury-vaults.json` and `artifacts/treasury-constrained-spends.json`. Current script proof covers delayed withdrawal and recovery primitives; payroll and spend caps remain wallet-policy/planner state until hardened. The constrained-spends artifact lists payroll and delayed-withdrawal drafts with cap, balance, delay, recipient, and wallet-review checks; it is not full treasury governance enforcement.

Build the transparent coordination-market prototype:

```sh
npm run coordination:market
npm run coordination:settlement-brief
```

This turns `fixtures/CoordinationMarketPrototype.json` into `artifacts/coordination-market-prototype.json`, then turns `fixtures/CoordinationMarketSettlementBrief.json` into `artifacts/coordination-market-settlement-brief.json`. It is not a Hashdag/Staghunt implementation; it is a transparent toy planner plus settlement/app brief for Stag, Intendo, Pack, Solver, and Hunt before opacity, capital multiplexing, atomic Hunt execution, and oracle/settlement rails exist.

Build the AI coding/source discipline artifact:

```sh
npm run ai:discipline
```

This turns `fixtures/AiCodingSourceDiscipline.json` into `artifacts/ai-coding-source-discipline.json`. It records public source-watch rules, current Kaspa Q&A implications, coding-agent failure modes, and agent operating principles. It is not a substitute for reading sources; it is the repo's guardrail against stale protocol claims, generic payment-thesis drift, EVM/L2 default drift, and instruction bloat.

Build the access pass planner:

```sh
npm run access:passes
npm run access:issuer-review
```

This turns `fixtures/AccessPassPlanner.json` into `artifacts/access-pass-planner.json`. Passes and redemptions are issuer/indexer flows, not native covenant-enforced tickets.

Build the mainnet-readiness map:

```sh
npm run mainnet:readiness
npm run invoice:mainnet-brief
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
npm run auction:settlement-drafts
npm run auction:custody-review
```

This turns `fixtures/AuctionIntentPrototype.json` into `artifacts/auction-intents.json` and `artifacts/auction-settlement-drafts.json`. It ranks accepted bid payloads for planner-side winner/refund state, then lists winner-release and loser-refund draft records. It is not MEV-resistant, does not prove bid custody, and does not enforce atomic asset exchange.

Build the DeFi research backlog:

```sh
npm run defi:backlog
npm run prediction:hedge
```

This turns `fixtures/DefiResearchBacklog.json` into `artifacts/defi-backlog.json`. `npm run prediction:hedge` turns accepted attestation signals, the attestation threshold artifact, and manual positions into `artifacts/prediction-hedge-simulator.json`. Verified accepted signals stay threshold-blocked until signer provenance, conflict, quorum, stale-state, and source checks allow influence. It keeps AMMs, lending, stable-value, insurance, derivatives, prediction hedges, and portfolio automation in a research/missing-rails lane.

Build the stable-value comparison brief:

```sh
npm run stable:value
```

This turns `fixtures/StableValuePaths.json` into `artifacts/stable-value-paths.json`. It compares issuer-backed, overcollateralized, synthetic, and external-stable paths without claiming a live native stablecoin.

Build the issuer-backed stable-value redemption state:

```sh
npm run stable:issuer
```

This turns `fixtures/StableIssuerRedemptions.json` into `artifacts/stable-issuer-redemptions.json`. It tracks accepted issuance and accepted redemption receipts for a demo issuer credit; signed-only redemption requests do not reduce accepted outstanding balance.

Build the AI-agent commitment board:

```sh
npm run agent:commitments
npm run agent:settlement-drafts
npm run agent:settlement-review
```

This turns `fixtures/AgentCommitments.json` into `artifacts/agent-commitments.json` and `artifacts/agent-settlement-drafts.json`. It tracks task offers, accepted proof payloads, disputes, release planning, hold planning, and refund planning without claiming autonomous payouts.

Build the repo status map:

```sh
npm run build:status
npm run project:plan
npm run project:queue
```

This turns `fixtures/BuildStatus.json` into `artifacts/build-status.json`. It is the canonical local answer for what is built, what is blocked, what remains natural next, and which proof/readiness labels apply.
`npm run project:plan` writes `artifacts/project-plan.json`: the operator view of what is done, WIP, next, later, and long-term.
`npm run project:queue` writes `artifacts/next-work-queue.json`: the all-in-one ordered build queue for the next 5, 10, 20, and 30 tasks.
`npm run project:next-ten` writes `artifacts/next-ten-execution-plan.json`: the current ten-task execution slice across wallet, indexer, custody, and signal-quality work.

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

2. Done: wallet-review readiness and wallet-connector spec artifacts over the signed draft registry. Next: replace local signing with a real wallet connector while keeping exact input/output/payload review.

3. Done: batch assurance planner aggregation has accepted TN12 payload records, amount-matched accepted pledge outputs, and signed-not-broadcast release/refund settlement drafts. Next: choose one mutually exclusive settlement path and review it through the wallet-submit surface before any TN12 submit.

4. Escrow primitive added: buyer fund, seller release, timeout refund, mutual cancel. Funding, release, DAA-refund, and mutual cancel now have accepted TN12 evidence on separate funded outputs.

5. Done: checkpointed accepted-index artifact and persisted checkpoint guard for 7 proof spends and 26 payload events. Next: move from known-txid public reads to a node/RPC backend with durable storage and virtual-chain rollback replay.

6. Done: local covenant adversarial map for seven accepted proof paths. Done: role-separated positive proofs for all seven vault, assurance, and escrow paths. Done: exact local invalid-candidate map before any TN12 rejection attempt. Next: fund fresh expendable outputs before submitting invalid rejection proofs.

7. Next: keep miner-signal ideas in research until a transaction-payload, coinbase-payload, or pool-policy design is explicit. Do not claim arbitrary block-header app data.

8. Next: build a cross-chain app research library that studies open-source apps, PMF evidence, and failure modes from other ecosystems, then maps only the reusable patterns into Kaspa's live, TN12, roadmap, or research lanes.

9. Next: use the master app plan in `docs/MASTER_APP_PLAN.md` as the operating build order for payload receipts, submit review, batch assurance, escrow, treasury vaults, access passes, assets, auctions, DeFi research, cross-chain research, miner/pool signals, and AI-agent commitments.

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
npm run check:tn12
```

## Assurance Contracts

The strongest app lane is an assurance contract: contributors pledge funds toward a goal, funds release only if the goal is met before a deadline, and contributors can refund otherwise.

See `docs/ASSURANCE_CONTRACTS.md`.
