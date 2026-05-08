# Roadmap State

Reviewed: 2026-05-07

This repo is a Toccata-ready TN12 app primitive lab. The goal is to build and verify Kaspa-native app rails before mainnet covenant tooling is production-ready, while keeping every claim separated into accepted proof, planner/indexer state, wallet policy, documentation, or research.

## Current Proof Core

Accepted TN12 contract-spend proofs:

1. Vault recovery.
2. Vault delayed withdrawal.
3. Individual assurance release.
4. Individual assurance refund.
5. Escrow release.
6. Escrow DAA-score refund.
7. Escrow mutual cancel on a separate funded output.

Blocked or limited:

- The old escrow cancel `sigOpCount=1` script-unit rejection and the later old-SDK verification failure are preserved as historical evidence only.
- Rusty Kaspa TN12 source confirms the version-1 compute-budget route: v1 inputs carry `computeBudget`, not `sigOpCount`. The accepted cancel was rebuilt with local TN12 `kaspa-wasm 1.1.1-toc.1`, preserving `computeBudget=30`.
- The public TN12 REST submit route is unsuitable for payload receipts. It accepted a payment while dropping payload bytes. The JSON wRPC route has accepted 24 matched payload events across invoice, access-pass, auction, stable-value issuer, miner/watcher attestation, agent commitment, and batch-assurance planner state.

## App Buckets

### Mainnet-capable with normal Kaspa transaction/indexer work

- Payload invoice / receipt app.
- Access passes / coupons.
- Attestation registry.
- Auction / intent registry.
- Basic merchant/payment proof APIs.

These should use accepted transactions, payloads, output matching, issuer signatures, and indexer-derived app state. They do not need covenants to become useful.

### TN12 / Toccata covenant apps

- Vaults.
- Escrow.
- Individual assurance pledges.
- Treasury/team vault controls.
- Future covenant-native asset rules.

These should stay TN12/Toccata-labeled until final mainnet activation, wallet support, audits, and mainnet-compatible tooling exist.

### Research / future rails

- Prediction and hedge markets.
- DeFi: swaps, lending, stable-value, insurance, derivatives, portfolio automation.
- Coordination markets: Stag, Intendo, Pack, Solver, Hunt.
- ZK / anchor readiness.
- vProg-style execution.
- Bridge/source-chain state and oracle/attestation systems.

These are roadmap or research until the missing rails are explicit and tested.

## Twenty-Lane Status Map

| Lane | Status | Current repo state | Natural next step |
|---|---|---|---|
| 1. Payload invoice / receipt | Accepted TN12 vertical slice | Fixtures, registry, signed payload drafts, readiness check, accepted JSON wRPC paid/refund/error events, decoded invoice state | Add wallet review and checkpointed indexing |
| 2. Submit console | Review gate built | 37 signed draft reviews, 24 payload drafts, wallet-review readiness artifact | Real wallet connector and no-local-key UX |
| 3. Batch assurance | Accepted TN12 payload state plus custody gate | Campaign planner with accepted pledge planner records, signed-only progress, below-minimum review, release-ready planner event, and blocked custody draft review | Real accepted pledge-output custody settlement drafts |
| 4. Escrow | Strong TN12 lane | Accepted release, accepted DAA-refund, and accepted mutual-cancel proofs on separate funded outputs | Add negative tests and keep SDK route documented |
| 5. Treasury/team vaults | Planner base | Spend caps, payroll, recovery templates | Real constrained spend drafts and role-key separation |
| 6. Access passes/coupons | Accepted TN12 payload state | Issuer model plus accepted redemption payload | Duplicate and expiry checks |
| 7. Simple asset policy | Roadmap base | Mint, transfer, burn, recovery, redemption policy shapes | Keep issuer-indexed now, covenant-native later |
| 8. Auction/intents | Accepted TN12 payload state | Accepted bid payloads, winner rule, and below-reserve state | Settlement/refund drafts |
| 9. DeFi backlog | Research | Missing rails listed for swaps/lending/stable-value/etc.; stable-value comparison brief now separates issuer-backed, overcollateralized, synthetic, and external rails | Simulation dashboards only |
| 10. Cross-chain research | Built as library | PMF/code/failure-mode mapping | Turn top ideas into one-page app briefs |
| 11. Miner/pool signals | Accepted TN12 payload state | Attestation registry, payload-first framing, accepted watcher signal | Signature verification and reputation hardening |
| 12. AI-agent commitments | Accepted TN12 payload state | Task/deposit/proof/dispute model with accepted payload events | Release/refund drafts plus accepted tx lifecycle |
| 13. Coordination markets | Research prototype | Transparent Stag/Intendo/Pack/toy Solver | Transparent settlement draft; no Hashdag overclaim |
| 14. ZK / anchor readiness | Roadmap added | Checklist lane | Define public inputs, anchors, oracle/source-chain trust |
| 15. Prediction / hedge markets | Research only | In DeFi/attestation backlog | Simulator using attestations; no real settlement claim |
| 16. Portfolio automation | Research only | In DeFi backlog | Rules engine/simulator first |
| 17. Grants / public goods | Partly via assurance | Pledge/campaign primitives | Grants board plus payout vault |
| 18. Marketplace escrow | Partly via escrow | Release/refund proven | Usable commerce demo, with cancel omitted or redesigned |
| 19. Wallet/vault product | Partly via vault | Recovery and delayed withdrawal proven | Better policy templates and adversarial tests |
| 20. Bridge/source-chain apps | Research only | ZK/anchor checklist | No build until canonical anchor model is clear |

## Time Horizon

### Coming hours

1. Keep public docs focused: accepted proofs first, planner/research second.
2. Keep the accepted escrow cancel proof tied to the local TN12 SDK route and preserve old bad-config rejections as historical evidence only.
3. Keep payload receipt claims tied to the accepted JSON wRPC transaction and keep the public REST no-payload transaction historical only.

### Coming days

1. Make the accepted JSON wRPC payload receipt path repeatable through wallet review instead of local signing.
2. Move checkpointed indexing from known-txid public reads plus rollback guard to durable node/RPC storage with virtual-chain replay.
3. Add more negative checks for wrong signer, wrong output, stale draft, duplicate redemption, and signed-only state.
4. Turn escrow release/refund into a simple marketplace/freelance demo.

### Coming weeks

1. Harden treasury/team vault drafts.
2. Build grants/public-goods workflow on top of assurance plus payout vault planning.
3. Build attestation/prediction/agent simulators without settlement overclaims.
4. Add ZK/anchor design checklists before any bridge, oracle, solver, or vProg proof claim.

## Strategic Rule

Do not build twenty fake apps. Build three real verticals and let the other lanes attach to them:

1. Invoice/receipt app: accepted transaction app state.
2. Escrow/assurance app: TN12 covenant proof app.
3. Attestation/agent/prediction simulator: research-to-app bridge.

Everything else should plug into those rails or remain clearly marked as research.
