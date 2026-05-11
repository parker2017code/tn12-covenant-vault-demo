# TN12 Product Execution Plan

Reviewed: 2026-05-11

This is the product plan for turning the TN12 proof lab into something people can use themselves. It does not upgrade any claim. Accepted TN12 evidence, planner/indexer state, wallet-policy state, and blocked production rails must stay visibly separate.

## Product Rule

Every lane should eventually support the same loop:

1. Get TN12 tKAS.
2. Use a fresh `kaspatest:` wallet or external wallet.
3. Review exact inputs, outputs, payload bytes, fees, and route.
4. Sign outside the repo when custody is involved.
5. Submit through a route that preserves the required transaction fields.
6. Replay accepted txids before promoting app state.
7. Show blocked actions when a rail is not actually enforced.

## Public Page Roles

| Page | Job |
|---|---|
| `results.html` | Public evidence story first: accepted txids, replayed state, done/open rails, and future adapters clearly marked as future. |
| `playground.html` | Live TN12 walkthrough: role funding, deposits, payout, copyable addresses, replay balances, blocked actions. |
| `lab.html` | Self-serve workbench: product map, runbook, artifact forms, wallet handoff, and collapsible advanced generated panels. |
| `index.html` | Reviewer proof home: accepted proofs, enforcement map, indexer, submit review, and sources. |

## Build Order

| Order | Slice | Done When |
|---|---|---|
| 1 | Public UX and source discipline | Pages are navigable, source links are correctly typed, bad TN12 explorer routes fail UI checks, bulky panels are collapsible. |
| 2 | Self-serve lane map | Lab starts with product map and runbook before generated details. Each lane says playable now, play next, research playable, or blocked. |
| 3 | External wallet handoff | Browser exposes wallet-standard request artifacts, return template, validation rules, and no-private-key language. |
| 4 | DeFi self-serve walkthrough | Users can follow funding -> role wallet -> deposit/payout -> replay -> blocked action checks from UI instructions and artifacts. |
| 5 | Assurance self-serve walkthrough | Users can inspect pledge/release/refund state, know what is accepted, and know what remains planner/indexer. |
| 6 | Escrow self-serve walkthrough | Users can inspect buyer/seller/release/refund/cancel paths and map actions to wallet-standard request candidates. |
| 7 | Coordination/Stag walkthrough | Transparent Stag/Intendo/Pack/Solver state is playable as research, with missing private Hunt execution called out. |
| 8 | Access pass, auction, agent walkthroughs | Issuer/indexer and planner states are visible with accepted payload receipts and settlement boundaries. |
| 9 | Real external signer round trip | A user-approved external wallet signs one payload and one covenant-style request; returned bytes validate, submit succeeds, replay matches. |
| 10 | Durable live indexer promotion | New accepted transactions are discovered from a live virtual-chain feed, rollback behavior is handled, and promotion is deterministic. |

## Current Lane Status

| Lane | Usable Now | Still Missing |
|---|---|---|
| Live TN12 money flow | Accepted role funding, two deposits, one payout, replay balances, copyable addresses. | External-wallet repeat of the same flow. |
| Payload receipt invoices | Accepted payload receipts and invoice state replay. | Production wallet/indexer flow and duplicate/refund policy hardening. |
| Vault policy | Browser artifact, accepted owner/recovery proof paths, policy labels. | Guardian/cap/request lifecycle script enforcement. |
| Assurance | Individual pledge release/refund proof and batch campaign state. | Full pooled campaign enforcement as one native contract. |
| Escrow | Accepted release, DAA refund, mutual cancel proof paths and marketplace action map. | Live external-wallet submit and production dispute workflow. |
| Access passes | Issuer/indexer pass and redemption state. | Native ticket enforcement claim. |
| Auction/intents | Accepted bid payloads and planner winner/refund state. | Atomic custody settlement and delivery enforcement. |
| DeFi lab | Accepted local-key funding/deposits/payouts, scheduler receipts, reducers, duplicate guards, blocked withdrawals. | AMM custody, lending custody, liquidation, oracle truth, production signer. |
| Coordination/Stag | Transparent intendos, packs, solver, and settlement brief. | Opacity, capital multiplexing, composability, atomic Hunt execution. |
| Agent commitments | Task offers, accepted payloads, disputes, release/refund review. | Autonomous payout and live wallet-reviewed settlement. |

## Guardian Enforcement Path

Guardians are currently policy/UI fields only. They can become script-enforced by adding a new covenant entrypoint that requires a threshold of guardian signatures for a recovery, cancel, or large-spend path.

Minimum credible build:

1. Create a guardian vault contract with explicit guardian pubkeys and threshold.
2. Add positive tests for `m-of-n` guardian signatures.
3. Add negative tests for too few guardians, wrong guardian, wrong output, wrong amount, early spend, and replay/double-spend candidates.
4. Fund a fresh TN12 output.
5. Submit one accepted guardian path.
6. Update the UI label from `planner-only` to `script-enforced` only for that exact path.

## External Wallet Path

People should be able to use their own wallets without sharing secrets. The repo should never require a private key paste for a public playground.

Minimum credible build:

1. Export unsigned/reviewable request JSON.
2. Display exact transaction fields and payload bytes.
3. Require external signing.
4. Validate returned signed bytes against review fingerprint, output scripts, payload, computeBudget, network, and txid expectations.
5. Submit through the correct route.
6. Replay accepted evidence before app-state promotion.

## Do Not Blur

- Future adapters are not finished products.
- Planner/indexer state is not custody.
- Local-key TN12 activity is not external-wallet proof.
- Accepted TN12 evidence is not mainnet readiness.
- A UI form is not script enforcement.
- A source link is not certification, partnership, or production integration.

