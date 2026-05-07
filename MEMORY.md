# Repo Memory

Read this file first when resuming work in this repo. It is the short routing layer for the current handoff, project rules, and which deeper docs to open next. Keep it updated after meaningful changes so future agents can continue without rebuilding context from scratch.

## Current Snapshot

- Repo: `/home/parker2017/tn12-covenant-vault-demo`
- Branch: `main`
- GitHub: `https://github.com/parker2017code/tn12-covenant-vault-demo`
- Pages: `https://parker2017code.github.io/tn12-covenant-vault-demo/`
- Local preview: `npm run serve` then `http://127.0.0.1:4176/`
- Main gate: `npm run check:all`
- Chain proof gate: `npm run tx:verify`
- Proof evidence gate: `npm run proof:evidence`
- Payload event gate: `npm run payload:verify:events`

The repo is a TN12 covenant/app primitive workshop. It has accepted TN12 proof transactions for vault recovery, vault delayed withdrawal, individual assurance release, individual assurance refund, escrow release, escrow DAA-score refund, and escrow mutual cancel. It also has 16 accepted TN12 payload events for invoice, access-pass, auction, stable-value issuer, miner/watcher attestation, and agent commitment state.

## First-Read Order

1. `MEMORY.md`: current handoff and doc map.
2. `CONTEXT.md`: operating context, wallet/address boundaries, accepted txids, commands, and longer handoff.
3. `AGENTS.md`: behavior rules for future coding agents.
4. `docs/ROADMAP_STATE.md`: durable lane map and current next work.
5. `docs/PROGRESS.md`: lane-by-lane build state and immediate task list.
6. `docs/LLM_REVIEW_GUIDE.md`: how to verify GitHub, Pages, artifacts, and TN12 chain state before making claims.
7. `docs/TN12_TEST_MATRIX.md`: what is TN12 accepted, what is only local reducer-tested, and what still needs a safe testnet transaction.
8. `docs/MICHAEL_QUESTIONS.md`: exact protocol/tooling questions to escalate through the user.
9. `docs/STATUS.md`: human-readable proof/status list.
10. `docs/BUILD_PLAN.md`: backlog history and next build tasks.

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
- Do not edit or publish `/home/parker2017/kaspa-explained` from this repo unless explicitly asked.

## Current Next Work

- Add more negative/adversarial checks around reducer and planner state.
- The payload vertical slice has 16 accepted TN12 JSON wRPC events listed in `fixtures/PayloadEventEvidence.json`. Keep app state tied to matched accepted payload bytes.
- Escrow mutual cancel is accepted through the version-1 compute-budget path. Preserve old cancel rejections as historical bad configuration or old-SDK evidence only.
- Build real depth in three verticals first:
  - invoice/receipt app: accepted transaction app state,
  - escrow/assurance app: TN12 covenant proof app,
  - attestation/agent/prediction simulator: research-to-app bridge.

## Latest Continuation Note

The latest continuation replaced fake accepted payload fixture txids with real TN12 evidence and expanded payload verification to 16 accepted events:

- paid receipt: `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`
- refund event: `4f24d99891d1bf79aab0dd66dcb31e6808ca766507f729f9be2c59048f4b7a13`
- error event: `3738322fbe19c384b5472336f006560bceea3e004099eb50c2499874903b2c5c`
- access-pass redemption, auction bids, stable-value issuer issuance/redemption, miner/watcher attestation, and agent task/proof/dispute events are listed in `fixtures/PayloadEventEvidence.json`.

`docs/TN12_TEST_MATRIX.md` now tracks what is TN12 accepted, what is only local reducer-tested, and what still needs safe TN12 transactions. `fixtures/SubmitConsoleDrafts.json` now exposes 29 reviewable drafts, including all 16 accepted payload drafts.

Validation run for this continuation:

```sh
npm run check:all
npm run tx:verify
npm run proof:evidence
npm run payload:verify:events
```

Observed proof state remained accepted and matched: `7/7` accepted proof transactions, `7/7` P2SH inputs, `7/7` P2PK outputs. Payload events verified: `16/16`.

## Update Rule

When you make a meaningful repo change, update this file with:

- the latest concrete change,
- the commands that verified it,
- the next safe task,
- any blocker that future agents should not rediscover.

Keep this file concise. Move long detail to the purpose-built docs above.
