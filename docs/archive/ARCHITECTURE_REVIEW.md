# Architecture Review — May 10 2026

**Scope:** Both repos (tn12-covenant-vault-demo + kaspa-explained) as an integrated proof + narrative system

**Finding:** Claim discipline is excellent. Surface-area control needs tightening.

---

## Current State: What's Great

### 1. Claim Discipline (Both Repos)
- Status lanes separate: TN12_ACCEPTED | TN12_REJECTED | SIGNED_NOT_BROADCAST | LOCAL_TEST_ONLY | PLANNER_ONLY | RESEARCH_ONLY | WALLET_POLICY_ONLY | MAINNET_BLOCKED
- TN12 README explicitly states: testnet-only, not a mainnet wallet, not proof Toccata is live
- kaspa-explained CLAIMS.yml forbids overclaims: "Toccata is live," "vProgs are live," "TN12 proofs = mainnet covenants"
- This discipline is the central credibility asset. Better than most crypto repos.

### 2. Real Evidence Shape (tn12-covenant-vault-demo)
- Not just prose. Actual accepted TN12 proof transactions with txids
- Adversarial rejection artifacts (wrong-signer, wrong-selector, wrong-output-lock, wrong-output-amount, single-party cancel)
- Role-separated proof evidence
- Payload-event evidence
- Wallet-submit/request artifacts
- Indexer/checkpoint artifacts
- Proof verification commands (npm run tx:verify, npm run proof:evidence)
- README accepted table names exact primitives, separates positive from rejected paths

### 3. Negative Testing (Strength)
- Most demos show happy paths only
- This one has wrong-signer, wrong-selector, wrong-output-lock, wrong-output-amount rejects
- App-layer negative tests: duplicate pledges, signed-only bids, below-reserve auctions, bad attestations, duplicate access-pass, over-cap treasury, signed-only redemptions
- Shows understanding that app state can be corrupted unless indexer/wallet/app layer rejects it

### 4. Source Hygiene (kaspa-explained)
- Built around status lanes, source hierarchy, plain-language routing
- Anchors status-sensitive claims in code, releases, KIPs, research papers, protocol docs, not community summaries
- Static check validates pages, canonical URLs, sitemap, skip links, OpenGraph metadata, nav wiring, local anchors, claim consistency
- Runs on push, pull request, weekly schedule
- Right architecture for fast-moving protocol area

### 5. Strategic Direction (tn12-covenant-vault-demo)
- Current roadmap: focus on three verticals, not twenty fake apps
  - invoice/receipt app
  - escrow/assurance app
  - attestation/agent/prediction/coordination simulator
- Correct. Repo has too many lanes now, but roadmap already contains cure.

---

## Current Weaknesses

### 1. tn12-covenant-vault-demo Is Artifact-Heavy and Noisy (Highest Risk)

Files: SESSION_*, *_STATUS, *_PLAN, MEMORY, NEXT_SPRINT, CODEX_PARALLEL_WORK, CODEX_HANDOFF_TASKS, etc.

**Why it matters:** Useful for agent continuity, but makes public repo feel like a generated state dump. Hard to audit. Hard for external builders to find signal.

**Fix:**
- Split public surfaces into:
  - README.md: current claims, verify commands, current blockers only
  - docs/PROOF_INDEX.md: accepted/rejected proof evidence table
  - docs/BUILDER_LESSONS.md: SDK, wRPC, payload, computeBudget, sigOpCount lessons
  - artifacts/: machine-readable evidence only
  - docs/archive/YYYY-MM-DD/: old session docs (or delete after summarized)
  - docs/HANDOFF.md: current agent state (internal only, not public)

**Result:** Repo becomes a proof package with a lab notebook attached, not a lab notebook pretending to be a proof package.

---

### 2. Script Surface Too Large (package.json)

**Current:** Dozens of commands (contract compile, funding drafts, spend drafts, payload verify, wallet connector, indexer, invoice, escrow, treasury, auction, DeFi, prediction, stable-value, agent, rollup, project queue, etc.)

**Why:** Shows work, but cognitive load is too high.

**Fix:**
- Group commands under:
  - `npm run help` — command index
  - `npm run check:all` — local gates
  - `npm run check:tn12` — live TN12 gates
  - `npm run proofs:verify` — verify all accepted txids
  - `npm run wallet:review` — wallet lanes
  - `npm run indexer:verify` — indexer lanes
  - `npm run app:payloads` — payload apps
  - `npm run project:queue` — next work
- Hide long specialist commands in scripts/commands/*.mjs or docs/COMMANDS.md

**Result:** Public CLI surface is clean. Specialist commands are discoverable but not dominant.

---

### 3. check.mjs Is Doing Too Much

**Current:** Imports and asserts across vault policy, assurance, payloads, invoices, wallets, escrow, indexer, treasury, auctions, DeFi, prediction, stable-value, agents, project plans, proof evidence.

**Why:** One giant failure surface. If one assertion breaks, whole project check becomes hard to diagnose.

**Fix:** Split into:
- scripts/check-core.mjs — TN12 core primitives
- scripts/check-proofs.mjs — accepted/rejected evidence
- scripts/check-wallet.mjs — wallet/signer lanes
- scripts/check-indexer.mjs — indexer/payload-app lanes
- scripts/check-payload-apps.mjs — invoice, escrow, assurance, etc.
- scripts/check-research-lanes.mjs — DeFi, prediction, coordination, etc.
- scripts/check-negative.mjs — negative test suite
- scripts/check-ui.mjs — UI smoke test

Then `check:all` orchestrates those. Failures self-explain.

**Result:** Failures pinpoint domain. Easier to reason about test health.

---

### 4. .env.tn12 Committed (Portability Risk)

**Current:**
```
KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210
KASPA_WRPC_ENCODING=borsh
KASPA_WASM_MODULE=/home/parker2017/...
```

**Why:** Not a private key leak, but exposes public endpoint, encoding, and local absolute path. Not portable. Trains contributors to commit .env files.

**Fix:**
- Rename to .env.tn12.example
- Add .env* to .gitignore (except explicit examples)
- Move endpoint info to docs/TN12_ENDPOINTS.md
- Keep local paths out of committed config

**Current .gitignore:** Only ignores node_modules/, .local/, logs. Needs expansion.

**Result:** Portable for new contributors. Clear boundary between example config and local secrets.

---

### 5. Too Many Public App Lanes (Strategic Noise)

**Current:** invoice, escrow, treasury, access passes, assets, auctions, DeFi, attestation, agents, coordination markets, ZK, prediction, portfolio, grants, marketplace, wallet/vault, bridges.

**Why:** Fine internally. Publicly, creates "we built twenty things" signal instead of "here are three rails."

**Fix:** Compress public narrative into three buckets:
1. **Money rules:** vaults, escrow, assurance, treasury
2. **Receipts and app state:** invoices, passes, auctions, attestations, agent proofs
3. **Future coordination markets:** prediction/hedge, solver packs, oracle/reporter flows, vProg/based-app direction

Everything else stays under "research lanes" until it attaches to one of those three.

**Result:** Clear product narrative. Focus on what matters first.

---

## Strategic Integration: tn12-covenant-vault-demo + kaspa-explained

### Current Problem
Two repos exist separately. tn12 is a proof lab. kaspa-explained is public education. They should be one system:

Kaspa Explained (vision) → tn12 Covenant Lab (proof) → Artifacts (machine-readable)

### Recommended Public Flow

```
Home (Kaspa Explained)
  ↓
Why Kaspa matters
  ↓
Application layer
  ↓
Builder guide
  ↓
Builder Evidence (NEW PAGE)
  ↓
TN12 Covenant Lab (repo link)
```

### New Page: builder-evidence.html (on kaspa-explained)

**Purpose:** Bridge between public vision and lab proof

**Structure:**

**What this page proves**
- TN12 covenant paths can enforce selected spend rules under testnet conditions
- Payload receipt/indexer rails can create accepted app-state events
- Negative tests show some invalid paths are rejected

**What this page does NOT prove**
- Mainnet Toccata activation
- Audited production contracts
- External wallet support
- Full vProgs
- Production DeFi

**Evidence table**
- Vault recovery
- Delayed withdrawal
- Assurance release/refund
- Escrow release/refund/cancel
- Batch assurance
- Payload events
- Adversarial rejects

**Builder lessons**
- accepted tx verification
- getVirtualChainFromBlockV2
- payload preservation
- computeBudget/sigOpCount
- wallet signer gap
- source outpoint matching

**Links to repo artifacts**
- README proof table
- docs/PROOF_INDEX.md
- artifacts/proof-evidence.json
- artifacts/adversarial/
- fixtures/

---

## Implementation Roadmap

### tn12-covenant-vault-demo Changes

**Phase 1: Clean Up (1 day, blocking)**
1. Rename .env.tn12 → .env.tn12.example
2. Expand .gitignore to exclude .env* (except examples)
3. Create docs/TN12_ENDPOINTS.md with endpoint reference
4. Remove duplicate "External wallet signing" from README

**Phase 2: Documentation Restructure (1 day)**
1. Create docs/PROOF_INDEX.md (index of all accepted/rejected proofs)
2. Create docs/COMMANDS.md (full command reference)
3. Move SESSION_*, *_STATUS, *_PLAN files to docs/archive/YYYY-MM-DD/ (or delete if superseded)
4. Move CODEX_* and MEMORY docs to docs/HANDOFF.md (internal)

**Phase 3: Check Refactor (1 day)**
1. Split check.mjs into check-{core, proofs, wallet, indexer, payload-apps, research, negative, ui}.mjs
2. Update package.json to hide specialist commands
3. Add `npm run help` command index
4. Test that check:all passes

**Phase 4: UI & Artifact Cleanup (0.5 day)**
1. Add provenance fields to all artifacts (generatedBy, generatedAt, inputFiles, inputShas, network, sdkVersion, nodeVersion, commit)
2. Mark public proof boundary in app UI (TN12 testnet only, not mainnet)
3. Keep app UI focused on three verticals: Vault/Safety, Escrow/Commerce, Receipts/App State

### kaspa-explained Changes

**Phase 1: Add Builder Evidence Page (0.5 day)**
1. Create /builder-evidence.html
2. Structure as above (what proves, doesn't prove, evidence table, lessons, links)
3. Add to nav
4. Link from /application-layer.html

**Phase 2: App Layer Cleanup (0.5 day)**
1. Reduce public app lanes in /application-layer.html to three: vault/escrow, receipts, coordination
2. Move other lanes to roadmap/research section
3. Link to builder-evidence.html for concrete proof

**Phase 3: Navigation Sync (0.5 day)**
1. Update all pages' nav to point to builder-evidence
2. Run check-nav-sync.sh
3. Verify no drift

---

## Success Criteria

### tn12-covenant-vault-demo
- ✅ Proof package structure: public artifacts are cleanly separated from lab notebook
- ✅ README reads as current status + verify commands, not state dump
- ✅ check:all is fast, local, and passes
- ✅ check:tn12 is networked, clear, and diagnoses failures by domain
- ✅ .env.tn12 is not committed
- ✅ App UI focuses on three verticals
- ✅ External builder can understand state without agent context

### kaspa-explained
- ✅ builder-evidence.html bridges vision to proof
- ✅ /application-layer.html links to builder-evidence for all claims
- ✅ Public app lanes compressed to three: vault/escrow, receipts, coordination
- ✅ All other lanes marked as roadmap/research
- ✅ CLAIMS.yml updated to reference builder-evidence for sensitive claims
- ✅ Static check passes

---

## What NOT to Change

- ✅ Claim discipline (keep status lanes, forbidden overclaims, source hygiene)
- ✅ Adversarial test shape (reject evidence matters)
- ✅ CONTENT_BRIEF.md voice (concrete first, technical second, no hype)
- ✅ Negative testing (keep wrong-signer, wrong-selector, wrong-output evidence)

---

## Why This Matters

Right now:
- tn12 reads: "I explored every possible Kaspa app lane"
- kaspa-explained reads: "Here are a lot of concepts"

After:
- tn12 reads: "Here is credible proof of three things"
- kaspa-explained reads: "Here is the vision. Here is the proof. Here is the boundary."

That is much stronger. It is the difference between a lab and a product.
