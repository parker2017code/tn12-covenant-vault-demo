# Wallet Signer References

Reviewed: 2026-05-09

## Why This Exists

The repo's wallet-submit lane is not a wallet. It is a review and handoff surface for exact transaction drafts. KasSigner/KasSee is useful because it is a live public reference for the missing external-signer boundary:

- a watch-only companion builds unsigned transactions from public wallet data;
- the signer keeps private keys off the networked device;
- signing moves through QR/partially signed transaction formats;
- the broadcaster only promotes state after the signed transaction is submitted and accepted.

That is close to the shape this repo wants, while still being different from the TN12 covenant proof work.

## KasSigner / KasSee

Relevant public references:

- KasSigner repository: https://github.com/InKasWeRust/KasSigner
- KasSee companion: https://kassigner.org/
- KasMedia recap of the air-gapped signer and multisig test: https://kasmedia.com/article/heroes-in-the-making
- KasMedia recap of the low-cost offline signer walkthrough: https://kasmedia.com/article/coordination-markets
- Aspectron external signing guide: https://kaspa-mdbook.aspectron.com/transactions/signing.html

Current read:

- KasSigner is an experimental air-gapped Kaspa signer, not a production hardware wallet.
- Its safety boundary is explicit: no secure element, no persistent key storage, no professional audit, keys in RAM only, and user backups are the permanent storage.
- KasSee is the closer reference for this repo: a watch-only companion that imports public wallet data, tracks UTXOs, builds unsigned transactions, and broadcasts signed transactions without holding private keys.
- The PSKB / KSPT direction is more relevant to this repo than generic browser-wallet language, because covenant and payload drafts need exact transaction fields preserved.
- The reported 2-of-3 mainnet multisig test is useful wallet-convention evidence, especially around Kaspa-specific details such as sigOpCount handling, multisig unlock-script shape, and signature variant tagging.
- Reproducible builds, address verification, manual UTXO selection, custom-node selection, KRC transaction detection, and signed-QR broadcast are directly relevant review surfaces for this repo's eventual wallet-submit UX.

## Repo Mapping

What overlaps:

- `npm run wallet:submit-package` builds the exact transaction handoff package this repo wants a signer or wallet to review.
- `npm run wallet:connector-requests` produces request-shaped data for an external submit path.
- `npm run wallet:adapter-run` proves review-session shape without signing or broadcasting.
- `npm run wallet:submit-ledger` keeps pending wallet-submit rows separate from already accepted JSON wRPC evidence.
- `npm run wallet:result-validation` checks returned txids/routes against fingerprints, payload bytes, v1 compute budget fields, explicit user action, and accepted evidence.

What KasSigner/KasSee does that this repo does not:

- real external private-key custody;
- QR-based offline signing;
- kpub/watch-only address derivation;
- PSKB/KSPT parsing and signing;
- mainnet multisig signing/broadcast tests.

What this repo does that KasSigner/KasSee does not try to do:

- TN12 Silverscript/covenant proof transactions;
- accepted vault, assurance, escrow, and role-separated proof records;
- payload receipt and app-state indexing artifacts;
- batch-assurance pledge-output and settlement-draft evidence;
- claim-boundary matrices for script-enforced versus planner/indexer/wallet-policy state.

## Direction

Do not compete with KasSigner. Use it as a reference for the external signer boundary.

Near-term wallet-submit requirements should move toward:

1. PSKB/PSKT/KSPT compatibility research before inventing another draft transport.
2. A watch-only transaction builder path that never sees private keys.
3. Explicit review of network, inputs, outputs, fee, payload bytes, tx version, lock fields, and compute budget fields.
4. A route label for payload-preserving submit versus known bad submit routes.
5. Accepted-transaction verification before the repo promotes a wallet-submitted result.
6. Reproducible-build and signer-version metadata when an external signer becomes part of a proof claim.

Keep the current status honest: this repo has wallet-review artifacts, not a live external signer integration.
