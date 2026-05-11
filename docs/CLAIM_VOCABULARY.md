# Claim Vocabulary

Short reviewer labels used across the repo.

| Label | Meaning |
|---|---|
| `SCRIPT_ENFORCED` | The Silverscript spend path enforces the named condition. |
| `PLANNER_ONLY` | Repo or UI planning logic models the rule; the contract does not enforce it. |
| `WALLET_POLICY` | A signer, wallet, or operator review step must enforce the rule before signing or broadcast. |
| `INDEXER_DERIVED` | Accepted transactions or payload bytes exist; app state is derived by repo/indexer logic. |
| `TN12_ACCEPTED` | A transaction or payload event is accepted on Kaspa testnet-12 and checked by repo commands. |
| `TN12_REJECTED` | A candidate was rejected by TN12 or by local validation before being treated as evidence. |
| `LOCAL_KEY_CUSTODY_TEST` | Real TN12 testnet funds move under repo-held local keys; useful for custody-adjacent testing, not production custody or external wallet signing. |
| `LOCAL_TEST_ONLY` | Local fixture, draft, simulation, or template evidence; not an accepted TN12 result. |
| `MAINNET_BLOCKED` | Useful proof exists, but mainnet activation, wallet, indexer, or custody requirements are not met. |
| `RESEARCH_ONLY` | Design or scouting material, not a working product claim. |

Use the narrowest label that fits. Do not upgrade planner, wallet, indexer, or research state into script enforcement.
