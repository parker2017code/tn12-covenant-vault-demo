# Escrow Operator Guide

Reviewed: 2026-05-10

## What This Lane Does

Escrow funds a buyer-seller covenant flow with release, refund, and cancel paths.

## Before Running Commands

- Run `npm ci` first.
- Builder commands may write draft artifacts under `artifacts/signed-drafts/`.
- Any submit command with `--submit` is a real TN12 broadcast; use testnet-only funds and keys.
- Local signed drafts are useful test evidence, but they are not a user-wallet result.

## Current Commands

- `npm run escrow:registry`
- `npm run escrow:marketplace`
- `npm run escrow:flow`
- `npm run escrow:action-map`
- `npm run tx:escrow:fund`
- `npm run tx:escrow:spends`

## Operator Flow

1. Review the escrow action map.
2. Confirm the funding outpoint is accepted.
3. Pick one settlement path.
4. Review the matching draft.
5. Submit only the intended path.
6. Do not submit mutually exclusive spends for the same output.

## Failure Cases

- wrong source outpoint;
- stale funding fixture;
- mixed release/refund/cancel paths;
- missing wallet review;
- payload route confusion.

## Do Not Claim

- a marketplace is live just because the draft exists;
- cancel, refund, and release can all be submitted for one output;
- local draft signing proves live wallet support.
