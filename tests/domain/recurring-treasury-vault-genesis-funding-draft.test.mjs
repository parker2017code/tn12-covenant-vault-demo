import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const localWasm = "/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa";
if (!process.env.KASPA_WASM_MODULE && existsSync(localWasm)) {
  process.env.KASPA_WASM_MODULE = localWasm;
}

const { buildWrpcTransactionFromArtifact, summarizeWrpcCandidate } = await import("../../src/wrpcSubmitCandidate.mjs");

const artifact = JSON.parse(await readFile("artifacts/signed-drafts/recurring-treasury-vault-genesis-funding.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-genesis-funding-draft/v1");
assert.equal(artifact.status, "signed-covenant-genesis-not-broadcast");
assert.equal(artifact.checks.transactionVersionIsV1, true);
assert.equal(artifact.checks.output0HasCovenantBinding, true);
assert.equal(artifact.checks.output0AuthorizingInputIsSourceInput, true);
assert.equal(artifact.checks.sourceInputComputeBudgetCoversP2pkSignature, true);
assert.equal(artifact.checks.sourceWalletMatchesFundingAddress, true);
assert.match(artifact.covenantGenesis.redeemScriptHash, /^[0-9a-f]{64}$/);
assert.match(artifact.covenantGenesis.scriptPublicKey, /^aa20[0-9a-f]{64}87$/);
assert.match(artifact.covenantGenesis.covenant.covenantId, /^[0-9a-f]{64}$/);
assert.equal(artifact.submitPayload.transaction.version, 1);
assert.equal(artifact.submitPayload.transaction.inputs[0].computeBudget, 10);
assert.equal(artifact.submitPayload.transaction.outputs[0].covenant.covenantId, artifact.covenantGenesis.covenant.covenantId);

const tx = buildWrpcTransactionFromArtifact(artifact);
const reconstructedCovenant = tx.outputs[0].toJSON().covenant;
if (reconstructedCovenant) {
  assert.equal(String(reconstructedCovenant.covenantId), artifact.covenantGenesis.covenant.covenantId);
}

const candidate = summarizeWrpcCandidate(artifact, {
  artifactPath: "artifacts/signed-drafts/recurring-treasury-vault-genesis-funding.json"
});
if (reconstructedCovenant) {
  assert.equal(candidate.txidMatches, true);
}
assert.equal(candidate.txVersion, 1);

console.log("Recurring treasury vault genesis funding draft tests passed.");
