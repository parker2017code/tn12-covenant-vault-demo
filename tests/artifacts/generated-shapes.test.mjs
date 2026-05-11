import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const txid = /^[0-9a-f]{64}$/;

const provenStatus = await readJson("artifacts/proven-status.json");
assert.equal(provenStatus.schema, "tn12-proven-status/v1");
assert.equal(provenStatus.network, "kaspa-testnet-12");
assert.ok(provenStatus.acceptedEvidence.payloadEvents > 0);
assert.ok(provenStatus.acceptedEvidence.proofTransactions > 0);
assert.ok(provenStatus.boundaries.some((boundary) => /No-local-key signing/.test(boundary)));
assert.equal(provenStatus.readiness.externalSignerAccepted, false);

const proofEvidence = await readJson("artifacts/proof-evidence.json");
assert.equal(proofEvidence.schema, "tn12-contract-spend-evidence/v1");
assert.ok(proofEvidence.summary.accepted > 0);
for (const proof of proofEvidence.proofs) {
  assert.match(proof.txid, txid);
  assert.equal(proof.accepted, true);
  assert.ok(proof.entrypoint);
  assert.equal(proof.checks.sourceOutpointMatchesExpected, true);
  assert.equal(proof.checks.outputAddressMatchesExpected, true);
}

const roleProofEvidence = await readJson("artifacts/role-separated-proof-evidence.json");
assert.equal(roleProofEvidence.schema, "tn12-contract-spend-evidence/v1");
assert.equal(roleProofEvidence.summary.total, 7);
assert.equal(roleProofEvidence.summary.accepted, 7);
assert.equal(roleProofEvidence.summary.matchedInputs, 7);

const payloadEvents = await readJson("fixtures/PayloadEventEvidence.json");
assert.ok(Array.isArray(payloadEvents.events));
for (const event of payloadEvents.events) {
  assert.ok(event.label);
  assert.ok(event.draftPath?.startsWith("artifacts/signed-drafts/"));
  assert.ok(event.outPath?.startsWith("artifacts/"));
  const evidence = await readJson(event.outPath);
  assert.match(evidence.txid, txid);
  assert.equal(evidence.accepted, true);
  assert.ok(evidence.payload?.decoded?.payload?.subject || evidence.invoiceId);
  assert.equal(evidence.payload?.matches ?? evidence.payloadMatches ?? evidence.receiptMatches, true);
}

const operatorPack = await readJson("artifacts/operator-receipt-pack.json");
assert.equal(operatorPack.schema, "tn12-operator-receipt-pack/v1");
assert.equal(operatorPack.status, "operator-receipt-pack-ready");
assert.equal(operatorPack.evidence.payloadEvents, payloadEvents.events.length);
assert.ok(operatorPack.wallet.boundary.includes("Local testnet wallet signing only"));
for (const receipt of operatorPack.wallet.acceptedReceipts) {
  assert.match(receipt.txid, txid);
  assert.ok(receipt.subject);
}

const nextTen = await readJson("artifacts/next-ten-execution-status.json");
assert.equal(nextTen.schema, "tn12-next-ten-execution-status/v1");
assert.equal(nextTen.status, "next-ten-execution-status-review");
assert.ok(nextTen.currentCompletionEstimate.afterLocalSlice);
assert.equal(nextTen.summary.externalSignerStillRequired, true);
assert.ok(nextTen.blockers.some((blocker) => /external[- ]signer/i.test(blocker)));

const defiArtifacts = [
  ["artifacts/defi-planner-simulation.json", "tn12-defi-planner-simulation/v1"],
  ["artifacts/defi-scenario-simulation.json", "tn12-defi-scenario-simulation/v1"],
  ["artifacts/defi-scenario-reducer.json", "tn12-defi-scenario-reducer/v1"],
  ["artifacts/defi-advanced-simulation.json", "tn12-defi-advanced-simulation/v1"],
  ["artifacts/defi-multi-wallet-scenario-pack.json", "tn12-defi-multi-wallet-scenario-pack/v1"],
  ["artifacts/defi-accepted-activity-ledger.json", "tn12-defi-accepted-activity-ledger/v1"],
  ["artifacts/defi-artifact-manifest.json", "tn12-defi-artifact-manifest/v1"],
  ["artifacts/scheduler-intent-registry.json", "tn12-scheduler-intent-registry/v1"],
  ["artifacts/scheduler-covenant-binding.json", "tn12-scheduler-covenant-binding/v1"],
  ["artifacts/full-defi-benchmark.json", "tn12-full-defi-benchmark/v1"]
];

for (const [path, schema] of defiArtifacts) {
  const artifact = await readJson(path);
  assert.equal(artifact.schema, schema);
  assert.equal(artifact.network, "kaspa-testnet-12");
  assert.match(artifact.status, /ready|simulation|review/);
  assert.equal(artifact.summary.liveProductClaims, 0);
  assert.equal(artifact.summary.custodyActions ?? artifact.summary.custodyReadyLanes ?? 0, 0);
  assert.doesNotMatch(JSON.stringify(artifact), /"privateKey"\s*:|"mnemonic"\s*:|"seed"\s*:|"secret"\s*:|\.local\/tn12-wallet\.json/i);
}

console.log("Generated artifact shape tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
