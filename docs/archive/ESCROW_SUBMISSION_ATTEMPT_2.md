# Escrow Funding Submission Attempt #2

**Date:** 2026-05-10  
**Endpoint:** ws://tn12-node.kaspa.com:17210 (Borsh, verified TN12)

---

## Artifact Patch

**Before:** submitPayload.transaction.outputs had empty scriptPublicKey  
**Patch:** Copied correct script bytes from signedTransaction.tx.inner.outputs  
**Result:** ✓ Scripts restored, rebuilt txid now matches original

```
Original txid:  741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03
Rebuilt txid:   741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03
Status:         ✓ MATCH (patch successful)
```

---

## Submission Result

**Status:** ❌ REJECTED

**Error:** Transaction is an orphan where orphan is disallowed

**Details:**
```
Rejected transaction: 741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03
Message: transaction 741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03 
         is an orphan where orphan is disallowed
```

**Root Cause:** Source UTXO does not exist on TN12
```
Source: abbaa9618b86ce4129a7cefcdb7b268bbf0867a1d57ee521234fc360a8466ae2:1
Status: Not found (orphan input)
```

---

## Validation Status

- ✅ All gates passing (check:all, check:negative, check:ui)
- ✅ Transaction properly signed (signedTransaction verified)
- ✅ Script serialization fixed (artifacts match)
- ✅ Endpoint verified and reachable
- ❌ **Source UTXO missing from TN12 chain**

---

## Next Action Required

The transaction format is now correct, but we need a valid source UTXO to spend from. Options:

1. **Check if wallet has other UTXOs** on TN12 (fixture shows none from 2026-05-09)
2. **Request fresh funds** from TN12 faucet (if available)
3. **Use different funding source** (if available)
4. **Verify fixture UTXO actually exists** on chain with different query method

The patch succeeded (script serialization fixed), but this is a funding/UTXO availability issue, not a transaction format issue.

---

**Blocker:** No valid source UTXO on TN12 to fund escrow covenant.
