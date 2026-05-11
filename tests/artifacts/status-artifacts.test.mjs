import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [provenStatus, operatorPack, payloadEvents] = await Promise.all([
  readJson("artifacts/proven-status.json"),
  readJson("artifacts/operator-receipt-pack.json"),
  readJson("fixtures/PayloadEventEvidence.json")
]);

assert.equal(provenStatus.schema, "tn12-proven-status/v1");
assert.equal(provenStatus.network, "kaspa-testnet-12");
assert.equal(provenStatus.status, "tn12-demo-proof-ready-mainnet-deferred");
assert.match(provenStatus.currentPercent, /^\d+-\d+%$/);
assert.equal(provenStatus.acceptedEvidence.payloadEvents, payloadEvents.events.length);
assert.equal(provenStatus.acceptedEvidence.proofTransactions, 9);
assert.equal(provenStatus.acceptedEvidence.roleSeparatedProofTransactions, 7);
assert.equal(provenStatus.readiness.externalSignerAccepted, false);
assert.equal(provenStatus.readiness.liveRollbackObserved, false);
assert.ok(provenStatus.mainnetDeferredBlockers.includes("external signer accepted result missing"));
assert.ok(provenStatus.boundaries.some((boundary) => boundary.includes("No-local-key signing")));

assert.equal(operatorPack.schema, "tn12-operator-receipt-pack/v1");
assert.equal(operatorPack.network, "kaspa-testnet-12");
assert.equal(operatorPack.status, "operator-receipt-pack-ready");
assert.equal(operatorPack.evidence.payloadEvents, provenStatus.acceptedEvidence.payloadEvents);
assert.equal(operatorPack.evidence.manifestEvents, provenStatus.acceptedEvidence.payloadEvents);
assert.equal(operatorPack.evidence.coreProofTransactions, provenStatus.acceptedEvidence.proofTransactions);
assert.equal(operatorPack.evidence.roleSeparatedProofTransactions, provenStatus.acceptedEvidence.roleSeparatedProofTransactions);
assert.equal(operatorPack.wallet.mode, "local-testnet-wallet");
assert.match(operatorPack.wallet.address, /^kaspatest:/);
assert.ok(operatorPack.wallet.boundary.includes("Local testnet wallet signing only"));
assert.ok(Array.isArray(operatorPack.wallet.acceptedReceipts));
assert.ok(operatorPack.wallet.acceptedReceipts.length >= 4);
assert.ok(operatorPack.nextCommandPath.every((step) => step.ready === true));
assert.ok(operatorPack.deferredMainnetRails.includes("external signer accepted result missing"));

for (const receipt of operatorPack.wallet.acceptedReceipts) {
  assert.match(receipt.txid, /^[0-9a-f]{64}$/);
  assert.ok(receipt.subject);
  assert.ok(Number.isInteger(receipt.acceptingBlockBlueScore));
}

console.log("Status artifact tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
