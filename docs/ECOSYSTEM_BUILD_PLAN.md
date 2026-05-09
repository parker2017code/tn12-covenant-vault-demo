# Kaspa Ecosystem Builder Plan

This document translates the Kaspa Explained resource map into the build plan for this local TN12 builder repo.

The mainstream crypto app direction is tracked in `docs/MAINSTREAM_APP_DIRECTION.md`. That file is the priority map for high-impact use cases from other chains, including which ones are build-now and which stay in research.

Source repo reviewed:

```txt
/home/parker2017/kaspa-explained
```

Main source pages and files:

- `application-layer.html`
- `builder-guide.html`
- `status.html`
- `sources.html`
- `adoption-metrics.html`
- `kaspa-in-one-screen.html`
- `search.html`
- `CONTENT_BRIEF.md`
- `CLAIMS.yml`
- `llms.txt`
- `README.md`

## What Kaspa Explained Says We Are Building

Kaspa Explained frames the app layer as a staged builder map, not a single "smart contracts are live" claim.

The practical app thesis is:

- use the live network for wallets, payments, infrastructure, KRC-aware tooling, and confirmation-risk UX;
- use TN12/Toccata covenant work for bounded state-output apps such as vaults, escrow, assurance contracts, simple assets, and treasury controls;
- use accepted transaction indexing and payloads as app-state infrastructure;
- keep Based Apps, full vProgs, Inline ZK, RTD-derived oracle flows, miner attestations, and cross-app atomic composition in later or research lanes until evidence changes.

The builder rule is concrete-first:

- funds can only leave after a delay before "covenant vault";
- funds release only if enough people commit before "assurance contract";
- buyer can release or refund after timeout before "escrow";
- receipt data rides on an accepted payment before "payload-indexed app state";
- token or pass redemption needs issuer support before "asset ecosystem".

## Status Lanes We Must Preserve

### Live Now

- Kaspa PoW blockDAG.
- UTXO model.
- GHOSTDAG.
- Crescendo-era 10 BPS.
- Wallets, explorers, mining, node operation, payment flows.
- KRC20/KRC721 ecosystem-token tooling through indexed data, wallets, metadata, and off-chain redemption rules.

### TN12 / Toccata Target Lane

- Covenants.
- Silverscript.
- Covenant IDs and state-output rules.
- ZK proof hooks.
- Sequencing commitments.
- Vaults, escrow, assurance contracts, simple assets, UTXO state-machine demos.

### Roadmap

- Based Apps.
- Full vProgs.
- Native-feeling DeFi rails.
- Cross-app atomic composition.
- Apps that prove richer logic while sharing Kaspa ordering.
- Familiar DeFi products such as lending, collateralized borrowing, swaps, stable-value units, derivatives, and portfolio automation after the lower-level rails are explicit.

### Research

- DAGKnight activation and higher-BPS sampling.
- RTD-derived attestations.
- Oracle markets.
- First-to-know signal markets.
- MEV-aware ordering/auctions.
- TangVM-style flows.
- Proof of Useful Work.
- AI-agent commitments with external proofs.

## What This Repo Already Built

### Vault Lane

Built:

- Browser vault policy designer.
- Vault templates.
- `DelayedRecoveryVault.sil`.
- Constructor fixtures.
- Compiled Silverscript artifact.
- Signed funding and spend draft scripts.
- Accepted TN12 recovery proof.
- Accepted TN12 delayed-withdrawal proof.
- Proof cards in UI.

Accepted proof txids:

```txt
Vault recovery:
b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391

Vault delayed withdrawal:
9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710
```

Still needed:

- separate owner and recovery keys;
- wallet-facing submit screen;
- richer vault variants: inheritance, team treasury, payroll cap, lost-key recovery, delay-with-cancel;
- real policy enforcement for spending caps and guardian rules instead of UI/planner intent only;
- import/export of active vault state from accepted transactions.

### Assurance Lane

Built:

- Browser assurance contract designer.
- `AssurancePledge.sil`.
- Individual pledge primitive.
- Constructor fixtures.
- Compiled Silverscript artifact.
- Signed funding and spend draft scripts.
- Accepted TN12 release proof.
- Accepted TN12 refund proof.
- Proof cards in UI.

Accepted proof txids:

```txt
Assurance release:
80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f

Assurance refund:
faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61
```

Still needed:

- campaign state format;
- multiple pledge fixtures;
- separate contributor, recipient, and refund keys;
- target aggregation;
- batch release planning;
- batch refund planning;
- campaign UI that imports pledge outpoints and shows target progress from accepted outputs;
- clearer release authorization model before claiming full public-goods funding.

### Accepted Transaction Indexer Lane

Built:

- `src/acceptedIndexer.mjs`.
- `scripts/build-accepted-app-state.mjs`.
- `npm run indexer:state`.
- `fixtures/AcceptedAppState.json`.
- UI section for accepted app state.
- `npm run tx:verify` now reuses indexer logic.

Current snapshot:

- 4 records.
- 4 accepted.
- 4 output-matched.
- 0 decoded payload receipts.

Still needed:

- accepted payload receipt fixture after a real payload transaction;
- checkpointed `getVirtualChainFromBlockV2` backend later;
- rollback handling;
- app-state reducers per lane: vault, assurance, escrow, receipt, KRC/pass, auction;
- indexed transaction history by app/campaign/vault ID.

### Payload Receipt Lane

Built:

- `src/signalPayload.mjs`.
- `scripts/build-signal-payload.mjs`.
- `npm run signal:payload`.
- `scripts/build-signed-payload-receipt-draft.mjs`.
- `npm run tx:payload`.
- `artifacts/signed-drafts/payload-receipt-self-send.json`.
- Payload draft status in UI.
- Receipt-events UI placeholder.
- Submit guard for payload artifacts.

Important finding:

- Official docs show payload as bytes through `new TextEncoder().encode(...)`.
- Local `kaspa-wasm createTransaction(..., Uint8Array, ...)` preserves payload bytes.
- Passing a plain string produced an empty payload.
- TN12 REST OpenAPI submit model does not list `payload`, though fetched transactions expose a payload field.

Current state:

- JSON wRPC accepted one matched payload receipt.
- `npm run payload:verify` fetches the accepted transaction, checks payload bytes, and writes receipt evidence.
- The public REST submit route remains no-payload evidence only.
- Wallet review is the next submit surface.

### App Lab / Research Lane

Built:

- `fixtures/KaspaAppLab.json`.
- `fixtures/MinerSignalResearch.json`.
- UI sections for app-lab and miner-signal research.
- Boundary: transaction payload first, coinbase payload/pool policy later, block headers are not arbitrary app-data fields.
- Cross-chain app research lane added in `docs/SOURCES.md` so proven products, open code, PMF signals, and failure modes can guide Kaspa app design without overclaiming protocol support.

Still needed:

- research notes for selected open-source apps from other chains: what had PMF, what failed, what code patterns are reusable, and what must be rebuilt for Kaspa/TN12;
- miner/pool signal research notebook;
- off-chain pool signal registry model;
- event-attestation incentive model;
- anti-spam, anti-bribery, MEV, and centralization analysis before any mining-software proposal.

## Apps To Build One By One

Use `docs/MAINSTREAM_APP_DIRECTION.md` before adding a new app lane. High-liquidity categories from other chains belong in the pipeline, but the repo should first ask whether the use case can be expressed as accepted payment/indexer state, TN12/Toccata covenant proof, wallet policy, or research.

Use `npm run rails:missing` for the highest-risk mainstream categories. It turns the DEX/AMM, lending, perps/prediction, bridge/source-chain, and stable-value dependency questions into a checked artifact before product UI or settlement claims.

Use `npm run rails:research` when a plan mentions oracle/price feeds, Kaskad/lending mechanics, miner/RTD signals, bridge/source-chain anchors, DEX/AMM liquidity, liquidations, collateral, or LP shares. It turns those phrases into a checked research route with local sources, external leads, first-principles questions, first artifact requirements, and do-not-claim boundaries.

Use `npm run project:queue` when the question is "what should be built next overall?" It is the all-in-one priority queue across done, WIP, roadmap, and next 30 tasks. Current highest impact order: wallet connector submit, durable virtual-chain indexer, accepted pledge outputs, batch-assurance release/refund drafts, then escrow marketplace demo.

Use `npm run coordination:settlement-brief` for the current coordination-market lane. It turns the transparent Stag/Intendo/Pack prototype into an app brief with release/refund routes and wallet review checks, while explicitly leaving opacity, capital multiplexing, atomic Hunt execution, and oracle/settlement rails missing.

### 1. Payload Receipt / Invoice App

Why first:

- It uses the live network and official payload docs.
- It creates reusable app-state plumbing for every later app.
- It can prove "payment plus app data" without waiting for new covenant work.

Build:

1. Create invoice JSON: invoice ID, merchant address, amount, memo, expiry.
2. Build signed self-send or merchant-send draft with payload receipt.
3. Submit through the verified JSON wRPC route.
4. Verify accepted tx and payload.
5. Add fixture.
6. Decode receipt in indexer.
7. Show invoice state: draft, signed, submitted, accepted, paid.
8. Add duplicate-payment, stale-receipt, and refund/error handling.

Success:

- UI shows one accepted payload receipt event.
- Indexer derives paid/unpaid state from accepted transaction payload and output.

### 2. Wallet-Facing Submit Console

Why next:

- Current scripts are powerful but not product-safe.
- Every app needs exact input/output/fee/payload review before broadcast.

Build:

1. Artifact picker for signed drafts.
2. Input table: txid, index, amount, script type.
3. Output table: destination, amount, script type.
4. Fee and payload summary.
5. Warning for testnet-only.
6. Copy submit command.
7. Dry-run submit preview.
8. Explicit manual submit gate.

Success:

- A user can inspect a draft without opening JSON.
- No private key is displayed.
- Broadcast remains explicit.

### 3. Batch Assurance Campaign App

Why:

- Kaspa Explained repeatedly highlights public-goods assurance and funding rules strangers can rely on.
- Current repo only proves individual pledge paths.

Build:

1. Campaign state fixture.
2. Multiple pledge output fixtures.
3. Contributor registry.
4. Pledge import UI.
5. Target progress from accepted outputs.
6. Batch release planner.
7. Batch refund planner.
8. Release/refund proof cards.

Success:

- UI shows a campaign target derived from accepted pledge outputs.
- Release/refund path is explicit and auditable.
- Docs clearly say whether target aggregation is app-side or covenant-enforced.

### 4. Escrow Primitive

Why:

- It is the next clean covenant app after vault and assurance.
- Kaspa Explained lists conditional escrow as a first useful Toccata product.

Build:

1. `contracts/Escrow.sil`.
2. Constructor fixtures: buyer, seller, timeout, arbiter or mutual-cancel policy, miner fee.
3. Entrypoints: release, timeout refund, mutual cancel.
4. Funding draft.
5. Release draft.
6. Timeout refund draft.
7. Optional mutual cancel draft.
8. UI panel.
9. Accepted TN12 proof cycle.

Success:

- At least one accepted fund + release or fund + refund path on TN12.
- UI imports the accepted proof into app state.

### 5. KRC / Access Pass Planner

Why:

- Kaspa Explained identifies KRC tooling as ecosystem-live today, but not native smart contracts.
- Practical workflows include coupons, event credits, access passes, memberships, and proof-of-attendance objects.

Build:

1. Status-labeled KRC workflow designer.
2. Coupon/pass metadata schema.
3. Redemption state model.
4. Wallet/indexer dependency checklist.
5. Merchant redemption mock UI.
6. Safety copy: issuer honors claim, not protocol-enforced redemption.

Success:

- Clear product artifact for coupons/passes without overclaiming native smart contracts.

### 6. Treasury / Team Vault

Why:

- Treasury controls are a natural extension of vault rules.
- More business-like than a generic personal vault.

Build:

1. Team role model.
2. Daily/weekly spend caps.
3. Delayed large withdrawals.
4. Emergency recovery.
5. Payroll batch template.
6. Accepted proof path for one constrained spend and one recovery/cancel path.

Success:

- App can explain exactly what a small org can and cannot do with testnet funds.

### 7. Simple Asset / Redeemable Claim

Why:

- Native asset rules are listed in the Toccata lane.
- It connects KRC ecosystem workflows to later covenant-enforced assets.

Build:

1. Asset policy artifact.
2. Issuer key and holder key fixtures.
3. Mint/transfer/burn intent model.
4. Redemption rule.
5. Covenant or planner proof only after script model is clear.

Success:

- Clear contrast between KRC ecosystem assets and later covenant/native asset policy.

### 8. Auction / Intent Primitive

Why:

- Kaspa Explained flags auctions, ordering, MEV-aware design, and fast mined ordering as a major app direction.

Build:

1. Sealed or open auction artifact.
2. Bid payload format.
3. Accepted bid indexer.
4. Winner selection rules.
5. Refund/release planning.
6. MEV and ordering caveats.

Success:

- UI can derive auction state from accepted bid transactions, even before covenant settlement is complete.

### 9. Basic DeFi Primitive Backlog

Why later:

- Kaspa Explained mentions native-feeling DeFi rails as roadmap architecture, not live infrastructure.
- Existing-platform ideas like lending, borrowing, swaps, AMMs, stablecoins, insurance, perps, margin, and portfolio automation are useful to track, but they require more than fast settlement.
- Open-source DeFi apps from other chains are useful research inputs for code structure, PMF clues, and failure modes, but each idea must be re-mapped to Kaspa's UTXO model, accepted-transaction indexing, TN12 covenant limits, payload receipts, and wallet/API boundaries.

Build:

1. Lending/borrowing model: collateral, loan terms, interest, margin, liquidation trigger, oracle/source assumptions.
2. Swap/AMM model: pool reserves, fees, slippage, LP accounting, accepted transaction indexing, and MEV/order caveats.
3. Stable-value model: collateral policy, redemption, issuer/oracle role, failure modes, and legal/risk boundary.
4. Insurance/protection model: covered event, proof source, payout rule, dispute/refund path.
5. Portfolio automation model: if-this-then-that strategy, attestation source, execution limits, and user consent.
6. Only then choose whether a prototype belongs in covenants, payload/indexer state, Based Apps, vProgs, or off-chain app logic.

Success:

- The repo has a status-labeled DeFi backlog that names the missing rails before building product UI.
- `artifacts/missing-rails-matrix.json` answers the reserve, collateral, oracle, liquidation, settlement, bridge-anchor, and stable-value trust questions before any build claim.
- No page claims mature lending, AMMs, stablecoins, derivatives, or native DeFi are live on Kaspa.

### 10. Cross-Chain App Code And PMF Research

Why:

- Other ecosystems have years of open-source app code, usage history, and public failures.
- That material can save time if it is used as product research, not copied as if Kaspa has the same execution model.
- The useful output is a Kaspa-specific app brief: user job, PMF evidence to verify, failure modes, reusable code patterns, and the Kaspa/TN12 rebuild plan.

Build:

1. Create one research note per candidate app or category.
2. Record repo links, docs, audits, incidents, usage signals, and the specific user job.
3. Separate PMF signals from subsidy/liquidity mining artifacts.
4. Extract reusable product/code patterns: state schema, indexer shape, risk controls, wallet review UX, admin controls, and dispute/refund flows.
5. Map each pattern to Kaspa status lanes: live payments/indexing, TN12 covenant prototype, roadmap Based Apps/vProgs, or research.
6. Turn the best candidates into app briefs before writing Kaspa code.

Success:

- The repo has a resource library for "what worked elsewhere" and "what failed elsewhere."
- New Kaspa app work starts from real product evidence while keeping protocol claims restrained.
- No copied app is treated as portable until the transaction model, indexing model, oracle assumptions, and wallet safety path are explicit.

### 11. Miner / Pool Signal Research App

Why later:

- User is curious about incentivizing miners to publish information.
- Kaspa Explained treats this as RTD-derived research, not shipped infrastructure.

Build:

1. Compare channels: transaction payload, coinbase payload, pool registry, header-derived facts.
2. Define signal object.
3. Define reward/fee model.
4. Define anti-spam/bribery assumptions.
5. Build off-chain registry first.
6. Only then consider pool/mining-software integration.

Success:

- Research artifact names exact assumptions and does not imply arbitrary block-header app data.

### 12. AI-Agent Commitment Board

Why later:

- Kaspa Explained lists AI-agent commitments as a research/app direction.
- It reuses payload receipts, escrow, and assurance.

Build:

1. Task offer.
2. Deposit.
3. Completion proof payload.
4. Dispute/refund rule.
5. Accepted transaction index.

Success:

- Agents can make small machine-readable commitments with auditable payment/proof state.

## Infrastructure We Need Across All Apps

### Must Build

- Payload-preserving send route.
- Accepted transaction reducer framework.
- Artifact import/export.
- Signed draft review UI.
- Fixture schema checks.
- Explorer/API verification links.
- Public/private key role separation.
- Testnet-only wallet safety guard.

### Later Backend

- RPC/Wallet API integration.
- Checkpointed accepted transaction ingestion.
- Reorg/rollback handling.
- Optional own-node or hosted RPC abstraction.
- Historical index/query store.

### Not Now

- Mainnet funds.
- Production wallet.
- Full local node workflow.
- Claims of native DeFi.
- Claims of full vProgs app-to-app atomic composition.
- Claims of arbitrary block-header app data.

## Build Order

1. Finish payload receipt accepted transaction.
2. Build receipt/invoice UI.
3. Build wallet-facing submit console.
4. Build batch assurance campaign.
5. Build escrow.
6. Build treasury vault.
7. Build KRC/access-pass planner.
8. Build simple asset policy.
9. Build auction/intent prototype.
10. Build basic DeFi primitive backlog: lending, swaps, stable-value, insurance, derivatives, portfolio automation.
11. Build cross-chain app code and PMF research library.
12. Build miner-signal research prototype.
13. Build AI-agent commitment board.

The canonical condensed roadmap is now tracked in `docs/MASTER_APP_PLAN.md` and rendered from `fixtures/MasterAppRoadmap.json`.

## One-By-One Completion Standard

Every app lane should have:

1. status label;
2. plain user story;
3. artifact schema;
4. UI builder;
5. signed draft or explicit reason it cannot sign yet;
6. accepted TN12 proof if the protocol/tooling supports it;
7. indexer state;
8. source/boundary note;
9. `npm run check` coverage;
10. no private key exposure.

## Current Next Task

Continue with **Payload Receipt / Invoice App**.

Immediate next steps:

1. Investigate Wallet API or RPC route that preserves payload bytes on submit.
2. Submit one tiny TN12 payload receipt transaction only if the route is clear.
3. Add the accepted payload txid to fixtures.
4. Decode the receipt in `src/acceptedIndexer.mjs`.
5. Show receipt event state in the UI.
