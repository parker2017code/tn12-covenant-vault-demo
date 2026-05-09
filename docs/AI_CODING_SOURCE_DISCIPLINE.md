# AI Coding And Source Discipline

Reviewed: 2026-05-09

This repo uses AI help, but AI output is not a source of truth. The source of truth is primary documentation, implementation code, accepted TN12 transaction evidence, generated artifacts, and explicit repo status lanes.

## Why This Exists

LLMs are useful for fast synthesis, code navigation, boilerplate, state-machine scaffolding, and test generation. They are weak at current protocol status, exact API surfaces, security boundaries, and knowing when they are guessing. Crypto makes those weaknesses expensive because a wording mistake can become a custody claim, and a code mistake can become a signing, payload, or indexing error.

## Hard Rules

1. Never upgrade a claim from memory.
2. Mark every claim as live mainnet, TN12/Toccata, accepted payload/indexer state, wallet policy, planner state, roadmap, research, or local artifact.
3. Do not summarize inaccessible source material. Record that it needs import, or mark it as user-provided if the user supplies an export.
4. Treat signed drafts, planner payloads, accepted payload events, accepted proof spends, custody outputs, and mainnet readiness as different things.
5. Before any DEX, lending, perps, bridge, stable-value, or oracle claim, name the custody, reserve, oracle, liquidation, settlement, ordering, and anchor rails.
6. Broadcast, signing, importing outpoints, and changing claim status stay explicit human-review actions.

## Agent Operating Rules

- Keep persistent instructions short and specific. `AGENTS.md` is for local commands, conventions, and known traps; this document and the generated artifact carry deeper rationale.
- Prefer executable proof over verbal confidence. Add or update scripts and checks when a new lane matters.
- Explore, plan, code, verify. For large work, name the file set and gates before editing; for small work, still inspect nearby patterns first.
- Use one coherent review unit per commit: fixture, builder, generated artifact, docs, and check assertions should move together when they represent one lane.
- Treat public company and open-source agent practices as evidence only when they are public. Internal/private company practices may exist but should be recorded as unknown rather than invented.
- For state transitions and external IO, observability is part of the feature: output txids, endpoints, network IDs, payload hashes, rollback status, and review states where relevant.

## Current Source Watch

- Kaspa Daily Yonatan Q&A Part 1 entry: https://x.com/DailyKaspa/status/2052716697262374936
- Part 1 body: user supplied a Thread Reader unroll on 2026-05-09. Store paraphrased takeaways, not full copied text.
- Part 2: watch for release before refreshing this discipline layer.
- Yonatan / Hashdag: use for direction, not final specs without docs/code/evidence.
- Michael Sutton writing: use for Toccata/covenant direction with activation/tooling status separated.
- Kaspa docs, Rusty Kaspa, Silverscript, and vProgs repos: use before claiming protocol, wallet, payload, or transaction behavior.
- OWASP LLM and smart-contract risk lists: use as safety checklists, not Kaspa-specific protocol truth.
- OpenAI Codex and AGENTS.md public docs: use for structured agent workflows and repo-local instruction files.
- OpenAI Codex repo `AGENTS.md`: use as an example of concrete commands and repo-specific traps, not as a template to copy blindly.
- Anthropic Claude Code best-practice docs: use for verification loops, context management, explore-plan-code sequencing, and failure pattern checks.
- GitHub Copilot custom-instruction docs: track only if this repo needs cross-tool instruction files.
- Empirical studies on AGENTS.md, failed agent PRs, and agent logging: use as warnings that bloat, large diffs, CI failures, and weak observability are real agent failure modes.

## Kaspa Daily Q&A Guardrails

- Base of Liquidity is useful narrative framing, not an app, use case, or adoption strategy by itself.
- Generic merchant/POS payments should not be treated as the main 2026 adoption vector. Keep invoice, payload, receipt, and wallet work because those are necessary rails, not because speed alone creates adoption.
- Coordination markets deserve higher priority because they are the founder-highlighted product category. The repo's current coordination-market artifact is still a transparent toy planner, not Staghunt/Hashdag production infrastructure.
- Narrative has to connect to products and visible on-chain activity. Broad marketing copy without usable artifacts should be down-ranked.
- Keep the Kaspa app strategy L1-first. Do not default to EVM compatibility or external L2 migration unless a source and artifact make that dependency explicit.
- Real adoption analysis should look for repeat usage, useful app activity, liquidity, durable builders, and clear on-chain metrics, not just price, campaign traffic, raw mints, or demos.
- Universal scheduler, netsplit resistance, 100 BPS, native DAS via RTD, and semi-based models are research/watch items unless current primary sources and code say otherwise.

## What To Audit

- Kaspa Explained: look for hype, vague abstractions, roadmap/current conflation, and claims that need primary source anchors.
- TN12: look for fixture/evidence confusion, invented API assumptions, unsafe submit paths, missing rollback handling, missing negative tests, and custody overclaims.
- Shared: keep docs and generated artifacts in sync so future AI agents inherit the boundaries.

The generated artifact is `artifacts/ai-coding-source-discipline.json`; rebuild it with:

```sh
npm run ai:discipline
```
