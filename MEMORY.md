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
- Wallet submit result validation gate: `npm run wallet:result-validation`
- Virtual-chain ingestion run gate: `npm run indexer:virtual-chain-run`
- Virtual-chain reader adapter gate: `npm run indexer:virtual-chain-adapter`
- Batch-assurance pledge-output plan gate: `npm run campaign:pledge-outputs`
- Escrow marketplace demo gate: `npm run escrow:marketplace`
- Attestation reputation gate: `npm run attestation:reputation`
- Treasury constrained spend gate: `npm run treasury:spends`
- Auction settlement draft gate: `npm run auction:settlement-drafts`
- Agent settlement draft gate: `npm run agent:settlement-drafts`
- AI/source discipline gate: `npm run ai:discipline`

The repo is a TN12 covenant/app primitive workshop. It has accepted TN12 proof transactions for vault recovery, vault delayed withdrawal, individual assurance release, individual assurance refund, escrow release, escrow DAA-score refund, and escrow mutual cancel. It also has accepted role-separated positive proofs for all seven vault, assurance, and escrow paths: recovery/withdrawal, release/refund, and release/refund/cancel. It also has 26 accepted TN12 payload events for invoice, access-pass, auction, stable-value issuer, miner/watcher attestation, prediction/hedge review, agent commitment, and batch-assurance planner state.

## First-Read Order

1. `MEMORY.md`: current handoff and doc map.
2. `CLAUDE.md`: project rules (key commands, artifact conventions, claim discipline).
3. `AGENTS.md`: behavior rules for future coding agents.
4. `docs/ROADMAP_STATE.md`: durable lane map and current next work.
5. `docs/PROGRESS.md`: lane-by-lane build state and immediate task list.
6. `docs/LLM_REVIEW_GUIDE.md`: how to verify GitHub, Pages, artifacts, and TN12 chain state before making claims.
7. `docs/TN12_TEST_MATRIX.md`: what is TN12 accepted, what is only local reducer-tested, and what still needs a safe testnet transaction.
8. `docs/MAINSTREAM_APP_DIRECTION.md`: high-impact user-facing app direction and which mainstream crypto use cases are build-now, later, or research.
9. `docs/MICHAEL_QUESTIONS.md`: exact protocol/tooling questions to escalate through the user.
10. `docs/AI_CODING_SOURCE_DISCIPLINE.md`: public-source, AI-agent, and Kaspa Q&A guardrails for future coding/explanation work.

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
- Keep current strategic framing explicit: invoice/receipt/payment work is a rail, not the generic 2026 adoption thesis; prioritize usable products, coordination-market direction, accepted on-chain activity, and measurable product pull.
- Keep `AGENTS.md` short and executable. Put deeper AI-agent/coding-source research in `docs/AI_CODING_SOURCE_DISCIPLINE.md` and `artifacts/ai-coding-source-discipline.json`.
- Keep rollup/vProg claims separate: Toccata gives L1 covenants and zk/sequencing foundations; based-rollup work is a separate execution lane; full synchronously composable vProgs remain roadmap until the interfaces are testable.
- Use `npm run rollup:scout` / `artifacts/based-rollup-scout.json` for based-rollup planning. It treats Maxim's TN12 PoC as bridge/proof reference, Hans' work as runtime/proving direction, and ecosystem rollups as possible future app surfaces.
- Use `npm run covenant:adversarial` / `artifacts/covenant-adversarial-coverage.json` before claiming hardened covenant coverage. It is local adversarial mapping, not TN12 rejection evidence. Current gaps include historical escrow cancel key reuse, fresh role-separated outputs for cancel/refund paths, and exact accepted-script preservation for older vault/assurance proof drafts.
- Use `npm run fixtures:roles` and `npm run compile:roles` for the role-separated proof lane. Public role metadata is committed; private role keys remain in `.local/tn12-role-wallets.json`.
- Use `npm run tx:roles:fund` to build the reviewable role-separated funding transaction. The current role-separated funding transaction is already accepted; build a new one before trying the remaining mutually exclusive role-separated paths.
- Use `npm run tx:roles:spends` after accepted role-separated funding outputs are fetched. The drafts prove role-separated witness construction but are mutually exclusive per contract output. The first proof pass consumed one vault, assurance, and escrow output through recovery, release, and release.
- Do not edit or publish `/home/parker2017/kaspa-explained` from this repo unless explicitly asked.

## Current Next Work

- Use `npm run project:queue` / `artifacts/next-work-queue.json` as the all-in-one broad-continuation order.
- **Adversarial suite COMPLETE**: 13 cases TN12-rejected — wrong-signer (3), wrong-selector (3), wrong-output-lock (3), wrong-output-amount (3), single-party-cancel (1). All in `artifacts/adversarial/`.
- **Claude Code infrastructure in place**: `CLAUDE.md` (lean, 23 lines), `.claude/settings.json` (deny `--submit` + protect `.local/`), hook at `.claude/hooks/check-submit-guard.sh`, slash commands `/verify`, `/next`, `/adversarial`.
- **Remaining open blockers** (priority order):
  1. External signer roundtrip — 4 requests in `artifacts/wallet-external-signer-roundtrip-plan.json`, none through a real signer.
  2. Virtual-chain live indexer — blocked on `kaspa-wasm 1.1.1-toc.1` (no pip, no wasm port). REST reads still work.
- Batch-assurance settlement CLOSED: `4d84472e...` at blue score 7413626.
- Escrow mutual cancel is accepted through the version-1 compute-budget path. REST submit for v1 txs requires both `sigOpCount: 0` and `computeBudget: 30`.

## Latest Continuation Snapshot

Updated 2026-05-09 after multi-AI feedback review and execution pass.

Key completed in this pass:
- **Batch-assurance release accepted on TN12**: `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801` at blue score 7413626. 3-pledge batch (45+35+20 TKAS) released to recipient in one tx. Refund paths are now void (mutually exclusive). This is the 8th accepted proof.
- **README compressed**: 617-line lab notebook moved to `docs/LAB_NOTEBOOK.md`. New `README.md` is ~80 lines — answers 5 questions only: what this is, what is accepted, what is not proven, how to verify, next blockers.
- **Status label vocabulary** (`TN12_ACCEPTED`, `SIGNED_NOT_BROADCAST`, `PLANNER_ONLY`, etc.) now visible in README table.
- **Virtual-chain live indexer blocker documented**: `getVirtualChainFromBlockV2` not available in installed `kaspa-wasm 0.13.x`. Requires `1.1.1-toc.1` build or `kaspa-python-sdk v1.1.0`. Subscription attempt also failed (protocol mismatch). REST-based accepted-tx verification remains the working read path.
- **check.mjs updated**: README assertions migrated to `docs/LAB_NOTEBOOK.md`; settlement status and preflight status assertions widened to accept new states.

Remaining blockers (priority order):
1. External signer roundtrip — 4 requests in `artifacts/wallet-external-signer-roundtrip-plan.json`, none executed through a real signer yet.
2. Virtual-chain live indexer — needs TN12 SDK build or Python SDK for `getVirtualChainFromBlockV2`.
3. Adversarial rejection evidence — fresh expendable outputs needed for invalid-candidate submissions.

Previously updated after commits `35140c6`, `75c8772`, `d210907`, `638b608`, `ca48e84`, `b833234`, `02ae416`, `e578689`, `c73bf02`, `eb0830d`, `9997bbb`, and `9df5a91`.

- Escrow marketplace action map is now a first-class artifact:
  - `npm run escrow:action-map` writes `artifacts/escrow-marketplace-action-map.json`.
  - The app shows the action map in the escrow panel.
  - Release, refund, and mutual-cancel actions map to wallet-standard request candidates.
  - All remain blocked until an external signer accepted result and accepted replay exist.
- Wallet-standard request coverage expanded from two requests to four:
  - payload receipt,
  - role-separated escrow release,
  - role-separated escrow refund,
  - role-separated escrow cancel.
  - `npm run wallet:standard-signer-validation` now adds pending external-signer rows for mapped requests without fixture results.
- Existing review/blocker artifacts are now visible in the browser:
  - auction custody review,
  - agent settlement review,
  - treasury role review,
  - access-pass issuer review,
  - invoice mainnet launch brief.
- Handoff docs were refreshed once in `02ae416`, then more wallet/indexer work landed after it.
- README and queue wording now reflect four wallet-standard request candidates instead of the older two-request wording.
- A hosted TN12 JSON wRPC endpoint was probed successfully:
  - `artifacts/tn12-wrpc-endpoint-probe.json` records server `1.1.1-toc.1`.
  - `artifacts/virtual-chain-live-window.json` records a bounded near-tip live window.
  - `artifacts/virtual-chain-live-replay-rows.json` records live rows plus one rollback row.
  - `artifacts/virtual-chain-checkpoint-comparison.json` records `live-window-near-tip-no-checkpoint-overlap`, so no app state should be promoted from that sample.
  - `artifacts/virtual-chain-endpoint-runbook.json` records live-tested endpoint evidence without promotion.
- `npm run wallet:external-signer-roundtrip` writes `artifacts/wallet-external-signer-roundtrip-plan.json`.
  - It selects the payload receipt request and role-separated escrow cancel request as the first two external signer round trips.
  - It is a runbook/checklist, not a live signer integration.
- The live virtual-chain reader now preserves the full accepted transaction list returned by the bounded window:
  - `scripts/read-virtual-chain-live-window.mjs` supports `TN12_VIRTUAL_CHAIN_START_HASH` for deliberate overlap tests instead of always starting from the current sink.
  - `artifacts/virtual-chain-live-window.json` carries full replay input under `replay.acceptedTransactions` and `replay.computeBudgetInputs`.
  - `artifacts/virtual-chain-live-replay-rows.json` records `fullAcceptedReplay: true`; the latest live sample had 46 accepted tx rows, 43 compute-budget rows, and 0 checkpoint matches.
  - App state is still not promoted until a checkpoint-overlap window or deterministic cursor transition is proven.
- `npm run wallet:external-signer-template` writes `artifacts/wallet-external-signer-result-template.json`.
  - It is generated from the current roundtrip plan so signer-return placeholders use current request fingerprints, txids, payload bytes, routes, and input-budget reports.
  - It is still not a signer result; `signedTransaction`, signer metadata, and user approval stay blank until a real external signer run.
- `npm run check:all` passed after each committed slice before push.
- Current pushed head before the full-replay indexer patch is `18293f0` unless newer work has landed.
- GitHub `check` and Pages were green for `18293f0` when verified with `gh run list` on 2026-05-09.

Immediate next tasks:

1. Verify `git status --short` and rerun `npm run check:all` before editing.
2. Continue wallet connector submit: real external signer round trip is still the main blocker.
3. Continue durable indexer: live endpoint reads work, but the near-tip sample has zero checkpoint overlap and must not promote app state yet.
4. Continue batch-assurance settlement review: pick one mutually exclusive path only after wallet/external signer hardening.
5. Avoid adding new app lanes until one of those rails improves.

## Latest Pause Note

Paused on 2026-05-09 after bounded batch-assurance custody import validation:

- `fixtures/BatchAssuranceCustodyImports.json` defines pasted/imported custody outpoint review rows for the current campaign.
- `src/batchAssuranceCustodyImports.mjs` and `scripts/build-batch-assurance-custody-imports.mjs` generate `artifacts/batch-assurance-custody-imports.json`.
- The validator checks pledge id, amount, txid/index presence, accepted evidence presence, duplicate outpoints, below-minimum rows, and planner-payload-only promotion.
- Current status is `custody-imports-ready`: three accepted 45/35/20 TKAS pledge outputs are imported and amount-matched.
- `scripts/build-batch-assurance-pledge-funding-draft.mjs` and `npm run campaign:pledge-funding-draft` created the 45/35/20 TKAS pledge funding draft and public pledge-wallet metadata. Generated pledge private keys stay in `.local/tn12-batch-pledge-wallets.json`.
- `scripts/build-batch-assurance-settlement-drafts.mjs` and `npm run campaign:settlement-drafts` now create one signed-not-broadcast release draft and three signed-not-broadcast refund drafts from the accepted pledge outputs.
- Next safe task in this lane: decide which mutually exclusive settlement path to test with a fresh review. Do not submit release and refunds for the same pledge outputs.

Paused on 2026-05-09 after bounded virtual-chain reader adapter artifact work:

- `fixtures/VirtualChainReaderAdapter.json` defines the endpoint config, bounded window, checkpoint cursor, rollback rules, retry/backoff, payload matching, proof matching, and no-local-node boundaries.
- `src/virtualChainReaderAdapter.mjs` and `scripts/build-virtual-chain-reader-adapter.mjs` generate `artifacts/virtual-chain-reader-adapter.json`.
- `npm run indexer:virtual-chain-adapter`, `npm run check`, and `npm run check:all` passed.
- The artifact is ready as a durable adapter contract, not a live subscription. `TN12_VIRTUAL_CHAIN_RPC_URL` is still unset, so no live endpoint read was attempted.
- Next safe task in this lane: set a hosted TN12 virtual-chain RPC endpoint and compare live reader rows against the current 33-record fixture-backed replay before committing a new checkpoint.

Paused on 2026-05-09 after bounded wallet submit result validation:

- `fixtures/WalletSubmitResultValidation.json` defines the strict result policy and negative cases.
- `src/walletSubmitResultValidation.mjs` validates returned txids/routes against adapter-session fingerprints, payload bytes, version-1 `computeBudget`, explicit user action, and accepted-evidence promotion rules.
- `npm run wallet:result-validation` writes `artifacts/wallet-submit-result-validation.json`; the artifact currently has 3 valid historical accepted-evidence rows, 6 caught negative cases, 2/2 v1 computeBudget sessions preserved, and `liveWalletConnectorExists: false`.
- This is still not a live wallet connector. It is the bounded validator future wallet results must pass before app-state promotion.

Paused on 2026-05-09 after bounded attestation provenance/quorum hardening:

- `fixtures/AttestationSignals.json` now includes signer-provenance records plus conflict, stale, and revoked-source review cases.
- `src/attestationSignal.mjs` carries active/revoked signer provenance and keeps influence-ready blocked for revoked provenance.
- `src/attestationReputationThresholds.mjs` extends `artifacts/attestation-reputation-thresholds.json` with signer provenance, conflict sets, quorum thresholds, stale/unresolved/revoked states, and `dashboardInfluenceEnabled: false` until source, signature, provenance, accuracy, conflict, and quorum checks all pass.
- `npm run attestation:reputation` regenerated the artifact successfully.
- Follow-up integration fixed the README wallet-submit-ledger assertion and `npm run check` now passes with the attestation checks.
- `npm run check:negative` passed after updating the extra conflicting-signal expectation.
- Follow-up integration made `npm run prediction:hedge` read the attestation threshold artifact before accepted signals can influence simulated probabilities or review prompts.

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

- Feedback to preserve: the real value is the accepted TN12 covenant proof work, role-separated repeats, payload preservation, wallet/indexer rails, and enforcement boundaries. The LLM-friendly scaffolding is useful only if it keeps that kernel verifiable and easier to extend; avoid letting docs/status surfaces inflate the project beyond the proof evidence.
- Paused on 2026-05-09 at the user's request after continuing from commit `bd7b15d`.
  - Do not assume this work is committed yet. `git status --short` showed uncommitted TN12 edits in `AGENTS.md`, `CONTEXT.md`, `MEMORY.md`, `README.md`, `app.js`, AI discipline docs/fixtures/artifact, next-ten/progress/completion docs, `package.json`, `scripts/check-ui.mjs`, `scripts/check.mjs`, plus new virtual-chain live-window/replay-row and wallet-signer-validation files/artifacts.
  - Kaspa Explained also has one uncommitted edit in `AGENTS.md`: the continue-until-stop rule.
  - Persistent Codex memory notes were written under `/home/parker2017/.codex/memories/extensions/ad_hoc/notes/` for continue-until-stop, code quality, and feature quality operating rules.
  - TN12 local gates passed after these changes: `npm run ai:discipline && npm run check:all`, then later `npm run indexer:live-replay-rows && npm run check:all`, and later `npm run wallet:standard-signer-validation && npm run check:all`.
  - New live-indexer work: `src/virtualChainLiveWindow.mjs`, `scripts/read-virtual-chain-live-window.mjs`, and `artifacts/virtual-chain-live-window.json`. It uses `KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa` because npm `kaspa-wasm@0.13.0` does not expose `getVirtualChainFromBlockV2`. The live window returned high-verbosity accepted transactions and v1 `computeBudget` inputs, but does not promote app state.
  - New replay-row work: `src/virtualChainLiveReplayRows.mjs`, `scripts/build-virtual-chain-live-replay-rows.mjs`, and `artifacts/virtual-chain-live-replay-rows.json`. It converts the live V2 sample into replay-table-shaped rows with `appStatePromoted=false`.
  - New wallet validation work: `fixtures/WalletStandardSignerResults.json`, `src/walletStandardSignerValidation.mjs`, `scripts/build-wallet-standard-signer-validation.mjs`, and `artifacts/wallet-standard-signer-validation.json`. It validates external signer-return metadata against wallet-standard request fingerprints and catches mutated fingerprint plus dropped compute-budget negative cases.
  - Before resuming implementation, run `git diff --stat`, then `npm run check:all`. If committing this batch, include both repos or split commits cleanly: TN12 implementation/docs first, then Kaspa Explained `AGENTS.md` rule.
- On 2026-05-09, the wallet-standard lane moved past mapping-only:
  - `npm run wallet:standard-requests` writes `artifacts/wallet-standard-requests.json`.
  - The artifact contains two concrete candidate request objects: one payload receipt round trip and one v1 `computeBudget` covenant round trip.
  - The objects are field-by-field candidate JSON envelopes, not official PSKB/PSKT binaries and not a live external signer integration.
  - `npm run wallet:implementation-slice` now reads those request candidates and records the first payload and covenant round-trip request fingerprints.
- Same pass added a reachable TN12 wRPC endpoint probe:
  - `TN12_VIRTUAL_CHAIN_RPC_URL=<endpoint> npm run indexer:wrpc-probe` writes `artifacts/tn12-wrpc-endpoint-probe.json`.
  - The committed probe shows `serverVersion=1.1.1-toc.1`, synced, UTXO-indexed, and TN12 DAG info reachable.
  - `KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa TN12_VIRTUAL_CHAIN_RPC_URL=<endpoint> npm run indexer:live-window` writes `artifacts/virtual-chain-live-window.json`.
  - The live-window artifact proves a bounded `getVirtualChainFromBlockV2` call with high-verbosity accepted transactions and v1 compute-budget inputs. It does not persist app state.
  - The next indexer task is converting that response into replay rows with rollback overlap.
- Paused on 2026-05-09 after a minimal next-ten continuation pass:
  - Added next-ten execution artifacts for wallet, indexer, and batch-assurance settlement follow-through.
  - New commands: `npm run wallet:implementation-slice`, `npm run indexer:endpoint-runbook`, `npm run campaign:submit-runbook`, and `npm run project:next-ten`.
  - Generated artifacts: `artifacts/wallet-connector-implementation-slice.json`, `artifacts/virtual-chain-endpoint-runbook.json`, `artifacts/batch-assurance-submit-runbook.json`, and `artifacts/next-ten-execution-plan.json`.
  - User asked to stop expanding, keep it minimal, commit current changes, and preserve context.
  - Next resume: run `npm run check:all`, then check `artifacts/next-work-queue.json` for the current priority queue.
- On 2026-05-09, the next-five pass added review artifacts for auction custody, agent settlement, treasury role/source checks, invoice mainnet readiness, and access-pass issuer review:
  - `npm run auction:custody-review` writes `artifacts/auction-custody-review.json`;
  - `npm run agent:settlement-review` writes `artifacts/agent-settlement-review.json`;
  - `npm run treasury:role-review` writes `artifacts/treasury-role-review.json`;
  - `npm run invoice:mainnet-brief` writes `artifacts/invoice-mainnet-launch-brief.json`;
  - `npm run access:issuer-review` writes `artifacts/access-pass-issuer-review.json`.
- Same pass updated public and agent-facing wording to use plain build language: built, working, needs wallet, needs custody, needs indexer, research, roadmap, next rail. Avoid over-negative repetition; name the next dependency.
- Invalid-candidate definitions are local-review-only, not signed invalid transactions and not TN12 rejection evidence.
- Resume by running `npm run check:all` and `npm run check:tn12` after any follow-up edits; both passed after this change.
- The next durable indexer step is testing the bounded virtual-chain reader adapter against a configured hosted TN12 RPC endpoint, then feeding live virtual-chain rows into the replay tables.
- The next high-impact build step is the project queue top item: wallet connector submit without local keys. The next high-impact app research step is turning a trigger lane into a brief only after the missing-rails matrix, trigger registry, and oracle/source artifacts name the gaps and do-not-claim boundary.
- The next safe protocol step is funding fresh expendable role-separated outputs before attempting any TN12 rejection submissions.

## Update Rule

When you make a meaningful repo change, update this file with:

- the latest concrete change,
- the commands that verified it,
- the next safe task,
- any blocker that future agents should not rediscover.

Keep this file concise. Move long detail to the purpose-built docs above.
