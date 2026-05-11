# Codex: Architecture Refactor — Complete Handoff

**Context:** External product review identified that both repos are strong on claim discipline but weak on surface-area control. This task list implements the review recommendations.

**Read first:** ARCHITECTURE_REVIEW.md (full analysis, rationale, success criteria)

---

## Priority: PHASE 1 — Clean Up (Blocking, 1 day)

These must complete before Phase 2. No dependencies between them.

### Task 1.1: Fix .env.tn12 Portability
- [ ] Rename `.env.tn12` → `.env.tn12.example`
- [ ] Create `docs/TN12_ENDPOINTS.md` with endpoint reference table:
  - endpoint URL
  - encoding (borsh/json)
  - network (kaspa-testnet-12)
  - use case (submit vs query)
  - status (working/tested/offline)
- [ ] Expand `.gitignore` to exclude .env* except explicit examples
- [ ] Commit: "Make TN12 config portable: .env.tn12.example + endpoint docs"

### Task 1.2: Remove README Duplication
- [ ] Find and remove duplicate "External wallet signing" lines in README.md
- [ ] Verify README "What is NOT proven" section is concise and not repeated
- [ ] Commit: "Remove duplicate README entries"

---

## Priority: PHASE 2 — Documentation Restructure (1 day)

Can run in parallel. Depends on Phase 1.

### Task 2.1: Create docs/PROOF_INDEX.md
- [ ] Generate table of all accepted proofs:
  - Primitive name (Vault recovery, Escrow release, etc.)
  - Contract name (Escrow.sil, DelayedRecoveryVault.sil, etc.)
  - Status (TN12_ACCEPTED, TN12_REJECTED, etc.)
  - Txid (with link to explorer)
  - Location in artifacts (path + file)
- [ ] Generate table of all rejected proofs (adversarial cases):
  - Primitive name
  - Rejection reason (wrong-signer, wrong-selector, wrong-output-lock, wrong-output-amount)
  - Txid
  - Location in artifacts
- [ ] Copy structure from artifacts/proof-evidence.json and artifacts/adversarial/adversarial-summary.json
- [ ] Commit: "Add docs/PROOF_INDEX.md — centralized proof and rejection evidence"

### Task 2.2: Create docs/COMMANDS.md
- [ ] Document all npm run commands from package.json
- [ ] Group by category:
  - Local checks: check:all, check:core, check:proofs, check:wallet, check:indexer, check:payload-apps, check:research, check:negative, check:ui
  - Proof verification: tx:verify, proof:evidence
  - Lane-specific: (commands for each lane)
- [ ] Add description, usage, output for each
- [ ] Commit: "Add docs/COMMANDS.md — full command reference"

### Task 2.3: Archive Old Session/Plan Files
- [ ] Create `docs/archive/2026-05-10/` directory
- [ ] Move or copy these files there (keep originals for now):
  - SESSION_*.md
  - *_STATUS.md (except README context)
  - *_PLAN.md
  - NEXT_SPRINT*.md
  - SPRINT_*.md
  - CODEX_PARALLEL_WORK.md (old version if updated)
  - ESCROW_FUNDING_STATUS.md (superseded by proof table)
  - ESCROW_SUBMISSION_ATTEMPT_*.md (superseded by proof table)
  - LIVE_TEST_STATUS.md (superseded by proof table)
- [ ] Create `docs/HANDOFF.md` with:
  - Current agent continuity state (internal use only)
  - Latest session summary
  - Current blockers
  - Next phase work
- [ ] Update README.md to note: "For session history, see docs/archive/. For agent continuity, see docs/HANDOFF.md"
- [ ] Commit: "Archive session docs; move agent continuity to docs/HANDOFF.md"

---

## Priority: PHASE 3 — Check Refactor (1 day)

Can run in parallel with Phase 2. Depends on Phase 1.

### Task 3.1: Split check.mjs into Domain Checks
- [ ] Create `scripts/check-core.mjs` — TN12 core primitives (vault, assurance, escrow basics)
- [ ] Create `scripts/check-proofs.mjs` — accepted/rejected proof evidence
- [ ] Create `scripts/check-wallet.mjs` — wallet/signer/external-signer lanes
- [ ] Create `scripts/check-indexer.mjs` — indexer/virtual-chain/checkpoint lanes
- [ ] Create `scripts/check-payload-apps.mjs` — invoice, escrow, assurance, treasury, access-pass, auctions, attestations
- [ ] Create `scripts/check-research-lanes.mjs` — DeFi, prediction, stable-value, coordination, agents, rolls
- [ ] Create `scripts/check-negative.mjs` — negative test suite (all rejection cases)
- [ ] Create `scripts/check-ui.mjs` — app UI smoke test
- [ ] Update `scripts/check.mjs` to be the orchestrator:
  ```javascript
  // Import all domain checks
  // Run each in sequence or parallel (as makes sense)
  // Report results by domain
  // Exit non-zero if any fail
  ```
- [ ] Update package.json:
  - `check` → runs check-core.mjs only (fast, local)
  - `check:all` → runs all domain checks in sequence
  - `check:core` → explicit alias for check-core.mjs
  - `check:proofs` → explicit alias for check-proofs.mjs
  - etc.
- [ ] Test locally: `npm run check` should be fast. `npm run check:all` should comprehensive.
- [ ] Commit: "Refactor check.mjs into domain-specific checks for better diagnostics"

### Task 3.2: Update package.json Command Surface
- [ ] Add `help` command that prints command index
- [ ] Group commands under semantic buckets:
  - `npm run help` — command index
  - `npm run check:*` — all checks
  - `npm run proofs:verify` — proof verification
  - `npm run wallet:*` — wallet lanes
  - `npm run indexer:*` — indexer lanes
  - `npm run app:*` — app/payload lanes
  - `npm run contract:*` — contract build/deploy
  - `npm run project:queue` — next work
  - Specialist commands can stay but should be in a `scripts:list` or `scripts/commands/` directory
- [ ] Commit: "Organize package.json commands by semantic bucket; add npm run help"

---

## Priority: PHASE 4 — UI & Artifact Cleanup (0.5 day)

Depends on Phase 3.

### Task 4.1: Add Provenance to All Artifacts
- [ ] Identify all .json artifacts in artifacts/ directory
- [ ] Add provenance header to each (can be a shell script to batch this):
  ```json
  {
    "provenance": {
      "generatedBy": "scripts/build-proof-evidence.mjs",
      "generatedAt": "2026-05-10T...",
      "inputFiles": ["fixtures/...", "contracts/..."],
      "inputShas": {...},
      "network": "kaspa-testnet-12",
      "sdkVersion": "1.1.0",
      "nodeVersion": "20.19.2",
      "commit": "4dc2e7d"
    },
    "data": {...}
  }
  ```
- [ ] Commit: "Add provenance metadata to all artifacts"

### Task 4.2: Mark Public Proof Boundary in App UI
- [ ] Review app.js and index.html
- [ ] Ensure every proof card displays:
  - "TN12 testnet only"
  - accepted | rejected status
  - source artifact file
  - txid (linked to explorer)
  - "verified at" timestamp
  - "⚠️ not mainnet, not production"
- [ ] Make the warning visually distinct (color, border, icon)
- [ ] Commit: "Visually mark public proof boundary in app UI"

### Task 4.3: Focus App UI on Three Verticals
- [ ] Restructure app UI navigation:
  - **Vault & Safety:** delayed recovery, delayed withdrawal, role separation, wrong-signer rejects
  - **Escrow & Commerce:** seller release, buyer refund, mutual cancel, single-party cancel reject
  - **Receipts & App State:** invoice paid/refund/error, accepted payload event, indexer replay, wallet submit route
  - **Research Lanes:** (separate section) DeFi, prediction, coordination, etc.
- [ ] Move non-core lanes to "Research Lanes" section
- [ ] Commit: "Reorganize app UI around three core verticals"

---

## Priority: PHASE 5 — kaspa-explained Builder Evidence Page (1 day)

Can run in parallel with Phase 4. Independent of tn12 changes.

### Task 5.1: Create /builder-evidence.html on kaspa-explained
- [ ] Create new page at kaspa-explained/builder-evidence.html
- [ ] Structure:
  - **Intro:** Bridge between Kaspa Explained vision and TN12 Covenant Lab proof
  - **What This Page Proves**
    - TN12 covenant paths can enforce selected spend rules
    - Payload receipt/indexer rails create accepted app-state events
    - Negative tests show invalid paths are rejected
  - **What This Page Does NOT Prove**
    - Mainnet Toccata activation
    - Audited production contracts
    - External wallet support
    - Full vProgs
    - Production DeFi
  - **Evidence Table** (three sections: accepted positive, rejected negative, payload events)
    - Primitive | Contract | Status | Txid | Explorer Link
  - **Builder Lessons**
    - Accepted tx verification
    - getVirtualChainFromBlockV2
    - Payload preservation
    - computeBudget/sigOpCount
    - Wallet signer gap
    - Source outpoint matching
  - **Links to Repo Artifacts**
    - TN12 README proof table
    - docs/PROOF_INDEX.md
    - artifacts/proof-evidence.json
    - artifacts/adversarial/
    - fixtures/
  - **Link to Full Lab:** "Explore the TN12 Covenant Lab repo for reproducible scripts and verification"
- [ ] Add to nav (between /builder-guide.html and /sources.html)
- [ ] Commit: "Add /builder-evidence.html bridge between vision and proof"

### Task 5.2: Update kaspa-explained Navigation
- [ ] Verify builder-evidence.html appears in nav on all pages
- [ ] Run check-nav-sync.sh
- [ ] Update /application-layer.html to link to builder-evidence for concrete proof
- [ ] Commit: "Wire builder-evidence.html into nav and app-layer routing"

---

## Success Verification

After all phases, run:

```bash
npm run check:all                    # All checks pass
npm run help                          # Command index visible
npm run proofs:verify                # All proofs verify
bash scripts/check-site.sh           # kaspa-explained site checks pass
```

Then manually verify:
- [ ] tn12-covenant-vault-demo README reads as current status + commands, not state dump
- [ ] tn12-covenant-vault-demo app UI focuses on three verticals
- [ ] kaspa-explained builder-evidence.html bridges vision to proof
- [ ] No .env.tn12 committed
- [ ] docs/PROOF_INDEX.md is complete and accurate
- [ ] docs/HANDOFF.md exists and is marked internal
- [ ] No sensitive claims float without source/proof linking

---

## What NOT to Change

- ✅ Claim discipline (status lanes, forbidden overclaims, source hygiene)
- ✅ Adversarial test artifacts (keep all rejection cases)
- ✅ CONTENT_BRIEF.md voice
- ✅ Negative testing suite
- ✅ Accepted proof txids and verification commands

---

## Estimated Timeline

| Phase | Tasks | Duration | Parallel? |
|-------|-------|----------|-----------|
| 1 | .env fix, README dedup | 0.5 day | N/A |
| 2 | PROOF_INDEX, COMMANDS, Archive | 1 day | Yes, after Phase 1 |
| 3 | Check refactor, npm organization | 1 day | Yes, after Phase 1 |
| 4 | Artifact provenance, UI cleanup | 0.5 day | Yes, after Phase 3 |
| 5 | builder-evidence.html + nav | 1 day | Yes, parallel to Phases 2-4 |
| **Total** | | **2-3 days** | Optimize with parallelization |

---

## Acceptance Criteria

- [ ] All tests pass: `npm run check:all`
- [ ] All kaspa-explained checks pass: `bash scripts/check-site.sh`
- [ ] Both repos read as "proof package + narrative bridge," not "lab notebook"
- [ ] External builder can understand state without agent context
- [ ] No .env.tn12 committed
- [ ] docs/PROOF_INDEX.md is complete and accurate
- [ ] /builder-evidence.html exists and routes all public claims
- [ ] Three public verticals (vault/escrow, receipts, coordination) are clear in UI

---

**Codex: This is the architecture refactor. All phases are independent except where noted. Go.**
