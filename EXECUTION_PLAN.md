# TN12 Covenant Lab — Execution Plan to 100%

**Date:** 2026-05-10  
**Current Status:** 100% infrastructure ready, 7 TN12 txids proven  
**Remaining:** 4 phases blocked on external funding

---

## Phase Readiness Matrix

| Phase | Component | Status | Blocker | When Available |
|-------|-----------|--------|---------|---|
| 1 (Core) | 7 TN12 txids | ✅ PROVEN | None | Working now |
| 2 (Resubmission) | Escrow draft builders | ✅ READY | Fresh UTXO + keys | 1-2 days |
| 5a (Auction) | Settlement contract | ✅ READY | Auction UTXO | 1-2 days |
| 5b (Coordination) | Game contract | ✅ READY | Game pool UTXO | 1-2 days |
| 4 (Wallet) | External signer interface | ✅ READY | KasWare extension | 2-3 days |

---

## Exact Execution Steps (When UTXO Available)

### Phase 2: Resubmission (1-2 Days)

**Prerequisite:** Fresh escrow UTXO with accessible buyer/seller keys

```bash
# Day 1: Generate drafts
$ ESCROW_CONTRACT_OUTPOINT=fixtures/FreshEscrowContractOutpoint.json \
  node scripts/build-signed-escrow-spend-drafts.mjs
  # Outputs: release, refund, cancel drafts
  
# Day 1: Submit to TN12
$ node scripts/phase-2-submit-escrow-tn12.mjs
  # Each draft → TN12 → awaits acceptance
  
# Day 1-2: Wait for acceptance (typically < 5 minutes on TN12)
$ npm run tx:verify
  # Polls until all 3 txids show accepted on chain
  
# Result:
✓ Escrow Release txid
✓ Escrow Refund txid  
✓ Escrow Cancel txid
```

**Proof:** 3 new TN12 txids (immutable on explorer)

**What This Proves:** 
- Core escrow settlement paths are reproducible
- Not a one-off success (repeatability validated)
- Fresh UTXO with different keys still works

---

### Phase 5a: Auction Settlement (1-2 Days)

**Prerequisite:** Auction UTXO with seller + bidder keys

```bash
# Day 3: Build auction settlement
$ node scripts/build-auction-settlement.mjs \
  --seller kaspatest:qp2vxrdg3c... \
  --bidder kaspatest:qxxxx... \
  --reserve 500000000 \
  --bid 750000000
  # Outputs: settlement transaction draft
  
# Day 3: Get both signatures
$ node scripts/sign-auction-settlement.mjs \
  --with-seller-key --with-bidder-key
  # Both parties sign agreed settlement
  
# Day 3: Submit to TN12
$ node scripts/submit-auction-settlement.mjs
  # Settlement → TN12 → awaits acceptance
  
# Day 3-4: Verify acceptance
$ npm run tx:verify
  # Polls until auction settlement txid accepted
  
# Result:
✓ Auction Settlement txid
  └─ Seller received: 749,995,000 sompi (bid - fee)
```

**Proof:** Auction settlement on-chain with payment locked to seller

**What This Proves:**
- Reserve price enforcement works
- Mutual signatures validated correctly
- Payment distribution correct

---

### Phase 5b: Coordination Games (1-2 Days)

**Prerequisite:** Game pool UTXO with player1 + player2 keys

```bash
# Day 5: Build coordination settlement (example: Stag Hunt)
$ node scripts/build-coordination-settlement.mjs \
  --game stag-hunt \
  --player1 kaspatest:qp2vxrdg3c... \
  --player2 kaspatest:qxxxx... \
  --pool 1000000000
  # Outputs: settlement transaction with payoff split
  
# Day 5: Both players sign agreed outcome
$ node scripts/sign-coordination-settlement.mjs \
  --player1-key --player2-key --game stag-hunt
  # Both sign same outcome (cooperation/payoff agreement)
  
# Day 5: Submit to TN12
$ node scripts/submit-coordination-settlement.mjs
  # Settlement → TN12 → awaits acceptance
  
# Day 5-6: Verify acceptance  
$ npm run tx:verify
  # Polls until coordination txid accepted
  
# Result:
✓ Stag Hunt game txid
  ├─ Player 1: 500,000,000 sompi
  └─ Player 2: 500,000,000 sompi
```

**Test Other Games Similarly:**
- Prisoner's Dilemma (payoff: 3,3 vs 1,1 vs 0,5)
- Pure Coordination (agreement: 2,2 vs 1,1 vs 0,0)

**Proof:** 3 game settlement txids on-chain with correct payoff distribution

**What This Proves:**
- All game types enforce correct logic
- Payoff calculation accurate
- Timeout refund path works

---

### Phase 4: External Wallet Signing (2-3 Days)

**Prerequisite:** KasWare extension installed and unlocked

```bash
# Day 7: Test KasWare integration
$ node scripts/test-kaswore-signing.mjs
  # Opens browser, KasWare signs test transaction
  # Extracts signature, verifies it's valid
  
# Day 7: Test hardware wallet (if available)
$ node scripts/test-hardware-wallet-signing.mjs \
  --ledger
  # Connects to Ledger, signs transaction
  
# Day 7-8: Full E2E with external wallet
$ node scripts/build-signed-escrow-spend-drafts.mjs \
  --signer kaswore \
  --with-external-wallet
  # Uses KasWare for all signatures
  
# Day 8: Submit wallet-signed txs
$ node scripts/submit-wallet-signed-txs.mjs
  # Each transaction signed by external wallet → TN12
  
# Result:
✓ Wallet-signed escrow txid
✓ Wallet-signed auction txid
✓ Wallet-signed coordination txid
```

**Proof:** Transactions signed by external wallet (keys never in app)

**What This Proves:**
- Key separation works in practice
- External wallets can sign covenant transactions
- Production-ready signing flow

---

## Test Matrix: What Gets Tested

| Phase | Paths/Games | Tests | Expected Txids |
|-------|-------------|-------|---|
| 1 | Vault (2), Batch (2), Escrow (3) | 27 constraints | 7 ✅ |
| 2 | Release, Refund, Cancel | 3 settlement paths | 3 new |
| 5a | Winning Bid, Below-Reserve | 2 settlement paths | 2 new |
| 5b | Stag Hunt, PD, Coordination | 3 game paths | 3 new |
| 4 | KasWare, Hardware | External wallet | 3 new |
| **Total** | **15 paths** | **All constraints** | **21 total** |

---

## Validation Checkpoints

After each phase, verify:

```bash
# Transaction verification
npm run tx:verify
  # Should show: N/N txids accepted

# Proof evidence
npm run proof:evidence
  # Should show: all accepted txids

# Role separation (for applicable phases)
PROOF_FIXTURE=artifacts/RoleSeparated*.json npm run tx:roles:verify
  # Should show: role-based proofs

# Payload events
npm run payload:verify:events
  # Should show: settlement events recorded

# Full gate
npm run check:tn12
  # Should show: all stages pass
```

---

## Timeline to 100%

```
Today (2026-05-10): Infrastructure ready
                    ✓ All code complete
                    ✓ All tests passing
                    ✓ 27/27 constraints validated

+ 1-2 days:  Phase 2 Resubmission (if escrow UTXO available)
             → 3 new escrow txids

+ 1-2 days:  Phase 5a Auction (if auction UTXO available)
             → 2 new auction txids

+ 1-2 days:  Phase 5b Coordination (if game pool UTXO available)
             → 3 new coordination txids

+ 2-3 days:  Phase 4 Wallet Signing (if KasWare available)
             → 3 new wallet-signed txids

Total:       ~7 days to 100% TN12 validation
             (assuming parallel UTXO availability)

Final:       21 immutable txids on explorer
             ├─ 7 core (already there)
             ├─ 3 resubmission (Phase 2)
             ├─ 2 auction (Phase 5a)
             ├─ 3 coordination (Phase 5b)
             └─ 3 wallet-signed (Phase 4)
```

---

## Contingency Plans

### If One UTXO is Delayed
- **Escrow UTXO delayed?** → Start Phase 5a/5b first, come back to Phase 2
- **Auction UTXO delayed?** → Test Phase 2 & 5b, return to Phase 5a
- **Game pool delayed?** → Test other phases first

### If KasWare Not Available
- Use local key fallback (ready now) for phases 2, 5a, 5b
- Test KasWare separately once extension available
- All critical paths already testable without KasWare

### If TN12 Node Goes Down
- Resubmissions are idempotent (retry-safe)
- Blue scores don't change (historical data)
- Just resubmit after node recovers

---

## Success Criteria

**Phase 2 Success:** 3 new escrow txids accepted
- Release path works with fresh UTXO ✓
- Refund path respects DAA timeout ✓
- Cancel path requires both signatures ✓

**Phase 5a Success:** 2 new auction txids accepted
- Reserve price enforced ✓
- Seller receives payment ✓
- Mutual exclusivity (only one path executes) ✓

**Phase 5b Success:** 3 new coordination txids accepted
- Game type validation works ✓
- Payoff distribution correct ✓
- Timeout refund path available ✓

**Phase 4 Success:** 3 wallet-signed txids accepted
- Keys stay in external wallet ✓
- Signatures valid on-chain ✓
- Different signing method, same results ✓

**100% Complete:** 21 immutable txids proving all settlement paths work

---

## Key Resources

**Dry Runs (test without UTXOs):**
- `artifacts/phase-2-dry-run.json` — what Phase 2 would do
- `artifacts/phase-5-dry-run.json` — what Phase 5 would do

**Code Ready:**
- `scripts/build-signed-escrow-spend-drafts.mjs` (Phase 2)
- `scripts/build-auction-settlement.mjs` (Phase 5a)
- `scripts/build-coordination-settlement.mjs` (Phase 5b)
- `src/externalWalletSigner.mjs` (Phase 4)

**Documentation:**
- `IMPLEMENTATION_READY.md` — detailed phase breakdown
- `DEVELOPER_GUIDE.md` — API reference
- `SESSION_SUMMARY.md` — what's been done

---

## Funding Requirements

| Phase | UTXO Type | Amount | Keys Needed |
|-------|-----------|--------|---|
| 2 | Escrow | ~5M sompi | buyer, seller |
| 5a | Auction | ~10M sompi | seller, bidder |
| 5b | Game Pool | ~10M sompi | player1, player2 |
| 4 | Any | Small | KasWare wallet |

**Total Testnet Funding:** ~25M TKAS (testnet, not real money)

---

## Next Steps

1. **Secure UTXO funding** (external action)
   - Request escrow UTXO with accessible keys
   - Request auction UTXO (seller + bidder)
   - Request game pool UTXO (player1 + player2)

2. **Once UTXO available:**
   - Update `fixtures/FreshEscrowContractOutpoint.json`
   - Run Phase 2 script
   - Verify 3 new txids on explorer
   - Repeat for Phase 5a, 5b

3. **Once KasWare available:**
   - Install extension
   - Run Phase 4 tests
   - Verify wallet-signed txids

4. **Record all results:**
   - `artifacts/phase-2-escrow-submission.json`
   - `artifacts/phase-5a-auction-settlement.json`
   - `artifacts/phase-5b-coordination-games.json`
   - `artifacts/phase-4-wallet-signing.json`

5. **Final validation:**
   - Run `npm run check:all` (should pass)
   - Run `npm run check:tn12` (should show 21 txids)
   - Celebrate 100% TN12 settlement validation ✓

