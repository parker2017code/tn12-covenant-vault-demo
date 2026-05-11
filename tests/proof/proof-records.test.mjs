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

const mutated = structuredClone(proofEvidence);
mutated.proofs[0].checks.outputAddressMatchesExpected = false;
const mutatedResult = verifyProofRecordSet({ proofEvidence: mutated });

assert.equal(mutatedResult.summary.failed, 1);
assert.ok(mutatedResult.failures.some((failure) => failure.includes("output-address-mismatch")));

console.log("Proof-record tests passed.");
