# Coordination Market Custody

Reviewed: 2026-05-10

This document keeps the coordination-market lane below the current proof boundary.

## Current Recommendation

Keep custody and settlement explicit before any Stag / Intendo / Pack / Solver claim.

## Candidate Custody Models

1. Escrow-based custody.
2. Multi-sig or role-reviewed custody.
3. Covenant-based custody.

## Current Repo Position

- The repo has a transparent toy planner.
- The repo does not have a production Staghunt or Hashdag implementation.
- The repo does not have opaque capital multiplexing or atomic Hunt execution.

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
