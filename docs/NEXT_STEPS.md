# Next Steps

Reviewed: 2026-05-10

This file is the short queue. It does not replace the generated artifacts; it points reviewers and future agents to the next concrete work without reopening broad roadmap claims.

## Current Position

- TN12 proof core is strong: base covenant spends, role-separated paths, batch-assurance release, payload events, replay guards, and adversarial rejections are represented in artifacts and checks.
- Mainnet deployment readiness is still about `55-60%`.
- Proof-lab auditability is roughly `75-80%` after the focused-check split, address validation pass, proof-record mutation coverage, status-artifact checks, and wallet-submit readiness checks.
- The next useful work is not another app idea. It is one end-to-end custody/indexer/operator slice.
- The latest local-wallet operator-pack receipt is accepted on TN12: `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`.

## Current Reviewer-Hardening Queue

These are the practical cleanup tasks surfaced by the latest repo reviews and GitHub surface check. They improve auditability before adding more app lanes.

| Order | Task | Why It Matters | Blocked By User? |
|---|---|---|---|
| 1 | Keep splitting `scripts/check.mjs` into focused domain tests. | Smaller failures are easier for an outside reviewer to trust and debug. | No |
| 2 | Add mutation coverage to proof-record tests. | The verifier should prove it catches bad source, amount, output, fee, and timing records. | No |
| 3 | Derive public counts from canonical artifacts. | README/UI count drift should fail a check instead of relying on manual updates. | No |
| 4 | Split `app.js` by proof page, lab page, renderers, and data loaders. | UI changes should not affect proof verification or unrelated lab panels. | No |
| 5 | Keep claim vocabulary close to public claims. | Reviewers should always know what is script-enforced, planner-only, indexer-derived, TN12-accepted, or mainnet-blocked. | No |
| 6 | Continue exact validation for addresses, txids, amounts, and artifact shapes. | Prefix checks and loose fixtures are acceptable for drafts, not reviewer evidence. | No |
| 7 | Keep historical reports archived and non-canonical. | The root and reviewer path should stay short enough to audit. | No |
| 8 | Move command, artifact, and count inventories toward manifest-driven checks. | Generated indexes should prevent docs, UI, and artifact packs from drifting. | No |

## Next 5 Deployment-Readiness Tasks

| Order | Task | Why It Matters | Blocked By User? |
|---|---|---|---|
| 1 | Keep `operator:refresh` green after every proof/artifact change. | This is the reviewer gate for accepted evidence plus local replay and UI checks. | No |
| 2 | Route the next local-wallet TN12 spend through the operator receipt pack. | Proves the repo can turn a spend into a reviewer/operator receipt instead of only a raw txid. | Done for txid `50e8aa53fc725a6bca0b20d46c8ea521644793b741664a6decab23eb23556361`; repeatable, not external-signer evidence |
| 3 | Keep batch-assurance release selected and refund alternates explicitly non-selected. | Prevents accidental double-claim language around the spent pledge set. | No |
| 4 | Prepare one unsigned external-signer payload receipt request. | Keeps the missing no-local-key signer rail concrete without pretending a wallet already signed it. | No; artifact path is `artifacts/external-signer-payload-request.json` |
| 5 | Only promote external signer status after a real wallet returns signed tx bytes and TN12 accepts the txid. | This is the main custody boundary for mainnet-style readiness. | Yes, unless a compatible throwaway signer is available |

## Next 90-95% Readiness Tasks

These are not all needed for the next commit, but they are the path from proof lab toward product infrastructure:

| Task | Clears |
|---|---|
| Real external-signer round trip | Repo no longer needs local keys for the selected demo path |
| Production wallet/indexer hardening | Operator can trust state recovery, monitoring, and retry behavior |
| Live removed-block rollback capture | Replay promotion is backed by real TN12 rollback evidence |
| Fresh accepted payload receipt through the operator pack | Demonstrates the current user-facing receipt loop |
| Public docs stay proof-first after each change | Prevents roadmap/status drift |

## Do Not Do Next

- Do not buy signer hardware just to move the repo forward.
- Do not submit non-selected batch refund paths for already spent pledge outputs.
- Do not add AMM, lending, liquidation, oracle, or bridge claims until there is a narrower accepted custody/indexer path.
- Do not treat local replay success as live removed-block rollback evidence.

## Commands

```sh
npm run operator:refresh
npm run proof:verify
npm run project:operator-pack
npm run project:proven-status
npm run wallet:unsigned-requests
```
