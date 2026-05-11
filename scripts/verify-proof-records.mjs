import { readFile } from "node:fs/promises";
import { verifyProofRecordSet } from "../src/proofRecordVerifier.mjs";

const proofEvidence = JSON.parse(await readFile("artifacts/proof-evidence.json", "utf8"));
const roleProofEvidence = JSON.parse(await readFile("artifacts/role-separated-proof-evidence.json", "utf8"));
const result = verifyProofRecordSet({ proofEvidence, roleProofEvidence });

if (result.failures.length) {
  console.error(JSON.stringify(result, null, 2));
  throw new Error(`Canonical proof-record verification failed: ${result.failures.length} failures`);
}

console.log(JSON.stringify(result, null, 2));
