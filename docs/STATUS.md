# Status Discipline

## Current Demo Status

- Local browser prototype: live in this repo.
- Policy designer and simulator: implemented.
- Local TN12 test address helper: implemented with Rusty Kaspa WASM bindings.
- Real TN12 transaction builder: not implemented.
- Wallet connector: not implemented.
- Faucet automation: not available from this shell because the faucet returns a Cloudflare challenge.

## Kaspa Status Boundaries

- Kaspa mainnet live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS.
- TN12: testnet covenant experimentation, not mainnet activation.
- Toccata: targeted hard-fork path until primary activation evidence says otherwise.
- vProgs: roadmap architecture.
- Cross-app atomic composition: later vProgs direction, not a TN12 vault feature.

## Why A Vault First

Vaults are a good first contribution because they turn covenants into a concrete user picture:

- funds can only leave after a delay,
- a recovery address can regain control,
- spending can be limited,
- a user can cancel a suspicious withdrawal,
- a policy can be explained before funds move.

This builds the primitive layer before speculative DeFi.
