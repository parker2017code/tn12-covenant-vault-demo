# Oracle Consensus Gate

Reviewed: 2026-05-10

This note is for the DeFi / price-feed research lane.

## Gate

Before any oracle-backed claim, define:

- provider set;
- update frequency;
- stale-feed rule;
- manipulation response;
- dispute or challenge path;
- what happens on source disagreement.

## Safe Use

The current repo can use oracle-like inputs for:

- review prompts;
- simulations;
- warning surfaces.

It should not use them for:

- custody movement;
- liquidation;
- automatic settlement;
- claims of ground-truth price.

## Failure Modes

- stale feed;
- missing feed;
- wrong feed;
- manipulated feed;
- split feed;
- unavailable feed.

## Next Artifact

Record the consensus model as a research artifact before any stable-value or lending claim advances.
