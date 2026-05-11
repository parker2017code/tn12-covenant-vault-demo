# TN12 Covenant Lab — Documentation Index

**Complete guide to all project documentation**

---

## Quick Navigation

| Document | Purpose | Time | Status |
|----------|---------|------|--------|
| **README.md** | Project overview | 5 min | START HERE |
| **QUICK_START_WITH_UTXOS.md** | Execute tests (when funded) | 4 hours | Ready to execute |
| **IMPLEMENTATION_READY.md** | What's done, what's blocked | 15 min | Current state |
| **EXECUTION_PLAN.md** | Detailed phase breakdown | 30 min | Planning |

---

## Documentation by Use Case

### "I Just Got Here"
1. **README.md** — What is this project?
2. **IMPLEMENTATION_READY.md** — What's the current status?
3. **FINAL_STATUS_REPORT.md** — What was accomplished?

### "I Have UTXOs, Let's Test"
1. **QUICK_START_WITH_UTXOS.md** — Copy/paste commands
2. **EXECUTION_PLAN.md** — Understand each phase
3. **DEVELOPER_GUIDE.md** — If something goes wrong

### "I Need To Understand The Code"
1. **DEVELOPER_GUIDE.md** — API reference
2. **contracts/** directory — Read the Silverscript
3. **src/** directory — Read the JavaScript modules

### "I Need To Debug Or Troubleshoot"
1. **DEVELOPER_GUIDE.md** — "Troubleshooting" section
2. **QUICK_START_WITH_UTXOS.md** — "Troubleshooting" section
3. **EXECUTION_PLAN.md** — "Contingency Plans" section

---

## Document Directory

### Executive Summaries

**README.md** (Project Overview)
- What TN12 covenant settlement is
- System architecture (3 modules + 3 extensions)
- Quick status (7 txids proven, phases 2-5 ready)
- How to get involved

**FINAL_STATUS_REPORT.md** (Complete Achievements)
- Core TN12 primitives verified
- Infrastructure built and tested
- Smart contracts implemented
- All gates passing
- 12/16 readiness checklist complete
- Timeline to 100% (7 days with UTXO)

**IMPLEMENTATION_READY.md** (Current State)
- What's proven NOW (7 txids with blue scores)
- Phase 1-5 status breakdown
- What requires UTXO funding
- Production readiness checklist
- Exact steps to execute each phase

**EXECUTION_PLAN.md** (Detailed Roadmap)
- Phase readiness matrix
- Exact bash commands for each phase
- Test matrix (15 paths, 27 constraints)
- Validation checkpoints
- Timeline to 100%
- Contingency plans

### How-To Guides

**QUICK_START_WITH_UTXOS.md** (Hands-On Execution)
- Prerequisites checklist
- Step-by-step for Phase 2-5
- Expected outputs for each step
- Verification commands
- Troubleshooting
- Timeline estimates
- Success criteria

**DEVELOPER_GUIDE.md** (Complete API Reference)
- Module documentation
  - External wallet signer
  - Virtual chain sync
  - Virtual chain replayer
  - Auction submission
  - Coordination submission
- Contract reference
  - Escrow settlement
  - Auction settlement
  - Coordination market
- Submission pipelines
- Test & validate commands
- Monitoring patterns
- Troubleshooting

### Status & Context

**STATUS_ENCODING.md** (Semantic Labels)
- What status labels mean
- When to use each label
- Evidence requirements
- Truth table for each status

**CURRENT_REALITY.md** (Honest Assessment)
- Core TN12: 100% proven
- Resubmission: blocked on fresh UTXO
- Extension: blocked on UTXO funding
- Wallet: blocked on KasWare extension
- Details for each blocker

**RESUBMISSION_AND_EXTENSION_READY.md** (Infrastructure Breakdown)
- What was built
- Phase 2-5 status
- Code artifacts created
- What's left
- Timeline estimates

**SESSION_SUMMARY.md** (This Session's Work)
- Starting point
- Work completed
- Infrastructure fixes
- Validation results
- Current state
- Remaining work

---

## Code Documentation

### Smart Contracts

**contracts/Escrow.sil**
- Three entrypoints: release, refund, cancel
- 8 constraints validated
- See: DEVELOPER_GUIDE.md → Escrow Settlement

**contracts/AuctionSettlement.sil**
- Two entrypoints: settleWinningBid, refundIfReserveNotMet
- 6 constraints validated
- See: DEVELOPER_GUIDE.md → Auction Settlement

**contracts/CoordinationMarket.sil**
- Two entrypoints: executeCoordination, timeoutRefund
- 8 constraints validated (3 game types)
- See: DEVELOPER_GUIDE.md → Coordination Market

### JavaScript Modules

**src/externalWalletSigner.mjs** (Transaction Signing)
- `signWithExternalWallet()` — KasWare, hardware, local
- `signWithLocalKey()` — Testing fallback
- `buildSignableTransaction()` — Prepare transactions
- See: DEVELOPER_GUIDE.md → External Wallet Signer

**src/virtualChainSync.mjs** (Consensus Verification)
- `verifyTransactionAccepted()` — Check if tx is accepted
- `getAcceptedTransactionsOnTN12()` — Query by address
- Consensus state derivation
- See: DEVELOPER_GUIDE.md → Virtual Chain Sync

**src/virtualChainReplayer.mjs** (Live Polling)
- `startReplay()` — Begin 5-second polling
- `onAccepted()` — Listener pattern
- `getTransaction()` — Query specific tx
- `deriveAppState()` — Get current state
- See: DEVELOPER_GUIDE.md → Virtual Chain Replayer

**src/auctionSubmission.mjs** (Auction Settlements)
- `submitAuctionSettlement()` — Build and submit
- Reserve price enforcement
- Payment validation
- See: DEVELOPER_GUIDE.md → Auction Submission

**src/coordinationSubmission.mjs** (Coordination Games)
- `submitCoordinationOutcome()` — Game settlement
- Stag Hunt, PD, Pure Coordination
- Payoff calculation
- See: DEVELOPER_GUIDE.md → Coordination Submission

---

## Test & Validation Scripts

### Validation
- `npm run validate:contracts` — 27/27 tests
- `npm run check:tn12` — Full TN12 gate
- `npm run check:all` — All gates
- `npm run check:negative` — Negative test cases

### Testing (Manual)
- `scripts/test-tx-verification-live.mjs` — Verify against TN12
- `scripts/test-submission-handlers.mjs` — Handler logic
- `scripts/e2e-infrastructure-test.mjs` — Full infrastructure

### Dry Runs (Without Funding)
- `scripts/build-phase-2-dry-run.mjs` — What Phase 2 would do
- `scripts/build-phase-5-dry-run.mjs` — What Phase 5 would do

### Dry Run Results
- `artifacts/phase-2-dry-run.json` — Phase 2 simulation
- `artifacts/phase-5-dry-run.json` — Phase 5 simulation

---

## Artifacts (Generated Results)

### Validation Results
- `artifacts/contract-validation-complete.json` — 27/27 tests
- `artifacts/tn12-system-complete-status.json` — System status
- `artifacts/e2e-infrastructure-test.json` — Infrastructure test

### Transaction Records
- `artifacts/AcceptedProofTransactions.json` — 7 proven txids
- `artifacts/RoleSeparatedAcceptedProofTransactions.json` — Role-based proofs

### Documentation
- `artifacts/phase-2-dry-run.json` — Phase 2 simulation
- `artifacts/phase-5-dry-run.json` — Phase 5 simulation
- `artifacts/submission-handlers-test.json` — Handler tests

---

## Reference Sections in Each Document

### IMPLEMENTATION_READY.md
- §1: What's Proven (7 txids)
- §2: Implementation Status (phases 1-5)
- §3: Infrastructure Working Now
- §4: Validation Suite
- §5: Exact Steps to 100%
- §6: Blocker Analysis
- §7: Production Readiness Checklist

### DEVELOPER_GUIDE.md
- §1: Module Reference (5 modules)
- §2: Contract Reference (3 contracts)
- §3: Submission Pipelines (4 flows)
- §4: Test & Validate (commands)
- §5: Monitoring (patterns)
- §6: Troubleshooting (common issues)
- §7: File Structure (directory tree)

### EXECUTION_PLAN.md
- §1: Phase Readiness Matrix
- §2: Exact Execution Steps (Phase 2-5)
- §3: Test Matrix
- §4: Validation Checkpoints
- §5: Timeline to 100%
- §6: Contingency Plans
- §7: Success Criteria

### QUICK_START_WITH_UTXOS.md
- §1: Prerequisites
- §2: Phase 2 (Escrow)
- §3: Phase 5a (Auction)
- §4: Phase 5b (Coordination)
- §5: Phase 4 (Wallet)
- §6: Final Validation
- §7: Troubleshooting

---

## How To Use This Index

1. **New to the project?** Start with README.md
2. **Want current status?** Read IMPLEMENTATION_READY.md
3. **Ready to execute?** Follow QUICK_START_WITH_UTXOS.md
4. **Need details?** Consult DEVELOPER_GUIDE.md
5. **Planning?** Use EXECUTION_PLAN.md
6. **Debugging?** Check troubleshooting sections
7. **Want to understand design?** Read DEVELOPER_GUIDE.md contracts section

---

## Document Relationships

```
README.md
  ├─→ IMPLEMENTATION_READY.md (current state)
  │    ├─→ EXECUTION_PLAN.md (detailed phases)
  │    │    └─→ QUICK_START_WITH_UTXOS.md (execute)
  │    └─→ DEVELOPER_GUIDE.md (API reference)
  ├─→ FINAL_STATUS_REPORT.md (achievements)
  └─→ This file: DOCUMENTATION_INDEX.md (navigation)
```

---

## Search Cheat Sheet

| Question | Document | Section |
|----------|----------|---------|
| "What's the status?" | IMPLEMENTATION_READY.md | §2 |
| "What was accomplished?" | FINAL_STATUS_REPORT.md | §1 |
| "How do I use Module X?" | DEVELOPER_GUIDE.md | §1 |
| "What's Phase 2?" | EXECUTION_PLAN.md | §2 |
| "What do I do when I have UTXOs?" | QUICK_START_WITH_UTXOS.md | §2-5 |
| "What does status X mean?" | STATUS_ENCODING.md | Entire file |
| "What's actually done vs blocked?" | CURRENT_REALITY.md | Entire file |
| "How do I test locally?" | DEVELOPER_GUIDE.md | §4 |
| "What's the timeline?" | EXECUTION_PLAN.md | §5 |
| "Something failed, help!" | QUICK_START_WITH_UTXOS.md | §7 |

---

## Keeping Documentation Up To Date

When things change:

1. **New feature added?** → Update DEVELOPER_GUIDE.md
2. **Status changes?** → Update IMPLEMENTATION_READY.md
3. **Phase completed?** → Update FINAL_STATUS_REPORT.md
4. **Blocker resolved?** → Update CURRENT_REALITY.md
5. **New bug found?** → Add to troubleshooting sections

All docs use status encoding: SCRIPT_PROVEN_TN12, READY_FOR_FUNDING, etc.

---

**Last Updated:** 2026-05-10  
**Total Documentation:** 1500+ lines across 10 comprehensive guides  
**Status:** Complete and ready for execution

