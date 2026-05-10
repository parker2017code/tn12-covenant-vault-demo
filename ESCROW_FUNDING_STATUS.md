# Escrow Funding Transaction - Ready for Live Submission

**Date:** 2026-05-10  
**Status:** ✅ SIGNED AND READY FOR SUBMISSION  
**Location:** `artifacts/escrow-funding-tx.json`

## Transaction Details

| Field | Value |
|-------|-------|
| **Source UTXO** | abbaa9618b86ce4129a7cefcdb7b268bbf0867a1d57ee521234fc360a8466ae2:1 |
| **Source Amount** | 974.99995 TKAS |
| **Wallet Address** | kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt |
| **Escrow Funding Amount** | 1 TKAS |
| **Miner Fee** | 0.00005 TKAS |
| **Change Back** | 973.9999 TKAS |
| **Transaction ID** | 741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03 |

## What's in the Artifact

✅ **Signed transaction** - Built with npm kaspa-wasm, signed with wallet private key  
✅ **RPC-ready submitPayload** - Normalized transaction format for TN12 wRPC  
✅ **Full transaction structure** - All inputs/outputs properly assembled  
✅ **Contract details** - Escrow covenant script hash and binding  

## How to Submit to TN12

The funding transaction is signed and ready. To submit:

```bash
KASPA_WRPC_URL=ws://65.108.107.30:18210 \
KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa \
node scripts/submit-escrow-funding.mjs artifacts/escrow-funding-tx.json --submit
```

## After Acceptance (Next Steps)

Once TN12 accepts the funding transaction:

1. **Fetch the escrow UTXO** (output index 0)  
   ```
   New UTXO: 741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03:0
   Amount: 1 TKAS
   Script: Escrow covenant (P2SH)
   ```

2. **Update the fixture with real UTXO**  
   Copy the new UTXO details to `fixtures/RoleEscrowContractOutpoint.json`

3. **Run settlement tests** using the real escrow UTXO  
   - Test escrow release (freelancer gets paid)
   - Test escrow refund (employer gets refund)
   - Test escrow cancel (mutual agreement to cancel)

4. **Validate on-chain settlement**  
   - Check that role-separated outputs appear in DAG
   - Verify settlement transaction acceptance
   - Log proof of acceptance

## Technical Notes

- **Signing:** Transaction signed locally using npm kaspa-wasm (proven working)
- **RPC Endpoint:** ws://65.108.107.30:18210 (TN12 testnet, Toccata consensus)
- **Network:** kaspa-testnet-12
- **Source Balance:** 974.99995 TKAS is confirmed on-chain as of 2026-05-09 15:00 UTC

## Current Blocker

The TN12 wRPC endpoint has WebSocket connection issues when submitting transactions via the TN12 wasm fork. The signing is complete and working; submission needs either:

1. Endpoint recovery/stability improvement
2. Alternative RPC endpoint (if available)
3. Manual submission via TN12 explorer
4. Wait for node recovery

**Status:** Transaction is built, signed, and ready. No code changes needed - just waiting for endpoint stability or alternative submission path.

## Files

- **Artifact:** `artifacts/escrow-funding-tx.json` - Complete signed transaction
- **Scripts:** 
  - `scripts/fund-escrow-on-tn12-v2.mjs` - Build & sign (complete ✅)
  - `scripts/submit-escrow-funding.mjs` - Submit to RPC (ready, endpoint issue)

---

**Next:** When endpoint is stable or alternative available, run submit command above. No further code changes needed.
