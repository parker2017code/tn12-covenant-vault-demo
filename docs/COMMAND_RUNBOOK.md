# Command Runbook

Use this before running commands copied from public pages. Commands have different safety classes; do not treat every snippet as safe to run without review.

## Start Here

```sh
npm ci
npm run check:all
npm run check:tn12
```

Expected result:

- `npm ci` installs the locked Node dependencies.
- `npm run check:all` runs local tests, artifact checks, negative checks, and UI smoke checks.
- `npm run check:tn12` verifies the accepted TN12 proof and payload evidence against public data.

## Command Classes

| Class | Examples | Needs | Does not need |
|---|---|---|---|
| Local check | `npm run check:all`, `npm run check:ui` | Node.js, `npm ci` | tKAS, private keys, submit endpoint |
| Public evidence refresh | `npm run check:tn12`, `npm run proof:verify` | Node.js, `npm ci`, internet access to TN12 APIs | local wallet keys |
| Artifact refresh | `npm run project:queue`, `npm run defi:accepted-activity` | Node.js, `npm ci`, repo fixtures | tKAS unless the script says otherwise |
| Fresh testnet wallet | `npm run address`, `npm run playground:wallets` | Node.js, `npm ci`; writes testnet-only material under `.local/` | mainnet keys |
| Role funding draft | `npm run playground:funding-draft` | Fresh playground wallet outputs plus a funded source wallet/outpoint. Defaults: `TN12_WALLET=.local/tn12-wallet.json`, `FUNDING_OUTPOINT=fixtures/FundedWalletOutpoint.json` | shared or committed private keys |
| Submit/broadcast | `node scripts/submit-signed-draft.mjs ... --submit` or `node scripts/submit-signed-draft-wrpc.mjs ... --submit` | signed draft, funded UTXO, explicit user intent, correct TN12 endpoint/config | mainnet keys or blind signing |
| Payload-preserving submit | `KASPA_WRPC_URL=... node scripts/submit-signed-draft-wrpc.mjs ... --submit` | `KASPA_WRPC_URL`, `KASPA_WRPC_ENCODING`, `KASPA_WRPC_NETWORK_ID`, `KASPA_WRPC_SUBMIT_SHAPE`, and the correct WASM route when building | public REST submit for payload receipts |

## Fresh Playground Route

Use this only for a new TN12 testnet run.

```sh
npm ci
npm run playground:wallets
npm run playground:funding-draft
node scripts/submit-signed-draft.mjs .local/playground/funding-draft.json --submit
```

What must happen first:

- `npm run playground:wallets` creates role wallets under `.local/playground/`. It refuses to overwrite an existing playground unless run with `-- --force`.
- `npm run playground:funding-draft` creates a multi-output funding draft for those role addresses. It spends from a separate source wallet/outpoint, not from the fresh role wallets.
- The default source is `TN12_WALLET=.local/tn12-wallet.json` plus `FUNDING_OUTPOINT=fixtures/FundedWalletOutpoint.json`. Override both when using your own funded TN12 source wallet.
- The draft must spend only intended testnet UTXOs and fund only public `kaspatest:` role addresses.
- The submit step must be an explicit action; it broadcasts a signed testnet transaction.
- After submit, verify the accepted txid in the TN12 explorer and rerun replay/indexer checks before trusting app state.

## Payload Receipt Route

Payload receipts need the JSON wRPC path that preserves transaction payload bytes.

Do not use the public TN12 REST submit route for payload receipts; this repo already observed that route accepting a payment while dropping payload bytes.

Required environment for payload-preserving submit examples:

```sh
KASPA_WRPC_URL=<ws-or-wss-tn12-endpoint>
KASPA_WRPC_ENCODING=json
KASPA_WRPC_NETWORK_ID=testnet-12
KASPA_WRPC_SUBMIT_SHAPE=object
```

Some build steps also require:

```sh
KASPA_WASM_MODULE=<path-to-tn12-kaspa-wasm>
```

## Safety Rules

- Never commit `.local/`.
- Never paste or use mainnet private keys.
- Treat `.local` wallet files as throwaway testnet-only material.
- Do not call a locally signed draft an external-wallet result.
- Promote UI/app state only after accepted txid, output or payload match, duplicate guard, and replay checks pass.
