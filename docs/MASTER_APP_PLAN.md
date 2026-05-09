# Kaspa Ecosystem App Build Plan

This repo uses Kaspa Explained as the status map and this TN12 demo as the app workshop. The plan is to build useful app primitives in order, while also studying open-source apps from other chains for PMF evidence, code patterns, and failure modes.

For the current twenty-lane status map and time horizon, see `docs/ROADMAP_STATE.md`.

For the high-impact mainstream app direction and why each use case is or is not build-now, see `docs/MAINSTREAM_APP_DIRECTION.md`.

## Operating Rules

- Keep every feature in a status lane: live Kaspa, TN12/Toccata, roadmap, or research.
- Use other-chain code as product research and engineering reference, not as proof that Kaspa supports the same execution model today.
- Prefer accepted transaction indexing and payload receipts before richer settlement claims.
- For miner or RTD-style data, start with signed attestations and transaction payload receipts. Do not claim arbitrary app data can be placed in block headers.
- Do not expose private keys in UI, docs, logs, or chat.
- Keep an enforcement matrix for every app surface: script, planner/indexer, wallet-policy, documentation, or simulation-only.

## Build Lanes

1. Payload Receipt / Invoice App
   - Payment plus app data.
   - This is the cleanest bridge from live Kaspa behavior into app state.
   - First success: one accepted TN12 payload receipt decoded by the app-state indexer.
   - Current repo surface: `fixtures/InvoiceReceipts.json`, `src/invoiceReceipt.mjs`, `npm run invoice:registry`, and the browser invoice panel.

2. Wallet-Facing Submit Console
   - Show exact inputs, outputs, fees, payload, draft status, and submit command.
   - Never expose private keys.
   - First success: inspect a signed draft without opening raw JSON.
   - Current repo surface: `fixtures/SubmitConsoleDrafts.json`, `src/submitConsole.mjs`, `src/walletReview.mjs`, `npm run submit:registry`, `npm run wallet:review`, and the browser submit console.

3. Batch Assurance Campaigns
   - Move from one pledge proof to many pledge outputs.
   - Show target progress, release planning, and refund planning.
   - First success: campaign state derived from multiple accepted pledge outputs.
   - Current repo surface: `fixtures/BatchAssuranceCampaign.json`, `src/batchAssurance.mjs`, `npm run campaign:state`, and the browser campaign panel.

4. Escrow Primitive
   - Buyer fund, seller release, timeout refund, mutual cancel.
   - First success: accepted TN12 fund and release/refund path.
   - Current repo surface: `fixtures/EscrowPrimitives.json`, `src/escrowPrimitive.mjs`, `npm run escrow:registry`, and the browser escrow panel.

5. Treasury / Team Vaults
   - Spend caps, delayed large withdrawals, recovery, payroll templates.
   - First success: one constrained team spend and one recovery/cancel path.
   - Current repo surface: `fixtures/TreasuryVaults.json`, `src/treasuryVault.mjs`, `npm run treasury:registry`, and the browser treasury panel.

6. KRC / Access Pass Planner
   - Coupons, memberships, tickets, redeemable claims.
   - Label clearly as ecosystem/indexer/issuer flows unless later covenant enforcement exists.
   - First success: pass artifact plus redemption state model.
   - Current repo surface: `fixtures/AccessPassPlanner.json`, `src/accessPassPlanner.mjs`, `npm run access:passes`, and the browser access pass panel.

7. Simple Asset Policy
   - Later covenant-native rules: mint, transfer, burn, recovery, redemption.
   - First success: asset policy artifact and clear contrast with KRC ecosystem assets.
   - Current repo surface: `fixtures/SimpleAssetPolicies.json`, `src/assetPolicy.mjs`, `npm run asset:policies`, and the browser asset policy panel.

8. Auction / Intent Prototype
   - Accepted bid payloads, winner selection, refund/release rules, MEV caveats.
   - First success: auction state derived from accepted bid transactions.

9. Basic DeFi Research Backlog
   - Lending, swaps, AMMs, stable-value, insurance, derivatives, portfolio automation.
   - Keep missing rails explicit: oracle, liquidity, liquidation, MEV, wallet, indexing, composition.
   - Use `npm run rails:missing` before any DEX, lending, perps, bridge, or stable-value app claim.
   - First success: app briefs that do not claim mature native DeFi is live.

10. Cross-Chain App Research Library
   - One note per proven or failed app category.
   - Track PMF, code patterns, failure modes, and Kaspa mapping.
   - First success: research notes that become app briefs before code is copied.
   - Current repo surface: `fixtures/CrossChainResearchLibrary.json`, `src/appResearch.mjs`, `npm run research:library`, and the browser research panel.

11. Miner / Pool Signal Research
   - Transaction payload first; coinbase/pool policy later.
   - No fake block-header claims.
   - First success: signed attestation registry, reputation summary, and one accepted payload receipt for a signal.

12. AI-Agent Commitment Board
   - Task offers, deposits, completion proofs, disputes, refunds, accepted transaction indexing.
   - First success: task commitment artifact plus simulated dispute/refund state.

13. Transparent Coordination-Market Prototype
   - Stag, Intendo, Pack, toy Solver, Hunt-plan artifact.
   - Settlement/app brief maps one satisfiable transparent Pack to release/refund routes and wallet review checks.
   - Explicitly not a Hashdag/Staghunt implementation: no opacity, capital multiplexing, composability, oracle/settlement rail, or coordinated atomic execution.
   - Current repo surface: `fixtures/CoordinationMarketPrototype.json`, `fixtures/CoordinationMarketSettlementBrief.json`, `src/coordinationMarket.mjs`, `src/coordinationMarketSettlementBrief.mjs`, `npm run coordination:market`, `npm run coordination:settlement-brief`, and the browser coordination panel.

14. ZK / Anchor Readiness
   - Track where future apps may need compact proofs or canonical anchors: off-chain state, coordination solver results, source-chain state, oracle attestations, and vProg-style execution.
   - Rule: a ZK proof verifies a statement about chosen public inputs; it is not itself an oracle or source-chain finality proof.
   - First success: a checklist that says what is proved, what supplies the anchor/root/event, and which trust model remains.

## Immediate Order

1. Prioritize the high-impact user-facing lanes: invoice/receipt, wallet submit, escrow/freelance marketplace, batch assurance, access passes, auctions/intents, and vault/treasury.
2. Keep the payload receipt app gated by `npm run payload:readiness` and `npm run payload:verify`; the accepted JSON wRPC receipt is current evidence, and the public REST route remains historical no-payload evidence.
3. Use `npm run mainnet:readiness` to separate mainnet-capable payment/indexer work from TN12/Toccata covenant work.
4. Continue filling base app artifacts for access passes, simple assets, auctions/intents, DeFi research, and AI-agent commitments.
5. Keep DEX/AMM, lending, perps, bridges, ZK, vProgs, and source-chain apps in documented pipeline lanes until their missing rails are explicit.
6. Harden vertical slices only after the enforcement and readiness maps agree on what is actually proved.
