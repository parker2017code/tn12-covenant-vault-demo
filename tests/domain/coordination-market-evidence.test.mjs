import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildCoordinationMarketEvidenceDossier } from "../../src/coordinationMarketEvidenceDossier.mjs";
import { buildCoordinationMarketPrototype } from "../../src/coordinationMarket.mjs";
import { buildCoordinationMarketSettlementBrief } from "../../src/coordinationMarketSettlementBrief.mjs";

const coordinationPrototype = await readJson("artifacts/coordination-market-prototype.json");
const settlementBrief = await readJson("artifacts/coordination-market-settlement-brief.json");
const dossier = buildCoordinationMarketEvidenceDossier({
  coordinationPrototype,
  settlementBrief,
  acceptedOutputs: await readJson("fixtures/AcceptedOutputEvidence.json"),
  custodyImports: await readJson("artifacts/batch-assurance-custody-imports.json"),
  settlementDrafts: await readJson("artifacts/batch-assurance-settlement-drafts.json"),
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json"),
  generatedAt: "2026-05-12T00:00:00.000Z"
});

assert.equal(dossier.schema, "tn12-coordination-market-evidence-dossier/v1");
assert.equal(dossier.status, "transparent-coordination-evidence-ready");
assert.equal(dossier.summary.qualifyingIntendos, 3);
assert.equal(dossier.summary.qualifyingTkas, 100);
assert.equal(dossier.summary.releaseAccepted, true);
assert.equal(dossier.summary.releaseTxid, "4d84472e9796b90875fb1bfbdd8a36e94e1727592247a52966f26e8ea65f6801");
assert.equal(dossier.summary.mainnetClaims, 0);
assert.equal(dossier.summary.productionCustodyClaims, 0);
assert.equal(dossier.summary.opaqueExecutionClaims, 0);
assert.ok(dossier.participants.every((row) => row.evidenceStatus === "accepted-payload-and-custody"));
assert.ok(dossier.participants.every((row) => row.amountMatches === true));
assert.ok(dossier.participants.every((row) => /^0b819695/.test(row.acceptedCustodyOutpoint)));
assert.equal(dossier.selectedRelease.status, "accepted-on-tn12");
assert.match(dossier.selectedRelease.explorerUrl, /tn12\.kaspa\.stream/);
assert.equal(dossier.alternateRoutes.length, 3);
assert.ok(dossier.alternateRoutes.every((route) => route.status === "non-selected-after-release"));
assert.ok(dossier.boundaries.some((boundary) => /user-wallet signing/.test(boundary)));

const livePrototype = buildCoordinationMarketPrototype(await readJson("fixtures/CoordinationMarketPrototype.json"));
const liveBrief = buildCoordinationMarketSettlementBrief({
  fixture: await readJson("fixtures/CoordinationMarketSettlementBrief.json"),
  coordinationPrototype: livePrototype
});
assert.equal(liveBrief.blockedPacks.length, 1);
assert.equal(liveBrief.blockedPacks[0].packId, "pack-stag-liquidity-migration-research");
assert.equal(liveBrief.blockedPacks[0].status, "not-satisfiable");
assert.equal(liveBrief.blockedPacks[0].nextRoute, "refund-or-keep-accumulating");

const checkedIn = await readJson("artifacts/coordination-market-evidence-dossier.json");
assert.equal(checkedIn.status, dossier.status);
assert.equal(checkedIn.summary.qualifyingIntendos, dossier.summary.qualifyingIntendos);
assert.equal(checkedIn.selectedRelease.txid, dossier.selectedRelease.txid);

console.log("Coordination market evidence dossier tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
