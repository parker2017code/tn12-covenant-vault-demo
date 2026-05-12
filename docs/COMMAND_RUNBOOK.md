# Command Runbook

Use this before running commands copied from public pages. Commands have different safety classes; do not treat every snippet as safe to run without review.

## Start Here

If you are starting from a blank terminal, read `docs/CLI_FROM_ZERO.md` first.
This file is the command safety table; the zero guide explains the full path
from install, to local checks, to fresh testnet wallets, to replay.

Maintainer note: when Toccata becomes mainnet behavior, refresh
`docs/CLI_FROM_ZERO.md` and the Kaspa Explained command/status/source pages from
public activation evidence, Rusty Kaspa releases, official docs, and working
tool commands before changing public status language.

Prerequisite: Node.js `>=20.19.0 <25` and npm. Then install exactly from the lockfile:

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

Use this table before copying any command from `index.html`, `results.html`, `playground.html`, or `lab.html`.

| Class | Examples | Needs | Writes | Broadcasts? | Expected result |
|---|---|---|---|---|---|
| Local check | `npm run check:all`, `npm run check:ui` | Node.js, `npm ci` | no intended state changes | No | pass/fail output in the terminal |
| Public evidence refresh | `npm run check:tn12`, `npm run proof:verify` | Node.js, `npm ci`, internet access to TN12 APIs | no wallet files | No | verifies accepted proof and payload evidence |
| Artifact refresh | `npm run project:queue`, `npm run defi:accepted-activity` | Node.js, `npm ci`, repo fixtures | generated files under `artifacts/` or `fixtures/` | No, unless the script says submit | rebuilt local review artifacts |
| Fresh testnet wallet | `npm run address`, `npm run playground:wallets` | Node.js, `npm ci` | testnet-only wallet files under `.local/` | No | new public `kaspatest:` addresses |
| Role funding draft | `npm run playground:funding-draft` | Fresh playground role wallets plus a funded source wallet/outpoint. Defaults: `TN12_WALLET=.local/tn12-wallet.json`, `FUNDING_OUTPOINT=fixtures/FundedWalletOutpoint.json` | signed draft under `.local/playground/` | No | a reviewable multi-output funding draft |
| Submit/broadcast | `node scripts/submit-signed-draft.mjs ... --submit` or `node scripts/submit-signed-draft-wrpc.mjs ... --submit` | signed draft, funded UTXO, explicit user intent, correct TN12 endpoint/config | submit result artifact if the command is configured to write one | Yes | TN12 txid or explicit submit failure |
| Payload-preserving submit | `KASPA_WRPC_URL=... node scripts/submit-signed-draft-wrpc.mjs ... --submit` | `KASPA_WRPC_URL`, `KASPA_WRPC_ENCODING`, `KASPA_WRPC_NETWORK_ID`, `KASPA_WRPC_SUBMIT_SHAPE`, and the correct WASM route when building | submit result artifact if configured | Yes | accepted txid whose payload bytes can be replay-checked |

If a command is shown on a public page but you cannot classify it with this table, do not run it yet. Open the script in `package.json` or `scripts/` and add the missing command note first.

## Public Page Command Rule

- `index.html` should show only the shortest verification path.
- `results.html` should show proof-check commands, not local signing flows.
- `playground.html` may show wallet generation, funding draft, and explicit submit commands only with `.local/` and `--submit` warnings nearby.
- `lab.html` may show many artifact builders, but the page must link back to this runbook before the command wall.
- Any command containing `--submit` is a real TN12 testnet broadcast.
- Any command that creates wallets must say it writes `.local/` testnet-only material.
- Any command that rebuilds artifacts should say what file or page to inspect next.

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

Fresh-session check without touching the default `.local/playground/` directory:

```sh
PLAYGROUND_DIR=.local/command-check/playground npm run playground:wallets -- --force
PLAYGROUND_WALLETS_PUBLIC=.local/command-check/playground/wallets.public.json \
OUT=.local/command-check/playground/funding-draft.json \
PLAYGROUND_FUNDING_PLAN_OUT=.local/command-check/playground/funding-plan.public.json \
npm run playground:funding-draft
```

This writes throwaway testnet files under `.local/command-check/playground/`.

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
- Do not call a locally signed draft a user-wallet result.
- Promote UI/app state only after accepted txid, output or payload match, duplicate guard, and replay checks pass.
