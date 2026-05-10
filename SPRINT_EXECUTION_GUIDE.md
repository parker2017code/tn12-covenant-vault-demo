# Sprint Execution Guide — Week 1 Status & Next Steps

**Sprint Period:** Week of 2026-05-10  
**Overall Progress:** 45% → Target 60% (5 lanes to advance 15 percentage points)  
**Current Blocker:** TN12 wRPC endpoint WebSocket issues (transaction ready, awaiting RPC stability)

---

## WEEK 1 STATUS: Escrow E2E (In Progress)

### What's Done ✅
- [x] Real escrow funding transaction built from wallet UTXO
- [x] Transaction signed with kaspa-wasm (valid on TN12)
- [x] Settlement fixtures updated with covenant address
- [x] All settlement drafts rebuilt (release/refund/cancel)
- [x] 7/7 proof evidence validated
- [x] All gates passing (check:all, check:negative, check:ui)
- [x] Monitoring script deployed (auto-retry when RPC recovers)
- [x] Post-funding workflow script prepared

### What's Blocked ⏳
- [ ] Escrow funding TX submission (RPC endpoint offline)
- [ ] Get accepted UTXO from TN12
- [ ] Run E2E settlement test

### Funding Transaction Status
```
Artifact: artifacts/escrow-funding-tx.json
Txid (signed): 741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03
Source UTXO: abbaa9618b86ce4129a7cefcdb7b268bbf0867a1d57ee521234fc360a8466ae2:1 (974.99995 TKAS)
Amount: 1 TKAS
Status: signed-ready-for-submission (awaiting RPC)

Monitor: Running in background, checking every 30s, will auto-submit when online
Log: /tmp/rpc-monitor.log
```

### Immediate Action (When RPC Comes Online)
The background monitor will automatically submit the transaction. Once accepted:

```bash
# 1. Fetch escrow UTXO from TN12
node scripts/post-escrow-funding-workflow.mjs 741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03

# 2. Rebuild settlements with new UTXO
npm run escrow:action-map
npm run campaign:settlement-drafts
npm run auction:settlement-drafts

# 3. Validate all gates
npm run check:all

# 4. Proceed to batch-assurance broadcast
npm run campaign:broadcast-settlement
```

---

## WEEK 2 PLAN: Batch-Assurance + Wallet External-Signer (Blocked on Week 1)

### Batch-Assurance Mutual-Exclusivity (1-2 days)
**Goal:** Prove only one settlement path (release or refund) can spend outputs

**Prerequisites:**
- Escrow funding accepted on TN12
- New escrow UTXO obtained and fixture updated
- Settlement drafts rebuilt with real UTXO

**Steps:**
1. Choose settlement path: release or refund 1/2/3
2. Broadcast via TN12 submit console
3. Verify mutual exclusivity (only one output spends)
4. Log acceptance evidence

**Status:** Signed, ready to broadcast (drafts in `artifacts/batch-assurance-settlement-drafts.json`)

### Wallet External-Signer Integration (3-4 days)
**Goal:** Wire KasWare or real external wallet signing

**Prerequisites:**
- KasWare extension built (or alternative signer ready)
- Wallet review gates passing (47 draft reviews done)

**Steps:**
1. Load KasWare CDP integration
2. Test signing flow (draft → sign → submit)
3. Validate no local-key submission path
4. Document for production use

**Status:** Review gates built, local-key only (need external signer wiring)

---

## PARALLEL TRACKS (No Dependencies) — For Codex/GPT

These 7 work streams run in parallel, zero blocking dependencies on escrow:

### Track 1: Access Pass Gates (2-3 days)
- Duplicate detection (same pass ID used twice)
- Expiry check (timestamp validation)
- Test with accepted payloads
- **Status:** Ready to start now
- **Expected completion:** Thu 2026-05-13

### Track 2: Treasury Spend Caps (2-3 days)
- Role-key separation (treasurer, auditor, emergency)
- Spend limit enforcement in script
- Test boundary cases
- **Status:** Ready to start now
- **Expected completion:** Thu 2026-05-13

### Track 3: Auction Custody Design (3 days, design only)
- Decide: Escrow-based vs. Covenant-based vs. Multi-sig
- Design atomic exchange contract
- Spec winner determination + refund flows
- **Status:** Ready to start now
- **Expected completion:** Fri 2026-05-14

### Track 4: Coordination Market Spec (3 days, design only)
- Define custody source (escrow, multi-sig, covenant)
- Specify settlement atomicity rules
- Create Stag/Intendo/Pack settlement sketches
- **Status:** Ready to start now
- **Expected completion:** Fri 2026-05-14

### Track 5: DeFi Oracle Research (5-7 days)
- Oracle consensus gate design (N-of-M)
- Stable-value pricing model
- Lending liquidation oracle
- **Status:** Ready to start now
- **Expected completion:** Sat-Sun 2026-05-16-17

### Track 6: Negative Test Coverage (2-3 days)
- Escrow edge cases (malformed, replay, wrong recipient)
- Batch-assurance mutual-exclusivity validation
- Wallet submission attacks
- **Status:** Ready to start now
- **Expected completion:** Fri 2026-05-14

### Track 7: Operator Documentation (2-3 days)
- Escrow merchant/freelancer guide
- Batch-assurance campaign manager guide
- Wallet submit console operator handbook
- **Status:** Ready to start now
- **Expected completion:** Fri 2026-05-14

---

## COMPLETION ROADMAP

| Lane | Week 1 Target | Week 2 Target | Week 3 Target | Week 4 Target | Overall Target |
|------|---------------|---------------|---------------|---------------|-----------------|
| **Escrow** | Funded → Live | E2E validated | - | - | 95% |
| **Batch-Assurance** | Ready to broadcast | Mutual-exclusive proved | - | - | 85% |
| **Wallet** | - | External-signer wired | Tested | - | 80% |
| **Access Pass** | - | Gates passing | - | - | 75% |
| **Treasury** | - | Spend caps enforced | - | - | 70% |
| **Auction** | - | - | Custody designed, atomic exchange drafted | - | 70% |
| **Coordination** | - | - | - | Spec ready | 30% |
| **DeFi/Oracle** | - | - | - | Research complete | 25% |

**Build-Now Rails:** 60% → 75% (Week 1-2)  
**Research Rails:** 20% → 25% (Week 2-4)  
**Overall:** 45% → 60% (4 weeks)

---

## DECISION POINTS

### 1. Escrow Funding (This Week)
- **Decision:** Submit when RPC stable (monitor running)
- **Timeline:** ASAP when endpoint online
- **Action:** Monitor will auto-submit; if manual needed, use `KASPA_WRPC_URL=... node scripts/submit-escrow-funding.mjs ... --submit`

### 2. Batch-Assurance Path (Week 2)
- **Decision:** Release or Refund 1/2/3?
- **Recommendation:** Release (simpler proof, same complexity)
- **Timeline:** After escrow funding accepted
- **Action:** `npm run campaign:broadcast-settlement` with chosen path

### 3. Auction Custody Model (Week 3)
- **Decision:** Escrow-based vs. Covenant-based vs. Multi-sig?
- **Recommendation:** Escrow-based for speed
- **Timeline:** After batch-assurance succeeds
- **Action:** Design via `artifacts/auction-custody-design-spec.json`

### 4. Wallet External-Signer (Week 2-3)
- **Decision:** KasWare CDP vs. Stub vs. Real wallet?
- **Recommendation:** KasWare if extension ready, else stub
- **Timeline:** Parallel with batch-assurance
- **Action:** Wire `scripts/wallet-external-signer-integration.mjs`

---

## MONITORING

### RPC Endpoint Status
- **Monitor process:** `node scripts/monitor-rpc-and-submit.mjs`
- **Status file:** `/tmp/rpc-monitor.log`
- **Current status:** Checking every 30s, will auto-submit when online
- **Check status:** `tail -20 /tmp/rpc-monitor.log`

### Proof Evidence
- **View all proofs:** `npm run proof:evidence`
- **Current:** 7/7 accepted
- **Next:** 8/8 when escrow funding succeeds

### Gate Status
- **Full validation:** `npm run check:all`
- **Current:** All passing
- **Monitor:** Runs before any submission

---

## GIT STATUS & COMMITS

### Latest Commits (This Session)
```
[commit hashes from SESSION_COMPLETE.md]
- Refresh TN12 endpoint probe
- Update escrow fixture with real UTXO
- Add escrow funding transaction
- Add submission scripts and monitoring
```

### Files to Commit (When Sprint Completes)
```
scripts/monitor-rpc-and-submit.mjs       # Auto-retry submission
scripts/post-escrow-funding-workflow.mjs # Post-funding steps
RPC_SUBMISSION_STATUS.md                 # This session's attempts
SPRINT_EXECUTION_GUIDE.md                # This sprint guide
```

---

## NEXT IMMEDIATE ACTIONS

1. **Monitor RPC Recovery** (continuous)
   - Check log: `tail -f /tmp/rpc-monitor.log`
   - Monitor will auto-submit when endpoint online

2. **Prepare Week 2 Work** (while waiting)
   - Review batch-assurance settlement paths
   - Research external signer options (KasWare readiness)
   - Prepare test matrix for mutual-exclusivity

3. **Coordinate with Codex/GPT** (immediately)
   - Send `CODEX_PARALLEL_WORK.md` with 7 tracks
   - Confirm no interdependencies
   - Track completion (expected: Thu-Fri)

---

## SUCCESS CRITERIA (Week 4)

✅ Escrow funding live on TN12 (real UTXO, settled outputs)  
✅ Batch-assurance mutual-exclusivity proven  
✅ Wallet external-signer path wired  
✅ Access pass gates passing  
✅ Treasury spend caps enforced  
✅ Auction custody designed  
✅ Coordination market spec ready  
✅ All parallel tracks complete  
✅ Overall: 55-60% complete

---

**Status:** Escrow signed, ready to broadcast. Background monitor running. No manual action needed until RPC comes online.
