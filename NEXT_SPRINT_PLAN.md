# Next Sprint Plan: 45% → 60% Overall

**Current State:** 45% complete (60% on build-now rails, 20% on research)  
**Target:** 55-60% overall (push build-now to 75%, maintain research)  
**Horizon:** 2-3 weeks

---

## Strategic Priorities

### Tier 1: Proof Completion (High ROI)
These lanes have 70-90% infrastructure. Finishing them moves the needle.

#### 1.1 Escrow E2E Live (THIS WEEK)
- **Current:** Signed, awaiting RPC
- **Action:** Submit funding TX → Get real UTXO → Run settlement test
- **Outcome:** First live merchant/freelancer marketplace settlement on TN12
- **Time:** 1-2 days
- **Impact:** Closes escrow lane to ~95% complete

#### 1.2 Batch-Assurance Mutual Exclusivity (WEEK 2)
- **Current:** Signed drafts (1 release + 3 refunds), custody outputs on TN12
- **Action:** Broadcast settlement path → Verify only one output spends
- **Outcome:** Proves custody + mutual-exclusive settlement works
- **Time:** 1-2 days
- **Impact:** Closes batch-assurance lane to ~85% complete

#### 1.3 Wallet Submit Console → External Signer (WEEK 2-3)
- **Current:** Review gate built (47 signed drafts), but local-key only
- **Action:** Wire real wallet adapter (KasWare or real external signer)
- **Outcome:** Proves no-local-key submission path
- **Time:** 3-4 days
- **Impact:** Closes wallet lane from 60% → 80%

---

### Tier 2: Adjacent Proof Lanes (Medium ROI)
These have 40-60% infrastructure. One solid push completes them.

#### 2.1 Access Pass Redemption (WEEK 2)
- **Current:** Issuer model, accepted payload
- **Action:** Build duplicate + expiry gate, test against accepted payloads
- **Outcome:** Coupons/passes ready for merchant use
- **Time:** 2-3 days
- **Impact:** Closes access-pass lane to ~75%

#### 2.2 Treasury Spend Caps (WEEK 3)
- **Current:** Payroll templates, constrained drafts drafted
- **Action:** Build role-key separation, enforce spend limits in script
- **Outcome:** Usable team vault with withdrawal caps
- **Time:** 2-3 days
- **Impact:** Closes treasury lane to ~70%

#### 2.3 Auction Custody + Atomic Exchange (WEEK 3-4)
- **Current:** Settlement drafts, planner state accepted
- **Action:** Design escrow-based or covenant-based custody, test winner path
- **Outcome:** Auction settlement completes buyer/seller flows
- **Time:** 3-4 days
- **Impact:** Closes auction lane to ~70%

---

### Tier 3: Research to Prototype (Lower priority, but visible)

#### 3.1 Coordination Markets — Custody Design (Week 4+)
- **Current:** Transparency model, settlement framework designed
- **Action:** Define custody source (escrow, multi-sig, or covenant)
- **Outcome:** Spec-ready for Stag/Intendo test
- **Time:** 3-5 days (design only)
- **Impact:** Unblocks coordination market lane

#### 3.2 DeFi Oracle / Stable-Value (Week 4+)
- **Current:** Missing rails matrix, research triggers
- **Action:** Build price-feed consensus gate, stable-value comparison dashboard
- **Outcome:** Simulated stable-value with oracle validation
- **Time:** 5-7 days
- **Impact:** Moves DeFi research from 15% → 35%

---

## Work Breakdown

### WEEK 1 (This Week) — Escrow Live
```
Mon: Submit escrow funding TX
Tue: Fetch accepted UTXO, update fixture
Wed-Thu: Run 6-phase E2E test (draft → KasWare → sign → submit → verify)
Fri: Log settlement acceptance, close escrow lane
```

**Success Metric:** Real escrow settlement TX on TN12 with role-separated payouts.

---

### WEEK 2 — Batch-Assurance + Wallet Signer
```
Mon-Tue: Broadcast batch-assurance settlement (choose release path)
Wed: Verify mutual exclusivity (only 1 output spends)
Thu-Fri: Start wallet external-signer wire (research KasWare integration or real wallet)
```

**Success Metrics:**
- Settlement path accepted on TN12
- Mutual exclusivity proven
- External signer handoff specified

---

### WEEK 3 — Access Pass + Treasury
```
Mon-Tue: Build access-pass duplicate + expiry gate
Wed: Test against accepted redemption payloads
Thu-Fri: Build treasury role-key separation + spend cap enforcement
```

**Success Metrics:**
- Access pass gate passes negative test cases
- Treasury spend limit enforced in script

---

### WEEK 4+ — Auction Custody + Research
```
Auction Custody (3-4 days):
  - Decide: Escrow-based vs. covenant-based
  - Build atomic exchange contract
  - Test winner determination + loser refunds
  
Coordination Market Design (3-5 days):
  - Specify custody source
  - Define settlement atomicity rules
  - Create Stag/Intendo test sketch
```

---

## Completion Targets

| Lane | Current | Target | Gap |
|------|---------|--------|-----|
| **Escrow** | 80% | 95% | 2 days |
| **Batch-Assurance** | 70% | 85% | 2 days |
| **Wallet** | 60% | 80% | 4 days |
| **Access Pass** | 50% | 75% | 3 days |
| **Treasury** | 40% | 70% | 3 days |
| **Auction** | 40% | 70% | 4 days |
| **Coordination** | 20% | 30% | 3 days (design) |
| **DeFi/Oracle** | 15% | 25% | 5 days (research) |
| | | | |
| **BUILD-NOW RAILS** | 60% | 80% | **2 weeks** |
| **RESEARCH RAILS** | 20% | 25% | **2 weeks** |
| **OVERALL** | **45%** | **60%** | **3-4 weeks** |

---

## Critical Dependencies

### Must Complete Before Proceeding
1. **Escrow funding acceptance** → Real UTXO unlocks all settlement tests
2. **Wallet external-signer path** → Blocks production readiness for invoice/escrow
3. **Batch-assurance mutual exclusivity proof** → Blocks scaling to multi-pledge campaigns

### Can Run in Parallel
- Access pass gate (independent of escrow)
- Treasury spend caps (uses existing vault logic)
- Auction custody design (parallel with wallet signer work)
- Coordination market spec (parallel, no code needed yet)

---

## Definition of "Done"

### For Each Lane (Before Mark 100%)
- ✅ Accepted TN12 transaction (if proof-required)
- ✅ Signed settlement draft (ready for broadcast)
- ✅ All gates passing (check:all, negative tests)
- ✅ Negative test coverage (malformed, stale, duplicate cases)
- ✅ Documentation (spec + operation guide)

### For Build-Now Rails (60% → 75%)
```
Escrow:           Signed release/refund/cancel + accepted proof
Batch-Assurance:  Accepted custody + mutual-exclusivity proven
Wallet:           External-signer path wired + review gates passing
Access Pass:      Duplicate + expiry gates + accepted payload
Treasury:         Role-key sep + spend-cap enforcement + test coverage
Auction:          Custody designed + atomic exchange drafted
```

---

## Decision Points Ahead

1. **Wallet External Signer** (Week 2 decision)
   - Option A: Wire KasWare CDP integration (harder, more realistic)
   - Option B: Use stub/mock signer (faster, less realistic)
   - **Recommendation:** Start with KasWare if extension build completes, else mock

2. **Auction Custody Model** (Week 3 decision)
   - Option A: Escrow-based (reuses escrow lane)
   - Option B: Covenant-based (new script, more atomic)
   - Option C: Multi-sig (custodian-heavy)
   - **Recommendation:** Escrow-based for speed, covenant-based for elegance

3. **Coordination Markets** (Week 4 decision)
   - Option A: Custody-only prototype (skip settlement)
   - Option B: Full Stag with settlement (3-4 weeks)
   - **Recommendation:** Custody spec only, defer settlement to month 2

---

## Metrics to Track

### Completion
- Lanes at 80%+ (build-now) vs. 50%+ (research)
- Accepted TN12 proofs (target: 9-10 by week 4)
- Signed-not-broadcast drafts (target: 15-18 by week 4)

### Quality
- Gate pass rate (target: 100% before broadcast)
- Negative test coverage (target: 3+ per settlement path)
- External blockers cleared (target: KasWare built, no RPC issues)

---

## Success Criteria (Week 4)

✅ **Escrow:** First live merchant settlement on TN12  
✅ **Batch-Assurance:** Mutual exclusivity proven, 3+ refund paths tested  
✅ **Wallet:** External signer path specified or wired  
✅ **Access Pass:** Duplicate + expiry gates passing  
✅ **Treasury:** Spend caps enforced  
✅ **Auction:** Custody designed, atomic exchange sketched  
✅ **Overall:** 55-60% complete, all build-now rails at 70%+  

---

## Long-Term (Month 2+)

**If 60% is reached by week 4:**
- Coordination market settlement (Stag/Intendo live)
- DeFi oracle consensus gate (for stable-value + lending)
- Bridge/ZK anchor readiness (design phase)
- Mainnet readiness audit (wallet + node + indexer hardening)

---

**Status:** Ready to execute. Escrow funding live this week unblocks everything else.
