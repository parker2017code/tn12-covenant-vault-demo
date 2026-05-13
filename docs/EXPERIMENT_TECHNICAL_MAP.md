# Experiment Technical Map

This is the technical companion to `experiments.html`.

The public page should keep the aha moments: what the rule could be used for,
why the money movement is easier to inspect, and what the user or wallet should
understand. This file keeps the mechanism details that make the proof auditable.

| Public job | Technical mechanism | Evidence | Boundary |
|---|---|---|---|
| Budget that cannot drain at once | Recurring-cap covenant, continuation output, reset-window branch | `artifacts/recurring-treasury-vault-window-reset-proof.json`, `artifacts/recurring-treasury-vault-window-post-reset-spend-evidence.json` | Accepted TN12 spends plus local over-cap and reset rejects. User-wallet signing and audit remain separate. |
| Step-by-step workflow that can recover | Mux / worker contract family, template routing, timeout return | `artifacts/blitz-mux-live-flow-evidence.json`, `artifacts/blitz-mux-challenge-settlement.json` | Accepted TN12 route/return/timeout/Worker B paths. This does not prove full game rules. |
| Asset that moves only with its controller | Sibling-input authorization / ICC, owner-marker covenant id, witness index | `artifacts/covenant-owned-asset-duel-live-strike-evidence.json`, `artifacts/sibling-input-discovery.json` | Accepted TN12 strike. Wrong witness, missing sibling, and wrong sibling id are local rejects. |
| Bad withdrawal checks | Guarded vault negative candidates over the accepted recurring-vault rail | `artifacts/covenant-heist-evidence.json` | Local script-engine rejects unless a future artifact records accepted or broadcast rejection evidence. |
| Group payment that releases or refunds | Assurance pledge release/refund spends on fresh pledge outputs | `artifacts/coordination-covenant-release-evidence.json`, `artifacts/coordination-covenant-refund-evidence.json` | Release and refund branches use separate fresh pledge sets. Threshold selection remains replay/planner logic. |
| Scheduled payout with replayable evidence | Scheduler receipt plus covenant payout output | `artifacts/scheduler-covenant-payout-evidence.json`, `artifacts/scheduler-covenant-payout-negative-evidence.json`, `artifacts/universal-scheduler-workbench.json` | Accepted payout spend. Trigger eligibility, winner selection, and stale/duplicate guards remain replay-derived. |

## Public-Page Rule

Keep these on the public page:

- possible use cases;
- why the spend or receipt is easier to inspect than a private server row;
- accepted, local-reject, or replay-derived evidence class;
- one or two links to the artifact.

Move these here or into artifacts:

- covenant ids;
- full txids;
- internal status slugs;
- template hashes;
- witness index details;
- compiler or script-engine implementation notes;
- long replay rows.
