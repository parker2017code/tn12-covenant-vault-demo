# Public Flow Rules

Use this when changing public TN12 pages.

## Default Reader

Assume the first reader is smart but does not already hold the repo's crypto context.

Show this first:

1. What happened on TN12.
2. What they can click.
3. What they can try with tKAS.
4. What needs a user wallet, indexer, oracle, or custody path.

## Page Roles

- `results.html`: evidence story first.
- `playground.html`: try the accepted money-flow pattern.
- `index.html`: proof home and reviewer entry.
- `lab.html`: builder workbench and deep artifacts.

## Public Copy

- If text says open, click, source, evidence, or artifact, make it a link or button.
- Use the industry or protocol term only when it helps. Then translate it into the real job: what the user tests, builds, approves, measures, or avoids.
- Keep commands as command text unless they point at an actual local file.
- Keep reviewer material reachable but collapsed by default.
- Avoid public notes about how the page should work.
- Prefer "next path" over "missing path" when a lane is intentionally unfinished.
- Prefer direct wording: "wallet signing is next" instead of "not production."
- Fix exact visible defects first. One bad icon, arrow, label, spacing issue, or copy line is not permission to remove unrelated design, but it also is not a reason to hold back broader cleanup when the broader page genuinely needs it.
- Use current Kaspa.org/docs pages for orientation, then use TN12 accepted txids, generated artifacts, KIPs, Rusty Kaspa source/tests, and release notes for proof or status changes.

## Visual Direction

- Dark mode is the default.
- Light mode must remain available.
- Avoid terminal-dashboard overload.
- Favor evidence rows, clear actions, short sections, and cards only for real choices or repeated records.
- Keep public web basics coherent on every release: favicon set, touch icon, manifest, Open Graph/Twitter preview, mobile screenshots, and HTTP-200 local preview.

## Public UI Implementation Rules

- A new public section is not complete until it has a user job, an evidence class, a mobile shape, and a failure state.
- Dynamic panels must distinguish loading, missing artifact, invalid artifact, network failure, accepted evidence, local reject, replay-derived state, wallet policy, and future work.
- Long hashes, artifact slugs, command flags, and wallet fields must wrap safely or live inside drawers. Do not let proof data stretch the page.
- Use real links for explorer/artifact destinations and real buttons for in-page actions. If a card is decorative, it must not look clickable.
- Tables are audit tools. On public routes, explain the plain action before showing status labels or artifact slugs.
- Keyboard users should be able to reach every route, drawer, command copy action, and evidence link. Focus outlines should remain visible in both themes.
- Do not add new dependencies, animated libraries, wallet widgets, analytics scripts, or external embeds for public polish. Add them only when they serve a specific inspection flow.
- Any wallet-facing card must state what the user is approving, what rule is checked, what evidence backs it, and what remains outside the current proof.
