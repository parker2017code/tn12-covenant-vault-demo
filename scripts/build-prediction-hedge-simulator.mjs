import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAttestationRegistry } from "../src/attestationSignal.mjs";
import { buildPredictionHedgeSimulator } from "../src/predictionHedgeSimulator.mjs";

const fixturePath = process.env.PREDICTION_FIXTURE || "fixtures/PredictionHedgeSimulator.json";
const attestationPath = process.env.ATTESTATION_FIXTURE || "fixtures/AttestationSignals.json";
const outPath = process.env.OUT || "artifacts/prediction-hedge-simulator.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const attestationFixture = JSON.parse(await readFile(attestationPath, "utf8"));
const attestationRegistry = buildAttestationRegistry(attestationFixture);
const simulator = buildPredictionHedgeSimulator({ fixture, attestationRegistry });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(simulator, null, 2)}\n`);

console.log(outPath);
console.log(`markets=${simulator.summary.markets}`);
console.log(`positions=${simulator.summary.positions}`);
console.log(`reviewSuggestions=${simulator.summary.reviewSuggestions}`);
