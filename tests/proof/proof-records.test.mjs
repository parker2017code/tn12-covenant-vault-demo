import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { verifyProofRecordSet } from "../../src/proofRecordVerifier.mjs";

const proofEvidence = JSON.parse(await readFile("artifacts/proof-evidence.json", "utf8"));
const roleProofEvidence = JSON.parse(await readFile("artifacts/role-separated-proof-evidence.json", "utf8"));
const result = verifyProofRecordSet({ proofEvidence, roleProofEvidence });

assert.equal(result.schema, "tn12-canonical-proof-record-verification/v1");
assert.equal(result.summary.records, 16);
assert.equal(result.summary.failed, 0);
assert.deepEqual(result.failures, []);
assert.ok(result.records.some((record) => record.lane === "vault" && record.timingClass === "time-or-daa-constrained"));
assert.ok(result.records.some((record) => record.lane === "auction" && record.expectedInputType === "pubkey"));
assert.ok(result.records.every((record) => BigInt(record.feeSompi) >= 0n));

assertMutation("output-address-mismatch", (mutated) => {
  mutated.proofs[0].checks.outputAddressMatchesExpected = false;
});

assertMutation("source-outpoint-mismatch", (mutated) => {
  mutated.proofs[0].checks.sourceOutpointMatchesExpected = false;
});

assertMutation("source-amount-mismatch", (mutated) => {
  mutated.proofs[0].checks.sourceAmountMatchesExpected = false;
});

assertMutation("output-not-pubkey", (mutated) => {
  mutated.proofs[0].output.type = "scripthash";
});

assertMutation("unknown-timing-class", (mutated) => {
  mutated.proofs[0].entrypoint = "unexpected";
});

assertMutation("negative-fee", (mutated) => {
  mutated.proofs[0].input.amount = "1000";
  mutated.proofs[0].output.amount = "2000";
});

function assertMutation(expectedFailure, mutate) {
  const mutated = structuredClone(proofEvidence);
  mutate(mutated);
  const mutatedResult = verifyProofRecordSet({ proofEvidence: mutated });

  assert.equal(mutatedResult.summary.failed, 1);
  assert.ok(
    mutatedResult.failures.some((failure) => failure.includes(expectedFailure)),
    `expected failure ${expectedFailure}`
  );
}

console.log("Proof-record tests passed.");
