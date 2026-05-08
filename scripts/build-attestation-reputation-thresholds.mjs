import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAttestationRegistry } from "../src/attestationSignal.mjs";
import { buildAttestationReputationThresholds } from "../src/attestationReputationThresholds.mjs";

const fixturePath = process.env.ATTESTATION_FIXTURE || "fixtures/AttestationSignals.json";
const outPath = process.env.OUT || "artifacts/attestation-reputation-thresholds.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const attestationRegistry = buildAttestationRegistry(fixture);
const thresholds = buildAttestationReputationThresholds({ attestationRegistry });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(thresholds, null, 2)}\n`);

console.log(outPath);
console.log(`status=${thresholds.status}`);
console.log(`influenceAllowedSources=${thresholds.summary.influenceAllowedSources}`);
console.log(`influenceAllowedSignals=${thresholds.summary.influenceAllowedSignals}`);
