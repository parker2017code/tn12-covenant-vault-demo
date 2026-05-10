# Codex Handoff — May 10 2026

**Context:** Claude is handed off due to token limits. This document lists all remaining work.

**Status:** Escrow lane 95% complete for TN12 proof-core; not a mainnet deployment percentage.

---

## IMMEDIATE TASK: Fix Check Gate (15 min)

**Current Blocker:** `npm run check:all` fails with status mismatch

```
AssertionError: Expected 'endpoint-runbook-ready-to-test' 
              but got 'endpoint-runbook-live-tested-no-promotion'
```

**File:** `artifacts/virtual-chain-endpoint-runbook.json` line ~5
**Fix:** Verify the `status` field matches what `check.mjs:1235` expects
**Command:** `npm run check:all` — should pass after fix

---

## PARALLEL TRACKS (Non-Blocking, All Independent)

### Track 1: Access Pass Gates (2-3 days)
- **Files to create:**
  - `scripts/build-access-pass-gates.mjs` — Duplicate/expiry gate logic
  - `scripts/test-access-pass-negative.mjs` — Negative test cases
  - `artifacts/access-pass-negative-cases.json` — Test matrix
- **Gate to add:** `check:access-pass`
- **Success:** All negative tests fail as expected, accepted payload still passes

### Track 2: Treasury Spend Caps (2-3 days)
- **Files to create:**
  - `scripts/build-treasury-spend-caps.mjs` — Role-based cap enforcement
  - `scripts/test-treasury-limits.mjs` — Boundary tests
  - `artifacts/treasury-payroll-template.json` — Payroll draft
- **Gate to add:** `check:treasury`
- **Success:** Over-cap rejected, under-cap accepted, roles separated

### Track 3: Auction Custody Design (Design Only, 3 days)
- **Files to create:**
  - `artifacts/auction-custody-design-spec.json` — Design decisions
  - `artifacts/auction-atomic-exchange-spec.json` — Contract spec
  - `docs/AUCTION_SETTLEMENT_LOGIC.md` — Walkthrough
- **No code yet** — Pure specification
- **Success:** Spec chosen (escrow-based vs covenant vs multisig), atomic rules documented

### Track 4: Coordination Market Spec (Design Only, 3 days)
- **Files to create:**
  - `artifacts/coordination-market-custody-spec.json` — Custody model
  - `artifacts/stag-game-settlement-flow.json` — Game flows with moves
  - `artifacts/intendo-commitment-spec.json` — Commitment enforcement
- **No code yet** — Pure design
- **Success:** Custody model chosen, settlement atomicity proven, game flows documented

### Track 5: DeFi Oracle Research (5-7 days, Research)
- **Files to create:**
  - `docs/ORACLE_CONSENSUS_GATE.md` — Gate design
  - `artifacts/stable-value-oracle-spec.json` — Price feed spec
  - `artifacts/oracle-failure-modes.json` — What breaks, how to recover
- **Research only** — No production code
- **Success:** Consensus mechanism defined, stable-value model clear, failure modes documented

### Track 6: Negative Test Coverage (2-3 days)
- **Files to create:**
  - `scripts/test-escrow-negative.mjs` — Escrow attack vectors
  - `scripts/test-batch-negative.mjs` — Batch-assurance edge cases
  - `scripts/test-wallet-negative.mjs` — Wallet submission attacks
  - `artifacts/negative-test-matrix.json` — All test cases
- **Gate to add:** `check:negative-extended`
- **Success:** All negative tests fail as expected, legitimate inputs still pass

### Track 7: Documentation & Operator Guides (2-3 days)
- **Files to create:**
  - `docs/ESCROW_OPERATOR_GUIDE.md` — Step-by-step escrow use (release/refund/cancel)
  - `docs/BATCH_ASSURANCE_OPERATOR_GUIDE.md` — Campaign management
  - `docs/WALLET_SUBMIT_OPERATOR_GUIDE.md` — Review + submit flows
- **No gates** — Pure documentation
- **Success:** Clear step-by-step flows with examples, error handling documented

---

## Schedule Priority

**By End of Week 1:**
1. Fix check gate (immediate)
2. Access Pass gates (parallel with others)
3. Treasury spend caps (parallel)
4. Auction custody spec (parallel, low effort)
5. Coordination market spec (parallel, low effort)
6. Negative test coverage (after escrow proven)
7. Full operator documentation (after all gates working)

---

## What's Ready for You (No New Dependencies)

- Escrow covenant UTXO: `64b68f1cc61acc1197198e67bf0c49130db9a43dead1d94823f81b487a5707a3:0`
- Fixture: `fixtures/RoleEscrowContractOutpoint.json` (updated, TN12 accepted)
- Settlement paths: 3 signed drafts (release/refund/cancel) ready in `artifacts/signed-drafts/`
- Proven: Role-based access control, output constraints, covenant validation

---

## What NOT to Start Yet

- ❌ Auction implementation (wait for custody spec + approval)
- ❌ Batch-assurance broadcast (depends on fixture being finalized)
- ❌ Coordination market full implementation (wait for spec + design approval)
- ❌ External signer wire (wait for wallet gates passing)

---

## Next Phase (After Week 1 Gates)

1. **You:** Wire KasWare external signer integration
2. **You:** Implement auction settlement using chosen custody model
3. **You:** Implement coordination market settlement from spec
4. **You:** Full E2E integration testing across all lanes
5. **Claude:** Back for E2E verification and final hardening

---

**Codex: All yours. No blockers. Go.**
