# Repo Memory

Read this file first when resuming work in this repo. It is the short routing layer for the current handoff, project rules, and which deeper docs to open next. Keep it updated after meaningful changes so future agents can continue without rebuilding context from scratch.

## Current Snapshot

- Repo: `/home/parker2017/tn12-covenant-vault-demo`
- Branch: `main`
- GitHub: `https://github.com/parker2017code/tn12-covenant-vault-demo`
- Pages: `https://parker2017code.github.io/tn12-covenant-vault-demo/`
- Local preview: `npm run serve` then `http://127.0.0.1:4176/`
- Main gate: `npm run check:all`
- Full public TN12 evidence gate: `npm run check:tn12`
- Chain proof gate: `npm run tx:verify`
- Proof evidence gate: `npm run proof:evidence`
- Role-separated proof gate: `npm run tx:roles:verify` and `npm run roles:proof:evidence`
- Role-separated invalid-candidate gate: `npm run roles:invalid-candidates`
- Payload event gate: `npm run payload:verify:events`
- Checkpointed index gate: `npm run indexer:checkpoint`
- Persisted checkpoint gate: `npm run indexer:persist`
- Wallet-review gate: `npm run wallet:review`
- Mainstream app direction gate: `npm run mainstream:direction`
- Missing rails gate: `npm run rails:missing`
- Rail research trigger gate: `npm run rails:research`
- Oracle source matrix gate: `npm run oracle:matrix`
- Project next-work queue gate: `npm run project:queue`
- Durable indexer schema/replay gates: `npm run indexer:schema` and `npm run indexer:replay`
- Wallet connector request gate: `npm run wallet:connector-requests`
- Wallet connector adapter dry-run gate: `npm run wallet:adapter-run`
- Virtual-chain ingestion run gate: `npm run indexer:virtual-chain-run`
- Batch-assurance pledge-output plan gate: `npm run campaign:pledge-outputs`
- Escrow marketplace demo gate: `npm run escrow:marketplace`
- Attestation reputation gate: `npm run attestation:reputation`

The repo is a TN12 covenant/app primitive workshop. It has accepted TN12 proof transactions for vault recovery, vault delayed withdrawal, individual assurance release, individual assurance refund, escrow release, escrow DAA-score refund, and escrow mutual cancel. It also has accepted role-separated positive proofs for all seven vault, assurance, and escrow paths: recovery/withdrawal, release/refund, and release/refund/cancel. It also has 26 accepted TN12 payload events for invoice, access-pass, auction, stable-value issuer, miner/watcher attestation, prediction/hedge review, agent commitment, and batch-assurance planner state.

## First-Read Order

1. `MEMORY.md`: current handoff and doc map.
2. `CONTEXT.md`: operating context, wallet/address boundaries, accepted txids, commands, and longer handoff.
3. `AGENTS.md`: behavior rules for future coding agents.
4. `docs/ROADMAP_STATE.md`: durable lane map and current next work.
5. `docs/PROGRESS.md`: lane-by-lane build state and immediate task list.
6. `docs/LLM_REVIEW_GUIDE.md`: how to verify GitHub, Pages, artifacts, and TN12 chain state before making claims.
7. `docs/TN12_TEST_MATRIX.md`: what is TN12 accepted, what is only local reducer-tested, and what still needs a safe testnet transaction.
8. `docs/MAINSTREAM_APP_DIRECTION.md`: high-impact user-facing app direction and which mainstream crypto use cases are build-now, later, or research.
9. `docs/MICHAEL_QUESTIONS.md`: exact protocol/tooling questions to escalate through the user.
10. `docs/STATUS.md`: human-readable proof/status list.
11. `docs/BUILD_PLAN.md`: backlog history and next build tasks.

Use `docs/SOURCES.md` and `docs/KASPA_DOCS_REVIEW.md` when checking source discipline or protocol claims. Use `docs/TRANSACTION_API_NOTES.md` before touching transaction creation, payloads, submit routes, or accepted-indexing code.

## Hard Rules

- Do not print, paste, commit, or expose `.local/tn12-wallet.json` or private keys.
- Do not use mainnet keys or imply mainnet covenant activation.
- Do not reintroduce local `kaspad` or `/home/parker2017/kaspa-node` into this repo unless the user explicitly reverses that rule.
- Keep actual broadcast behind explicit commands and testnet-only language.
- Positive app-state transitions should have accepted TN12 transaction evidence before they are marked done. Local reducer tests are still useful for adversarial, duplicate, stale, malformed, or unsafe cases, but they are not a substitute for a safe testnet transaction when the feature claims a real state change.
- Do not use the public TN12 REST submit route for payload receipts. It accepted a payment while dropping payload bytes.
- Use public TN12 REST reads, local fixtures, local signing, explicit submit commands, and the verified TN12 JSON wRPC route for payload receipts until wallet review replaces local signing.
- When TN12, Silverscript, Rusty Kaspa, transaction signing, submit serialization, or covenant verification behavior remains unclear, first dig through the basic layers yourself: local artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK version/API shape, node/network id, and upstream Rusty Kaspa source/tests. Ask the user to get Michael's guidance only after those checks are exhausted or a precise external confirmation is genuinely needed. Include the exact txid, artifact path, endpoint response, source line, and smallest reproducer command.
- Keep status lanes separate: live Kaspa mainnet, TN12/Toccata covenant work, roadmap vProgs/native app rails, and research-only ideas.
- Keep rollup/vProg claims separate: Toccata gives L1 covenants and zk/sequencing foundations; based-rollup work is a separate execution lane; full synchronously composable vProgs remain roadmap until the interfaces are testable.
- Use `npm run rollup:scout` / `artifacts/based-rollup-scout.json` for based-rollup planning. It treats Maxim's TN12 PoC as bridge/proof reference, Hans' work as runtime/proving direction, and ecosystem rollups as possible future app surfaces.
- Use `npm run covenant:adversarial` / `artifacts/covenant-adversarial-coverage.json` before claiming hardened covenant coverage. It is local adversarial mapping, not TN12 rejection evidence. Current gaps include historical escrow cancel key reuse, fresh role-separated outputs for cancel/refund paths, and exact accepted-script preservation for older vault/assurance proof drafts.
- Use `npm run fixtures:roles` and `npm run compile:roles` for the role-separated proof lane. Public role metadata is committed; private role keys remain in `.local/tn12-role-wallets.json`.
- Use `npm run tx:roles:fund` to build the reviewable role-separated funding transaction. The current role-separated funding transaction is already accepted; build a new one before trying the remaining mutually exclusive role-separated paths.
- Use `npm run tx:roles:spends` after accepted role-separated funding outputs are fetched. The drafts prove role-separated witness construction but are mutually exclusive per contract output. The first proof pass consumed one vault, assurance, and escrow output through recovery, release, and release.
- Do not edit or publish `/home/parker2017/kaspa-explained` from this repo unless explicitly asked.

## Current Next Work

- Use `npm run project:queue` / `artifacts/next-work-queue.json` as the all-in-one broad-continuation order. Use `npm run project:plan` / `artifacts/project-plan.json` for the older done/WIP/next/later grouping.
- WIP lanes: live wallet connector submit without local keys, batch-assurance pledge-output funding/import, durable indexer replay implementation, and attestation provenance/quorum hardening.
- Next actions: wallet submit route, accepted pledge-output custody transactions, durable indexer, covenant rejection attempts from fresh expendable outputs, and attestation signer provenance/quorum handling.
- Keep real depth in three verticals first:
  - invoice/receipt app: accepted transaction app state,
  - escrow/assurance app: TN12 covenant proof app,
  - attestation/agent/prediction simulator: research-to-app bridge.
- The payload vertical slice has 26 accepted TN12 JSON wRPC events listed in `fixtures/PayloadEventEvidence.json`. Keep app state tied to matched accepted payload bytes.
- Escrow mutual cancel is accepted through the version-1 compute-budget path. Preserve old cancel rejections as historical bad configuration or old-SDK evidence only.

## Latest Pause Note

Paused on 2026-05-08 after local invalid-candidate work:

- `src/roleSeparatedInvalidCandidates.mjs` is now wired through `scripts/build-role-separated-invalid-candidates.mjs`.
- `npm run roles:invalid-candidates` writes `artifacts/role-separated-invalid-candidates.json`.
- The artifact maps 32 local review candidates across seven accepted role-separated proof paths.
- Verified locally with `npm run check:all` and `npm run check:tn12`.
- `docs/MAINSTREAM_APP_DIRECTION.md` now documents high-impact mainstream app targets, with invoice/receipt, escrow/freelance, batch assurance, wallet submit, access passes, auctions, vault/treasury, assets, stable-value, and DEX/lending/perps mapped to the correct build/research lane.
- `npm run mainstream:direction` now writes `artifacts/mainstream-app-direction.json` from `fixtures/MainstreamAppDirection.json`.
- `npm run rails:missing` now writes `artifacts/missing-rails-matrix.json` from `fixtures/MissingRailsMatrix.json`, answering the DEX/AMM, lending, perps/prediction, bridge/source-chain, and stable-value rail questions from repo-local evidence and first principles.
- `npm run rails:research` now writes `artifacts/rail-research-triggers.json` from `fixtures/RailResearchTriggers.json`, routing oracle/Kaskad/miner-RTD/bridge/DEX/lending terms to local evidence, external source leads, first questions, required first artifacts, and do-not-claim boundaries.
- `npm run oracle:matrix` now writes `artifacts/oracle-source-matrix.json` from `fixtures/OracleSourceMatrix.json`, comparing CEX weighted median, arbitrage-simulated fair price, signed reporter, miner/RTD, DCLOB, and source-chain anchor oracle models. None are custody-ready in this repo.
- `npm run project:queue` now writes `artifacts/next-work-queue.json` from `fixtures/NextWorkQueue.json`, making wallet connector submit, durable virtual-chain indexer, accepted pledge outputs, batch-assurance settlement drafts, and escrow marketplace demo the top five.
- `npm run indexer:schema` now writes `artifacts/indexer-storage-schema.json`.
- `npm run indexer:replay` now writes `artifacts/indexer-replay-run.json`, materializing the 33-record public-read checkpoint into checkpoint, accepted transaction, payload event, proof spend, and rollback rows.

Remote status before this local change: GitHub Actions `check` and `tn12-verify` had passed; GitHub Pages had deployed successfully.

Accepted role-separated proof state:

- all seven distinct-key positive paths are accepted on TN12,
- `fixtures/RoleSeparatedAcceptedProofTransactions.json` is the canonical role-separated proof fixture,
- `artifacts/role-separated-proof-evidence.json` verifies `7/7` accepted, `7/7` P2SH inputs, `7/7` matched inputs, and `7/7` P2PK outputs,
- historical failed attempts are preserved as configuration evidence: `sigOpCount: 2` for vault recovery, Unix-time lock values for timed paths, and REST tx-v1 schema rejection for role-separated escrow cancel.

Current WIP:

- Invalid-candidate definitions are local-review-only, not signed invalid transactions and not TN12 rejection evidence.
- Resume by running `npm run check:all` and `npm run check:tn12` after any follow-up edits; both passed after this change.
- The next durable indexer step is replacing known-txid checkpoint input with a node/RPC virtual-chain reader feeding the replay tables.
- The next high-impact build step is the project queue top item: wallet connector submit without local keys. The next high-impact app research step is turning a trigger lane into a brief only after the missing-rails matrix, trigger registry, and oracle/source artifacts name the gaps and do-not-claim boundary.
- The next safe protocol step is funding fresh expendable role-separated outputs before attempting any TN12 rejection submissions.

## Update Rule

When you make a meaningful repo change, update this file with:

- the latest concrete change,
- the commands that verified it,
- the next safe task,
- any blocker that future agents should not rediscover.

Keep this file concise. Move long detail to the purpose-built docs above.
