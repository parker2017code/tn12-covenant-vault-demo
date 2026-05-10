# Role Binding for Complete Settlement Testing

**Status:** Documented Gap  
**Blocker Level:** Non-critical (covenant works, settlement structure correct)

---

## What's Needed

To complete end-to-end settlement testing with actual covenant execution:

### 1. Generate Role Keys

```
Buyer:    New PrivateKey → PublicKey → Address
Seller:   New PrivateKey → PublicKey → Address  
Arbiter:  New PrivateKey → PublicKey → Address
```

### 2. Create Escrow Instance with Role Binding

Bind the three addresses to an escrow smart contract instance:
```
escrow.buyer = <buyer-address>
escrow.seller = <seller-address>
escrow.arbiter = <arbiter-address>
escrow.amount = 1 TKAS
escrow.minerFee = 0.00005 TKAS
```

### 3. Fund Escrow with Role-Bound Contract

Deploy covenant with role addresses embedded in the script.

### 4. Sign Settlement Paths with Role Keys

Each settlement path requires a signature from its authorized role:
- **Release:** Sign with buyer's private key → output to seller address
- **Refund:** Sign with arbiter's private key → output to buyer address  
- **Cancel:** Sign with arbiter's private key → output to merchant

### 5. Broadcast & Verify

Submit each settlement path. Covenant will validate:
- ✓ Signature matches role
- ✓ Output goes to correct address
- ✓ Amount is correct (minus miner fee)

---

## Why This Works

The covenant script embedded in the UTXO contains the role addresses. When a settlement path is broadcast:
1. Script deserializes the role addresses from the covenant code
2. Validates the transaction signature against the role's public key
3. Verifies output constraints (amount, destination)
4. Either succeeds (returns TRUE) or fails (returns FALSE)

---

## Current Proof

We've already proven:
- ✅ Covenant script executes on-chain
- ✅ Role validation logic works (rejected wrong address)
- ✅ Output constraints are enforced
- ✅ Signature validation works

The settlement draft just needs the correct role addresses to pass validation.

---

## Next Steps

1. **Short term:** Keep current escrow as covenant validation proof
2. **Medium term:** Generate role keys and test with actual buyer/seller
3. **Long term:** Integrate with wallet external signer for multi-party setup

**Impact:** Non-blocking - parallel tracks can continue independently.
