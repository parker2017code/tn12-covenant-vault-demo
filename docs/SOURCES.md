# Sources And Setup Notes

## Primary / Near-Primary

- Kaspa builder landing page: https://kaspa.org/build
- Kaspa builder docs: https://docs.kaspa.org/
- Kaspa programmability overview: https://docs.kaspa.org/programmability
- Kaspa covenants guide: https://docs.kaspa.org/programmability/covenants
- Kaspa Based Apps guide: https://docs.kaspa.org/programmability/based-apps
- Kaspa full vProgs guide: https://docs.kaspa.org/programmability/full-vprogs
- Kaspa Inline ZK guide: https://docs.kaspa.org/programmability/inline-zk
- Kaspa wallet guide: https://docs.kaspa.org/integrate/wallet
- Kaspa accepted transactions guide: https://docs.kaspa.org/integrate/accepted-transactions
- Kaspa transaction payload guide: https://docs.kaspa.org/integrate/transaction-payload
- Kaspa node guide: https://docs.kaspa.org/integrate/kaspa-node
- Kaspa references: https://docs.kaspa.org/references
- Aspectron Kaspa WASM SDK RpcClient docs: https://kaspa.aspectron.org/docs/classes/RpcClient.html
- Aspectron Kaspa transaction signing guide: https://kaspa-mdbook.aspectron.com/transactions/signing.html
- KasSigner repository: https://github.com/InKasWeRust/KasSigner
- KasSee watch-only companion: https://kassigner.org/
- Rusty Kaspa TN12 branch: https://github.com/kaspanet/rusty-kaspa/tree/tn12
- Rusty Kaspa Toccata branch: https://github.com/kaspanet/rusty-kaspa/tree/toccata
- Silverscript: https://github.com/kaspanet/silverscript
- vProgs: https://github.com/kaspanet/vprogs
- Michael Sutton Toccata outlook: https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c
- Kaspa Daily Yonatan Q&A Part 1: https://x.com/DailyKaspa/status/2052716697262374936

## TN12 Public Utilities

- Faucet: https://faucet-tn12.kaspanet.io/
- Explorer: https://tn12.kaspa.stream/
- UTXO endpoint used locally: `https://api-tn12.kaspa.org/addresses/{kaspatest-address}/utxos`
- Transaction endpoint used locally: `https://api-tn12.kaspa.org/transactions/{transaction-id}`

## Builder Resource Notes

The new official builder docs are useful to this repo in three ways:

- The programmability guide frames covenants as the right lane for asset rules and stateful outputs. That matches this vault and individual pledge primitive.
- The same guide points shared mutable app state toward Based Apps and future vProgs. That keeps pooled assurance target aggregation out of the first covenant primitive.
- The accepted-transactions guide supports adding verification and ingestion tooling after broadcast. This repo now has `npm run tx:verify` for the accepted proof transactions.
- The transaction-payload guide is the right first app-data lane for receipts, campaign metadata hashes, and accepted-transaction indexing. It is not evidence for arbitrary app data in block headers.
- The accepted-transactions guide's stronger long-term indexer pattern is checkpointed `getVirtualChainFromBlockV2` with `dataVerbosityLevel: "High"` when full transaction data, payloads, and rollback handling are needed. This repo currently stays lighter with REST txid pulls because the local full-node workflow was intentionally removed.
- The wallet guide matters for the payload route because it documents the high-level Wallet API as the normal JS/Rust send path, while the TN12 REST submit schema currently omits a payload field.
- The covenants guide directly supports this repo's next app choices: vaults, treasury controls, escrow-like flows, and time/condition-based unlocks.
- The Based Apps, full vProgs, and Inline ZK pages reinforce status boundaries: shared-state concurrency and app composition are later lanes, while ZK is specialized and not needed for the current vault/assurance/escrow path.
- Aspectron's `RpcClient` docs confirmed the current object-style constructor and request-style submit wrapper: `new RpcClient({ url, networkId })` and `submitTransaction({ transaction, allowOrphan })`.
- Aspectron's signing guide confirmed the same submit wrapper after SDK signing. TN12-specific `computeBudget` behavior still had to be verified against Rusty Kaspa TN12 source/tests and the local TN12 WASM build.
- KasSigner/KasSee is the best current public reference for this repo's missing external-signer boundary: watch-only transaction construction, offline signing, PSKB/KSPT-style handoff, and accepted-state promotion after broadcast. It is not evidence that this repo has a live wallet connector.

## External Signer / Wallet-Submit References

Use `docs/WALLET_SIGNER_REFERENCES.md` before changing wallet-submit direction.

KasSigner is relevant because it shows a real Kaspa-native signing workflow with private keys kept away from the networked companion app. KasSee is especially relevant because it imports public wallet data, builds unsigned transactions, and broadcasts signed transactions without seeing private keys.

This repo should learn from that boundary:

- prefer standard or emerging Kaspa partial-transaction formats over inventing a custom wallet handoff;
- keep exact transaction review mandatory before signing;
- preserve payload bytes and tx v1 fields such as `computeBudget`;
- treat signed/broadcast results as untrusted until accepted transaction evidence matches the reviewed draft;
- keep local `.local` key signing as testnet plumbing, not product UX.

## Cross-Chain App Research Resources

This repo should also keep a practical "what already worked elsewhere" resource lane.

Use open-source apps from other chains as reference material for product shape, PMF clues, failure modes, and battle-tested UX patterns. Do not treat them as protocol evidence for Kaspa, and do not port claims faster than Kaspa/TN12 can actually support them.

Research each candidate app in this order:

1. What user job did it solve?
2. What showed real demand: usage, revenue, liquidity, repeat behavior, developer adoption, or ecosystem dependence?
3. What failed: oracle risk, liquidation design, bridge risk, governance capture, toxic MEV, liquidity fragmentation, regulatory exposure, UX/key-management mistakes, or unsustainable incentives?
4. What code or architecture can be reused as a head start: artifact schemas, state machines, indexers, risk dashboards, admin controls, campaign flows, market models, or wallet review screens?
5. What must be rebuilt for Kaspa: UTXO transaction shape, accepted-transaction indexing, TN12 covenant limits, payload receipts, wallet API, and status labeling.

Good reference categories:

- multisig and wallet policy apps;
- vaults, treasuries, and guarded withdrawals;
- escrow, arbitration, streaming payments, and subscriptions;
- assurance/public-goods funding, grants, bounties, and campaign payout rules;
- AMMs, lending, stable-value systems, insurance, derivatives, and liquidation monitors;
- auctions, intent systems, prediction/oracle markets, and MEV-aware ordering tools;
- access passes, tickets, coupons, memberships, and redeemable claims;
- indexers, subgraphs, analytics dashboards, risk monitors, and explorer-style app state.

Every copied idea must keep a Kaspa status lane:

- live Kaspa lane for payment/receipt rails, wallets, KRC-aware tooling, payload receipts, and accepted-transaction indexing;
- TN12/Toccata lane for covenant-shaped vaults, escrow, assurance, simple assets, and state-output experiments;
- roadmap/research lane for Based Apps, full vProgs, cross-app composition, rich DeFi, RTD/oracle markets, and miner-attestation flows.

## AI-Agent And Coding Practice Sources

Use public agent practice as operator input, not as product truth. Some high-performing company workflows are private or only partly described publicly; record that boundary instead of inventing internal practice.

Current public sources encoded by `npm run ai:discipline`:

- OpenAI Codex practice: https://openai.com/business/guides-and-resources/how-openai-uses-codex/
- AGENTS.md open format: https://github.com/openai/agents.md
- OpenAI Codex repo AGENTS.md example: https://github.com/openai/codex/blob/main/AGENTS.md
- Anthropic Claude Code best practices: https://code.claude.com/docs/en/best-practices
- GitHub Copilot repository custom instructions: https://docs.github.com/en/copilot/how-tos/custom-instructions/adding-repository-custom-instructions-for-github-copilot
- AGENTS.md effectiveness study: https://arxiv.org/abs/2602.11988
- Failed agent PR study: https://arxiv.org/abs/2601.15195
- Agent logging study: https://huggingface.co/papers/2604.09409

Practical rule: prefer specific repo commands, files, and failure traps over generic agent maxims. For this repo that means `npm run check:all`, `npm run check:tn12`, accepted transaction evidence, generated artifacts, and exact source lanes.

## Local Finding

On 2026-05-06, `curl -I -L https://faucet-tn12.kaspanet.io/` returned HTTP 403 with a Cloudflare challenge. That does not mean the faucet is down for browsers; it means this shell cannot automate the request.

`curl -I -L https://tn12.kaspa.stream/` returned HTTP 200.

On 2026-05-07, `https://api-tn12.kaspa.org/addresses/kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt/utxos` returned one UTXO:

- transaction ID: `f6ca76d93accf1a468de36ba35439bc8ca5cb2e1ba28f30b3220586e90bb0aee`
- output index: `0`
- amount: `1000000000000` sompi, or `10000` TKAS

The project no longer expects a local `kaspad` node. The heavy local node/build/data folder was removed from `/home/parker2017/kaspa-node`.

The local address helper uses `kaspa-wasm` Rusty Kaspa bindings. It creates a random `Keypair`, calls `toAddress("testnet")`, verifies the result with the SDK `Address` parser, and writes testnet-only wallet material to `.local/tn12-wallet.json`.

The dry-run planner is local-only project code. It reads the compiled Silverscript JSON artifacts and produces transaction-intent JSON, but it is not protocol evidence and does not prove TN12 broadcast support.

Silverscript repo notes checked on 2026-05-06:

- README says Silverscript is a CashScript-inspired language and compiler targeting Kaspa script.
- README labels the project experimental and unstable.
- README says compiled scripts from that repo are valid only on Kaspa Testnet 12.
- Useful examples include `transfer_with_timeout.sil`, `covenant_escrow.sil`, `covenant_last_will.sil`, and `hodl_vault.sil`.
