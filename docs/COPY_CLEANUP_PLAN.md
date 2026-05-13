# Copy Cleanup Plan

Reviewed: 2026-05-11

Use this when changing public pages, docs, generated artifacts, or handoff text.

## Standard

Good copy is short:

1. What can I do?
2. What evidence backs it?
3. What is missing?
4. What should I try next?

For public TN12 pages, use this order before artifact labels:

1. What happened on TN12?
2. What can the reader click or repeat?
3. What did the repo replay from accepted rows?
4. Which rule is script-enforced, replay-derived, wallet policy, local-only, or future work?
5. What remains missing before a real product claim?

## Cut Or Rewrite

- Vague roadmap fog.
- Repeated defensive disclaimers.
- Fake-official or fake-product labels.
- Internal notes on public pages.
- Technical terms before a concrete example.
- Huge generated walls before the user has a path.
- Claims that sound bigger than the TN12 evidence.
- "Rules" language when normal operator judgment is enough.
- Internal status slugs as public-facing copy.
- "Live Play" style labels that make a testnet walkthrough sound like a product.
- "DeFi" as a top-level public label unless the same sentence states the missing AMM, lending, liquidation, oracle, custody, and wallet rails.

## Preferred Shape

| Bad shape | Better shape |
|---|---|
| This is not production and not mainnet and not autonomous. | This is TN12 evidence. Mainnet wallet and indexer rails are still missing. |
| Universal scheduler aligned conceptually with future primitives. | Scheduler workbench: accepted trigger, bid, execution, and replay rows. |
| Coordination-market research prototype. | People commit only if enough compatible people also commit. |
| Planner-only state must not be promoted. | Replay first. Promote only accepted, matching rows. |
| Covenant proofs, grouped by pattern. | Show which rule moved the money. |
| DeFi multi-wallet flow. | Pool-style testnet flow. |
| Proof surface: accepted txids, receipts, replay rows, and remaining pieces. | Evidence in order: accepted txids first, app receipts second, replayed state third, open gaps last. |

## Current Framing

1. Money rails first.
2. Covenant primitives second.
3. Based-app prototypes third.
4. Full vProgs / synchronous composition later.

The repo should say plainly that it is building based-app prototypes. It should also say plainly which rows are accepted on TN12 and which rows are expected behavior or predictions to test next.

## Follow-Up

- Keep playground and lab pages focused on what users can run.
- Keep advanced evidence collapsible.
- Keep source links typed as explorer evidence, repo source, or external reference.
- Replace repeated "not production" copy with the exact missing rail.
- Update this file when a new wording rule becomes important.
