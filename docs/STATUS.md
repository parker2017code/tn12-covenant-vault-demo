# Status Discipline

## Current Demo Status

- Local browser prototype: live in this repo.
- Policy designer and simulator: implemented.
- Assurance contract designer and simulator: implemented.
- Local TN12 test address helper: implemented with Rusty Kaspa WASM bindings.
- Saved TN12 address: `kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt`.
- Saved address funding: user-reported manual check says about 10,000 TN12 KAS/TKAS is available.
- Initial UTXO fetched from `api-tn12.kaspa.org`: `f6ca76d93accf1a468de36ba35439bc8ca5cb2e1ba28f30b3220586e90bb0aee:0`, amount `10000` TKAS.
- Dry-run transaction planner: implemented for vault funding, delayed withdrawal, recovery, assurance pledge, release, and refund.
- Real transaction builder: implemented for P2PK self-send, split funding, P2SH contract funding, and P2SH contract spends.
- Real signing and serialization: implemented for local testnet drafts. Broadcast is route-specific: contract proof spends and payload events use the documented TN12 submit scripts, while payload receipts must use JSON wRPC because public REST dropped payload bytes.
- Accepted-transaction app-state indexer: implemented for the current proof and payload fixtures with `npm run indexer:state`, `npm run indexer:checkpoint`, and `npm run check:tn12`.
- Vault recovery: submitted and accepted with a 5000-sompi embedded fee.
- Vault delayed withdrawal: submitted and accepted with a past DAA-score lock.
- Assurance release: submitted and accepted for the individual pledge primitive.
- Assurance refund: submitted and accepted with a past DAA-score deadline.
- Proof evidence artifact: `npm run proof:evidence` confirms all seven proof spends consume TN12 P2SH (`p...`) contract outputs and pay the expected P2PK (`q...`) saved wallet output.
- Payload evidence artifacts: `npm run payload:verify:events` confirms 26 accepted payload events with matched payload bytes.
- Wallet connector: not implemented.
- Silverscript templates: drafted.
- Silverscript compiler integration: helper added; artifacts depend on local `silverc`.
- Faucet automation: not available from this shell because the faucet returns a Cloudflare challenge.
- Local full-node workflow: removed from this project to keep the machine lighter.

## Accepted TN12 Transactions

- Initial split from the 10,000 TKAS UTXO: `cc853951471745753284096f200334c8475a90d10ddbafd68031ac3ebb71f0eb`.
- First 1000-sompi contract deployment proved the fee was too low for recovery spend; TN12 required `1784` sompi.
- 5000-sompi vault funding: `4051184914011dd5399f4042fe5be0e5031b5f57e05b055ee676c36ad5a468b6`.
- 5000-sompi assurance pledge funding: `3012b541bc10832e8440a16424cdefbdbe84e85f8e212fd40d595debfb3b87da`.
- Vault recovery spend: `b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391`.
- Assurance release spend: `80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f`.
- DAA-score split for timed-path testing: `83548474ab77b79f7bc872ba5879519a6f311a64ecd5e1c92e04df17abf40eac`.
- DAA-score vault funding: `19061b314fa11cc075a078e0bcaa5f381e493f9810ae2aefa8c3aa814a14bcaa`.
- DAA-score assurance pledge funding: `f479eac4e3b1e0abde679bdf31c8203c0d3d151997a74da2444ae75ae49157e7`.
- Vault delayed withdrawal spend: `9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710`.
- Assurance refund spend: `faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61`.
- Escrow funding: `6042f46571a1b983f9d823562813bd0a99793bfcae81aa15d5ac82268c3f8ba2`.
- Escrow release spend: `825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d`.
- DAA-expired escrow refund funding: `f839eb30667eed509a55dae382da6aeeccebe21014bf6fc74f4bf0f2f204a96f`.
- DAA-expired escrow refund spend: `6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d`.
- Escrow cancel funding: `331b0372e9a8dd12516a772c9ce983f519031fa6970113a64eae16c0fcf4f022`.
- Escrow mutual cancel accepted proof: `14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c`. Earlier failures remain historical: one wrong script budget, one old-SDK path that did not preserve tx v1 `computeBudget`.
- Role-separated funding: `ce1a94b8ced52cbc73e8f79c173e6b3611fa0c57fa3a712db64da290f555f4e0`.
- Role-separated vault recovery: `dbe2c3ea5cf7e93031db468a8906be16fdc1a2e4b6382d14d7d01e67e71274e0`. Earlier `sigOpCount: 2` recovery rejection is historical; accepted retry uses `sigOpCount: 1`.
- Role-separated assurance release: `fe2fba8819f3022f62892215b1bc4316377ffb7e54f833549d30bd247d8fda32`.
- Role-separated escrow release: `4f882d934700667819a4c7ad84f51a63e9db4e7b8989bfd65089410051f47382`.
- Cancel-debugging rule: check artifacts, constructor keys, witness order, sighash/preimage shape, accepted sibling spends, SDK/API shape, node/network id, and Rusty Kaspa source/tests before escalating.
- Accepted cancel route after the sigop fix: local TN12 `kaspa-wasm 1.1.1-toc.1` with tx version 1, constructor fields `sigOpCount: 0` plus `computeBudget: 30`, submitted over JSON wRPC to `testnet-12`.

Latest fetched contract output addresses before the timed spends were:

- Vault: `kaspatest:pqzs5gsqn2k209c6u3htd93uyzavx7dm7t58txa83d057e2e0ta4qn8nly5sn`.
- Assurance: `kaspatest:pqug9en8x39e44hevz8pdc5tjmd2ns3nc93une2yn6s65934dkvlzgakg8ajj`.
- Escrow: `kaspatest:pr3x90f5geklry4lytdspzsve9zcdmafzp4v5v7km75gvhwg7v9azvapwu33v`.

Proof-spend input evidence:

- Vault recovery input: `kaspatest:prk2u9cexve3qscnp3dug8r20qauql5ygyhlxyre63dn64vemz6qjwyktx9cw`, type `scripthash`, prefix `p`.
- Vault delayed withdrawal input: `kaspatest:pqzs5gsqn2k209c6u3htd93uyzavx7dm7t58txa83d057e2e0ta4qn8nly5sn`, type `scripthash`, prefix `p`.
- Assurance release input: `kaspatest:prfzsga33hgfsydw7vyn8grfctmh83cz7ux53wa33cznsc4fqtf359eej4ztg`, type `scripthash`, prefix `p`.
- Assurance refund input: `kaspatest:pqug9en8x39e44hevz8pdc5tjmd2ns3nc93une2yn6s65934dkvlzgakg8ajj`, type `scripthash`, prefix `p`.
- Escrow release input: `kaspatest:pr3x90f5geklry4lytdspzsve9zcdmafzp4v5v7km75gvhwg7v9azvapwu33v`, type `scripthash`, prefix `p`.
- Escrow DAA refund input: `kaspatest:pz67j8d7nhxvftqjnffdjcp8xgucqduqfl33ndxsydxeag5dkezs56cs3fuvx`, type `scripthash`, prefix `p`.
- Escrow mutual cancel input: `kaspatest:pzqkhmevkrg87hph7dmk8keknjn7zkhw0x05d0yl4t43fcqvp6j3g728t6zmc`, type `scripthash`, prefix `p`.

## Transaction Planner Boundary

- `npm run plan` emits dry-run JSON only.
- Vault and assurance are separate app lanes, but they share the same manual funding, contract artifact, transaction builder, signer, broadcast, and explorer-verification plumbing.
- The vault planner covers funding, delayed withdrawal, and recovery.
- The assurance planner covers an individual pledge, release, and refund.
- Assurance target aggregation is still app/planner-side. The current pledge contract does not prove by itself that a full campaign target was reached.
- ZK is not needed for the next step. It may become useful later for compact proofs of larger off-chain campaign/state rules.

## Kaspa Status Boundaries

- Kaspa mainnet live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS.
- TN12: testnet covenant experimentation, not mainnet activation.
- Toccata: targeted hard-fork path until primary activation evidence says otherwise.
- vProgs: roadmap architecture.
- Cross-app atomic composition: later vProgs direction, not a TN12 vault feature.

## Mainnet And Testnet Split

- Mainnet addresses use the `kaspa:` prefix. Do not use keys from this repo for mainnet.
- TN12 addresses use the `kaspatest:` prefix and faucet tokens have no value.
- User-reported funding should be treated as a working assumption until a transaction is attempted or explorer data is pasted into the app.
- Keep any private key in `.local/tn12-wallet.json` only. Do not paste it into docs, source, chat, or public sites.

## Why A Vault First

Vaults are a good first contribution because they turn covenants into a concrete user picture:

- funds can only leave after a delay,
- a recovery address can regain control,
- spending can be limited,
- a user can cancel a suspicious withdrawal,
- a policy can be explained before funds move.

This builds the primitive layer before speculative DeFi.
