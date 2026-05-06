# Sources And Setup Notes

## Primary / Near-Primary

- Rusty Kaspa TN12 branch: https://github.com/kaspanet/rusty-kaspa/tree/tn12
- Rusty Kaspa Toccata branch: https://github.com/kaspanet/rusty-kaspa/tree/toccata
- Silverscript: https://github.com/kaspanet/silverscript
- vProgs: https://github.com/kaspanet/vprogs
- Michael Sutton Toccata outlook: https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c

## TN12 Public Utilities

- Faucet lead: https://faucet-tn12.kaspanet.io/
- Explorer: https://tn12.kaspa.stream/

## Local Finding

On 2026-05-06, `curl -I -L https://faucet-tn12.kaspanet.io/` returned HTTP 403 with a Cloudflare challenge. That does not mean the faucet is down for browsers; it means this shell cannot automate the request.

`curl -I -L https://tn12.kaspa.stream/` returned HTTP 200.

The local address helper uses the `kaspa-wasm` Rusty Kaspa bindings installed through the `kaspa` npm package, which points to `kaspanet/rusty-kaspa`. It creates a random `Keypair`, calls `toAddress("testnet")`, and verifies the result with the SDK `Address` parser before printing it.

Silverscript repo notes checked on 2026-05-06:

- README says Silverscript is a CashScript-inspired language and compiler targeting Kaspa script.
- README labels the project experimental and unstable.
- README says compiled scripts from that repo are valid only on Kaspa Testnet 12.
- Useful examples include `transfer_with_timeout.sil`, `covenant_escrow.sil`, `covenant_last_will.sil`, and `hodl_vault.sil`.
