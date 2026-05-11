# Codex/GPT Parallel Work — Non-Blocking Tasks

**Your Work This Week:** Escrow funding live (Mon-Fri)  
**Codex/GPT Can Do:** Everything below, in parallel (no blocking dependencies)

---

## PARALLEL TRACK 1: Access Pass Gates (2-3 Days)

### What to Build
- Duplicate detection gate (same pass ID used twice)
- Expiry check gate (timestamp validation)
- Negative test cases (malformed, expired, duplicates)

### Files to Create
- `scripts/build-access-pass-gates.mjs` — Gate enforcement logic
- `scripts/test-access-pass-negative.mjs` — Negative test suite
- `artifacts/access-pass-negative-cases.json` — Test cases with expected failures

### Why Non-Blocking
- Doesn't depend on escrow funding success
- Uses existing accepted payloads in fixtures
- Can validate independently

### Success Criteria
- All negative tests fail as expected (duplicate → reject, expired → reject)
- Accepted redemption payload still passes gates
- Output: `check:access-pass` gate added and passing

---

## PARALLEL TRACK 2: Treasury Spend Cap Enforcement (2-3 Days)

### What to Build
- Role-key separation for treasury outputs (treasurer, auditor, emergency)
- Spend limit script enforcement (amount + timelock)
- Payroll template with withdrawal cap validation

### Files to Create
- `scripts/build-treasury-spend-caps.mjs` — Script builder
- `scripts/test-treasury-limits.mjs` — Boundary tests
- `artifacts/treasury-payroll-template.json` — Payroll draft

### Why Non-Blocking
- Reuses vault script logic (already proven)
- Can test locally without TN12
- No dependency on escrow completion

### Success Criteria
- Spend limit enforced in script (reject over-cap, accept under-cap)
- Role keys separated (treasurer can't sign auditor output)
- Output: `check:treasury` gate added and passing

---

## PARALLEL TRACK 3: Auction Custody Design (Design Only, 3 Days)

### What to Build
**NO CODE YET** — Just the specification.

- Decide: Escrow-based vs. Covenant-based vs. Multi-sig custody
- Design atomic exchange contract (seller refund if buyer doesn't pay, buyer refund if seller cancels)
- Spec winner determination (highest bid only, no secondary market)

### Files to Create
- `artifacts/auction-custody-design-spec.json` — Design decision doc
- `artifacts/auction-atomic-exchange-spec.json` — Contract spec
- `docs/AUCTION_SETTLEMENT_LOGIC.md` — Walkthrough

### Why Non-Blocking
- Pure design work, no implementation needed
- Doesn't depend on escrow proof
- Ready for implementation after week 2

### Success Criteria
- Spec chosen and justified
- Atomic exchange rules documented
- Negative cases covered (buyer default, seller cancel, tie bids)

---

## PARALLEL TRACK 4: Coordination Market Custody Spec (Design Only, 3 Days)

### What to Build
**NO CODE YET** — Pure specification.

- Custody source definition (escrow-based, multi-sig, or covenant-based)
- Settlement atomicity rules (how many parties must sign, in what order)
- Stag/Intendo/Pack settlement sketches (game theory flows)

### Files to Create
- `artifacts/coordination-market-custody-spec.json` — Custody design
- `artifacts/stag-game-settlement-flow.json` — Game flow with moves
- `artifacts/intendo-commitment-spec.json` — Commitment enforcement

### Why Non-Blocking
- Pure design, no code needed
- Doesn't depend on any TN12 proofs
- Ready for real implementation in month 2

### Success Criteria
- Custody model chosen and justified
- Settlement atomicity proven (who moves first, how is fairness enforced)
- Game flows documented with role responsibilities

---

## PARALLEL TRACK 5: DeFi Oracle Research (5-7 Days, Research)

### What to Build
**RESEARCH ONLY** — No production code, just exploration.

- Oracle consensus gate design (N-of-M oracle providers)
- Stable-value oracle pricing model (what sources, how often, what reversion)
- Lending liquidation oracle (when to trigger, precision needed)

### Files to Create
- `docs/ORACLE_CONSENSUS_GATE.md` — Gate design
- `artifacts/stable-value-oracle-spec.json` — Price feed spec
- `artifacts/oracle-failure-modes.json` — What breaks, how to recover

### Why Non-Blocking
- Pure research, doesn't block any active work
- Can run fully independent
- Ready for real oracle build in month 2

### Success Criteria
- Consensus mechanism defined (majority? weighted? Byzantine-tolerant?)
- Stable-value pricing model clear (which oracles, update frequency, deviation limits)
- Failure modes documented (oracle outage, price manipulation, stale feeds)

---

## PARALLEL TRACK 6: Test Coverage Expansion (2-3 Days)

### What to Build
- Negative test cases for escrow (malformed signatures, replay attempts, wrong recipient)
- Negative test cases for batch-assurance (broken mutual exclusivity, amount mismatch)
- Negative test cases for wallet (unsigned requests, local-key detection, double-spend)

### Files to Create
- `scripts/test-escrow-negative.mjs` — Escrow attack vectors
- `scripts/test-batch-negative.mjs` — Batch-assurance edge cases
- `scripts/test-wallet-negative.mjs` — Wallet submission attacks
- `artifacts/negative-test-matrix.json` — All test cases (pass/fail expected)

### Why Non-Blocking
- Uses fixtures, doesn't need live RPC
- Can test locally while escrow is broadcasting
- Improves quality gates before week 2 broadcasts

### Success Criteria
- All negative tests fail as expected (bad input → reject)
- All legitimate inputs still pass
- Coverage: 3+ edge cases per settlement path

---

## PARALLEL TRACK 7: Documentation & Operator Guides (2-3 Days)

### What to Build
- Escrow merchant/freelancer operation guide (how to use release/refund/cancel)
- Batch-assurance campaign manager guide (how to fund pledges, trigger settlement)
- Wallet submit console operator handbook (review checklist, submit procedures)

### Files to Create
- `docs/ESCROW_OPERATOR_GUIDE.md` — Step-by-step escrow use
- `docs/BATCH_ASSURANCE_OPERATOR_GUIDE.md` — Campaign management
- `docs/WALLET_SUBMIT_OPERATOR_GUIDE.md` — Review + submit flows

### Why Non-Blocking
- Pure documentation, no code impact
- Can write in parallel with development
- Helps with week 2 testing

### Success Criteria
- Clear step-by-step flows (no assumptions about user knowledge)
- Screenshots/examples where helpful
- Error handling documented (what to do if submission fails, etc.)

---

## WORK ALLOCATION MATRIX

| Track | Effort | Duration | Start | Done By | Blocker? |
|-------|--------|----------|-------|---------|----------|
| Access Pass Gates | Medium | 2-3 days | Now | Thu | No |
| Treasury Spend Caps | Medium | 2-3 days | Now | Thu | No |
| Auction Custody (Spec) | Low | 3 days | Now | Fri | No |
| Coordination Custody (Spec) | Low | 3 days | Now | Fri | No |
| DeFi Oracle Research | Low-Medium | 5-7 days | Now | Sat | No |
| Negative Test Coverage | Medium | 2-3 days | Wed | Fri | No |
| Documentation | Low | 2-3 days | Thu | Fri | No |

---

## WHAT NOT TO START YET

### Blocked by Escrow Funding Success
- ❌ Auction implementation (needs custody design, then escrow-based logic)
- ❌ Batch-assurance broadcast (depends on funding success)
- ❌ Coordination market settlement (depends on auction custody)
- ❌ External signer wire (depends on wallet review gates passing)

### Blocked by Week 2 Completion
- ❌ Coordination market full implementation
- ❌ DeFi oracle live implementation
- ❌ Bridge/ZK anchor build

---

## RECOMMENDED CODEX SCHEDULE

### Mon-Wed (While You Do Escrow Funding)
- Access Pass duplicate + expiry gates
- Treasury spend cap enforcement
- Auction custody design spec
- Coordination market spec (pure design)

### Wed-Thu (You Finish Escrow, They Continue)
- Negative test coverage (escrow, batch, wallet)
- DeFi oracle research

### Fri (All Together)
- You: Escrow E2E complete, fixtures updated, settlement verified
- Them: All gates passing, specs ready, tests comprehensive

---

## Success Outcome

### By End of Week 1
- Escrow funding LIVE on TN12 (You) ✅
- Access Pass gates working (Codex) ✅
- Treasury spend caps enforced (Codex) ✅
- Auction custody specified (Codex) ✅
- Coordination market spec complete (Codex) ✅
- Comprehensive negative tests (Codex) ✅
- Full operator documentation (Codex) ✅

**Overall:** 7 independent work streams, 0 blocking dependencies, 100% of week 1 plan complete.

---

## Handoff Points

**You → Codex (Monday after escrow funding succeeds):**
- New UTXO details from TN12
- Updated fixture path
- Gate format expectations
- Test harness examples

**Codex → You (Thursday EOD):**
- All specs ready for week 2 builds
- All negative tests ready for validation
- Documentation ready for operational testing

---

**Codex can start immediately. No blocking dependencies. All work is additive, non-interfering.**
