# AI Coding And Source Discipline

Reviewed: 2026-05-09

This repo uses AI help. Source of truth lives in primary documentation, implementation code, accepted TN12 transaction evidence, generated artifacts, and explicit repo status lanes.

## Why This Exists

LLMs are useful for fast synthesis, code navigation, boilerplate, state-machine scaffolding, and test generation. Current protocol status, exact API surfaces, security boundaries, and guess detection require source checks. Crypto makes that expensive because a wording mistake can become a custody claim, and a code mistake can become a signing, payload, or indexing error.

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
- Treat public company and open-source agent practices as evidence only when they are public. Internal/private company practices may exist and should be recorded as unknown unless public evidence exists.
- For state transitions and external IO, observability is part of the feature: output txids, endpoints, network IDs, payload hashes, rollback status, and review states where relevant.
- When asked to continue, keep moving through the repo queue until the user says stop/pause or a real blocker needs input. Do not spend turns asking whether to proceed after each small step.
- Treat code quality as behavior plus checks, not prose quality. A good feature has an input/event source, state transition, user/operator review surface, validation gate, and a handoff note.
- Prefer fewer stronger verticals over more labels. New feature work should reuse wallet, indexer, custody, attestation, or proof rails unless a specific source or artifact justifies a new lane.

## Failure Modes To Avoid

- Inflated surface area: many lanes and JSON artifacts can make a small proof kernel look like a product suite. Lead with accepted txids, scripts, and SDK lessons, not lane count.
- Scaffolding outgrowing substance: repo memory, status dashboards, and AI guidance are useful only when they make the accepted TN12 proofs and wallet/indexer rails easier to verify or extend.
- Fixture transformation as faux progress: a script that reads one JSON file and writes another is useful only if it catches a bug, tightens a claim, or drives the next transaction.
- Roadmap language sounding like implementation: words such as app, market, DeFi, stable-value, agent, and coordination must stay research/planner-labeled until custody, settlement, wallet, indexer, and failure paths exist.
- Repetitive boundary prose: restating every non-claim everywhere makes the repo read like machine output. Put boundaries once in the right artifact and keep public copy shorter.
- LLM self-management sprawl: docs about agents are not product work. Keep AI guidance small, executable, and tied to checks.
- Txid-only reasoning: UTXO work must key by full outpoint. A single accepted transaction can carry several distinct outputs.
- Planning before proof: when a lane has an obvious next transaction or negative test, build that before adding another matrix, queue, or status page.
- Public copy over-explaining itself: external readers should see what landed, how to verify it, what broke, and what is next.
- Corporate abstraction replacing requirements: terms like "institutional readiness," "ecosystem maturity," "enterprise adoption," "strategic," "robust," "seamless," "unlock," and "enable" hide the work. Name the actor and requirement instead: exchange integration, wallet signing, custody, accounting, refunds, indexers, docs, support, liquidity, or legal review.

## AI / Agent Coding Failure Modes

Current research does not just say "LLMs hallucinate." The repo should assume these concrete failure classes:

- Premise inheritance: agents keep extending nearby code even when the nearby code carries a bad assumption.
- Missing corner cases: happy-path rows pass while duplicate txids, absent payloads, stale signals, wrong networks, rollbacks, or spent-output conflicts are uncovered.
- Hallucinated local objects: agents name fields, methods, files, scripts, wallet APIs, or artifact rows that fit the pattern but are not actually present.
- Prompt-biased code: agents satisfy the requested shape even when a safer answer is to stop, inspect, or shrink scope.
- Security-by-green-check: generated code can pass functional tests while still weakening secret handling, parsing, shell execution, endpoint IO, replay safety, or wallet submit.

Repo rule: before extending a pattern, inspect the adjacent artifact shape and the negative path. For TN12 that usually means full outpoints, accepted payload bytes, rollback state, wallet-result fingerprints, and exact route/network fields. For Kaspa Explained it means source lane, status label, and a concrete reader-visible claim.

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
- Empirical LLM-code studies: use bug taxonomies and secure-coding benchmarks as checklists for missing corner cases, hallucinated objects, prompt-biased code, buggy-context continuation, and security review gaps.

## Kaspa Daily Q&A Guardrails

- Base of Liquidity is narrative framing. Adoption strategy still needs concrete apps, repeat usage, liquidity, and visible on-chain activity.
- Generic merchant/POS payments are rails. They are not the main 2026 adoption vector. Keep invoice, payload, receipt, and wallet work because those are necessary rails, not because speed alone creates adoption.
- Coordination markets deserve higher priority because they are the founder-highlighted product category. Current repo status: transparent planner and proof-backed prototype slices; Staghunt/Hashdag production infrastructure still needs custody, privacy, solver, settlement, and wallet rails.
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
