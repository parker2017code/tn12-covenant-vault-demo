# Auction Settlement Logic

Reviewed: 2026-05-10

This document captures the current settlement choice for the auction / intent lane.

## Current Recommendation

Use escrow-based custody first.

Reason:

- it reuses the existing escrow lane and its accepted proof shape;
- it keeps winner / loser settlement understandable;
- it avoids pretending the repo has atomic delivery or MEV protection already.

## Settlement Rule

1. Highest valid bid wins.
2. Losers refund or remain unselected.
3. Seller release only happens after the buyer-side payment condition is satisfied.
4. If the buyer does not pay, the seller gets the refund path defined by the draft.

## Required Checks

- accepted bid payload exists;
- reserve price is satisfied;
- custody source is explicit;
- refund path is visible;
- no atomic exchange claim until both sides are enforceable.

## Do Not Claim

- MEV resistance;
- trustless bid custody;
- automatic asset delivery;
- settlement safety without a real custody source.

## Next Artifact

Build the auction custody spec from the existing auction intent prototype, then wire one seller/buyer example to the escrow lane.
