# TN12 Covenant Vault Demo Guidance

## Scope

- Separate local repo for a Kaspa TN12 covenant vault demo.
- Read `MEMORY.md` first on every resume. It points to the current handoff docs and should be updated after meaningful repo changes.
- Keep this project clearly labeled as testnet / experimental.
- Mainnet wording stays narrow: live Kaspa is PoW/blockDAG/UTXO/GHOSTDAG/Crescendo. Toccata, TN12, vProgs, native DeFi, and cross-app atomic composition stay in their own lanes.
- Prefer simple browser-native code until a real Kaspa/Silverscript integration requires a build system.

## General Agent Autonomy

- Work end to end: inspect, install routine tooling when needed, change, verify, and report the result.
- Protocol debugging starts with the local evidence: artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK version/API shape, node/network id, and Rusty Kaspa source/tests.
- When the first explanation fails, check adjacent causes too: stale SDKs, compatibility fields, serialization differences, endpoint encoding, network suffix, and diagnostics that prove only a txid rather than the committed transaction shape.
- Escalate protocol questions with a small reproducer and exact evidence: txid, artifact path, endpoint response, source line, and command.
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
- Keep writing concrete and necessary. Avoid repeated "not X but Y" frames, "if this then that" filler, and polished LLM cadence words such as "seamless," "robust," "unlock," "empower," "transform," or "game-changing."
- Avoid clever authority voice: no dramatic adjective piles, faux-bold certainty, invented slogans, or lines that sound written to impress the writer rather than help the builder.
- Use one clear status label or source link instead of long defensive caveat stacks.
- Treat text as part of the product. UI labels, docs, fixtures, generated artifacts, LLM context, and handoff notes should be scanned with the same care as code: necessary, specific, clean, and defensible.
- Treat the current version as a TN12-configured proof app. The browser builds policy/control artifacts, while scripts compile, sign, submit, verify, and index accepted testnet transactions.
- Public TN12 APIs, manual explorer data, and local fixtures are the default. Bring back local node work only on direct request.
- Payload/miner-signal work starts with transaction payload receipts and accepted-transaction indexing. Coinbase payload or pool policy is a later mining-software lane.
- Payload receipt submit needs a verified wallet/wRPC route. The public TN12 REST route accepted a payment while dropping payload bytes, so it cannot mark an invoice paid.

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
- When a chain/protocol result is surprising, preserve the failed artifact as evidence, label it accurately, and exhaust the local checks above before turning uncertainty into a claim or asking for expert review.
