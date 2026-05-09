# TN12 Pickup Note

Paused: 2026-05-09

## Current Branch State

The previous public-facing cleanup was committed and pushed. Do not assume the worktree is clean on resume; verify with `git status --short`.

## What Was Being Done

The proof-first cleanup is done. The current continuation task is to use `docs/PROJECT_COMPLETION_PLAN.md` as the stop/go map: finish wallet submit, durable indexing, batch-assurance settlement review, and escrow marketplace UX before adding more app lanes.

## Recently Completed Before This WIP

The latest committed TN12 work already did the real batch-assurance custody step:

- Accepted pledge funding tx: `0b8196957a09832bc4469237ac75f315eba9c2f22678030eef92816a4e5cd69a`.
- It created accepted 45/35/20 TKAS pledge outputs.
- `fixtures/AcceptedOutputEvidence.json` records those accepted outputs.
- The checkpointed indexer now has 36 accepted records.
- Batch-assurance custody imports are ready.
- `npm run campaign:settlement-drafts` creates one signed release draft and three signed individual refund drafts.
- Those release/refund drafts are mutually exclusive and not broadcast.

## Last Known Checks

Before this pickup note was refreshed, these passed:

```sh
npm run check
npm run check:ui
npm run check:all
```

On resume, rerun at least:

```sh
npm run campaign:custody-requirements
npm run check:all
```

If generated artifacts change, inspect them before committing.

## First Resume Steps

1. Run `git status --short`.
2. Search for stale batch-assurance next-step language:

   ```sh
   rg -n "accepted pledge outputs|release/refund drafts|custody drafts|matched pledge-output custody transactions|still WIP|still needs matched custody|Pick the next covenant-shaped product" README.md docs index.html app.js src fixtures artifacts scripts
   ```

3. Regenerate and check:

   ```sh
   npm run campaign:custody-requirements
   npm run project:queue
   npm run check:all
   ```

4. If clean, commit each coherent continuation chunk and push.
5. Verify GitHub checks/pages after push.

## Important Boundaries

- Do not submit both batch-assurance release and refund spends. They consume the same accepted pledge outputs.
- Do not reveal or commit private wallet material from `.local/`.
- The remaining reusable TN12 funds are controlled through change/output lineage, not by reusing an already spent original UTXO.
- Public copy should lead with accepted txids, SDK gotchas, and checkable artifacts. Broad app lanes should be secondary and clearly labeled as scaffolding, research, planner/indexer, or wallet-policy.
- Use `docs/PROJECT_COMPLETION_PLAN.md` before adding a new lane; if a task does not improve wallet, indexer, settlement, or proof evidence, write the missing rail down instead.
