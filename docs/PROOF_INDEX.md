# Proof Index

Reviewed: 2026-05-10

This is the short index for accepted TN12 proof evidence, historical rejections, and the next live rails.

## Accepted proof evidence

| Rail | Status | Primary artifact |
|---|---|---|
| Vault / assurance / escrow proof suite | Accepted | `artifacts/proof-evidence.json` |
| Role-separated positive proofs | Accepted | `artifacts/role-separated-proof-evidence.json` |
| Payload receipt | Accepted | `artifacts/payload-receipt-evidence.json` |
| Payload refund | Accepted | `artifacts/payload-refund-evidence.json` |
| Payload error | Accepted | `artifacts/payload-error-evidence.json` |
| Batch-assurance release output | Accepted | `fixtures/AcceptedOutputEvidence.json` |

## Planner / indexer state

| Rail | Status | Primary artifact |
|---|---|---|
| Batch-assurance campaign | Planner state | `artifacts/batch-assurance-campaign.json` |
| Batch-assurance refund drafts | Non-selected alternate | `artifacts/batch-assurance-settlement-drafts.json` |
| Public payload submit readiness | Historical limitation | `artifacts/payload-submit-readiness.json` |

## Historical or rejected evidence

| Rail | Status | Primary artifact |
|---|---|---|
| Old escrow cancel attempt | Historical rejection | `artifacts/escrow-cancel-attempt.json` |
| Role-separated invalid candidates | Local review only | `artifacts/role-separated-invalid-candidates.json` |

## Current live rails

| Rail | Status | Next step |
|---|---|---|
| Wallet connector / external signer | WIP | Wire a real external signer round trip |
| Virtual-chain live indexer | WIP | Test the bounded adapter against a configured TN12 endpoint |
| Batch-assurance alternate-path cleanup | WIP | Keep refund drafts non-selected after accepted release |
| Escrow marketplace demo | WIP | Build the concrete demo on the accepted escrow output |

## Notes

- Keep accepted proof, planner/indexer state, and research lanes separate.
- Do not treat local reducer tests as proof of live acceptance.
- Keep the current verified TN12 endpoint in `docs/TN12_ENDPOINTS.md`.
