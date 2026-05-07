# Progress Snapshot

Reviewed: 2026-05-07

This repo is now a TN12 covenant/app primitive workshop with a browser control surface, generated artifacts, local checks, GitHub Actions, and GitHub Pages deployment. It is not a mainnet wallet and does not claim live mainnet covenant support.

## Built Bases

1. Payload receipt / invoice app: fixture, registry, UI panel, signed payload draft, readiness check.
   - Current status: blocked on verified payload-preserving submit route.
   - Enforcement: planner/indexer.
   - Mainnet potential: high, with wallet/node/indexer hardening.

2. Wallet-facing submit console: signed draft manifest, input/output/fee/payload review, explicit submit commands.
   - Current status: base built.
   - Enforcement: wallet policy.
   - Mainnet potential: useful only after real wallet integration replaces local keys.

3. Batch assurance campaigns: multi-pledge accepted progress, pending progress, release/refund planning.
   - Current status: base built.
   - Enforcement: planner/indexer.
   - Covenant boundary: individual pledge script exists; pooled target aggregation is not script-enforced.

4. Escrow primitive: buyer fund, seller release, timeout refund, mutual cancel planner.
   - Current status: next build.
   - Enforcement: script-planned after `Escrow.sil`; no spend proof yet.
   - Next proof: add signed drafts and accepted TN12 proof paths.

5. Treasury / team vaults: spend caps, delayed large withdrawals, recovery, payroll templates.
   - Current status: base built.
   - Enforcement: wallet policy plus existing vault primitives.
   - Boundary: payroll/caps are not script-enforced yet.

6. KRC / access pass planner: coupons, memberships, tickets, redeemable claims.
   - Current status: base built.
   - Enforcement: issuer/indexer.
   - Mainnet potential: medium-high as accepted payload/indexer app state.

7. Simple asset policy: mint, transfer, burn, recovery, redemption policy shapes.
   - Current status: base built.
   - Enforcement: issuer/indexer now; future covenant-native lane later.
   - Boundary: no live native asset protocol claim.

8. Auction / intent prototype: accepted bid payloads, winner rule, refund planning, MEV caveat.
   - Current status: base built.
   - Enforcement: planner/indexer.
   - Boundary: no bid custody, no atomic exchange, no MEV resistance claim.

9. DeFi research backlog: swaps, AMMs, lending, stable-value, insurance, derivatives, prediction hedges, portfolio automation.
   - Current status: base built as research backlog.
   - Enforcement: documentation.
   - Boundary: not live DeFi.

10. Cross-chain app research library: PMF, reusable patterns, failure modes, Kaspa mapping.
    - Current status: base built.
    - Enforcement: documentation.
    - Use: source shelf before porting code or UX.

11. Miner / pool signal research: signed attestations and transaction payload first.
    - Current status: base built.
    - Enforcement: research.
    - Boundary: no fake block-header data claim.

12. AI-agent commitment board: task offers, deposits, completion proofs, disputes, release/refund planning.
    - Current status: base built.
    - Enforcement: planner/indexer.
    - Boundary: no autonomous payouts.

13. Transparent coordination-market prototype: Stag, Intendo, Pack, toy Solver, Hunt plan.
    - Current status: research.
    - Enforcement: research.
    - Boundary: not Hashdag/Staghunt implementation; missing opacity, capital multiplexing, composability, and atomic Hunt execution.

## Immediate Next Work

1. Add negative/adversarial tests for planner and reducer state:
   - signed-only bids cannot win;
   - below-reserve accepted bids cannot win;
   - accepted pledge progress differs from signed-only progress;
   - agent disputes block release;
   - invoice paid state requires accepted matching payload.

2. Build the escrow proof path:
   - `contracts/Escrow.sil`;
   - constructor fixtures;
   - funding draft;
   - seller release draft;
   - timeout refund draft;
   - mutual cancel draft if the script/tooling supports it cleanly;
   - accepted TN12 proof only after local draft checks pass.

3. Continue the invoice vertical slice:
   - find or build a payload-preserving submit route;
   - submit one payload receipt;
   - fetch accepted transaction;
   - decode payload into paid invoice state;
   - update UI only after accepted state proves it.

4. Turn research lanes into safer prototypes:
   - prediction/hedge simulator using attestations and manual portfolio positions;
   - swap-intent registry with no custody;
   - agent-task release/refund drafts.

5. Keep GitHub current:
   - commit each lane separately;
   - push to `main`;
   - verify GitHub Actions and Pages;
   - verify cache-busted live artifacts after deployment.

## Current Verification Commands

```sh
npm run check:all
npm run tx:verify
npm run proof:evidence
```

`npm run proof:evidence` verifies the important proof shape: the four accepted TN12 proof spends consume P2SH contract outputs and pay the expected P2PK wallet output.
