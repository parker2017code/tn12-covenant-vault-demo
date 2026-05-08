# Transaction API Notes

Local `kaspa-wasm` exports useful transaction primitives:

- `PrivateKey`
- `Keypair`
- `Address`
- `PaymentOutput`
- `Transaction`
- `TransactionInput`
- `TransactionOutpoint`
- `TransactionOutput`
- `ScriptPublicKey`
- `UtxoEntry`
- `createTransaction`
- `signTransaction`

The initial implementation path has moved beyond local construction: the repo now constructs, signs, submits, and verifies selected TN12 proof transactions. New submit attempts should still be explicit, reviewed, and gated behind `--submit`.

## Resolved Notes

- Exact JavaScript object shape expected by `createTransaction` for a manually supplied P2PK UTXO entry is proven by `npm run tx:p2pk` and split transactions.
- Raw compiled Silverscript bytes are non-standard as outputs; use standard P2SH wrapper `OpBlake2b OpData32 blake2b32(redeemScript) OpEqual`.
- P2SH spends use the Silverscript entrypoint sigscript plus a pushed redeem script.
- Older SDK signing uses `signScriptHash` over the sighash from `SignableTransaction.getScriptHashes()`. The TN12 SDK path used for tx version 1 signs with `createInputSignature` against a `Transaction` that carries the input UTXO reference.
- The public TN12 REST endpoint accepts submit payloads at `https://api-tn12.kaspa.org/transactions`.
- Contract spend fee must be embedded high enough in the constructor. A 1000-sompi vault recovery failed because TN12 required 1784 sompi; 5000 sompi worked.
- DAA-score lock times worked for delayed withdrawal and refund testing. Seconds-based lock times hit finalization ambiguity through the public submit route.
- Official builder docs now include accepted-transaction ingestion patterns. This repo uses a lightweight REST verification command first: `npm run tx:verify`.
- For a production-grade accepted transaction indexer, the official docs point to checkpointed `getVirtualChainFromBlockV2` with high data verbosity. Use that later through a node/RPC backend; do not reintroduce local node work in this repo unless the user asks.
- Official transaction-payload docs use `new TextEncoder().encode(...)` payload bytes. Local `kaspa-wasm createTransaction(..., payload, ...)` preserves those bytes when the payload argument is a `Uint8Array`; a plain string produced an empty payload in local testing.
- The TN12 REST OpenAPI `SubmitTxModel` checked on 2026-05-07 does not list a `payload` field, while fetched `TxModel` does expose `payload`. A forced REST submit accepted a payment while dropping payload bytes. Keep that result as historical no-payload evidence.
- TN12 JSON wRPC accepted the matched payload receipt `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`. `npm run payload:verify` fetches it, checks payload bytes, decodes the receipt, and writes `artifacts/payload-receipt-evidence.json`.
- `npm run payload:readiness` records the OpenAPI check, the REST no-payload attempt, and the accepted wRPC evidence in `artifacts/payload-submit-readiness.json`.

## Upstream Tooling Context

Snapshot date: 2026-05-08.

- The recent `rusty-kaspa` Toccata engine-flag work makes script construction fork-aware on the `toccata` branch. For post-activation Toccata script construction, builders may need an explicit post-activation flag path such as `ScriptBuilder::with_flags` rather than assuming the default builder emits post-activation-compatible scripts.
- That fork-aware change was not merged to the `tn12` branch in the discussion snapshot. Treat TN12 as the post-activation-engine test surface, but do not assume the same default builder/API behavior when moving examples between `tn12`, `toccata`, and future master.
- WASM exposure can lag Rust APIs. If a Rust API exists for fork-aware script construction but is not exposed through WASM yet, JavaScript examples should stay TN12-specific or carry a clear tooling caveat.
- The open DAA-score keyed UTXO-index pagination work is relevant to the durable indexer plan. If it lands, the likely sync shape is: subscribe to UTXO changes, capture the first response DAA score, buffer later subscription messages, paginate UTXOs up to that DAA score, drain buffered adds/removes, then continue from live subscription messages.
- Do not treat these upstream notes as activation evidence. They are builder/tooling context for script construction, UTXO sync, and indexer design.

## Working Public Wallet Metadata

Use:

```sh
npm run wallet:public
```

It reads `.local/tn12-wallet.json`, derives the public key, prints public metadata, and does not print the private key.

## Safe Spike Order

1. Build a local P2PK transaction draft to the same saved address from a fetched outpoint. Done in `npm run tx:p2pk`.
2. Add signing only after the transaction object can be created without broadcast. Done in `npm run tx:p2pk`.
3. Add contract-output serialization after a normal P2PK draft works. Done in `npm run tx:contracts`.
4. Add vault funding output. Done and accepted on TN12.
5. Add recovery spend. Done and accepted on TN12.
6. Add delayed withdrawal spend. Done and accepted on TN12 with DAA-score lock.
7. Add assurance pledge output. Done and accepted on TN12.
8. Add assurance refund spend. Done and accepted on TN12 with DAA-score deadline.
9. Add assurance release spend. Done and accepted on TN12 for the individual pledge primitive.
10. Add accepted transaction verification. Done in `npm run tx:verify`.
11. Add signed payload receipt draft. Done in `npm run tx:payload`; use JSON wRPC for payload-aware submit and keep REST blocked for this lane.
12. Add payload submit readiness artifact. Done in `npm run payload:readiness`; it preserves the REST no-payload result and points to the accepted JSON wRPC receipt evidence.
13. Add escrow mutual cancel on a separate funded output. Done and accepted on TN12 through local TN12 `kaspa-wasm 1.1.1-toc.1`, tx version 1, `computeBudget=30`, and JSON wRPC to `testnet-12`.
14. Add accepted payload receipt verification. Done in `npm run payload:verify` for tx `34d5f807c2a6b917458f2d1a3926f5ed49730f44da2c480a53a0236c915afc4e`.
