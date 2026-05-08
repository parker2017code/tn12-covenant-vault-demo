# Mainstream App Direction

Reviewed: 2026-05-08

This repo should point toward high-impact crypto app categories that have already shown user demand on other chains, but each idea must be rebuilt around Kaspa's actual lanes: live payments and indexing, TN12/Toccata covenants, wallet policy, roadmap rails, or research.

The priority is not to clone every DeFi app. The priority is to choose app shapes that can bring liquidity, attention, and repeat usage while staying honest about what is proved.

Machine-readable source: `fixtures/MainstreamAppDirection.json`.
Generated artifact: `artifacts/mainstream-app-direction.json`.
Build command: `npm run mainstream:direction`.

Missing-rails source: `fixtures/MissingRailsMatrix.json`.
Generated missing-rails artifact: `artifacts/missing-rails-matrix.json`.
Build command: `npm run rails:missing`.

Research trigger source: `fixtures/RailResearchTriggers.json`.
Generated research trigger artifact: `artifacts/rail-research-triggers.json`.
Build command: `npm run rails:research`.

## Priority Rule

Build the highest-impact user-facing apps first when they can be connected to existing proof:

1. payments plus accepted app state,
2. escrow and assurance contracts,
3. wallet-reviewed submit flow,
4. indexed access, auctions, attestations, and simple issuer assets,
5. larger DeFi, bridge, rollup, ZK, and vProg lanes only after the missing rails are explicit.

## Mainstream App Targets

| Priority | App direction | User use case | Current lane | Why it matters | Current repo status |
|---|---|---|---|---|---|
| 1 | Invoice / receipt app | Merchant gets a payment with attached receipt/order state | Live-style payment plus indexer | Payment proofs are the fastest path to real users because they do not need covenants | Accepted TN12 JSON wRPC paid/refund/error payload events; durable indexer replay still WIP |
| 2 | Escrow / freelance / marketplace | Buyer funds, seller completes, buyer releases or timeout/refund/cancel handles failure | TN12/Toccata covenant | Escrow is easy for normal users to understand and is a strong covenant showcase | Release, DAA refund, and mutual cancel accepted on TN12; wallet submit UX still WIP |
| 3 | Batch assurance / public-goods funding | Contributors fund a target, release happens only if the target is met, otherwise refunds are planned | Planner/indexer now, covenant-assisted later | Public-goods funding and group purchases can create visible community use | Accepted planner payloads and custody requirements exist; matched pledge-output custody transactions still WIP |
| 4 | Wallet-facing submit console | User reviews exact inputs, outputs, fees, payloads, and submit route before signing | Wallet policy | Every serious app needs safer signing and broadcast before it can face users | Review package and connector spec exist; live no-local-key connector is WIP |
| 5 | Access passes / coupons / tickets | Memberships, event passes, coupons, proof-of-attendance, redeemable claims | Issuer/indexer | Simple consumer use cases can ship before deep DeFi rails | Accepted redemption payload and duplicate safeguards exist; expiry and issuer review still need hardening |
| 6 | Auction / intent marketplace | Users place bids, app selects winners, refund/release planning is visible | Planner/indexer now, settlement later | Auctions and intents attract attention, but settlement must be explicit | Accepted bid and planner payloads exist; no atomic exchange or MEV resistance claim |
| 7 | Vault / treasury / team wallet | Safer custody, delayed withdrawals, recovery, team spend controls, payroll templates | TN12/Toccata covenant plus wallet policy | Strong business and wallet-safety use case | Vault recovery and delayed withdrawal accepted on TN12; team caps/payroll still planner/wallet-policy |
| 8 | Simple asset / redeemable claim | Issuer-backed credits, vouchers, recoverable claims, later covenant-native assets | Issuer/indexer now, covenant-native later | Asset workflows bring users, but native-asset claims must wait for rails | Policy artifacts exist; keep separate from KRC/native-asset overclaims |
| 9 | Stable-value issuer app | Issuer-backed issuance/redemption state, receipts, reserves, redemption requests | Issuer/indexer and research | Stable-value flows bring liquidity attention, but native stablecoin claims are high-risk | Accepted issuance/redemption payload state exists; not a native stablecoin |
| 10 | DEX / AMM / lending / perps | Trading, liquidity provision, borrowing, leverage, hedging | Research / future rails | These are high-liquidity categories on other chains, but need oracles, liquidity, liquidation, MEV/order rules, wallet safety, and composability | DeFi backlog and prediction/hedge simulator exist; no live settlement, odds, custody, or advice |

## Build-Now Focus

The build-now direction is:

1. make the invoice/receipt app durable through replayable indexing;
2. make the wallet submit path usable without local private keys;
3. turn escrow into a simple freelance or marketplace demo;
4. turn batch assurance into accepted matched-output custody flow;
5. harden access passes, auctions, and attestations as indexed app-state products.

These are the shortest path to real user-facing apps because they reuse accepted transactions, payloads, or already accepted TN12 covenant proofs.

## Research But Keep In Pipeline

These should stay documented and visible because they are high-impact elsewhere, but they should not be presented as ready:

- DEX/AMM and swap routing;
- lending and collateralized borrowing;
- perps, prediction markets, and hedge products;
- stablecoins beyond issuer-backed redemption state;
- NFT/game/social apps unless a Kaspa-specific user job is identified;
- bridges, source-chain apps, rollups, ZK apps, and vProg apps.

For each, the repo should require a short app brief before code:

1. user job,
2. liquidity or attention reason,
3. PMF evidence from other ecosystems,
4. Kaspa lane: live, TN12/Toccata, wallet policy, roadmap, or research,
5. missing rails,
6. smallest honest prototype,
7. what must not be claimed yet.

`npm run rails:missing` records the first-principles questions and current answers for the highest-risk categories: DEX/AMM, lending, perps/prediction, bridge/source-chain apps, and stable-value units.

`npm run rails:research` records the routes that should trigger deeper research before the repo upgrades claims. Current trigger lanes cover oracle/price feeds, Kaskad/lending mechanics, miner/RTD signals, bridge/source-chain anchors, and DEX/AMM liquidity mechanics. Each trigger names local repo evidence, external source leads, research questions, a first artifact, and do-not-claim boundaries.

## Done Standard

An app lane is user-facing-ready only when:

- it has a clear user job;
- state is derived from accepted transactions or explicit wallet-reviewed drafts;
- private keys are not exposed;
- status labels separate live, TN12, roadmap, and research claims;
- failure/refund/review paths are visible;
- the relevant local and TN12 verification gates pass.

Until then, the lane can be valuable, but it stays labeled as planner, indexer, wallet-policy, TN12 proof, or research.
