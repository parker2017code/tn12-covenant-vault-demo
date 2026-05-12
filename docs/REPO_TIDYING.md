# Repo Tidying Map

This file defines the cleanup standard for the repo. It is not a roadmap for new features.

Current tidying state after the May 2026 cleanup: mature, with a few code-surface
and wallet/replay rails still open.

## Canonical Surface

Keep these files current:

- `README.md`: short public summary, current verifier path, and canonical artifact links.
- `MAINNET_READINESS.md`: deployment-readiness gaps only.
- `docs/AUDIT_MAP.md`: claim-to-evidence map.
- `docs/SCRIPT_INDEX.md`: preferred command groups and artifact-diff policy.
- `docs/PROOF_INDEX.md`: txid-level accepted proof index.
- `docs/TN12_TEST_MATRIX.md`: tested, rejected, and not-tested matrix.
- `docs/PROGRESS.md`: short current handoff.
- `artifacts/proven-status.json`: compact generated status.
- `artifacts/operator-receipt-pack.json`: operator-facing generated evidence pack.

## Archive Policy

Archive rather than delete when a file is useful history but not current truth.

Archive candidates:

- session reports;
- sprint status reports;
- old implementation readiness reports;
- superseded funding guides;
- one-off execution notes.

Archived files live under `docs/archive/` and must not be cited as current evidence.
They are excluded from normal `rg` searches through `.ignore`; use
`rg --no-ignore "pattern" docs/archive` only when intentionally reviewing old
session history.

## Public UI Policy

The public page should lead with:

- accepted evidence;
- reviewer path;
- operator pack;
- enforcement/status boundaries;
- proof/indexer sections;
- mainnet blockers.

Backlog, research, app ideas, prediction, stable-value, and DeFi expansion should stay below the proof surface and remain explicitly status-labeled.

The broad builder workbench lives in `lab.html`. The main `index.html` is the proof/reviewer/operator surface.

`app.js` still owns most renderers, but page bootstrapping is split through `src/ui/pageControllers.mjs` so the proof page and lab workbench do not share one undifferentiated startup path.

## Naming Policy

Prefer this vocabulary:

- proof spend;
- payload receipt;
- checkpoint index;
- operator pack;
- user-wallet signing;
- live rollback evidence;
- planner or research lane.

Avoid turning every planner artifact into a product claim.

## Script Policy

Preferred reviewer commands:

- `npm run check:all`
- `npm run check:tn12`
- `npm run operator:refresh`
- `npm run operator:pack`
- `npm run proof:verify`

Older script names can remain as compatibility aliases when removing them would make history or handoffs harder to follow.

## Artifact Diff Policy

Material artifact changes:

- status label changes;
- count changes;
- txid changes;
- blocker/review problem changes;
- accepted/rejected state changes.

Low-signal artifact changes:

- timestamp-only regeneration;
- replay `seen_at` changes with identical txids/counts;
- generated ordering with no status/count change.

Do not make a proof claim from low-signal diffs.

## Remaining Maintenance

The remaining cleanup is ongoing maintenance:

- keep live Pages, README, and generated artifacts synchronized after each proof;
- reduce old aliases only after a release window where docs no longer reference them;
- keep the proof page and lab workbench split if the UI grows again;
- keep user-wallet signing and live rollback evidence as named blockers until they are actually cleared.
