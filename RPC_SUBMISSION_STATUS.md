# RPC Submission Status — Escrow Funding

**Date:** 2026-05-10 (Session restart)  
**Status:** ⏳ RPC ENDPOINT TEMPORARILY OFFLINE

---

## Escrow Funding Transaction

### Transaction Details
- **Txid (signed):** `741463085b6129ffc0415d6288cce1bfe9808a2d6bb8ef7a26752cc1641ebf03`
- **Source UTXO:** `abbaa9618b86ce4129a7cefcdb7b268bbf0867a1d57ee521234fc360a8466ae2:1` (974.99995 TKAS)
- **Output:** 1 TKAS → Escrow covenant `kaspatest:pqn4sg3gr7h5p24zygea7fdhdhcr5p0pdcaaccfldy5qqsyup6927hnmrx62w`
- **Status:** `signed-ready-for-submission`
- **Artifact:** `artifacts/escrow-funding-tx.json`

### Submission Attempts
| Attempt | Time | Endpoint | Result | Error |
|---------|------|----------|--------|-------|
| 1 | 2026-05-10 (prev) | ws://65.108.107.30:18210 | FAIL | WebSocket disconnected during submitTransaction |
| 2 | 2026-05-10 (this session) | ws://65.108.107.30:18210 | FAIL | WebSocket disconnected during submitTransaction |
| 3 | 2026-05-10 (check) | ws://65.108.107.30:18210 | OFFLINE | RPC endpoint unreachable |

---

## Next Steps

### When RPC Comes Online
```bash
KASPA_WRPC_URL=ws://65.108.107.30:18210 \
KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa \
node scripts/submit-escrow-funding.mjs artifacts/escrow-funding-tx.json --submit
```

### Post-Submission Steps (Once UTXO Accepted)
1. Fetch escrow UTXO from TN12 (will be at txid:0)
2. Update `fixtures/RoleEscrowContractOutpoint.json` with accepted UTXO
3. Rebuild all settlement drafts with new UTXO
4. Run 6-phase E2E test (see `artifacts/E2E_TEST_PLAN.md`)
5. Broadcast batch-assurance settlement (mutual-exclusive paths)

---

## Local Validation Status

✅ All gates passing:
- `npm run check` — gate passed
- `npm run check:negative` — negative checks passed
- `npm run check:ui` — UI smoke check passed
- Proof evidence: 7/7 accepted

✅ Settlement paths ready:
- Escrow release (signed, validated)
- Escrow refund (signed, validated)
- Escrow cancel (signed, validated)
- Batch-assurance (1 release + 3 refunds, signed)
- Auction (3 paths, planner-ready)

---

## Blocking Issue

**Issue:** TN12 wRPC endpoint (ws://65.108.107.30:18210) has persistent WebSocket disconnection during submitTransaction calls.

**Impact:** Cannot submit escrow funding TX to testnet, which blocks:
- Getting real UTXO for settlement testing
- Broadcasting batch-assurance mutual-exclusivity proof
- Running full E2E settlement test

**Workarounds:**
- Monitor endpoint; retry when connectivity stabilizes
- Check for alternative RPC endpoints (if available)
- Manually trigger submission via different client (if needed)

**Resolution:** Wait for endpoint recovery or switch RPC endpoint

---

**Status:** Transaction is valid, signed, and ready. Awaiting RPC endpoint stability.
