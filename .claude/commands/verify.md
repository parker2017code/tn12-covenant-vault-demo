Run the full TN12 verification gate in this order:

1. `npm run check` — local script + artifact gate
2. `npm run check:negative` — negative-path gate
3. `npm run tx:verify` — fetch and verify all accepted proof txids from TN12 REST API
4. `npm run roles:proof:evidence` — print role-separated proof table

Report: pass/fail for each step. If any step fails, show the error output directly. Do not summarize away error details.
