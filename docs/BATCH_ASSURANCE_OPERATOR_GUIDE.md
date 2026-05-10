# Batch Assurance Operator Guide

Reviewed: 2026-05-10

## What This Lane Does

Batch assurance groups pledge outputs and only moves to release when the accepted custody outputs match the target.

## Current Commands

- `npm run campaign:state`
- `npm run campaign:custody`
- `npm run campaign:custody-requirements`
- `npm run campaign:pledge-outputs`
- `npm run campaign:custody-imports`
- `npm run campaign:pledge-funding-draft`
- `npm run campaign:settlement-drafts`
- `npm run campaign:settlement-decision`

## Operator Flow

1. Confirm the accepted pledge outputs exist.
2. Import the outpoints.
3. Check the amount match.
4. Review the release and refund drafts.
5. Pick one settlement path.
6. Submit only one mutually exclusive path.

## Failure Cases

- pledge amount mismatch;
- duplicate outpoint;
- missing accepted evidence;
- release submitted before custody is matched;
- both release and refund attempted on the same outputs.

## Do Not Claim

- pooled custody enforcement exists if the target only lives in planner state;
- signed drafts are the same thing as broadcast acceptance;
- both settlement branches can be executed on one pledge set.
