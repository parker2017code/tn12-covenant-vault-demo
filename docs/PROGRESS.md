# Progress Snapshot

Reviewed: 2026-05-07

This repo is now a TN12 covenant/app primitive workshop with a browser control surface, generated artifacts, local checks, GitHub Actions, and GitHub Pages deployment. It is not a mainnet wallet and does not claim live mainnet covenant support.

The durable roadmap and twenty-lane status map are in `docs/ROADMAP_STATE.md`.

Standard: positive app-state transitions need accepted TN12 transaction evidence before they are marked done. Local reducer tests remain useful for duplicate, stale, malformed, or unsafe cases, but they do not replace a safe testnet transaction for real state changes. The running tested/not-tested map is `docs/TN12_TEST_MATRIX.md`.

## Built Bases

1. Payload receipt / invoice app: fixture, registry, UI panel, signed payload drafts, readiness check, accepted paid/refund/error payload evidence, and decoded app state.
   - Current status: accepted TN12 JSON wRPC vertical slice.
   - Evidence: forced public TN12 REST submit accepted tx `d67880665f81a4bb9966a0fbcf77d31b8b501ddd4098b8e5861831e5bc044bb4`, but the fetched transaction has no payload; expected payload txid `ae807e8d81fd46ad5f0f9f77128851cb181a37e7b90105fb8e89f5595955a4d9` was not found.
   - Accepted route: JSON wRPC accepted paid tx `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`, refund tx `4f24d99891d1bf79aab0dd66dcb31e6808ca766507f729f9be2c59048f4b7a13`, and error tx `3738322fbe19c384b5472336f006560bceea3e004099eb50c2499874903b2c5c`; `npm run payload:verify` confirms payload bytes and output match for each evidence artifact.
   - Enforcement: planner/indexer.
   - Mainnet potential: high, with wallet/node/indexer hardening.
   - Indexer status: checkpointed known-txid public-read index covers 27 accepted TN12 records: 7 proof spends and 20 payload events.

2. Wallet-facing submit console: signed draft manifest, input/output/fee/payload review, explicit submit commands.
   - Current status: base built with wallet-review readiness artifact.
   - Enforcement: wallet policy.
   - Mainnet potential: useful only after real wallet integration replaces local keys.
   - Review status: `npm run wallet:review` checks all published signed draft summaries for testnet network, explicit submit commands, payload-route gating, and serialized secret fields.

3. Batch assurance campaigns: multi-pledge accepted progress, pending progress, release/refund planning.
   - Current status: base built.
   - Enforcement: planner/indexer.
   - Covenant boundary: individual pledge script exists; pooled target aggregation is not script-enforced.

4. Escrow primitive: buyer fund, seller release, timeout refund, mutual cancel planner.
   - Current status: base built.
   - Enforcement: script for accepted release, DAA-refund, and mutual-cancel paths.
   - Proof: accepted escrow funding, accepted release spend, and accepted DAA-expired refund spend.
   - Cancel status: accepted on a separate funded output. The first submit used `sigOpCount=1` and hit `used=200870`, `limit=109999`; the old-SDK v1 attempt failed verification; the corrected local TN12 SDK route accepted `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c`.
   - Latest route: Rusty Kaspa TN12 source confirms tx version 1 plus `computeBudget`; v1 malformed RPC transactions with non-zero `sig_op_count` are rejected. The accepted JS route uses local TN12 `kaspa-wasm 1.1.1-toc.1` with `sigOpCount: 0, computeBudget: 30`.

5. Treasury / team vaults: spend caps, delayed large withdrawals, recovery, payroll templates.
   - Current status: base built.
   - Enforcement: wallet policy plus existing vault primitives.
   - Boundary: payroll/caps are not script-enforced yet.

6. KRC / access pass planner: coupons, memberships, tickets, redeemable claims.
   - Current status: accepted TN12 redemption payload plus planner state.
   - Enforcement: issuer/indexer.
   - Mainnet potential: medium-high as accepted payload/indexer app state.

7. Simple asset policy: mint, transfer, burn, recovery, redemption policy shapes.
   - Current status: base built.
   - Enforcement: issuer/indexer now; future covenant-native lane later.
   - Boundary: no live native asset protocol claim.

8. Auction / intent prototype: accepted bid payloads, winner rule, refund planning, MEV caveat.
   - Current status: accepted TN12 bid payloads plus planner state.
   - Enforcement: planner/indexer.
   - Boundary: no bid custody, no atomic exchange, no MEV resistance claim.

9. DeFi research backlog: swaps, AMMs, lending, stable-value, insurance, derivatives, prediction hedges, portfolio automation.
   - Current status: base built as research backlog.
   - Enforcement: documentation.
   - Boundary: not live DeFi.
   - Stable-value detail: comparison brief added for issuer-backed, overcollateralized, synthetic, and external-stable paths; issuer-backed demo state now tracks accepted TN12 issuance/redemption payloads while excluding signed-only requests. This is not a native stablecoin claim.

10. Cross-chain app research library: PMF, reusable patterns, failure modes, Kaspa mapping.
    - Current status: base built.
    - Enforcement: documentation.
    - Use: source shelf before porting code or UX.

11. Miner / pool signal research: signed attestations and transaction payload first.
    - Current status: accepted TN12 miner/watcher attestation payload plus research registry.
    - Enforcement: research.
    - Boundary: no fake block-header data claim.

12. AI-agent commitment board: task offers, deposits, completion proofs, disputes, release/refund planning.
    - Current status: accepted TN12 task/proof/dispute payloads plus planner state.
    - Enforcement: planner/indexer.
    - Boundary: no autonomous payouts.

13. Transparent coordination-market prototype: Stag, Intendo, Pack, toy Solver, Hunt plan.
    - Current status: research.
    - Enforcement: research.
    - Boundary: not Hashdag/Staghunt implementation; missing opacity, capital multiplexing, composability, and atomic Hunt execution.

14. ZK / anchor readiness: off-chain state proofs, solver proofs, source-chain anchors, oracle attestation proofs, and vProg settlement.
    - Current status: research roadmap.
    - Enforcement: documentation.
    - Boundary: no ZK proof is used by the current vault, assurance, or escrow proofs.
    - Rule: ZK proves math over selected inputs; builders still need an anchor/trust model for external roots, events, prices, and source-chain state.

## Immediate Next Work

1. Add negative/adversarial tests for planner and reducer state:
   - signed-only bids cannot win;
   - below-reserve accepted bids cannot win;
   - accepted pledge progress differs from signed-only progress;
   - agent disputes block release;
   - invoice paid state requires accepted matching payload.
   - access-pass redemptions require a txid and duplicate holder/pass redemptions cannot inflate redeemed counts.

2. Extend the escrow proof path:
   - accepted funding outpoint: done;
   - accepted seller release: done;
   - DAA-score timeout refund: done;
   - mutual cancel: separately funded attempt is accepted; current version-1 `computeBudget=30` artifact was rebuilt with local TN12 `kaspa-wasm 1.1.1-toc.1`, submitted over JSON wRPC, and verified accepted by the TN12 API.

3. Harden the invoice vertical slice:
   - keep REST submit marked unsuitable for payload receipts;
   - make JSON wRPC or wallet review repeatable;
   - duplicate-payment and stale-receipt checks: done in invoice registry state;
   - refund/error state: done with accepted TN12 payload events and invoice registry state;
   - keep invoice paid state tied to matched accepted payload bytes;
   - checkpointed known-txid public-read index plus rollback guard: done for current proof and payload records.

4. Turn research lanes into safer prototypes:
   - prediction/hedge simulator using attestations and manual portfolio positions;
   - swap-intent registry with no custody;
   - agent-task release/refund drafts.

5. Keep GitHub current:
   - commit each lane separately;
   - push to `main`;
   - verify GitHub Actions and Pages;
   - verify cache-busted live artifacts after deployment.
   - Later maintenance: update GitHub Actions when `actions/checkout` and `actions/setup-node` have stable Node 24-compatible versions, or opt into Node 24 early and verify the workflow.

## Current Verification Commands

```sh
npm run check:all
npm run tx:verify
npm run proof:evidence
npm run payload:verify:events
```

`npm run proof:evidence` verifies the important proof shape: the seven accepted TN12 proof spends consume P2SH contract outputs and pay the expected P2PK wallet output.
