# Quick Start — Executing TN12 Tests (When UTXOs Available)

**Use this guide when you have UTXO funding ready**

---

## Prerequisites Checklist

Before starting, you need:

- [ ] Fresh escrow UTXO (escrow contract outpoint in JSON)
- [ ] Auction UTXO (seller + bidder addresses)
- [ ] Game pool UTXO (player1 + player2 addresses)
- [ ] KasWare extension (optional, for Phase 4)
- [ ] Access to TN12 testnet
- [ ] This repository cloned and ready

---

## Phase 2: Escrow Resubmission (1-2 Hours)

**Goal:** Prove escrow settlement paths work with a fresh UTXO

### Step 1: Prepare the UTXO fixture

Create `fixtures/FreshEscrowContractOutpoint.json`:

```json
{
  "txid": "your_escrow_utxo_txid_here",
  "index": 0,
  "amount": 5000000,
  "scriptHash": "escrow_contract_hash",
  "buyer": "kaspatest:buyer_address_here",
  "seller": "kaspatest:seller_address_here",
  "refundTime": "your_timeout_daa_score",
  "minerFee": 5000
}
```

### Step 2: Build the drafts

```bash
ESCROW_CONTRACT_OUTPOINT=fixtures/FreshEscrowContractOutpoint.json \
  node scripts/build-signed-escrow-spend-drafts.mjs
```

**Expect output:**
- release_draft.json
- refund_draft.json
- cancel_draft.json

### Step 3: Submit to TN12

```bash
node scripts/phase-2-submit-escrow-tn12.mjs
```

### Step 4: Verify acceptance

```bash
npm run tx:verify
```

Check `artifacts/phase-2-escrow-submission.json` for new txids.

**Success:** 3 new escrow txids on explorer ✅

---

## Phase 5a: Auction Settlement (1-2 Hours)

**Goal:** Prove auction settlement works with reserve enforcement

### Step 1: Build the settlement

```bash
node scripts/build-auction-settlement.mjs \
  --seller "kaspatest:seller_address" \
  --bidder "kaspatest:bidder_address" \
  --reserve 500000000 \
  --bid 750000000
```

### Step 2: Sign the settlement

Buyer and seller must both sign:

```bash
node scripts/sign-auction-settlement.mjs \
  --seller-key "seller_private_key_or_wallet" \
  --bidder-key "bidder_private_key_or_wallet"
```

### Step 3: Submit settlement

```bash
node scripts/submit-auction-settlement.mjs
```

### Step 4: Verify

```bash
npm run tx:verify
```

Check `artifacts/phase-5a-auction-settlement.json` for new txid.

**Success:** 1 new auction settlement txid on explorer ✅

---

## Phase 5b: Coordination Games (2-4 Hours)

**Goal:** Prove coordination game payoff distribution works

### Step 1: Run Stag Hunt game

```bash
node scripts/build-coordination-settlement.mjs \
  --game stag-hunt \
  --player1 "kaspatest:player1_address" \
  --player2 "kaspatest:player2_address" \
  --pool 1000000000
```

### Step 2: Both players sign

```bash
node scripts/sign-coordination-settlement.mjs \
  --player1-key "player1_key_or_wallet" \
  --player2-key "player2_key_or_wallet" \
  --game stag-hunt
```

### Step 3: Submit game

```bash
node scripts/submit-coordination-settlement.mjs
```

### Step 4: Verify

```bash
npm run tx:verify
```

### Repeat for other games

Run the same process for:

```bash
# Prisoner's Dilemma
node scripts/build-coordination-settlement.mjs --game prisoners-dilemma ...

# Pure Coordination
node scripts/build-coordination-settlement.mjs --game pure-coordination ...
```

**Success:** 3 new game txids on explorer ✅

---

## Phase 4: External Wallet Signing (1-2 Hours)

**Goal:** Prove keys stay in external wallet (KasWare)

### Prerequisite

Install KasWare extension and unlock it in your browser.

### Step 1: Test KasWare integration

```bash
node scripts/test-kaswore-signing.mjs
```

Browser should prompt for signature approval.

### Step 2: Use KasWare for resubmission

```bash
ESCROW_CONTRACT_OUTPOINT=fixtures/FreshEscrowContractOutpoint.json \
  SIGNER_TYPE=kaswore \
  node scripts/build-signed-escrow-spend-drafts.mjs
```

### Step 3: Submit wallet-signed transactions

```bash
node scripts/submit-wallet-signed-txs.mjs
```

**Success:** Transactions signed by external wallet ✅

---

## Final Validation

Once all phases complete:

```bash
# Verify all new txids
npm run tx:verify

# Check proof evidence
npm run proof:evidence

# Run full gate
npm run check:tn12
```

**Final Status:**
```
✓ Phase 1: 7 txids (core primitives)
✓ Phase 2: 3 txids (escrow resubmission)
✓ Phase 5a: 1 txid (auction settlement)
✓ Phase 5b: 3 txids (coordination games)
✓ Phase 4: 3+ txids (wallet signing)
─────────────
  TOTAL: 17+ txids (100% TN12 validation)
```

---

## Troubleshooting

### "UTXO not found"
- Check UTXO txid in explorer (make sure it's unspent)
- Verify amount matches expectation
- Update fixture file with correct values

### "Signature invalid"
- Check that buyer/seller keys are correct
- Verify signature format matches contract expectations
- Try submitting without wallet first (local key fallback)

### "Transaction rejected: reserve price not met"
- Check bid amount >= reserve amount
- Verify values in auction parameters

### "Blue score timeout"
- Check tx.time against contract's refundTime
- Ensure enough blocks have passed for timeout

### KasWare signing fails
- Check KasWare extension is installed
- Unlock KasWare wallet in browser
- Approve signature request in extension popup

---

## Key Files During Execution

**Inputs (prepare these):**
- `fixtures/FreshEscrowContractOutpoint.json`
- `fixtures/AuctionBiddingOutpoint.json`
- `fixtures/GamePoolOutpoint.json`

**Outputs (will be created):**
- `artifacts/phase-2-escrow-submission.json`
- `artifacts/phase-5a-auction-settlement.json`
- `artifacts/phase-5b-coordination-games.json`
- `artifacts/phase-4-wallet-signing.json`

**Reference:**
- `IMPLEMENTATION_READY.md` — detailed phase breakdown
- `EXECUTION_PLAN.md` — exact bash commands
- `DEVELOPER_GUIDE.md` — API reference

---

## Timeline Estimate

| Phase | Time | Blockchain Wait | Total |
|-------|------|---|---|
| 2 (Escrow) | 30 min | 5 min | ~45 min |
| 5a (Auction) | 30 min | 5 min | ~45 min |
| 5b (Coordination) | 60 min | 10 min | ~90 min |
| 4 (Wallet) | 60 min | 5 min | ~75 min |
| **Total** | **240 min** | **25 min** | **~4 hours** |

---

## Success Criteria

✅ **All phases successful when:**
- npm run check:all passes
- npm run check:tn12 passes
- 17+ txids showing accepted on explorer
- All artifacts contain valid JSON

✅ **100% TN12 Settlement Validation** achieved when:
- Phase 1: 7 core primitives verified ✓
- Phase 2: 3 resubmission txids recorded ✓
- Phase 5a: Auction settlement txid recorded ✓
- Phase 5b: 3 coordination game txids recorded ✓
- Phase 4: 3+ wallet-signed txids recorded ✓

---

## What Happens After 100%

Once all phases complete:

1. All 21 txids immutable on TN12 explorer
2. All settlement paths proven reproducible
3. System ready for production deployment
4. Can move to mainnet (after audit)

---

**Good luck!** This proves TN12 covenant settlement is production-ready.

