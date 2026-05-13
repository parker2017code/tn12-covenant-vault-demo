# TN12 Design Audit Matrix

Reviewed locally: 2026-05-13

Use this before broad public UI changes. The site is not a marketing page. It is a TN12 testnet evidence interface for accepted transactions, replayed state, wallet-review fields, and exact blockers.

## Product Stance

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Purpose | Testnet proof lab, not production DeFi or wallet product. | Public routes now say accepted TN12, replay, wallet path, and blockers. | Keep every new section tied to accepted evidence, repeatable walkthrough, or builder audit. |
| Primary user | Reviewer, builder, crypto-native reader, and curious tester with tKAS. | Results and playground now provide clearer paths than the old lab notebook shape. | Make Results the default reader path; keep Lab Tools advanced. |
| User goal | Inspect what landed, replay what changed, understand what is missing, optionally repeat on TN12. | Results, Playground, Experiments, and Lab Tools split the jobs. | Avoid new pages unless they have a distinct job. |
| De-emphasized | Full artifacts, template hashes, long txids, compiler notes, operator commands, internal names. | Some detail remains visible but mostly moved behind links/drawers. | Continue moving mechanical detail down one layer. |

## Information Architecture

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Navigation | Proof Home, Results, TN12 Playground, Experiments, Lab Tools. | Good enough. "TN12 Playground" replaced product-like wording. | Keep local anchors short and action-based. |
| Page roles | Proof Home routes, Results proves run, Playground repeats run, Experiments explains app patterns, Lab Tools builds. | Mostly aligned. | Remove duplicate proof-story text where pages repeat each other. |
| Search / filters | Not a search-first site. Evidence links and drawers matter more. | No global search needed yet. | If artifacts grow, add local filters to Results instead of more pages. |
| Footer | Minimal. | Fine. | Avoid deep marketing footer. |

## Layout And Density

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Layout system | Dense workbench panels, not landing-page sections. | New proof topology, evidence ledger, wallet review, replay pipeline match this. | Keep cards as repeated evidence or choices only. |
| Above fold | What happened, current count, proof boundary. | Hero is large but readable. | Watch mobile H1 height and keep proof drawer visible on proof home. |
| Tables | Use only for reviewer detail. | Experiments table was shortened; table detail still exists lower. | Keep raw status slugs out of first-screen tables. |
| Mobile | Stack panels, hide arrows, avoid fixed controls over content. | UI smoke and screenshots pass. | Keep testing 390px and long-token overflow after every visual change. |

## Visual System

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Style | Protocol lab console: graphite, thin borders, restrained Kaspa teal, amber for attention. | Current CSS follows this better after workbench visuals. | No neon, no crypto-glow, no large decorative gradients. |
| Branding | Kaspa/TN12 signal, not toy-game brand. | Fun names are demoted; proof labels are primary. | Keep internal names behind docs or artifacts when they reduce seriousness. |
| Color | Teal for accepted/action, amber for active emphasis, red only for blocked/rejected. | Mostly consistent. | Audit status chips for color-only meaning. |
| Typography | Large enough to scan, not hero-heavy inside compact panels. | Some H1s remain huge. | Keep mobile H1s short; avoid long technical terms in headings. |
| Spacing | Compact but breathable. | New boards use 7px radius, 10-14px gaps. | Avoid card nesting and overlong vertical pages. |
| Motion | Subtle state pulse only. | Proof topology uses light pulse. | Respect reduced-motion if more animation is added. |

## Components

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Buttons / CTAs | Use real links for evidence and routes. | Visible txids and cards increasingly link out. | Audit all clickable-looking cards. |
| Forms / inputs | Minimal; playground is not a production form. | No major forms exposed. | If wallet handoff UI grows, add validation and error states. |
| Cards | Repeated evidence, route choices, wallet review fields. | New cards are purposeful. | Avoid cards for prose-only sections. |
| Tables | Evidence ledger or hidden details. | Results ledger is card-based; deeper tables stay lower. | Long artifact tables stay behind drawers. |
| Drawers | Advanced details and commands. | Good pattern on Results/Playground. | Keep commands collapsed unless a page is explicitly a runbook. |
| Ask/review widgets | TN12 has no Ask AI widget. | N/A. | Do not add assistant chrome unless it has a clear reviewer job. |

## Implementation Engineering Rules

Use this section when turning the design into code. TN12 pages are state-heavy proof surfaces, so the implementation bar is higher than "the layout renders."

| Area | TN12 rule | Required check |
|---|---|---|
| User intent | Code follows the reader jobs: observe accepted evidence, repeat a safe TN12 path, inspect wallet review fields, or audit/build from artifacts. | Every new visible section should name the action it supports. |
| Components | Treat proof cards, rule ledgers, evidence drawers, wallet review cards, command blocks, and topology maps as reusable interface parts. | Each part needs default, hover/focus, long-content, empty/unavailable, and error behavior where applicable. |
| State management | Keep `accepted TN12`, `local reject`, `replay-derived`, `wallet policy`, `planner-only`, `missing artifact`, `invalid artifact`, and `network error` separate. | Do not collapse distinct states into a silent `null`, blank card, or generic "unavailable." |
| Content variability | Long txids, covenant IDs, artifact names, command flags, and error text must wrap or move behind drawers. | Test with full hashes, missing labels, large numbers, and narrow mobile width. |
| Responsive behavior | Mobile is a first-class review surface, not a squeezed desktop table. | Tables must become cards, drawers, or horizontally safe ledgers below mobile width. |
| Accessibility | Use links for navigation, buttons for actions, semantic headings, visible focus, keyboard-openable drawers, and status text beyond color. | No clickable-looking non-links; no status communicated by color alone. |
| Performance | Keep visuals static HTML/CSS/SVG with small vanilla JS unless a real inspection feature needs more. | No new animation or package unless it improves inspection, not decoration. |
| Security and privacy | No private keys, seeds, wallet material, or signing assumptions in public UI. Wallet prompts must say what is checked and what remains external. | Local-key or wallet-policy text must stay clearly labeled and never imply production custody. |
| SEO and source trail | Public proof pages need crawlable plain text for what landed, what replayed, and what is blocked. | Metadata and visible text must agree with artifact status. |
| Analytics, if added | Measure evidence-link clicks, playground starts, and failed/missing artifact states. | Do not add broad tracking or vanity engagement metrics. |
| Maintainability | Large UI/check/CSS files are known debt. New work should reduce coupling or keep additions modular. | Prefer small renderers, shared class patterns, and checked docs over page-specific one-offs. |

## Content Design

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Copy order | Concrete action, evidence, mechanism, boundary. | Results/Playground/Experiments are closer now. | Continue replacing internal mechanism-first wording with plain jobs. |
| Translation rule | Use protocol terms only after the practical job is visible. | Encoded in public flow and agent rules. | Say what someone tests, builds, approves, measures, or avoids before naming the mechanism. |
| Tone | Direct proof language, no pitch-deck language. | Better after cleanup. | Remove "cool/demo/game" language from public route unless it explains a user job. |
| Evidence labels | Accepted TN12, local reject, replay-derived, wallet policy, future. | Present and clearer. | Put evidence classes near the top when a page mixes proof types. |
| Non-obvious value | Explain why the pattern matters outside the artifact. | Experiments has this; do not delete it. | Keep aha examples front-facing; move only mechanical detail down. |
| Error / empty states | Local static pages mostly precomputed. | Basic fallback via JS renderers. | If dynamic fetch fails, visible message should name missing artifact vs bad JSON. |

## Trust, Accessibility, And Quality

| Area | Decision | Current check | Next action |
|---|---|---|---|
| Trust | Show accepted txids, local reject status, replay boundary, and blockers. | Strong. | Keep mainnet/audit/wallet blockers exact, not dramatic. |
| Accessibility | Semantic sections, links, skip support from base site, responsive checks. | UI smoke passes. | Add reduced-motion guard if animation grows. |
| SEO / social | Static pages with metadata and social assets. | Existing checks cover public basics. | Recheck favicon/social/manifest after public-facing asset edits. |
| Performance | Plain HTML/CSS/JS. No new packages for visuals. | Good. | Avoid Three.js/canvas unless a dense DAG view truly needs it. |
| Analytics | Not currently a product analytics surface. | Fine. | If added, measure route clicks and evidence-link clicks, not hype metrics. |

## Page-Level Verdict

| Page | Role | Status | Local backlog |
|---|---|---|---|
| `index.html` | Proof home / reviewer entry. | Improved with replay pipeline. | Keep first viewport compact; avoid moving proof drawer too low. |
| `results.html` | Public evidence story. | Stronger after evidence ledger. | Consider making this the primary linked public path. |
| `playground.html` | Observe or repeat TN12 flow. | Stronger after wallet review board. | Shorten lower sections and reduce copy-button crowding if present. |
| `experiments.html` | App-pattern implications. | Better after topology map and board. | Keep aha examples; move txid/detail walls down. |
| `lab.html` | Builder/debug workbench. | Intentionally dense. | Collapse more sprawl; keep commands prereq-labeled. |

## Local Rule

Do not push from this checklist pass unless explicitly asked. Use it to guide local edits, screenshots, and gates first.
