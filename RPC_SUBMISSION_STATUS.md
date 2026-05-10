# RPC Submission Status - Escrow Funding

**Date:** 2026-05-10
**Status:** submitted-awaiting-acceptance

## Escrow Funding Transaction

- **Signed txid:** `07e017f7b7cf61b68968a5b379a6fa4544f83953d3d71b413c64e8bcf9688596`
- **Source UTXO:** `8f6ae53f2f53efd4eab109bc4b2b7aa4c1ae40e088e9476d39f6171316d1eeb6:1`
- **Source amount:** `974.99995 TKAS`
- **Escrow output:** `1 TKAS` to covenant P2SH
- **Artifact:** `artifacts/escrow-funding-tx.json`
- **Endpoint:** `ws://tn12-node.kaspa.com:17210`
- **Encoding:** `borsh`

## Submit Result

Submission succeeded with the live TN12 wRPC endpoint and the TN12 WASM module.

```text
transactionId: 07e017f7b7cf61b68968a5b379a6fa4544f83953d3d71b413c64e8bcf9688596
```

## Current Next Step

Wait for acceptance, then fetch the accepted escrow UTXO and update:

1. `fixtures/RoleEscrowContractOutpoint.json`
2. settlement draft generators
3. batch-assurance settlement docs

## What Changed

- The stale `ws://65.108.107.30:18210` endpoint path is no longer the active route.
- The escrow funding artifact now uses a live TN12 UTXO.
- The submit script now honors the Borsh endpoint and reconstructs output values and scripts from the signed transaction when needed.
