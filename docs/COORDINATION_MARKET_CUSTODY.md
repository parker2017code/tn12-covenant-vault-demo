# Coordination Market Custody

Reviewed: 2026-05-10

This document keeps the coordination-market lane below the current proof boundary.

## Current Recommendation

Keep custody and settlement explicit before any Stag / Intendo / Pack / Solver claim.

Junny Ho's Web3 Festival HK 2026 talk frames this lane cleanly: stag-hunt coordination fails when participants cannot observe credible commitments from others quickly enough. A coordination-market prototype should show conditional participation, observable thresholds, and economic exposure before it claims to solve coordination.

## Candidate Custody Models

1. Escrow-based custody.
2. Multi-sig or role-reviewed custody.
3. Covenant-based custody.

## Current Repo Position

- The repo has a transparent toy planner.
- The repo has pieces in the direction of Junny Ho's coordination-market thesis: accepted TN12 money movement, payload receipts, replayed state, transparent Stag/Intendo/Pack planning, and batch-assurance threshold/release artifacts.
- Missing: production Staghunt or Hashdag implementation.
- Missing: opaque capital multiplexing and atomic Hunt execution.
- Reviewer answer: this repo has a proof-backed prototype slice of the idea. The full production coordination-market system still needs custody, privacy/opacity, atomic execution, wallet signing, and mainnet activation.

## Settlement Rule

1. State who commits.
2. State what gets measured.
3. State who can settle.
4. State what can be inspected on-chain.

## Do Not Claim

- live coordination-market infrastructure;
- fairness without custody rules;
- private execution without an implemented privacy model;
- production settlement without a source of funds and a settlement authority.

## Next Artifact

Turn the toy planner into a custody spec and a settlement brief before any code path is promoted.
