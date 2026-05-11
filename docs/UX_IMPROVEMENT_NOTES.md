# TN12 UX improvement notes

This is an internal working note for product cleanup. Keep the public site focused on the proof path; keep audit detail available but not dominant.

## Current grade

- Engineering proof lab: B-
- User-facing product: C+

## Main problems to fix

- The front door still feels like a lab notebook. Compress around one question: what was proven on TN12?
- The first screen should route to three jobs: see the proof, try the playground, inspect technical evidence.
- Treat one reported issue as a class until proven otherwise. One confusing command means audit all visible commands; one fake-clickable card means audit all similar cards; one bad mobile control means inspect the whole mobile chrome.
- Audit words like accepted evidence, indexer-derived, local-key custody, external signer, durable replay, and promotion guard are correct but too dense for the default path.
- Generated artifact sections should be collapsed by default and renamed by user job, not internal script role.
- Package scripts, large `app.js`, large `scripts/check.mjs`, and artifact count make the repo hard to review. Keep splitting renderers and checks.
- Clickable affordances must be honest: if a card reads like an action, make it a link or change the styling/copy.
- Proof-core shorthand such as `7 core + 2 auction + 7 role-separated + 53 indexed records` is useful for reviewers but not meaningful as the main public proof summary.
- Repeated `Technical:` drawer labels make the page feel like an audit console. Use fewer, more natural labels: Proof details, Replay details, Wallet handoff, Build lab.
- The results page currently has the strongest public entry: it starts with concrete activity and should be treated as the default non-builder path.
- Mobile playground is compelling but too long. It needs a sticky or top-level `Observe / Repeat / Build` path and less visible copy-button noise.
- The `Go` circle decoration on cards can look odd or overlap; either refine it or remove it where it harms readability.
- The TN12 mobile theme toggle can land awkwardly; keep it smaller and less visually dominant.

## Near-term product cleanup

- Make the proof home answer: funds moved, covenant spends accepted, payload receipts accepted, replay state derived.
- Move operator/reviewer/build-status material behind technical drawers.
- Keep playground self-serve: faucet, role wallets, external wallet handoff, replay.
- Keep Lab Tools for determined builders, not first-time readers.
- Reduce visible percentages and score language; use concrete counts and missing pieces.
- Use a three-door homepage:
  - See what happened -> `results.html`
  - Try the TN12 playground -> `playground.html`
  - Audit/build from it -> `lab.html`
- Keep the homepage mostly as routing. Proof counts and enforcement details are secondary.

## Real product gaps

- External signer round trip: real wallet signs, submit succeeds, replay sees accepted txid.
- Live removed-block rollback evidence.
- Rendered browser review on mobile and desktop.
- More code splitting around generated manifests, renderers, and check groups.

## Repo hygiene and stale-claim cleanup

- Archive and rename old `100%`, `complete`, `production-ready`, and similar artifacts so repo search does not surface stale overconfidence.
- Current risky names to review include `tn12-system-complete-status.json`, `tn12-100-percent-validation.json`, and `contract-validation-complete.json`.
- Keep historical material clearly non-canonical, or move it deeper into archive paths that do not pollute normal contributor search.
- Quarantine local/testnet signing scripts and private-key handling as local-only test tooling.
- Reduce `package.json` script sprawl with grouped command docs and a smaller public command path.
- Split `app.js`, `scripts/check.mjs`, and `styles.css` further as part of normal feature work.

## Classic LLM smells to remove

- Coverage inflation: too many artifacts, lanes, statuses, and generated outputs.
- Completion-language residue: `90%`, `100%`, `complete`, `production-ready` in old or generated files.
- Matrix addiction: tables and status grids replacing a clean user path.
- Defensive copy loops: repeating what the project is not instead of showing what happened.
- Label churn: reviewer, technical, evidence, artifact, readiness, missing pieces all appearing too often.
- Big-file gravity: large UI, check, CSS, and JSON files making future changes harder.

## Improvement order

1. Make `results.html` the public front door, or make proof home a very light router to results, playground, and lab.
2. Archive or rename old `100% / complete / production-ready` artifacts and docs.
3. Split large UI/check files and reduce package script sprawl.
4. Replace more proof text with clearer user journeys.

## Priority queue

1. Fix visible layout defects first: mobile nav overlap, horizontal overflow, clipped card copy, copy-button crowding, and awkward empty space.
2. Make every clickable-looking element either a real link/button or visually plain text.
3. Audit public command snippets. Each visible command needs a nearby route, prerequisites, and expected outcome, or it moves behind an advanced/local-operator drawer.
4. Route command prerequisites by class:
   - `npm ci` required for repo checks and generators.
   - TN12 faucet funds required for fresh wallet/playground runs.
   - `.local` testnet wallet material required only for local signing flows.
   - `KASPA_WASM_MODULE`, `KASPA_WRPC_URL`, encoding, network id, and submit shape required for payload-preserving submit flows.
   - Explorer verification required before app state promotion.
5. Keep public pages minimal by default. Long operator commands, artifact inventories, old planning notes, and generated matrices belong in docs/lab drawers.
6. Then split large code surfaces: `app.js`, `styles.css`, `scripts/check.mjs`, and package script groups.

## Lessons from strong open-source websites

- Homepage sells the shape; docs prove the details.
- Use one sharp promise, one primary action, and one secondary action before exposing matrices.
- Vite-style lesson: one sentence, one command, one GitHub/docs route beats a broad feature wall.
- Astro-style lesson: strong product promise first, concrete reasons second, ecosystem depth later.
- Docusaurus/Starlight lesson: technical depth belongs in a clean docs/lab shell with search, stable navigation, and low decoration.
- Kaspa.org lesson: public network portals use normal user-facing sections first; technical detail does not need to appear on the first screen.
- For TN12, the first page should answer only: what happened, can I try it, can I audit/build from it?
- Results should be the non-builder entry. Playground should be the self-serve entry. Lab Tools should be the technical entry.
- Avoid matrix-as-UX. If a table is needed, put it behind a deliberate technical route.
- Visual system: graphite base, cyan evidence/action links, orange action highlights, minimal glow.
- Copy system: short verbs and nouns. Prefer `See`, `Try`, `Verify`, `Build`, `Run`, `Replay` over internal labels.
