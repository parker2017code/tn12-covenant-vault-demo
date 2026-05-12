# TN12 Lab Notebook

Short operator notes for this repo. Keep claims tied to artifacts and TN12 gates.

## Current State

- Accepted TN12 proof core: vault recovery, vault delayed withdrawal, assurance release/refund, escrow release/refund/cancel.
- Accepted role-separated proof core: all seven distinct-role positive paths.
- Accepted payload events: receipt, refund, error, access pass, auction, stable-value planner, agent, and batch-assurance events.
- Accepted batch-assurance outputs: 45/35/20 TKAS pledge outputs and one 3-pledge release output.
- Local gates cover proof evidence, payload matching, replay, wallet-review fixtures, negative cases, and UI smoke.
- Not complete: no production wallet, no mainnet covenant claim, no mature DeFi, no live rollback-window proof.

Primary status files:

```txt
README.md
MAINNET_READINESS.md
TN12_HANDOFF.md
docs/PROGRESS.md
docs/PROOF_INDEX.md
docs/TN12_TEST_MATRIX.md
docs/ROADMAP_STATE.md
```

## Proof Gates

Run the full local gate:

```sh
npm run check:all
npm run demo:operator-refresh
```

Run the public TN12 evidence gate:

```sh
npm run check:tn12
```

This verifies accepted proof txids, role-separated proof txids, payload events, checkpoint rebuild, and persisted checkpoint state.

Useful targeted gates:

```sh
npm run tx:verify
npm run tx:roles:verify
npm run payload:verify:events
npm run proof:evidence
npm run roles:proof:evidence
npm run indexer:checkpoint
npm run indexer:persist
```

## Wallet And Keys

Create or refresh the local TN12 wallet:

```sh
npm run address
npm run wallet:public
npm run utxos:fetch
```

Private keys live under `.local/` and are testnet-only. Do not use them for mainnet funds.

Current saved public address:

```txt
kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt
```

Faucet and explorer:

```txt
https://faucet-tn12.kaspanet.io/
https://tn12.kaspa.stream/
https://api-tn12.kaspa.org/
```

## Build Commands

Core fixtures and contracts:

```sh
npm run fixtures
npm run fixtures:roles
npm run compile:contracts
npm run compile:roles
```

Draft construction:

```sh
npm run drafts
npm run tx:p2pk
npm run tx:contracts
npm run tx:spends
npm run tx:escrow:spends
npm run tx:roles:fund
npm run tx:roles:spends
```

Payload receipts:

```sh
npm run signal:payload
npm run invoice:registry
npm run payload:readiness
npm run tx:payload
npm run tx:submit:dry
npm run tx:submit:wrpc
npm run payload:verify
```

Wallet/external-signer rail:

```sh
npm run submit:registry
npm run wallet:review
npm run wallet:connector
npm run wallet:submit-package
npm run wallet:connector-requests
npm run wallet:adapter-run
npm run wallet:submit-ledger
npm run wallet:result-validation
npm run wallet:external-signer-template
npm run project:proven-status
npm run project:operator-pack
```

Indexer/replay rail:

```sh
npm run indexer:state
npm run indexer:checkpoint
npm run indexer:persist
npm run indexer:replay-plan
npm run indexer:schema
npm run indexer:replay
npm run indexer:virtual-chain-plan
npm run indexer:virtual-chain-run
npm run indexer:virtual-chain-adapter
npm run indexer:live-preflight
npm run indexer:endpoint-runbook
npm run indexer:durable-promotion-guard
```

Batch assurance:

```sh
npm run campaign:state
npm run campaign:custody
npm run campaign:custody-requirements
npm run campaign:pledge-outputs
npm run campaign:custody-imports
npm run campaign:pledge-funding-draft
npm run campaign:settlement-drafts
npm run campaign:settlement-decision
npm run campaign:submit-runbook
npm run campaign:operator-decision
```

Other app-state lanes:

```sh
npm run escrow:registry
npm run escrow:marketplace
npm run escrow:flow
npm run escrow:action-map
npm run treasury:registry
npm run treasury:spends
npm run treasury:role-review
npm run access:passes
npm run access:issuer-review
npm run auction:intents
npm run auction:settlement-drafts
npm run auction:custody-review
```

Research/status artifacts:

```sh
npm run enforcement:matrix
npm run mainnet:readiness
npm run invoice:mainnet-brief
npm run rails:missing
npm run rails:research
npm run oracle:matrix
npm run project:queue
npm run project:next-ten-status
npm run project:proven-status
npm run project:operator-pack
```

## Accepted Txid References

Core proof txids live in:

```txt
fixtures/AcceptedProofTransactions.json
fixtures/RoleSeparatedAcceptedProofTransactions.json
fixtures/AcceptedPayloadEvents.json
fixtures/AcceptedOutputEvidence.json
```

Generated evidence lives in:

```txt
artifacts/proof-evidence.json
artifacts/role-separated-proof-evidence.json
artifacts/checkpointed-accepted-index.json
artifacts/persisted-checkpoint-guard.json
```

## Debugging Rules

- Start with the artifact path, txid, endpoint response, and smallest command.
- Do not call a protocol failure until config, witness order, script args, tx version, `sigOpCount`, `computeBudget`, submit route, and accepted sibling spends are checked.
- Treat local invalid-candidate artifacts as review material, not TN12 rejection evidence.
- Keep volatile SDK/API notes in this repo, not in public Kaspa Explained copy.

## Next Work

1. Real user-wallet signing round trip.
2. Live removed-block rollback evidence.
3. Auction or agent-task settlement/refund vertical.
4. Continued prose cleanup: proof-first, fewer roadmap claims, fewer repeated caveats.
