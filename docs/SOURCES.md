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
- Rusty Kaspa TN12 branch: https://github.com/kaspanet/rusty-kaspa/tree/tn12
- Rusty Kaspa Toccata branch: https://github.com/kaspanet/rusty-kaspa/tree/toccata
- Silverscript: https://github.com/kaspanet/silverscript
- vProgs: https://github.com/kaspanet/vprogs
- Michael Sutton Toccata outlook: https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c

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
