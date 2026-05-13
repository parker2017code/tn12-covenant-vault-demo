# LLM Review Guide

Use this guide when reviewing the repo from GitHub, GitHub Pages, or a local checkout. The goal is to verify the public claim surface quickly without guessing.

## Start Here

1. Read `MEMORY.md` for the current handoff and doc map.
2. Check the latest pushed commit on `main`.
3. Check whether GitHub Pages has deployed that commit.
4. Compare the public README with the live artifacts under GitHub Pages.
5. Verify the accepted TN12 txids through the TN12 API.
6. Report any gap between local state, pushed GitHub state, live Pages state, and chain state.

Useful public links:

```txt
Repo: https://github.com/parker2017code/tn12-covenant-vault-demo
Pages: https://parker2017code.github.io/tn12-covenant-vault-demo/
TN12 tx API: https://api-tn12.kaspa.org/transactions/{txid}
Proof evidence: https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/proof-evidence.json
Build status: https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/build-status.json
Enforcement matrix: https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/enforcement-matrix.json
```

Use cache-busted URLs when checking Pages after a fresh push:

```txt
https://parker2017code.github.io/tn12-covenant-vault-demo/artifacts/proof-evidence.json?v={commit}
```

## Escalation Rule

Unclear TN12, Silverscript, Rusty Kaspa, transaction signing, submit serialization, or covenant verification behavior needs local evidence first: artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK/API shape, node/network id, and upstream source/tests. Escalation needs a txid, artifact path, endpoint response, source line, and smallest reproducer command.

Use `docs/MICHAEL_QUESTIONS.md` for resolved and pending evidence bundles.

## What Is Worth Checking

Primary proof state:

- `fixtures/AcceptedProofTransactions.json`: canonical list of accepted proof spends.
- `artifacts/proof-evidence.json`: resolved evidence that each proof spend consumed a TN12 P2SH (`p...`) output and paid the expected P2PK (`q...`) output.
- `fixtures/AcceptedAppState.json`: accepted transaction state used by the UI/indexer lane.
Claim boundaries:

- `fixtures/EnforcementMatrix.json`
- `artifacts/enforcement-matrix.json`
- `fixtures/BuildStatus.json`
- `artifacts/build-status.json`
- `docs/PROGRESS.md`
- `docs/ROADMAP_STATE.md`

Submit/draft review:

- `fixtures/SubmitConsoleDrafts.json`
- `artifacts/submit-console-registry.json`
- `artifacts/wallet-review-readiness.json`
- `artifacts/wallet-connector-readiness.json`
- `artifacts/signed-drafts/*.json`

Do not inspect or request `.local/tn12-wallet.json`. It is local testnet wallet material and is intentionally gitignored.

## Current Expected Proof Shape

The repo is allowed to claim accepted TN12 proof spends for:

- vault recovery;
- vault delayed withdrawal;
- individual assurance release;
- individual assurance refund;
- escrow release.
- escrow DAA refund.

Each accepted proof spend should satisfy:

```txt
accepted: true
input previous output type: scripthash
input address prefix: kaspatest:p...
output type: pubkey
output address prefix: kaspatest:q...
output amount matches fixture
```

Escrow nuance:

- Escrow funding tx `6042f46571a1b983f9d823562813bd0a99793bfcae81aa15d5ac82268c3f8ba2` created the P2SH escrow output.
- Escrow release tx `825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d` consumed that output.
- DAA-expired escrow refund funding tx `f839eb30667eed509a55dae382da6aeeccebe21014bf6fc74f4bf0f2f204a96f` created a separate P2SH output.
- DAA-expired escrow refund tx `6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d` consumed that separate output.
- Cancel funding tx `331b0372e9a8dd12516a772c9ce983f519031fa6970113a64eae16c0fcf4f022` created a separate P2SH output.
- Cancel tx `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c` consumed that separate output and is the accepted mutual-cancel proof.
- Earlier cancel failures are historical evidence only: the first used the wrong script budget, and the later old-SDK route did not preserve the tx version 1 `computeBudget` field.

## Local Verification Commands

Run these from the repo root when local checkout access is available:

```sh
npm run check:all
npm run check:tn12
npm run tx:verify
npm run proof:evidence
npm run wallet:review
npm run indexer:persist
git diff --check
```

Optional regeneration commands:

```sh
npm run indexer:state
npm run submit:registry
npm run wallet:review
npm run indexer:persist
npm run enforcement:matrix
npm run build:status
```

## Work In Progress

Current incomplete lanes:

- invoice/payment payload receipts and related app events: TN12 JSON wRPC payload receipts are accepted and decoded through the fixture set; the public REST no-payload submit result is historical only;
- pooled assurance target aggregation: planner/indexer only, not script-enforced;
- escrow cancel: accepted on a separate funded output;
- treasury caps/payroll: wallet-policy/planner only;
- access passes/assets/auctions/agent commitments: planner/indexer artifacts unless tied to accepted payload receipts;
- prediction markets, DeFi, RTD/miner-oracle, Hashdag/Staghunt: research/prototype lanes only.

## Accurate Labels

Avoid these labels:

- a mainnet wallet;
- proof that Toccata covenants are live on mainnet;
- production-safe smart contracts;
- a full Hashdag/Staghunt coordination market implementation;
- live DeFi;
- arbitrary block-header data insertion.

## SilverScript Lessons Already Learned

- State is the point. Recurring caps, assets, and game state should use explicit state, continuation outputs, and `validateOutputState` where tooling supports it.
- Each feature needs five answers: what it proves, what it makes possible, why Kaspa's fast UTXO/covenant model matters, why crypto is needed instead of a normal server, and what is still not proven.
- Covenant IDs track lineage. Use template hashes and state fields for role identity inside a closed contract system.
- Mux/worker beats one giant script. A hub can route to small worker contracts, workers can return state, and fast multi-transaction flow is part of the Kaspa edge.
- ICC uses sibling authority instead of nested execution. Let sibling inputs prove that another covenant or script authorized the transaction.
- Challenge/timeout paths beat expensive global scans. Let one party make a claim, give the other party a bounded challenge path, and use timeouts for liveness.
- Negative cases make examples serious: wrong signer, wrong destination, over cap, missing continuation, stale window, and missing sibling input.
- UX abstraction is now part of the technical work. A useful covenant demo should produce a wallet-readable approval summary and eventually a visible review card, not only a JSON artifact for reviewers.
- ICC examples need sibling discovery. A sibling-authorized asset path is incomplete for users until the repo can explain which sibling input is required and how it was found.
- `artifacts/sibling-input-discovery.json` is the first asset discovery artifact. Use it as the shape future ICC examples should satisfy: required covenant id, witness input, selected sibling outpoint, accepted strike, and local reject coverage.
- Replay-derived lanes need independent verification. Scheduler evidence is useful as accepted receipts plus deterministic replay, but do not imply protocol scheduling unless the spend path or a later proof system enforces it.
- Coordination evidence now has fresh `AssurancePledge` covenant outputs and three accepted covenant release spends in `artifacts/coordination-covenant-release-evidence.json`. Keep threshold selection replay/planner-derived, and do not claim private coordination, pooled custody, or protocol-level coordination.
- Scheduler evidence needs a fresh covenant settlement output before it can be called covenant settlement. The current payout is local-key P2PK evidence; use `artifacts/scheduler-covenant-settlement-target.json` as the handoff.
- Use "money with visible rules" as a plain framing. Avoid public claims such as "holy grail," "bleeding edge," or "if this reaches mainnet then Kaspa becomes..." unless the repo has mainnet, wallet, audit, and production evidence.
- Compiled stateful `.sil` and accepted funding are not enough. For recurring caps, require an actual spend from the funded contract output or keep the label at wallet-policy/local-wallet.
- `artifacts/recurring-treasury-vault-state-proof.json` proves state/output behavior locally. It does not prove the full `ownerSig` path or a live accepted TN12 spend.
- `artifacts/recurring-treasury-vault-owner-sig-proof.json` proves the full local `ownerSig` covenant path. It still does not prove live TN12 submission.
- `artifacts/recurring-treasury-vault-live-submit-readiness.json` records the old npm `kaspa-wasm@0.13.0` JS route gap. Current live covenant spends use the local TN12 `1.1.1-toc.1` WASM route and wRPC.
- `artifacts/recurring-treasury-vault-rust-submit-route-probe.json` shows the Rust RPC submit-request model preserves output covenant binding and tx v1 `computeBudget`.
- `artifacts/recurring-treasury-vault-rpc-data-route.json` shows the first live 150 tKAS output is not covenant-bound. Do not try to spend it as a stateful covenant input.
- Recurring vault live status: covenant-genesis funding is accepted, two under-cap script-enforced spends are accepted, reset-window genesis and reset spend are accepted, continuation fixtures are recorded, and over-cap/early-reset/stale-window candidates are locally rejected.
- Study `/home/parker2017/michaelsutton-silverscript-chess/examples/chess` before designing complex examples. The useful pattern is mux/worker routing, shared state layout, template identity, challenge paths, and settlement, not "make a game" as a product idea.
- Built deep examples: the sibling-authorized asset proof has local ICC sibling-input proof plus accepted TN12 owner-marker, asset genesis, sibling-authorized strike spend, and live-id local negative candidates; the mux worker proof has local mux/worker/timeout proof plus accepted TN12 route, worker-return, second route, timeout spend, Worker B route/return, and a bounded timeout-settlement/challenge artifact.
- Next exact tasks are: add one Worker B Blitz route/return or a small challenge variant, then move to the next experiment only if it proves a different transition shape.

Accurate label:

```txt
TN12 covenant/app primitive workshop with accepted vault, assurance, escrow release, escrow DAA refund, and escrow mutual-cancel proof transactions.
```
