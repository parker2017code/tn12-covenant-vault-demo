# End-to-End Test Plan: Escrow Release Settlement with KasWare Signing

**Status:** Ready to execute  
**Date:** 2026-05-10  
**Prerequisites:** KasWare extension built, OpenClaw gateway running, TN12 wRPC endpoint available

---

## Test Scenario: Freelance Wallet Integration Review (escrow-freelance-001)

A freelancer completes work and the escrow releases the payment to both parties' role-separated addresses.

### Participants
- **Escrow Covenant:** Holds 1 TKAS in a covenant UTXO
- **Freelancer (Payee):** Receives 0.5 TKAS to role-separated address
- **Employer (Releaser):** Authorizes release by signing with seller key
- **Witness (Optional):** Validates release conditions (not needed for happy path)

---

## Test Execution Steps

### Phase 0: Setup (Pre-Test)

```bash
# Verify OpenClaw gateway is running
openclaw health

# Verify all artifacts are in place
npm run check:all

# Check escrow action map
cat artifacts/escrow-marketplace-action-map.json | jq '.flows[0]'

# Confirm signed drafts exist
ls artifacts/signed-drafts/role-escrow-*.json
```

**Expected Output:**
- Gateway: operational
- Check gate: all pass
- Escrow flow: status = "funded-awaiting-action"
- Release action: status = "sim-validated"
- Signed drafts: 3 files (release, refund, cancel)

---

### Phase 1: Prepare Unsigned Draft (Local, No Keys)

```bash
# Build unsigned covenant spend draft (reuse existing signed draft as template)
node scripts/orchestrate-escrow-release-with-kaswore.mjs

# Expected: escrow-release-orchestration-summary.json generated
# Status: "awaiting-kaswore-signature"
```

**Checkpoint:**
- ✓ Orchestration summary shows: escrow-freelance-001, release status
- ✓ Draft txid matches expected fingerprint
- ✓ Payload bytes correct (should be 0 for pure covenant spend)

---

### Phase 2: Launch OpenClaw Managed Browser

```bash
# Start managed Chromium with KasWare extension
openclaw browser --launch

# Expected: Chromium opens with orange tint, KasWare extension visible in toolbar
```

**Manual Steps (in browser):**
1. Go to `chrome://extensions`
2. Enable "Developer Mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select `/tmp/extension/dist/` (or wherever KasWare dist is built)
5. Pin KasWare extension to toolbar
6. Leave browser open (OpenClaw will reuse it)

**Checkpoint:**
- ✓ KasWare extension appears in toolbar
- ✓ KasWare icon clickable
- ✓ Extension can read/write to managed Chromium profile

---

### Phase 3: Delegate to OpenClaw KasWare Skill

```bash
# Invoke OpenClaw coding-agent skill to orchestrate signing
openclaw agent \
  --to default \
  --message "Sign the escrow release covenant spend using KasWare. Draft: artifacts/signed-drafts/role-escrow-release.json. Expected txid: 4f882d9347006678..." \
  --deliver
```

**Alternative (via Claude Code in Claude message):**
```
"Sign the escrow-freelance-001 release using KasWare. 
Use the artifact at artifacts/signed-drafts/role-escrow-release.json.
OpenClaw should: load draft in KasWare, click sign, extract signature, return hex."
```

**Expected Flow:**
1. OpenClaw CDP: opens KasWare in managed Chromium
2. KasWare: displays unsigned transaction payload
3. KasWare: user clicks "Sign" button
4. KasWare: displays signature confirmation
5. OpenClaw: extracts signature hex from DOM
6. OpenClaw: returns to caller with signature bytes

**Checkpoint:**
- ✓ Signature extracted from KasWare
- ✓ Signature hex matches expected length (132-144 chars)
- ✓ Txid reconstruction matches: 4f882d9347006678...

---

### Phase 4: Assemble Signed Draft

```bash
# Once signature received from OpenClaw, assemble final signed draft
# (This script would be part of the orchestration, or manual if needed)
node scripts/assemble-signed-escrow-release.mjs \
  --unsigned artifacts/signed-drafts/role-escrow-release.json \
  --signature <HEX_FROM_KASWORE> \
  --output artifacts/signed-drafts/role-escrow-release-kaswore-signed.json

# Expected: role-escrow-release-kaswore-signed.json with full signedTransaction
```

**Checkpoint:**
- ✓ Assembled draft has signedTransaction.tx field populated
- ✓ Txid matches expected fingerprint
- ✓ Signature bytes present and valid length
- ✓ Status: "signed-not-broadcast"

---

### Phase 5: Submit to TN12 (If Endpoint Available)

```bash
# Probe endpoint first
KASPA_WRPC_URL="ws://65.108.107.30:18210" \
node scripts/submit-signed-draft-wrpc.mjs \
  artifacts/signed-drafts/role-escrow-release-kaswore-signed.json \
  --probe

# If probe succeeds, submit
KASPA_WRPC_URL="ws://65.108.107.30:18210" \
node scripts/submit-signed-draft-wrpc.mjs \
  artifacts/signed-drafts/role-escrow-release-kaswore-signed.json \
  --submit
```

**Expected Output (on successful submission):**
```json
{
  "status": "transaction-accepted-tn12",
  "txid": "4f882d9347006678...",
  "acceptingBlockBlueScore": 12345,
  "payloadBytes": 0,
  "submittedAt": "2026-05-10T15:00:00Z"
}
```

**Checkpoint:**
- ✓ TN12 accepted the transaction
- ✓ Txid matches expected
- ✓ Role-separated outputs confirmed in DAG (verify with `npm run proof:evidence`)

---

### Phase 6: Verify Settlement Acceptance

```bash
# Verify accepted transactions
npm run tx:verify

# Check proof evidence table
npm run proof:evidence

# Log settlement acceptance
node scripts/log-settlement-acceptance.mjs \
  --flow escrow-release \
  --escrow-id escrow-freelance-001 \
  --txid 4f882d9347006678... \
  --blue-score 12345
```

**Expected:**
- ✓ Txid appears in proof evidence
- ✓ Settlement acceptance log created
- ✓ Role-separated outputs visible (freelancer + employer payouts)

---

## Fallback Paths

### If KasWare Not Available (Timeout > 30s)
1. OpenClaw falls back to local sim
2. Artifact marked: "sim-validated"
3. No submission happens
4. User can manually sign in KasWare when available
5. Retry full submission flow

### If TN12 Endpoint Down
1. Submit step fails gracefully
2. Signed draft saved: "signed-not-broadcast"
3. Queue for replay when endpoint comes online
4. Operator can resubmit: `KASPA_WRPC_URL=... --submit`

### If Signature Mismatch
1. Txid reconstruction fails
2. Retry signing in KasWare
3. Verify role key assignments
4. Check draft was not corrupted

---

## Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| **Signature Authenticity** | Extracted sig matches KasWare-approved payload |
| **Txid Preservation** | Reconstructed txid = expected fingerprint |
| **Roundtrip Integrity** | Draft bytes unchanged after signing |
| **Settlement Acceptance** | TN12 node accepts and broadcasts settlement tx |
| **Role Outputs Locked** | Freelancer + employer receive to correct addresses |
| **Timing** | Full flow completes in < 2 minutes (excl. TN12 confirm) |

---

## Metrics to Collect

After successful test:
```json
{
  "test_id": "escrow-release-e2e-20260510",
  "flow": "escrow-freelance-001",
  "duration_ms": 45000,
  "kaswore_sign_time_ms": 8000,
  "assembly_time_ms": 2000,
  "submit_time_ms": 5000,
  "txid_reconstructed": "4f882d9347006678...",
  "txid_accepted_tn12": "4f882d9347006678...",
  "txid_match": true,
  "role_outputs_count": 2,
  "signature_validity": "passed",
  "fallback_used": false,
  "status": "success"
}
```

---

## Known Limitations (v1)

1. **One Escrow Per Test** — Full flow for single escrow release; batch testing is next phase
2. **Manual Browser Interaction** — KasWare extension load is manual (future: automate via CDP)
3. **No MPC Recovery** — If signature corruption occurs, must retry from Phase 3
4. **TN12 Endpoint Required** — Submission needs live endpoint; fallback uses sim
5. **No Real Keys** — Test uses local testnet keys; mainnet integration is future

---

## Next Steps After Success

1. **Run Batch-Assurance Settlement** — 1 release + 3 refund paths (mutual exclusivity test)
2. **Stress Test** — 10+ concurrent escrow releases with Codex parallelization
3. **Auction Settlement E2E** — Auction with highest-bidder validation
4. **Agent Orchestration Stress** — All 3 flows running in parallel
5. **Mainnet Readiness** — Real key management + live signer integration

---

## Cleanup After Test

```bash
# Close managed browser (preserves session)
# Kill it with: pkill -f "openclaw browser"

# Review test logs
tail -f ~/.openclaw/logs/*.log

# Archive test artifacts
tar czf escrow-release-e2e-20260510.tar.gz artifacts/

# Reset for next test
# (signatures/txids are one-use; rebuild drafts)
```

---

**Test Owner:** Claude Code  
**Duration:** ~2-3 minutes (Phase 0-5)  
**Environment:** TN12 testnet, OpenClaw local gateway, KasWare extension  
**Status:** Ready to execute
