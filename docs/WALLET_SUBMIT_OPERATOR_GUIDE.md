# Wallet Submit Operator Guide

Reviewed: 2026-05-10

## What This Lane Does

This lane reviews exact inputs, outputs, payload bytes, and submit routes before a transaction leaves the repo.

## Current Commands

- `npm run wallet:review`
- `npm run wallet:connector`
- `npm run wallet:submit-package`
- `npm run wallet:connector-requests`
- `npm run wallet:adapter-run`
- `npm run wallet:submit-ledger`
- `npm run wallet:result-validation`
- `npm run wallet:unsigned-requests`
- `npm run wallet:standard-map`
- `npm run wallet:standard-requests`
- `npm run wallet:standard-signer-validation`
- `npm run wallet:external-signer-template`

## Operator Flow

1. Review the signed draft or unsigned request.
2. Check payload bytes and compute-budget preservation.
3. Confirm the route is payload-preserving.
4. Require explicit user action before live submit.
5. Promote only after accepted evidence exists.

## Failure Cases

- REST submit that drops payload bytes;
- local-key-only submit path;
- compute-budget rewritten into sigOpCount;
- missing accepted evidence;
- promotion without explicit user action.

## Do Not Claim

- no-local-key signing is live until an external signer returns a matching transaction;
- a submit ledger proves connector liveness;
- a payload-preserving draft means the network accepted it.
