# Historical Archive

This folder holds old session reports, status snapshots, sprint notes, and task guides.

Archived files are intentionally excluded from normal `rg` searches through
the repo `.ignore` file. Search them deliberately with:

```sh
rg --no-ignore "pattern" docs/archive
```

Canonical current status lives in:

- `../../README.md`
- `../../MAINNET_READINESS.md`
- `../PROOF_INDEX.md`
- `../TN12_TEST_MATRIX.md`
- `../../artifacts/proven-status.json`
- `../../artifacts/operator-receipt-pack.json`

Use archived files only for historical context. Do not treat them as current
proof counts, product status, or roadmap state.
