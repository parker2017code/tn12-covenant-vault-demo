# TN12 Covenant Vault Demo Guidance

## Scope

- This is a separate local repo for a Kaspa TN12 covenant vault demo.
- Read `MEMORY.md` first on every resume. It points to the current handoff docs and should be updated after meaningful repo changes.
- Keep this project clearly labeled as testnet / experimental.
- Do not describe Toccata, TN12, vProgs, native DeFi, or cross-app atomic composition as live mainnet functionality.
- Prefer simple browser-native code until a real Kaspa/Silverscript integration requires a build system.

## General Agent Autonomy

- Plain rule: be proactive with tooling and environment setup; do the work, verify it, then report what changed.
- When a task is blocked by missing local tools, packages, browsers, renderers, SDKs, or node utilities, install or configure what is needed and continue. Do not stop just to ask permission for routine environment setup.
- Prefer finishing the requested outcome end to end: inspect, change, run, verify, and then report exactly what changed.
- Ask before destructive actions, credential use, mainnet signing/broadcasting, publishing a local-only prototype, or anything involving secrets, wallets, private keys, personal data, paid services, or irreversible system changes.
- After changing the environment, mention the package, tool, or configuration that was added so future agents understand the machine state.

## Status Rules

- Live mainnet: Kaspa Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS.
- TN12 / testnet: covenant experimentation, Silverscript-facing app design, proof and sequencing experiments.
- Roadmap: full vProgs, mature native app rails, cross-app atomic composition.
- Research / architecture: oracle or miner-attestation flows, TangVM-style ideas, DAGKnight activation timing.

## Product Direction

- Treat `docs/ROADMAP_STATE.md` as the durable "where we are / where we are going" map. Keep it aligned when app lanes, proof status, or research boundaries change.
- Start with safe money rules users can understand: delayed withdrawal, recovery path, spend limit, escrow, bounty, and treasury controls.
- Explain the action before the abstraction. Say "funds can only leave after a delay" before "covenant policy."
- Treat the current version as a TN12-configured proof app. The browser builds policy/control artifacts, while scripts compile, sign, submit, verify, and index accepted testnet transactions.
- Do not reintroduce the local node workflow. Use public TN12 APIs, manual explorer data, and local fixtures unless the user explicitly reverses that decision.
- For payload/miner-signal work, start with transaction payload receipts and accepted-transaction indexing. Do not claim arbitrary app data can be placed in block headers.
- Do not use the public TN12 REST submit route for payload receipts; it accepted a payment while dropping payload bytes. Use a verified wallet/wRPC route and then fetch the accepted transaction before marking receipt state paid.

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
- When checking public state, follow `docs/LLM_REVIEW_GUIDE.md` before summarizing what is built, live, stale, or still in limbo.
