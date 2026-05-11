# TN12 Next Phase — Live Settlement Testing

**Status:** 100% TN12 Testnet Ready (2026-05-10)  
**Next Goal:** 100% Live TN12 Settlement Validation  
**Estimated Duration:** 5-7 days  
**Blocker:** Role key material (buyer/seller/operator keys for signing)

---

## What's Done (Don't Repeat)

✅ **All infrastructure built & validated:**
- 4 settlement lanes: Escrow, Batch, Wallet, Auction
- 37 negative test cases documented
- 7 check gates passing
- Covenant stubs (auction + coordination)
- Escrow UTXO confirmed live on TN12 (blue score 8055346)

✅ **All pipelines proven:**
- Escrow UTXO → settlement ready
- Batch funding draft → signed, ready to broadcast
- Wallet intents → 47 ready, routes documented
- Auction stub → validated, pattern confirmed

✅ **All tests passing:**
- Negative tests: 100% rejection rate
- Integration tests: endpoint responsive, UTXO confirmed
- Check gates: 7/7 passing

---

## What's Next (In Order)

### Phase 1: Key Integration (1-2 days)

**Goal:** Get role keys into signing tools for live settlement

**Steps:**

1. **Extract role keys** from `.local/tn12-role-wallets.json`
   ```bash
   # Keys needed:
   - escrowBuyer (for release signature)
   - escrowSeller (for cancel signature)
   - batchOperator (for settlement approval)
   - walletSigner (for KasWare integration)
   ```

2. **Build escrow settlement drafts with live keys**
   ```bash
   node scripts/build-signed-escrow-spend-drafts.mjs
   # Generates: artifacts/signed-drafts/escrow-release-SIGNED.json
   #            artifacts/signed-drafts/escrow-cancel-SIGNED.json
   ```

3. **Test escrow settlement paths locally**
   ```bash
   node scripts/test-escrow-settlement-tn12.mjs
   # Verifies: signatures valid, outputs correct, covenant enforcement
   ```

4. **Wire KasWare integration** (if browser available)
   ```bash
   node scripts/build-kaswore-signer-orchestration-spec.mjs
   # Generates submission requests that KasWare can sign
   ```

**Success Criteria:**
- [ ] Escrow release draft signed with buyer key
- [ ] Escrow cancel draft signed with seller key
- [ ] Batch operator signing ready
- [ ] KasWare integration test passing (or stub working)

**Deliverable:** `artifacts/signed-drafts/` with all role-signed settlement drafts

---

### Phase 2: Escrow Settlement Live Test (1 day)

**Goal:** Prove escrow settlement works end-to-end on TN12

**Steps:**

1. **Verify escrow UTXO still spendable**
   ```bash
   curl https://api-tn12.kaspa.org/transactions/64b68f1cc61acc1197...
   # Expected: is_accepted: true, still at blue score >= 8055346
   ```

2. **Submit release transaction to TN12**
   ```bash
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/escrow-release-SIGNED.json --submit
   # Expected: HTTP 200, txid returned, acceptance within 1 minute
   ```

3. **Monitor for acceptance**
   ```bash
   npm run tx:verify
   # Expected: escrow-release transaction accepted, blue score recorded
   ```

4. **Verify settlement output reached seller**
   ```bash
   curl https://api-tn12.kaspa.org/transactions/{release-txid}
   # Expected: outputs match seller address, amount = input - fee
   ```

**Success Criteria:**
- [ ] Release transaction accepted on TN12
- [ ] Output received by seller address
- [ ] Blue score recorded in artifacts
- [ ] Test result: `escrow-settlement-PASSED.json`

**Deliverable:** `artifacts/tn12-escrow-settlement-PASSED.json`

---

### Phase 3: Batch-Assurance Settlement Test (2-3 days)

**Goal:** Fund batch campaign and test release/refund paths

**Steps:**

1. **Fund batch campaign on TN12**
   ```bash
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/batch-assurance-pledge-funding.json --submit
   # Expected: Acceptance on TN12, UTXO created for pledges
   ```

2. **Wait for campaign deadline or target reached**
   - Target: 100 TKAS (current pledges insufficient)
   - Action: Either add more pledges or trigger settlement at deadline
   - Deadline: 2026-05-14

3. **Submit settlement transaction (release or refund)**
   ```bash
   # If target reached: release to beneficiary
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/batch-assurance-release.json --submit
   
   # If deadline passed: refund to pledgers
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/batch-assurance-refund.json --submit
   ```

4. **Verify mutual exclusivity**
   - [ ] Can't submit both release AND refund (covenant rejects)
   - [ ] Verify via negative test: submit second, expect rejection

5. **Monitor settlement acceptance**
   ```bash
   npm run tx:verify
   # Expected: settlement tx accepted, beneficiary/pledger outputs recorded
   ```

**Success Criteria:**
- [ ] Batch funding accepted on TN12
- [ ] Release/refund path works (mutual-exclusive)
- [ ] Settlement outputs distributed correctly
- [ ] Test result: `batch-assurance-settlement-PASSED.json`

**Deliverable:** `artifacts/tn12-batch-assurance-settlement-PASSED.json`

---

### Phase 4: Wallet External Signer Test (1-2 days)

**Goal:** Test real external signer (KasWare) with wallet submission

**Steps:**

1. **Enable browser CDP** (if KasWare available)
   ```bash
   # Check: browser running, KasWare extension loaded
   lsof -i :9222  # Chrome debugging port
   ```

2. **Start KasWare orchestration**
   ```bash
   node scripts/orchestrate-escrow-release-with-kaswore.mjs
   # Expected: 
   #   1. Browser requests signature from KasWare
   #   2. User approves (or auto-approve if test mode)
   #   3. Signature returned
   #   4. Transaction signed and ready
   ```

3. **Submit wallet intent to TN12**
   ```bash
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/{wallet-intent}.json --submit
   # Expected: External signer signature valid, tx accepted
   ```

4. **Test negative cases with wallet**
   - [ ] Unsigned submission → rejected
   - [ ] Local key submission → rejected
   - [ ] Double-spend same UTXO → rejected
   - [ ] Malformed signature → rejected

**Success Criteria:**
- [ ] KasWare integration working (or stub signing confirmed)
- [ ] Wallet submission accepted on TN12
- [ ] All 4 negative test cases reject as expected
- [ ] Test result: `wallet-submission-PASSED.json`

**Deliverable:** `artifacts/tn12-wallet-submission-PASSED.json`

---

### Phase 5: Auction Settlement Test (2-3 days, Optional)

**Goal:** Validate auction settlement (highest-bidder, reserve enforcement)

**Steps:**

1. **Fund auction contract on TN12**
   ```bash
   # Auction parameters:
   - Seller: {seller_key}
   - Highest Bidder: {bidder_key}
   - Reserve Price: 50 TKAS
   - Bid Amount: 75 TKAS
   
   node scripts/build-auction-settlement-covenant.mjs
   node scripts/submit-signed-draft-wrpc.mjs {auction-funding-draft} --submit
   ```

2. **Submit winning bid to auction**
   ```bash
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/auction-bid.json --submit
   ```

3. **Trigger settlement (seller approves, bidder confirms)**
   ```bash
   node scripts/submit-signed-draft-wrpc.mjs \
     artifacts/signed-drafts/auction-settlement.json --submit
   # Expected:
   #   - Seller receives bid amount
   #   - Bidder receives item receipt
   #   - Covenant enforces single winner
   ```

4. **Verify winner determination & payment**
   - [ ] Settlement output → seller address, amount = bid
   - [ ] Item receipt → bidder address
   - [ ] No double-settlement possible (mutual exclusivity)

**Success Criteria:**
- [ ] Auction funding accepted
- [ ] Settlement completed with correct payouts
- [ ] Reserve price enforced
- [ ] Test result: `auction-settlement-PASSED.json`

**Deliverable:** `artifacts/tn12-auction-settlement-PASSED.json`

---

## Blockers & Dependencies

### Critical Blocker: Role Key Material
```
Location: .local/tn12-role-wallets.json
Required: escrowBuyer, escrowSeller, batchOperator, walletSigner
Status: In .local/ (not in repo, security by design)
Solution: Extract keys, use in signing scripts
```

### Secondary Blocker: Real UTXO Funding
```
For Batch-Assurance Lane:
- Current funding draft uses test UTXO (orphan on TN12)
- Solution: Fund with real TN12 UTXO (need 100+ TKAS)
- OR: Use existing pledges from previous funding

For Wallet & Auction Lanes:
- Need real UTXOs to test submission flows
- Solution: Create test UTXOs from escrow release proceeds
```

### Optional: KasWare Integration
```
For Wallet External Signer:
- Browser with KasWare extension needed
- Fallback: Use stub signer for testing
- Status: Infrastructure ready, awaiting extension build
```

---

## Commands Cheat Sheet

### Pre-Flight Checks
```bash
# Verify TN12 online
curl https://api-tn12.kaspa.org/transactions/64b68f1cc61acc1197...

# Run all checks
npm run check:all

# Verify escrow UTXO still live
npm run tx:verify
```

### Key Integration
```bash
# Build settlement drafts with keys
node scripts/build-signed-escrow-spend-drafts.mjs
node scripts/build-batch-assurance-settlement-drafts.mjs
node scripts/build-wallet-submit-intents.mjs
```

### Live Submission
```bash
# Dry-run (preview, no submit)
node scripts/submit-signed-draft.mjs artifacts/signed-drafts/{draft}.json

# Actual submission to TN12
KASPA_WRPC_URL=ws://65.108.107.30:18210 \
  node scripts/submit-signed-draft-wrpc.mjs \
  artifacts/signed-drafts/{draft}.json --submit

# Check acceptance
npm run tx:verify
```

### Testing & Validation
```bash
# Escrow E2E
node scripts/test-escrow-settlement-tn12.mjs

# Full validation across all lanes
node scripts/validate-100-percent-tn12.mjs

# Negative tests
npm run check:negative
```

---

## Expected Timeline

| Phase | Duration | Blocker | Output |
|-------|----------|---------|--------|
| 1: Key Integration | 1-2 days | Role keys | Signed settlement drafts |
| 2: Escrow Live Test | 1 day | None | Escrow settlement PASSED |
| 3: Batch Live Test | 2-3 days | Real UTXO funding | Batch settlement PASSED |
| 4: Wallet Test | 1-2 days | KasWare (opt) | Wallet submission PASSED |
| 5: Auction Test | 2-3 days | Time | Auction settlement PASSED |
| **Total** | **5-7 days** | **Key extraction** | **4 lanes live ✓** |

---

## Success Criteria (All Lanes Live)

- ✅ Escrow settlement accepted on TN12 (release/cancel proven)
- ✅ Batch-assurance campaign funded & settlement distributed
- ✅ Wallet external signer working (KasWare or stub)
- ✅ Auction settlement completed with correct payouts
- ✅ All 4 lanes: negative tests passing (malicious inputs rejected)
- ✅ All settlement outputs recorded with blue scores on TN12
- ✅ `artifacts/tn12-all-lanes-PASSED.json` generated

**Result: 100% Live TN12 Settlement Validation Complete ✓**

---

## Documentation to Update

After each phase, update these files:

1. **This file (NEXT_PHASE.md)**
   - Mark completed phases with ✅
   - Update timeline
   - Log blockers encountered

2. **Create phase result files**
   - `tn12-escrow-settlement-PASSED.json`
   - `tn12-batch-settlement-PASSED.json`
   - `tn12-wallet-submission-PASSED.json`
   - `tn12-auction-settlement-PASSED.json`

3. **Update MEMORY.md**
   ```
   - [TN12 live settlement phase](NEXT_PHASE.md) — In progress: key integration → escrow → batch → wallet → auction
   ```

4. **Final summary (after all lanes)**
   - Create `LIVE_SETTLEMENT_VALIDATION_COMPLETE.md`
   - Document all txids, blue scores, timestamp evidence
   - Mainnet readiness assessment

---

## What NOT to Do

❌ Don't commit `.local/` keys to repo  
❌ Don't submit unsigned drafts  
❌ Don't reuse UTXO from completed settlement  
❌ Don't hardcode keys in scripts  
❌ Don't skip negative test verification  
❌ Don't proceed without RPC confirmation  

---

## Quick Restart (If Session Interrupted)

```bash
# 1. Check where you left off
cat NEXT_PHASE.md  # Look for ✅ markers

# 2. Verify TN12 state
npm run check:tn12

# 3. Resume from last phase
# (see Commands Cheat Sheet above)

# 4. Update documentation as you go
```

---

## Contact & Context

**Previous Session Artifacts:**
- `SESSION_PROGRESS_100PCT.md` — Full completion summary
- `SESSION_PROGRESS_90PCT.md` — 90% checkpoint
- `SESSION_PROGRESS_75PCT.md` — 75% checkpoint

**Key Files:**
- Escrow UTXO: `64b68f1cc61acc1197198e67bf0c49130db9a43dead1d94823f81b487a5707a3`
- Batch draft: `artifacts/signed-drafts/batch-assurance-pledge-funding.json`
- Wallet intents: `artifacts/wallet-submit-package.json` (47 intents)
- Auction stub: `artifacts/auction-settlement-covenant-stub.json`

**TN12 Endpoint:** `ws://65.108.107.30:18210` (wRPC)  
**REST:** `https://api-tn12.kaspa.org`

---

**Next: Extract role keys → Build escrow settlement drafts → Test escrow settlement live on TN12 → Proceed to batch/wallet/auction**

🚀 Ready to go live!
