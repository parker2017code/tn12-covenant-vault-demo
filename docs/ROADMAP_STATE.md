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
- The public TN12 REST submit route is unsuitable for payload receipts. It accepted a payment while dropping payload bytes. The JSON wRPC route accepted a matched payload receipt as tx `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`.

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
| 1. Payload invoice / receipt | Accepted TN12 vertical slice | Fixtures, registry, signed payload draft, readiness check, accepted JSON wRPC receipt, decoded invoice state | Add wallet review, duplicate-payment checks, and refund handling |
| 2. Submit console | Base built | Signed draft review, inputs/outputs/fees/commands | Real wallet connector and no-local-key UX |
| 3. Batch assurance | Base built | Campaign planner with accepted vs signed-only progress | Real accepted pledge-output batch settlement drafts |
| 4. Escrow | Strong TN12 lane | Accepted release, accepted DAA-refund, and accepted mutual-cancel proofs on separate funded outputs | Add negative tests and keep SDK route documented |
| 5. Treasury/team vaults | Planner base | Spend caps, payroll, recovery templates | Real constrained spend drafts and role-key separation |
| 6. Access passes/coupons | Planner/indexer base | Issuer and redemption model | Tie one redemption to accepted payload transaction |
| 7. Simple asset policy | Roadmap base | Mint, transfer, burn, recovery, redemption policy shapes | Keep issuer-indexed now, covenant-native later |
| 8. Auction/intents | Planner/indexer base | Accepted bid payload model and winner rule | Settlement/refund drafts |
| 9. DeFi backlog | Research | Missing rails listed for swaps/lending/stable-value/etc.; stable-value comparison brief now separates issuer-backed, overcollateralized, synthetic, and external rails | Simulation dashboards only |
| 10. Cross-chain research | Built as library | PMF/code/failure-mode mapping | Turn top ideas into one-page app briefs |
| 11. Miner/pool signals | Research base | Attestation registry, payload-first framing | Signature verification plus accepted payload receipt |
| 12. AI-agent commitments | Planner base | Task/deposit/proof/dispute model | Release/refund drafts plus accepted tx lifecycle |
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
2. Tie one access pass or attestation to accepted payload state.
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
