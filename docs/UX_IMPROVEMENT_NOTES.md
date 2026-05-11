# TN12 UX improvement notes

This is an internal working note for product cleanup. Keep the public site focused on the proof path; keep audit detail available but not dominant.

## Current grade

- Engineering proof lab: B-
- User-facing product: C+

## Main problems to fix

- The front door still feels like a lab notebook. Compress around one question: what was proven on TN12?
- The first screen should route to three jobs: see the proof, try the playground, inspect technical evidence.
- Audit words like accepted evidence, indexer-derived, local-key custody, external signer, durable replay, and promotion guard are correct but too dense for the default path.
- Generated artifact sections should be collapsed by default and renamed by user job, not internal script role.
- Package scripts, large `app.js`, large `scripts/check.mjs`, and artifact count make the repo hard to review. Keep splitting renderers and checks.
- Clickable affordances must be honest: if a card reads like an action, make it a link or change the styling/copy.

## Near-term product cleanup

- Make the proof home answer: funds moved, covenant spends accepted, payload receipts accepted, replay state derived.
- Move operator/reviewer/build-status material behind technical drawers.
- Keep playground self-serve: faucet, role wallets, external wallet handoff, replay.
- Keep Lab Tools for determined builders, not first-time readers.
- Reduce visible percentages and score language; use concrete counts and missing pieces.

## Real product gaps

- External signer round trip: real wallet signs, submit succeeds, replay sees accepted txid.
- Live removed-block rollback evidence.
- Rendered browser review on mobile and desktop.
- More code splitting around generated manifests, renderers, and check groups.
