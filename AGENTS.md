# TN12 Covenant Vault Demo Guidance

## Scope

- Separate local repo for a Kaspa TN12 covenant vault demo.
- Read `MEMORY.md` first on every resume. It points to the current handoff docs and should be updated after meaningful repo changes.
- Keep this project clearly labeled as testnet / experimental.
- Mainnet wording stays narrow: live Kaspa is PoW/blockDAG/UTXO/GHOSTDAG/Crescendo. Toccata, TN12, vProgs, native DeFi, and cross-app atomic composition stay in their own lanes.
- Prefer simple browser-native code until a real Kaspa/Silverscript integration requires a build system.

## General Agent Autonomy

- Work end to end: inspect, install routine tooling when needed, change, verify, and report the result.
- When the user says start, continue, go, keep going, or similar, keep executing the next concrete tasks from repo handoff/queue and track progress until the user says stop/pause or a real blocker needs input.
- Protocol debugging starts with the local evidence: artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK version/API shape, node/network id, and Rusty Kaspa source/tests.
- When the first explanation fails, check adjacent causes too: stale SDKs, compatibility fields, serialization differences, endpoint encoding, network suffix, and diagnostics that prove only a txid rather than the committed transaction shape.
- Escalate protocol questions with a small reproducer and exact evidence: txid, artifact path, endpoint response, source line, and command.
- Ask before destructive actions, credential use, mainnet signing/broadcasting, publishing a local-only prototype, or anything involving secrets, wallets, private keys, personal data, paid services, or irreversible system changes.
- After changing the environment, mention the package, tool, or configuration that was added so future agents understand the machine state.
- Keep this file short and executable. Longer AI/coding-agent research and failure-mode rationale lives in `docs/AI_CODING_SOURCE_DISCIPLINE.md` and `artifacts/ai-coding-source-discipline.json`.
- Prefer concrete repo commands, source files, and known traps over generic "best practice" prose. If a new recurring agent rule is not actionable in this repo, do not add it here.

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
- Avoid corporate abstraction unless the sentence cashes it out. Do not leave terms like "institutional readiness," "ecosystem maturity," "enterprise adoption," "strategic," or "platform unlock" standing alone. Name the actor and requirement: an exchange needs node stability, wallet integration, liquidity, legal review, and support; a payments company needs payment APIs, refunds, accounting, uptime, and support; builders need docs, SDKs, indexers, and working examples.
- Avoid clever authority voice: no dramatic adjective piles, faux-bold certainty, invented slogans, or lines that sound written to impress the writer rather than help the builder.
- Do not write cringey internal-process language in public copy or durable notes. Avoid vague words like "framing pass," "status theater," "polish pass," "move the narrative," and "unlock." Say the concrete task: shorten the page, link the card, move details to docs, show the command prereqs, or explain the app path.
- Use one clear status label or source link instead of long defensive caveat stacks.
- Do not hedge facts the user directly provides, such as a URL, transcript, repo state, txid, artifact path, or reviewer instruction. Treat it as real input, then verify only the claims that depend on external current state.
- Prefer plain build language: built, working, needs wallet, needs custody, needs indexer, research, roadmap, next rail. Avoid over-negative repetition when the useful point is simply what must be built next.
- Apply the writing bar across public pages and LLM-facing files. Every touched page, repo guide, source note, generated artifact, handoff note, and context file should be direct, sourced or status-labeled, necessary, and free of defensive throat-clearing.
- Treat text as part of the product. UI labels, docs, fixtures, generated artifacts, LLM context, and handoff notes should be scanned with the same care as code: necessary, specific, clean, and defensible.
- Treat user examples as class signals unless the user explicitly says one instance only. If the user points at one command, fake-clickable card, crowded mobile control, copy button, source link, or status label, audit the whole class of similar patterns.
- For broad cleanup work, use read-only parallel agents for audits and research when available. Assign them search/review tasks, keep edits local to the main agent, and use their findings to avoid narrow one-off fixes.
- Treat agent-written code as suspect around adjacent assumptions: check existing artifact shapes, field names, negative cases, and security-sensitive paths before extending a pattern.
- Treat invoice, payload, receipt, and wallet work as rails, not as a generic merchant-payment adoption thesis. Current product framing should prioritize usable products, visible on-chain activity, coordination-market direction, and L1-first Kaspa primitives.
- Treat the current version as a TN12-configured proof app. The browser builds policy/control artifacts, while scripts compile, sign, submit, verify, and index accepted testnet transactions.
- Public TN12 APIs, manual explorer data, and local fixtures are the default. Bring back local node work only on direct request.
- Payload/miner-signal work starts with transaction payload receipts and accepted-transaction indexing. Coinbase payload or pool policy is a later mining-software lane.
- Payload receipt submit needs a verified wallet/wRPC route. The public TN12 REST route accepted a payment while dropping payload bytes, so it cannot mark an invoice paid.
- Do not default to EVM or external-L2 assumptions for Kaspa app strategy. Keep ecosystem L2 or bridge references in research/scouting lanes unless a sourced artifact makes the dependency explicit.

## Sources

- Use primary or near-primary sources first:
  - https://github.com/kaspanet/rusty-kaspa/tree/tn12
  - https://github.com/kaspanet/rusty-kaspa/tree/toccata
  - https://github.com/kaspanet/silverscript
  - https://github.com/kaspanet/vprogs
  - https://docs.kaspa.org/
  - https://kaspa.org/build
  - https://kaspa.org/developments/
  - https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c
- Use Kaspa Explained as internal framing discipline, not protocol authority.
- Use current Kaspa.org/docs pages for orientation and source discovery. Use TN12 artifacts, Rusty Kaspa source/tests, KIPs, releases, and accepted txids before changing proof/live status.
- Use public AI-agent guidance and open-source repo examples as operator input only. Private company practices may be unknown; do not invent them.

## Validation

- Run `node scripts/check.mjs` after edits.
- For UI work, serve locally and confirm the page returns HTTP 200 before sharing a link.
- When checking public state, follow `docs/LLM_REVIEW_GUIDE.md` before summarizing what is built, live, stale, or still in limbo.
- Public AI review rules live in `ai-review.html`; keep it aligned with `docs/LLM_REVIEW_GUIDE.md`, `docs/CLAIM_VOCABULARY.md`, and public page labels.
- Keep the hard-earned SilverScript lessons public and LLM-facing: state is the point, covenant IDs track lineage, mux/worker beats giant scripts, ICC uses sibling authority instead of nested execution, challenge/timeout paths beat expensive global scans, and negative cases make examples serious.
- When a chain/protocol result is surprising, preserve the failed artifact as evidence, label it accurately, and exhaust the local checks above before turning uncertainty into a claim or asking for expert review.
- For new artifact lanes, wire the builder into `npm run check:all` so future agents verify behavior rather than trusting prose.
