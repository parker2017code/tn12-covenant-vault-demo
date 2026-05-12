# Proof Index

Reviewed: 2026-05-10

This is the short index for accepted TN12 proof evidence, historical rejections, and open rails.

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

## Open rails

| Rail | Status | Next step |
|---|---|---|
| Wallet connector / user-wallet signing | Open | Wire a real user-wallet signing round trip |
| Virtual-chain live indexer | Open | Test the bounded adapter against a configured TN12 endpoint |
| Batch-assurance alternate-path cleanup | Open | Keep refund drafts non-selected after accepted release |
| Escrow marketplace demo | Open | Build the concrete demo on the accepted escrow output |

## Notes

- Keep accepted proof, planner/indexer state, and research lanes separate.
- Do not treat local reducer tests as proof of live acceptance.
- Keep the current verified TN12 endpoint in `docs/TN12_ENDPOINTS.md`.
