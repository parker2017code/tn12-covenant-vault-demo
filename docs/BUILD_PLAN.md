# Full Vault And Assurance Build Plan

This plan assumes the saved TN12 address is manually funded and checked by the user:

```txt
kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt
```

User-reported balance: about 10,000 TN12 KAS/TKAS. The initial proof set has now been submitted and verified through the TN12 public API.

## Completed Proof Path

- Manual outpoint fixture format and browser form: done.
- Constructor and entrypoint fixtures for `DelayedRecoveryVault` and `AssurancePledge`: done.
- Local Silverscript compiler integration: done with `/home/parker2017/silverscript-tools/target/release/silverc`.
- Dry-run transaction planner: done.
- Signed P2PK, split, contract-funding, and contract-spend drafts: done.
- Public TN12 REST submission helper: done, gated behind explicit `--submit`.
- Vault recovery proof: accepted on TN12.
- Vault delayed withdrawal proof: accepted on TN12.
- Assurance release proof: accepted on TN12.
- Assurance refund proof: accepted on TN12.
- Browser proof cards and TN12 API refresh: done.
- Accepted-transaction app-state snapshot: done with `npm run indexer:state`.
- Signed payload receipt draft: done with `npm run tx:payload`; broadcast remains gated until REST payload submit behavior is verified.

## Next 20 Build Tasks Before A Real Testnet App Run

1. Add a wallet-facing submit screen that lists exact inputs, outputs, fees, DAA-score locks, and transaction hex before submit.
2. Add a "never print private key" guard around every script that reads `.local/tn12-wallet.json`.
3. Add explorer links for every fixture, signed draft, and accepted proof transaction.
4. Add a proof-state machine: planned, signed, submitted, accepted, mismatch, stale.
5. Verify payload submission through a route that actually preserves payload bytes, then submit one tiny TN12 payload receipt transaction.
6. Add the accepted payload txid to fixtures after API/explorer verification.
7. Add a payload decoder in the browser so receipts become visible app events.
8. Add multi-pledge assurance fixtures with separate contributors and refund addresses.
9. Add batch release transaction planning for enough pledge outputs to satisfy a target.
10. Add batch refund transaction planning for expired campaigns.
11. Add a campaign state JSON format with target, deadline, pledge outpoints, accepted release proofs, and accepted refund proofs.
12. Add a campaign UI that imports pledge outpoints and shows exact target progress from accepted outputs.
13. Add a stricter `AssurancePledge` template or companion campaign-state template only after the multi-output model is clear.
14. Add an `Escrow.sil` prototype with fund, release, timeout refund, and mutual cancel paths.
15. Add escrow funding and spend draft scripts using the existing transaction-builder pattern.
16. Add vault template variants for inheritance, team treasury, payroll cap, and lost-key recovery.
17. Add owner/recovery key separation fixtures instead of using one saved test key for all roles.
18. Add browser import/export for vault, assurance, escrow, and payload artifacts.
19. Add a miner-signal research notebook that compares transaction payload, coinbase payload, pool policy, and header-derived facts.
20. Keep Kaspa status labels aligned with Kaspa Explained: mainnet live, TN12 covenant testnet, Toccata path, vProgs roadmap, RTD research.
21. Add a basic DeFi backlog covering lending/borrowing, swaps/AMMs, stable-value units, insurance/protection, derivatives, and portfolio automation with explicit oracle, collateral, liquidity, liquidation, and composition assumptions.
22. Keep `docs/MASTER_APP_PLAN.md` as the canonical twelve-lane app roadmap: payload receipt/invoice, wallet submit console, batch assurance, escrow, treasury vaults, KRC/access passes, simple assets, auctions/intents, DeFi research, cross-chain research, miner/pool signals, and AI-agent commitments.
23. Add the attestation signal registry as the first miner/pool signal foundation: signed signals, source reputation, market use, portfolio hedge use, and payload-receipt settlement next.
24. Add the invoice receipt app lane: invoice fixture, invoice registry artifact, browser invoice panel, and explicit rule that invoice state becomes paid only after an accepted transaction carries the matching payload receipt.
