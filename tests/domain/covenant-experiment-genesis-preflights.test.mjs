import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const rows = [
  {
    lane: "blitz-mux-arena",
    contract: "BlitzMux",
    draftPath: "artifacts/signed-drafts/blitz-mux-arena-genesis-funding.json",
    outpointPath: "fixtures/BlitzMuxArenaContractOutpoint.json"
  },
  {
    lane: "covenant-owned-asset-duel",
    contract: "CovenantOwnedAssetDuel",
    draftPath: "artifacts/signed-drafts/covenant-owned-asset-duel-genesis-funding.json",
    outpointPath: "fixtures/CovenantOwnedAssetDuelContractOutpoint.json"
  }
];

for (const row of rows) {
  const draft = JSON.parse(await readFile(row.draftPath, "utf8"));
  const outpoint = JSON.parse(await readFile(row.outpointPath, "utf8"));

  assert.equal(draft.schema, "tn12-covenant-experiment-genesis-funding-draft/v1");
  assert.equal(draft.network, "kaspa-testnet-12");
  assert.equal(draft.lane, row.lane);
  assert.equal(draft.contract, row.contract);
  assert.equal(draft.status, "signed-covenant-genesis-not-broadcast");
  assert.equal(draft.checks.output0HasCovenantBinding, true);
  assert.match(draft.covenantGenesis.covenant.covenantId, /^[0-9a-f]{64}$/);

  assert.equal(outpoint.schema, "tn12-contract-outpoint/v1");
  assert.equal(outpoint.network, "kaspa-testnet-12");
  assert.equal(outpoint.lane, row.lane);
  assert.equal(outpoint.contract, row.contract);
  assert.equal(outpoint.status, "accepted");
  assert.equal(outpoint.txid, draft.transactionId);
  assert.equal(outpoint.outputIndex, 0);
  assert.equal(outpoint.amountSompi, draft.covenantGenesis.amountSompi);
  assert.equal(outpoint.scriptPublicKey, draft.covenantGenesis.scriptPublicKey);
}

console.log("Covenant experiment genesis preflight tests passed.");
