# TN12 Covenant Lab — Claude Rules

## Non-negotiable constraints
- `.local/` contains live testnet private keys. Never read it aloud, commit it, or include its content in any artifact or response.
- Never use `--submit` in any npm or node command unless the user explicitly says to submit a transaction. Dry-run first by default.
- `npm run check` must pass before declaring any artifact update done.

## Key commands
- `npm run check:all` — full gate (scripts + negative + UI smoke)
- `npm run check:tn12` — live TN12 evidence gate
- `npm run tx:verify` — verify all accepted txids on chain
- `npm run proof:evidence` — print accepted proof table

## Conventions when updating artifacts
- Accepted transaction: set `status` to `"accepted-tn12"`, add `acceptedEvidence` block with `txid` and `acceptingBlockBlueScore`
- Blue score comes from the REST API field `acceptingBlockBlueScore`
- If a fixture outpoint (in `fixtures/Role*ContractOutpoint.json`) is spent, fetch a fresh UTXO and update the fixture before rebuilding drafts
- Status labels in use: `TN12_ACCEPTED` | `TN12_REJECTED` | `SIGNED_NOT_BROADCAST` | `LOCAL_TEST_ONLY` | `PLANNER_ONLY`

## Claim discipline
- See `docs/LLM_REVIEW_GUIDE.md` for claim boundaries (what NOT to assert as proven)
- See `docs/AI_CODING_SOURCE_DISCIPLINE.md` for source discipline rules
- Never state a txid as accepted without verifying via `npm run tx:verify`
- No corporate abstraction in public copy or handoff notes. If a term like institutional readiness, ecosystem maturity, enterprise adoption, robust, seamless, unlock, or enable appears, replace it or define the actor, the job, and the concrete requirement.
