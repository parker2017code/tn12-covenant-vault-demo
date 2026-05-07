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

The repo is a TN12 covenant/app primitive workshop. It has accepted TN12 proof transactions for vault recovery, vault delayed withdrawal, individual assurance release, individual assurance refund, escrow release, and escrow DAA-score refund.

## First-Read Order

1. `MEMORY.md`: current handoff and doc map.
2. `CONTEXT.md`: operating context, wallet/address boundaries, accepted txids, commands, and longer handoff.
3. `AGENTS.md`: behavior rules for future coding agents.
4. `docs/ROADMAP_STATE.md`: durable lane map and current next work.
5. `docs/PROGRESS.md`: lane-by-lane build state and immediate task list.
6. `docs/LLM_REVIEW_GUIDE.md`: how to verify GitHub, Pages, artifacts, and TN12 chain state before making claims.
7. `docs/MICHAEL_QUESTIONS.md`: exact protocol/tooling questions to escalate through the user.
8. `docs/STATUS.md`: human-readable proof/status list.
9. `docs/BUILD_PLAN.md`: backlog history and next build tasks.

Use `docs/SOURCES.md` and `docs/KASPA_DOCS_REVIEW.md` when checking source discipline or protocol claims. Use `docs/TRANSACTION_API_NOTES.md` before touching transaction creation, payloads, submit routes, or accepted-indexing code.

## Hard Rules

- Do not print, paste, commit, or expose `.local/tn12-wallet.json` or private keys.
- Do not use mainnet keys or imply mainnet covenant activation.
- Do not reintroduce local `kaspad` or `/home/parker2017/kaspa-node` into this repo unless the user explicitly reverses that rule.
- Keep actual broadcast behind explicit commands and testnet-only language.
- Do not use the public TN12 REST submit route for payload receipts. It accepted a payment while dropping payload bytes.
- Use public TN12 REST reads, local fixtures, local signing, explicit submit commands, and the verified TN12 JSON wRPC route for payload receipts until wallet review replaces local signing.
- When TN12, Silverscript, Rusty Kaspa, transaction signing, submit serialization, or covenant verification behavior remains unclear, first dig through the basic layers yourself: local artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK version/API shape, node/network id, and upstream Rusty Kaspa source/tests. Ask the user to get Michael's guidance only after those checks are exhausted or a precise external confirmation is genuinely needed. Include the exact txid, artifact path, endpoint response, source line, and smallest reproducer command.
- Keep status lanes separate: live Kaspa mainnet, TN12/Toccata covenant work, roadmap vProgs/native app rails, and research-only ideas.
- Do not edit or publish `/home/parker2017/kaspa-explained` from this repo unless explicitly asked.

## Current Next Work

- Add more negative/adversarial checks around reducer and planner state.
- The invoice/payload receipt vertical slice has one accepted TN12 JSON wRPC receipt: `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`. Keep invoice paid state tied to matched accepted payload bytes.
- Escrow mutual cancel is accepted through the version-1 compute-budget path. Preserve old cancel rejections as historical bad configuration or old-SDK evidence only.
- Build real depth in three verticals first:
  - invoice/receipt app: accepted transaction app state,
  - escrow/assurance app: TN12 covenant proof app,
  - attestation/agent/prediction simulator: research-to-app bridge.

## Latest Continuation Note

The latest continuation added access-pass negative/reducer hardening: accepted redemptions now require an accepted txid, duplicate pass/holder redemptions are marked for review, and neither case can inflate redeemed counts. The UI summary now surfaces redemption review count. Regenerated `artifacts/access-pass-planner.json`.

Validation run for this continuation:

```sh
npm run access:passes
npm run check:all
npm run tx:verify
npm run proof:evidence
npm run compile:contracts
```

Observed proof state remained accepted and matched: `6/6` accepted proof transactions, `6/6` P2SH inputs, `6/6` P2PK outputs.

## Update Rule

When you make a meaningful repo change, update this file with:

- the latest concrete change,
- the commands that verified it,
- the next safe task,
- any blocker that future agents should not rediscover.

Keep this file concise. Move long detail to the purpose-built docs above.
