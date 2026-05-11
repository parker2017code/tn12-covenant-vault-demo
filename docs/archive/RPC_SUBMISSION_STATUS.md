# RPC Submission Status - Escrow Funding

**Date:** 2026-05-10
**Time:** 17:59 UTC
**Status:** submitted-to-rpc (awaiting on-chain acceptance)

## Current Escrow Funding Transaction ✓

- **Txid:** `64b68f1cc61acc1197198e67bf0c49130db9a43dead1d94823f81b487a5707a3`
- **Source UTXO:** `4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801:0`
- **Source amount:** `99.99995 TKAS` (verified on TN12 chain)
- **Escrow output:** `1 TKAS` to covenant P2SH
- **Change output:** `98.99990 TKAS` back to wallet
- **Artifact:** `artifacts/escrow-funding-tx.json`
- **Endpoint:** `ws://tn12-node.kaspa.com:17210` (Borsh)
- **Fixture:** `fixtures/FundedWalletOutpoint.json` (updated)

## Submission Timeline

### Previous Attempts (FAILED)
- 2026-05-10 15:51 UTC: Txid `07e017f7b7cf61b68968a5b379a6fa4544f83953d3d71b413c64e8bcf9688596`
  - Source UTXO `8f6ae53f2f53efd4eab109bc4b2b7aa4c1ae40e088e9476d39f6171316d1eeb6:1` did NOT exist on TN12
  - **Result:** ❌ REJECTED (orphan - source UTXO missing from chain)

### Current Attempt (SUCCESS)
- 2026-05-10 17:59 UTC: Txid `64b68f1cc61acc1197198e67bf0c49130db9a43dead1d94823f81b487a5707a3`
- **RPC Response:** `transactionId: 64b68f1cc61acc1197198e67bf0c49130db9a43dead1d94823f81b487a5707a3`
- **Result:** ✓ ACCEPTED by RPC mempool
- **Status:** Awaiting on-chain acceptance (mining/DAA score)

## Key Fixes Applied

1. **Verified UTXO on TN12:** Source UTXO now confirmed to exist on-chain (DAA score 7532926)
2. **Fixed submitPayload:** Added missing `previousOutpoint.index` field
3. **Updated fixture:** `fixtures/FundedWalletOutpoint.json` now points to correct live UTXO

## Next Action

Wait for transaction to be accepted on-chain, then:
1. Verify acceptance via REST API or explorer
2. Update `fixtures/RoleEscrowContractOutpoint.json` with new escrow UTXO
3. Rebuild settlement drafts from accepted UTXO
4. Test settlement flows with real covenant
