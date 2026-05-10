# UTXO Funding Checklist

**Use this before funding fresh UTXOs for Phases 2-5**

---

## Pre-Funding Review

Before you allocate testnet funds, verify your setup:

- [ ] You have TN12 testnet access (can see explorer)
- [ ] You have testnet KAS available (need ~25M TKAS total)
- [ ] You have buyer/seller keys accessible
- [ ] You have this repository cloned locally
- [ ] You can run `npm run check:all` successfully
- [ ] You can run `npm run check:tn12` successfully (should show 7 txids)

---

## Phase 2: Escrow Resubmission

**Funding Requirements:**
- Amount: ~5,000,000 sompi (5 TKAS)
- Keys needed: buyer key, seller key
- Status: In escrow contract

**Before Funding, Prepare:**

- [ ] Decide on buyer address: `kaspatest:_________`
- [ ] Decide on seller address: `kaspatest:_________`
- [ ] Choose refund timeout (DAA score, e.g., current_score + 100)
- [ ] Create `fixtures/FreshEscrowContractOutpoint.json`:

```json
{
  "txid": "TXID_OF_YOUR_ESCROW_UTXO_HERE",
  "index": 0,
  "amount": 5000000,
  "scriptHash": "ESCROW_SCRIPT_HASH",
  "buyer": "kaspatest:buyer_address",
  "seller": "kaspatest:seller_address",
  "refundTime": TIMEOUT_DAA_SCORE_HERE,
  "minerFee": 5000
}
```

**After Funding, Execute:**

```bash
# (1) Build drafts
ESCROW_CONTRACT_OUTPOINT=fixtures/FreshEscrowContractOutpoint.json \
  node scripts/build-signed-escrow-spend-drafts.mjs

# (2) Submit
node scripts/phase-2-submit-escrow-tn12.mjs

# (3) Verify
npm run tx:verify

# (4) Check results
cat artifacts/phase-2-escrow-submission.json
```

**Success Criteria:**
- [ ] 3 new txids in artifacts/phase-2-escrow-submission.json
- [ ] All 3 show "accepted": true
- [ ] npm run check:tn12 shows 10 total txids (7 core + 3 new)

---

## Phase 5a: Auction Settlement

**Funding Requirements:**
- Amount: ~10,000,000 sompi (10 TKAS)
- Keys needed: seller key, bidder key
- Status: Locked in auction contract

**Before Funding, Prepare:**

- [ ] Decide on seller address: `kaspatest:_________`
- [ ] Decide on bidder address: `kaspatest:_________`
- [ ] Choose reserve price (e.g., 500,000,000 sompi = 0.5 TKAS)
- [ ] Choose test bid (must be > reserve, e.g., 750,000,000 sompi)
- [ ] Create `fixtures/AuctionBiddingOutpoint.json`:

```json
{
  "txid": "TXID_OF_YOUR_AUCTION_UTXO",
  "index": 0,
  "amount": 10000000,
  "seller": "kaspatest:seller_address",
  "highestBidder": "kaspatest:bidder_address",
  "reservePrice": 500000000,
  "currentBid": 750000000,
  "minerFee": 5000
}
```

**After Funding, Execute:**

```bash
# (1) Build settlement
node scripts/build-auction-settlement.mjs \
  --seller "kaspatest:seller_address" \
  --bidder "kaspatest:bidder_address" \
  --reserve 500000000 \
  --bid 750000000

# (2) Get signatures (both must sign)
# If using local keys:
node scripts/sign-auction-settlement.mjs

# If using KasWare (external wallet):
SIGNER=kaswore node scripts/sign-auction-settlement.mjs

# (3) Submit
node scripts/submit-auction-settlement.mjs

# (4) Verify
npm run tx:verify

# (5) Check results
cat artifacts/phase-5a-auction-settlement.json
```

**Success Criteria:**
- [ ] 1 new auction txid in artifacts/phase-5a-auction-settlement.json
- [ ] Shows "accepted": true
- [ ] Seller payment amount = bid - fee

---

## Phase 5b: Coordination Games

**Funding Requirements:**
- Amount: ~10,000,000 sompi (10 TKAS) per game
- Keys needed: player1 key, player2 key
- Status: Locked in game contract

**Before Funding, Prepare (Repeat 3 Times for Each Game):**

### Stag Hunt Game:
- [ ] Decide on player1 address: `kaspatest:_________`
- [ ] Decide on player2 address: `kaspatest:_________`
- [ ] Create `fixtures/StagHuntPoolOutpoint.json`:

```json
{
  "txid": "TXID_OF_STAG_HUNT_UTXO",
  "index": 0,
  "amount": 10000000,
  "player1": "kaspatest:player1_address",
  "player2": "kaspatest:player2_address",
  "gameType": 0,
  "minerFee": 5000
}
```

### Prisoner's Dilemma Game:
- [ ] Same addresses or different
- [ ] Create `fixtures/PDGamePoolOutpoint.json` (gameType: 1)

### Pure Coordination Game:
- [ ] Same addresses or different
- [ ] Create `fixtures/CoordinationPoolOutpoint.json` (gameType: 2)

**After Funding, Execute (For Each Game):**

```bash
# (1) Build settlement
node scripts/build-coordination-settlement.mjs \
  --game stag-hunt \
  --player1 "kaspatest:player1_address" \
  --player2 "kaspatest:player2_address" \
  --pool 10000000

# (2) Both players sign (must agree on payoffs)
node scripts/sign-coordination-settlement.mjs \
  --player1-key "player1_key" \
  --player2-key "player2_key" \
  --game stag-hunt

# (3) Submit
node scripts/submit-coordination-settlement.mjs

# (4) Verify
npm run tx:verify

# (5) Check results
cat artifacts/phase-5b-coordination-games.json
```

**Repeat for:**
- [ ] Prisoner's Dilemma (--game prisoners-dilemma)
- [ ] Pure Coordination (--game pure-coordination)

**Success Criteria:**
- [ ] 3 new game txids in artifacts/phase-5b-coordination-games.json
- [ ] All show "accepted": true
- [ ] Payoff distributions look correct for each game type

---

## Phase 4: External Wallet Signing (Optional)

**Funding Requirements:**
- KasWare extension (or hardware wallet)
- No additional testnet funds needed

**Before Testing, Prepare:**

- [ ] Install KasWare extension (browser add-on)
- [ ] Create test account with some testnet KAS
- [ ] Unlock KasWare in browser

**Execute:**

```bash
# (1) Test KasWare signing
node scripts/test-kaswore-signing.mjs

# Browser should prompt for signature approval
# Approve the signature

# (2) If successful, use it for resubmission
SIGNER_TYPE=kaswore \
  ESCROW_CONTRACT_OUTPOINT=fixtures/FreshEscrowContractOutpoint.json \
  node scripts/build-signed-escrow-spend-drafts.mjs

# (3) Submit wallet-signed transactions
node scripts/submit-wallet-signed-txs.mjs

# (4) Verify
npm run tx:verify
```

**Success Criteria:**
- [ ] KasWare signs without error
- [ ] Wallet-signed txids recorded
- [ ] npm run check:tn12 shows wallet-signed txids

---

## Grand Finale: Full Validation

Once all phases complete:

```bash
# Complete validation
npm run check:all
npm run check:tn12
npm run proof:evidence

# Expected output:
# ✓ Total txids: 21
# ✓ 7 core (Phase 1)
# ✓ 3 escrow (Phase 2)
# ✓ 2-3 auction (Phase 5a)
# ✓ 3 coordination (Phase 5b)
# ✓ 3+ wallet-signed (Phase 4)
```

---

## Common Mistakes To Avoid

- ❌ Wrong amount in UTXO (must match contract expectations)
- ❌ Wrong keys (buyer/seller must match contract params)
- ❌ Timeout in past (refund won't trigger, choose future DAA score)
- ❌ Bid too low for auction (must be >= reserve)
- ❌ Players disagree on game outcome (both must sign same payoff)
- ❌ Mixing up which key is which role

---

## Timeline Estimate

| Phase | Setup | Execute | Blockchain | Total |
|-------|-------|---------|-----------|-------|
| 2 (Escrow) | 10 min | 20 min | 5 min | ~45 min |
| 5a (Auction) | 10 min | 20 min | 5 min | ~45 min |
| 5b x3 (Games) | 15 min | 45 min | 15 min | ~90 min |
| 4 (Wallet) | 5 min | 20 min | 5 min | ~30 min |
| **Total** | **~50 min** | **~2 hours** | **~30 min** | **~3.5 hours** |

---

## Need Help?

**Before funding, review:**
1. QUICK_START_WITH_UTXOS.md — Exact commands
2. IMPLEMENTATION_READY.md — Current status
3. DEVELOPER_GUIDE.md — API reference

**If something fails:**
1. Check QUICK_START_WITH_UTXOS.md §7 (Troubleshooting)
2. Check EXECUTION_PLAN.md §6 (Contingency Plans)
3. Verify fixture JSON is valid (use `cat` and check syntax)
4. Verify addresses are correct (copy/paste to avoid typos)
5. Verify keys are accessible (test with simple transaction first)

---

## Sign-Off

Before you allocate funds:

- [ ] I have read QUICK_START_WITH_UTXOS.md
- [ ] I have read the troubleshooting section
- [ ] I understand what each UTXO will do
- [ ] I have the correct addresses prepared
- [ ] I have backup of all keys
- [ ] I'm ready to execute the phases

**Good luck!** This proves TN12 covenant settlement is production-ready.

