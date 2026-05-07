# Expert Escalation Notes

This file holds exact protocol/tooling escalation notes after local debugging has checked the basic layers: artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK/API shape, node/network id, and upstream Rusty Kaspa source/tests.

## Resolved: Escrow Cancel Version-1 Compute Budget Submit

Resolution:

No outside question remains for this issue. The working route is local TN12 `kaspa-wasm 1.1.1-toc.1`, tx version 1, JS constructor fields `sigOpCount: 0` plus `computeBudget: 30`, `new RpcClient({ url, encoding, networkId })`, and `submitTransaction({ transaction, allowOrphan })` over JSON wRPC to `testnet-12`.

Context:

- Contract path: `contracts/Escrow.sil`
- Builder path: `src/contractSpendDrafts.mjs`
- Current draft: `artifacts/signed-drafts/escrow-cancel-proof-cancel.json`
- Current rejection/evidence artifact: `artifacts/escrow-cancel-attempt.json`
- Funding output: `331b0372e9a8dd12516a772c9ce983f519031fa6970113a64eae16c0fcf4f022:0`
- Current cancel spend txid: `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c`
- Current draft transaction version: `1`
- Current input budget: `computeBudget: 30`

What we already verified:

- The old `sigOpCount=1` script-unit rejection was bad configuration and is historical evidence only.
- Rebuilding with `sigOpCount=2` removed script-unit exhaustion but returned signature-script verification failure.
- Rusty Kaspa `tn12` HEAD inspected locally: `7b1e18cc6e7098d83927049781c91740b90e7754`.
- TN12 consensus source says transaction version 1 and higher inputs use `computeBudget`, while version 0 uses `sigOpCount`.
- TN12 serde source says version-1 JSON/Borsh input shape carries `computeBudget`, not `sigOpCount`.
- TN12 daemon integration tests submit `TX_VERSION_TOCCATA` transactions after setting `ComputeBudget(...)` on each input, and reject malformed v1 RPC transactions with non-zero `sig_op_count`.
- The branch-local WASM build at `/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa` reports `kaspa-wasm` `1.1.1-toc.1`.
- The installed npm `kaspa-wasm@0.13.0` JS `TransactionInput` constructor rejects `computeBudget`, requires `sigOpCount`, and does not preserve `computeBudget` when both fields are supplied.
- The local TN12 SDK still requires a `sigOpCount` property in the JS constructor, but preserves the correct v1 shape when passed `sigOpCount: 0, computeBudget: 30`.
- The current JS/wRPC dry run reconstructs the corrected version-1 cancel draft with the expected txid when `KASPA_WASM_MODULE` points at the local TN12 SDK:

```sh
KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa node scripts/submit-signed-draft-wrpc.mjs artifacts/signed-drafts/escrow-cancel-proof-cancel.json
```

Historical submit failures:

- Public REST with only `computeBudget` returns HTTP 422: `body.transaction.inputs.0.sigOpCount: field required`.
- Public REST with `sigOpCount` on tx version 1 returns HTTP 400: `RpcTransactionInput.sig_op_count is inconsistent with transaction version 1`.
- Public Borsh wRPC peers tested connect, but `submitTransaction` returned `RPC response error NotFound`.
- Public JSON wRPC peers tested returned `request deserialization error`.
- Public JSON probe against `ws://65.108.107.30:18210` returned `getInfo.serverVersion = 1.1.1-toc.1`, `isSynced = true`, and `isUtxoIndexed = true`, but `getServerInfo` failed with `RPC serde deserialization error: invalid type: integer 1, expected an array of length 4`.

Resolved result:

The corrected artifact is tx version 1 with `computeBudget: 30`, was rebuilt using the local TN12 `kaspa-wasm 1.1.1-toc.1` SDK, reconstructs to `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c` with compute budget preserved, submitted successfully, and is accepted on TN12.

What we learned:

1. JS should use a matching TN12/Toccata WASM build/API for tx v1 compute-budget transactions.
2. The current SDK constructor shape is object-style `new RpcClient({ url, encoding, networkId })`.
3. The submit wrapper is request-style `submitTransaction({ transaction, allowOrphan })`.
4. Public REST was not authoritative for this v1 compute-budget transaction shape.
5. Old Borsh/public endpoint failures were submit-surface/tooling issues, not proof that the cancel script was invalid.

Smallest local reproducer:

```sh
cd /home/parker2017/tn12-covenant-vault-demo
npm run check
node scripts/submit-signed-draft-wrpc.mjs artifacts/signed-drafts/escrow-cancel-proof-cancel.json
node scripts/submit-signed-draft.mjs artifacts/signed-drafts/escrow-cancel-proof-cancel.json
```

The cancel route is accepted. Preserve old failures as historical evidence only.
