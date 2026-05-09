# Project Completion Plan

Reviewed: 2026-05-09

This document is the stop/go map for the repo. It answers what is done, what is WIP, what continues next, what stays future, and when the project is complete enough to stop expanding it.

The short version: this repo is done when it is a credible TN12 proof lab plus a small app-stack prototype. It is done when the rails are reproducible, externally reviewable, and documented well enough for another builder to continue.

## Definition Of Done

The project is complete at the current intended scope when all of these are true:

1. The proof core is reproducible: vault recovery, vault delayed withdrawal, assurance release/refund, escrow release/refund/cancel, and their role-separated repeats are documented with accepted TN12 evidence and local checks.
2. The wallet path is no-local-key: a user can review an exact draft, hand it to an external signer or wallet adapter, preserve payload bytes and tx version 1 fields, submit intentionally, and validate the returned txid against the original review fingerprint.
3. The indexer path is durable: accepted transaction state comes from a configured node/RPC virtual-chain reader with persistence, rollback replay, payload matching, and proof-output matching, not from hand-curated txid fixtures alone.
4. The batch-assurance path has one explicit settlement outcome: either the accepted pledge outputs are released or refunded through one reviewed path, or the repo records why settlement was intentionally deferred. The mutually exclusive alternatives must not both be submitted.
5. The escrow app surface is usable as a testnet marketplace or freelance flow: buyer funding, seller release, timeout refund, mutual cancel, dispute text, wallet review, and accepted-proof evidence are visible without mainnet or production-wallet claims.
6. The public copy is proof-first: accepted txids, artifacts, commands, and SDK gotchas lead; app-lane plans remain secondary and status-labeled.
7. Kaspa Explained only receives stable lessons from this repo as testnet or builder guidance, with app-lane planning kept separate from public adoption language.
8. Future rails are gated: DEX, AMM, lending, perps, bridges, stable-value, coordination markets, vProgs, ZK, and oracle work each have explicit missing-rail briefs before product copy or settlement code claims.
9. Local and CI gates pass: `npm run check:all` is green, GitHub Actions are green after push, and Pages deploys the current public artifact.

If those are true, the repo can be called complete for the TN12 lab phase. Later work becomes a new phase with a new scope.

## Differentiation Thesis

The repo is differentiated by the tight loop between new Kaspa rails and accepted testnet evidence:

- covenant scripts that actually spend on TN12;
- role-separated repeats that catch fake single-wallet success;
- signed drafts plus exact output, payload, tx-version, and `computeBudget` review;
- accepted payload receipts that become app state only after a transaction is found and decoded;
- negative evidence, such as the REST route that submitted a payment but dropped payload bytes;
- SDK/tooling gotchas written down with reproducer commands instead of hidden in chat;
- enforcement labels that stop planner/indexer state from being marketed as script enforcement.

Builders elsewhere may be working privately on stronger apps, wallets, or protocol tools. This repo should not pretend to beat unknown private work. It should be different by being checkable: artifacts, txids, commands, source boundaries, and failure notes are public enough that another builder can reproduce or falsify the claim.

## What Is Actually Hard To Duplicate

The strongest moat is not code volume. It is accumulated proof discipline around a young toolchain:

1. Accepted covenant path knowledge: the repo records which script shapes, witness shapes, DAA locks, and tx fields landed on TN12.
2. Role separation: the repo treats a proof as weak if one local test wallet controls every role.
3. Payload-preservation evidence: the repo knows one submit route dropped payload bytes and one JSON wRPC path preserved them.
4. Reviewable transaction artifacts: the repo turns wallet integration into exact-draft review instead of "trust this app to sign."
5. Claim taxonomy: script, planner/indexer, wallet-policy, documentation, and research lanes stay separate.
6. Missing-rails routing: DEX, lending, perps, bridges, stable-value, oracles, and coordination markets trigger rail briefs before UI claims.
7. Public handoff quality: another agent or human can resume from docs and checks without relying on memory or private chat.

If future work does not strengthen one of those, it is probably not the highest-value work.

## How We Know It Is Real

Use this evidence ladder. A claim cannot move up the ladder by better wording.

1. Research note: sourced reasoning, no app-state or funds claim.
2. Fixture model: deterministic reducer or planner output, no network claim.
3. Signed draft: exact transaction artifact exists, but it is not accepted state.
4. Submitted txid: a network accepted or rejected something, but app matching still needs verification.
5. Accepted and matched evidence: txid is accepted, payload/output/script expectations match, and the artifact records it.
6. Replayable app state: indexer/reducer can rebuild the state from accepted data and rollback rules.
7. Wallet-reviewed user flow: a user can review and authorize the exact transition without local repo keys.
8. Repeated external use: more than the maintainer can run it, inspect it, and reproduce the result.

The repo currently has level 5 for the proof core and payload events, partial level 6 through fixture-backed replay, and level 2-3 for many app lanes. It does not yet have level 7 for a live external wallet flow.

## How Everything Stays Tethered

Every new feature needs a tether before it is added:

- Evidence tether: accepted txid, signed draft, artifact, source line, or explicit research citation.
- Rail tether: accepted payment, transaction payload, indexer state, TN12 covenant proof, wallet review, oracle/attestation model, bridge/source-chain anchor, or future vProg/zk rail.
- User tether: the concrete user problem, such as invoice proof, escrowed freelance work, public-goods pledge, team spend review, ticket redemption, or builder debugging.
- Failure tether: what could go wrong and how the UI/docs keep that visible.
- Promotion tether: the exact condition required to move from research to planner, planner to signed draft, signed draft to accepted evidence, or accepted evidence to public explainer copy.

If a task cannot name those tethers, it belongs in a research backlog or should be skipped.

## Adoption Odds Filter

High adoption chance does not mean "large crypto category." It means the repo can remove a real friction point using rails that Kaspa can plausibly support soon.

Use this score before prioritizing an app:

- User pain: does a normal builder/user already understand the problem without a lecture?
- Kaspa fit: does fast accepted transaction state, payloads, UTXO flow, or covenants matter to the product?
- Rail readiness: can the current repo build a real step now, or is it blocked on undefined custody/oracle/liquidity/bridge/shared-state rails?
- Proof path: can success be shown with accepted evidence and replay, not only screenshots?
- Wallet path: can the user authorize exact transitions without local keys?
- Distribution path: who would actually try it, and what would they do on day one?
- Risk containment: can the demo avoid custody, advice, fake yield, fake liquidity, and mainnet claims until those are real?

The current highest-probability order is:

1. Wallet-reviewed submit and durable indexer rails, because every other app depends on them.
2. Invoice/receipt app, because payload-backed accepted state is closest to normal Kaspa behavior.
3. Escrow/freelance flow, because release/refund/cancel is easy to understand and already has accepted TN12 proof.
4. Assurance/grants flow, because public funding has clear users and accepted pledge-output progress.
5. Access passes/coupons, because issuer/indexer state can be useful without native covenant assets.
6. Builder proof dashboard, because Kaspa builders need reproducible covenant and payload examples.
7. Attestation/signal dashboards, but only as review/context until provenance and quorum are stronger.
8. Coordination-market research, because it may be strategically important, but it is not ready to masquerade as a finished app.

DEX, lending, perps, bridges, and stable-value can have major attention/liquidity upside, but they are lower build-now priority until custody, oracle, liquidity, liquidation, asset, and settlement rails are explicit.

## Done

The following are already done at the proof-lab level:

- Seven accepted TN12 covenant proof spends: vault recovery, vault delayed withdrawal, individual assurance release, individual assurance refund, escrow release, escrow DAA-score refund, and escrow mutual cancel.
- Seven accepted role-separated repeats using distinct role keys for owner/recovery, recipient/contributor, and buyer/seller paths.
- Escrow cancel debugging resolved: the bad `sigOpCount=1` path is historical evidence, and the accepted route uses tx version 1 with `computeBudget=30` through the local TN12 `kaspa-wasm 1.1.1-toc.1` route.
- Accepted JSON wRPC payload vertical slice: invoice paid/refund/error, access pass, auction, stable issuer, miner/watcher attestation, prediction/hedge review, agent commitments, and batch-assurance planner events.
- Public REST submit negative result preserved: REST accepted a transaction while dropping payload bytes, so payload receipts must not depend on that route.
- Batch-assurance accepted custody outputs: one TN12 funding transaction created the 45/35/20 TKAS pledge outputs and the custody import gate matches them.
- Batch-assurance review drafts: one signed release draft and three signed refund drafts exist; they are mutually exclusive and not broadcast.
- Wallet-review artifacts: submit registry, connector readiness, submit package, connector request bundle, adapter dry-run, submit ledger, and result-validation rules.
- Fixture-backed app-state indexer: checkpointed accepted index, persisted checkpoint guard, replay plan, storage schema, replay rows, virtual-chain ingestion plan, virtual-chain run artifact, and bounded reader adapter contract.
- Enforcement matrix: script-enforced, planner/indexer, wallet-policy, documentation, and research lanes are labeled.
- KasSigner/KasSee reference added as external signer and watch-only wallet research, with the experimental/not-integrated boundary explicit.
- Public-facing tone corrected toward "lab notes" and proof-first status instead of app-empire language.

## WIP Now

These are active work items, not future fantasies:

1. Live external wallet submit.
   - Built: review package, request format, adapter dry-run, submit ledger, result validation, external-signer gap artifact, unsigned request templates, KasSigner/KasSee reference.
   - Missing: wallet-standard mapping plus a real external adapter or wallet path that signs/submits without `.local` keys and preserves payload bytes plus tx v1 `computeBudget`.
   - Done when: a returned txid is validated against the original review fingerprint and accepted evidence promotes it from pending to accepted.

2. Durable virtual-chain indexer.
   - Built: storage schema, replay plan, fixture replay, virtual-chain plan/run, bounded adapter contract.
   - Missing: configured hosted TN12 node/RPC run with persistence and rollback replay from live virtual-chain data.
   - Done when: new accepted transactions can be discovered and replayed without editing txid fixtures by hand.

3. Batch-assurance settlement.
   - Built: accepted pledge outputs, custody imports, release/refund drafts.
   - Missing: one deliberate settlement decision and, if appropriate, one submitted path.
   - Done when: release or refund is accepted and documented, or a written deferral says why the accepted pledge outputs are being preserved for review.

4. Escrow marketplace/freelance surface.
   - Built: accepted release/refund/cancel proof core and marketplace demo artifact.
   - Missing: a coherent user-facing testnet flow that feels like a buyer/seller job, not a pile of draft cards.
   - Done when: the UI shows funding, deliverable state, release, timeout refund, cancel, dispute boundary, and wallet-review state in one flow.

5. Signal provenance reuse.
   - Built: attestation reputation thresholds and prediction/hedge threshold consumption.
   - Missing: reuse the same gate wherever future signals could influence app state.
   - Done when: no signal-consuming lane can move from context to influence without provenance, accepted payload evidence, quorum, stale-state, and conflict checks.

## Continuing Order

This is the order to keep working unless new evidence changes the dependency graph.

1. External wallet submit route.
2. Durable virtual-chain reader against a configured TN12 endpoint.
3. Batch-assurance settlement decision and one accepted settlement path or explicit deferral.
4. Escrow marketplace/freelance UI pass.
5. Fresh expendable role-separated outputs for any invalid-candidate rejection tests.
6. Treasury/team vault constrained spend lifecycle with role-key separation.
7. Access-pass duplicate, expiry, and issuer-review checks.
8. Auction settlement/refund custody drafts with atomic-exchange caveats.
9. Agent-task release/refund custody drafts with reviewer gates.
10. Grants/public-goods workflow using assurance plus payout-vault planning.
11. Stable-value issuer redemption review, still issuer/indexer only.
12. Oracle source dashboard as simulation-only.
13. AMM/DEX rail brief before any swap UI.
14. Lending rail brief before any borrow/lend UI.
15. Perps/prediction settlement boundary brief before any market UX that looks real-money.
16. Bridge/source-chain anchor brief before any wrapped-asset or bridge UI.
17. Coordination-market settlement draft only after custody, wallet review, opacity, multiplexing, composability, and atomic Hunt execution assumptions are explicit.
18. Based-rollup scouting with one tiny app only after the endpoint, wallet path, bridge model, and execution state are clear.
19. Kaspa Explained promotion pass for stable lessons only.
20. Archive or park lanes that remain research-only after their missing rails are documented.

## Future / Parked Until Rails Exist

These should not become user-facing product claims in this phase:

- Native DEX/AMM pools: needs native asset model, pool reserve representation, LP shares, price/slippage rules, custody, ordering/MEV analysis, and settlement path.
- Lending: needs collateral custody, oracle model, stale/wrong-price handling, liquidation rules, risk parameters, and legal/product review.
- Perps and prediction markets: need margin/collateral custody, matching, close/liquidation rules, oracle settlement, odds integrity, and jurisdiction review.
- Bridges and external stablecoins: need canonical source-chain anchors, bridge trust model, proof flow, redemption operations, and wallet UX.
- vProg/shared-state apps: need public execution model, state commitments, proof/settlement paths, and wallet/indexer support.
- ZK/source-chain claims: need public inputs, canonical anchors, prover/verifier assumptions, and failure-mode docs.
- Production mainnet covenant apps: need final activation, compatible tooling, wallet support, audits, monitoring, and rollback/incident procedures.

## User-Facing Apps That Can Come Out Of This

At current scope, the realistic outputs are:

1. Invoice/receipt app: accepted transaction payloads become paid/refunded/error app state.
2. Wallet review and submit console: exact draft review, external signer handoff, accepted-result validation.
3. Escrow/freelance marketplace demo: buyer/seller testnet flow backed by accepted TN12 proof paths.
4. Assurance/grants campaign demo: pledge outputs, target progress, release/refund review.
5. Access-pass/coupon planner: issuer/indexer app state from accepted payload receipts.
6. Treasury/vault policy planner: delayed withdrawal, recovery, constrained spend review.
7. Attestation/signal dashboard: signed accepted signals as context, not automatic trading.
8. Builder proof dashboard: txids, outputs, payload bytes, artifacts, and check commands for Kaspa developers.

These are apps if the wallet and indexer rails become real. Without those rails, they remain demos or lab notes.

## Completion Levels

### Lab Complete

The repo is lab-complete when the proof core, role-separated repeats, payload evidence, batch-assurance custody outputs, and proof-first docs stay green under `npm run check:all`.

Current status: mostly achieved.

### App-Stack Complete

The repo is app-stack-complete when external wallet submit and durable virtual-chain indexing work together, and at least invoice, escrow, and assurance flows can be reviewed end-to-end without local private keys.

Current status: not complete.

### Public-Explainer Complete

The related Kaspa Explained work is complete when it points to stable TN12 lessons as testnet/builder evidence, keeps all source/status claims current, and keeps app-lane planning out of public adoption language.

Current status: stable, but source drift must be watched.

### Mainnet Product Complete

This repo alone cannot declare mainnet product completion. That requires mainnet activation/tooling, wallet support, audits, real users, monitoring, incident handling, and app-specific legal/security review.

Current status: future phase.

## Stop Rules

Stop expanding the repo when one of these is true:

- A new idea cannot be tied to accepted transaction state, wallet review, indexer replay, a TN12 covenant proof, or a concrete missing-rails brief.
- A planned app needs oracle, custody, liquidity, bridge, liquidation, or shared-state rails that are not yet explicit.
- The work would add another fixture-only lane without improving wallet, indexer, settlement, or proof evidence.
- Public copy starts making the repo look bigger than the accepted proof core.

In those cases, write the missing rail down and return to the continuing order.
