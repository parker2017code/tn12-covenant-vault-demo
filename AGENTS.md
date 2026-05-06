# TN12 Covenant Vault Demo Guidance

## Scope

- This is a separate local repo for a Kaspa TN12 covenant vault demo.
- Keep this project clearly labeled as testnet / experimental.
- Do not describe Toccata, TN12, vProgs, native DeFi, or cross-app atomic composition as live mainnet functionality.
- Prefer simple browser-native code until a real Kaspa/Silverscript integration requires a build system.

## Status Rules

- Live mainnet: Kaspa Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS.
- TN12 / testnet: covenant experimentation, Silverscript-facing app design, proof and sequencing experiments.
- Roadmap: full vProgs, mature native app rails, cross-app atomic composition.
- Research / architecture: oracle or miner-attestation flows, TangVM-style ideas, DAGKnight activation timing.

## Product Direction

- Start with safe money rules users can understand: delayed withdrawal, recovery path, spend limit, escrow, bounty, and treasury controls.
- Explain the action before the abstraction. Say "funds can only leave after a delay" before "covenant policy."
- Treat the first version as a vault policy designer and simulator. Real TN12 transaction construction should be added only after wallet/node/faucet flow is verified.

## Sources

- Use primary or near-primary sources first:
  - https://github.com/kaspanet/rusty-kaspa/tree/tn12
  - https://github.com/kaspanet/rusty-kaspa/tree/toccata
  - https://github.com/kaspanet/silverscript
  - https://github.com/kaspanet/vprogs
  - https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c
- Use Kaspa Explained as internal framing discipline, not protocol authority.

## Validation

- Run `node scripts/check.mjs` after edits.
- For UI work, serve locally and confirm the page returns HTTP 200 before sharing a link.
