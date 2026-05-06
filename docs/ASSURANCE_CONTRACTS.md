# Assurance Contract Plan

An assurance contract is a funding rule strangers can rely on:

- contributors pledge funds toward a goal,
- the project receives funds only if the goal is met before a deadline,
- contributors can refund if the goal is not met,
- everyone can inspect the rule before sending funds.

This is a better first TN12 app than complex DeFi because it proves the useful primitive: conditional money movement without trusting one operator.

## What We Need

### 1. Contract State

Minimum state:

- `campaign_id`
- `creator_pubkey`
- `recipient_pubkey`
- `refund_pubkey` for each pledge
- `goal_amount`
- `pledged_amount`
- `deadline`
- `status`: open, succeeded, refunded, cancelled

For the first version, avoid a giant shared mutable pool. Start with individual pledge outputs. Each pledge knows the campaign, amount, contributor refund key, deadline, and recipient.

### 2. Spending Paths

First useful paths:

- `refund`: contributor can reclaim after deadline if the campaign did not succeed.
- `release`: recipient can collect if the success proof shows the goal was reached before deadline.
- `cancel`: creator can cancel before release if the campaign terms are invalid or unsafe.

The hard part is the success proof. We should not fake it. Start with a local simulator and then choose one of these TN12 approaches:

- simple coordinator proof: an app gathers pledges and builds a release transaction that consumes enough pledge outputs;
- covenant ID / state transition proof: a campaign state output tracks total pledged amount;
- later ZK proof: a proof verifies enough pledges without exposing or manually listing everything.

### 3. Silverscript Template

Silverscript is the right next tool. It is experimental and TN12-only, but it is meant to make covenant scripts readable and LLM-friendly.

Relevant example patterns from `kaspanet/silverscript`:

- `transfer_with_timeout.sil`: recipient spend before timeout, sender reclaim after timeout.
- `covenant_escrow.sil`: arbiter-controlled send to one of two parties.
- `covenant_last_will.sil`: recovery / refresh style paths.
- `hodl_vault.sil`: condition plus signature plus external data signature.

Our first assurance contract can combine the timeout/refund shape with a release condition.

### 4. App Pieces

Browser app:

- campaign designer,
- pledge simulator,
- refund/release state machine,
- JSON export.

Silverscript layer:

- `contracts/AssurancePledge.sil`,
- compile artifact,
- ABI notes,
- test vectors.

TN12 integration:

- address generation,
- faucet funding,
- transaction plan,
- local or public TN12 node RPC,
- explorer link for resulting outputs.

### 5. What Not To Claim

- Do not claim this is mainnet-ready.
- Do not claim general smart contracts are live.
- Do not claim full vProgs or cross-app atomic composition.
- Do not claim funds are safe until real script tests and transaction tests pass.

## Suggested Milestone Order

1. Add an assurance campaign simulator beside the vault simulator.
2. Add a draft `AssurancePledge.sil` based on the timeout and escrow examples.
3. Compile it with Silverscript locally.
4. Add test vectors for refund and release paths.
5. Only then wire TN12 transaction creation and broadcast.
