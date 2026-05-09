Run the adversarial invalid-spend builder in dry-run mode and report status.

1. `node scripts/build-adversarial-invalid-spend-attempts.mjs` (dry-run, no --submit)
2. Read `artifacts/adversarial/adversarial-summary.json`
3. Check which mutation types are still LOCAL_TEST_ONLY (wrong-selector, wrong-output-lock, wrong-amount)

Report: which cases have live TN12 rejection evidence, which are still local-only, and what fresh expendable P2SH outputs would be needed to run the remaining cases.

IMPORTANT: Do NOT add --submit unless the user explicitly asks to submit new adversarial transactions.
