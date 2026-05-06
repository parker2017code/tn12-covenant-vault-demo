# TN12 Covenant Vault Demo

Local prototype for a Kaspa TN12 covenant vault app.

This is not a mainnet wallet, not investment advice, and not proof that Toccata or vProgs are live. The first goal is to make covenant-style vault rules understandable, testable, and easy for Kaspa builders to critique.

## What It Does Now

- Designs a vault policy with:
  - owner address,
  - recovery address,
  - withdrawal delay,
  - daily spend limit,
  - guardian threshold,
  - optional memo.
- Produces a deterministic policy ID in the browser.
- Simulates the lifecycle from design to funding, withdrawal request, delay, release, cancel, and recovery.
- Exports a JSON policy artifact that can later become input for Silverscript or TN12 transaction tooling.

## What It Does Not Do Yet

- It does not create or broadcast Kaspa transactions.
- It does not hold funds.
- It does not connect to a wallet.
- It does not claim mainnet covenant support.
- It does not implement full vProgs or cross-app atomic composition.

## TN12 Test Tokens

The faucet lead found for TN12 is:

```txt
https://faucet-tn12.kaspanet.io/
```

From this shell, the faucet host responds but returns a Cloudflare challenge, so automated token requests are not available here. Use a browser, paste a `kaspatest:` address, and treat the tokens as testnet-only with no value.

Create a local TN12 test address:

```sh
npm run address
```

The script prints a `kaspatest:` address for the faucet and writes the testnet-only wallet material to:

```txt
.local/tn12-wallet.json
```

`.local/` is ignored by git. Do not use that private key for mainnet funds.

Useful TN12 explorer:

```txt
https://tn12.kaspa.stream/
```

## Run Locally

```sh
python3 -m http.server 4176
```

Open:

```txt
http://127.0.0.1:4176/
```

## Check

```sh
node scripts/check.mjs
```

## Suggested Next Build Steps

1. Verify a working TN12 wallet/address/faucet loop manually in the browser.
2. Add a `kaspa:` / `kaspatest:` address validator.
3. Convert the policy artifact into a Silverscript-oriented covenant template.
4. Add a dry-run transaction planner for funding, delayed spend, cancel, and recovery paths.
5. Add a real TN12 broadcast path only after node/wallet tooling is confirmed.

## Assurance Contracts

The strongest next app lane is an assurance contract: contributors pledge funds toward a goal, funds release only if the goal is met before a deadline, and contributors can refund otherwise.

See `docs/ASSURANCE_CONTRACTS.md`.
