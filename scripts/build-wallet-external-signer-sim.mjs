import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletExternalSignerSim } from "../src/walletExternalSignerSim.mjs";

const roundtripPlanPath = process.env.ROUNDTRIP_PLAN || "artifacts/wallet-external-signer-roundtrip-plan.json";
const outPath = process.env.OUT || "artifacts/wallet-external-signer-sim-results.json";
const signerName = process.env.SIGNER_NAME || "local-sim";
const signerVersion = process.env.SIGNER_VERSION || "0.1.0";

const roundtripPlan = JSON.parse(await readFile(roundtripPlanPath, "utf8"));

// Load each signed draft referenced by the roundtrip plan
const signedDrafts = {};
for (const row of roundtripPlan.rows || []) {
  const draftPath = row.sourceSignedDraftPath;
  if (draftPath) {
    try {
      signedDrafts[draftPath] = JSON.parse(await readFile(draftPath, "utf8"));
    } catch {
      // Leave missing — sim will flag it
    }
  }
}

const simResults = buildWalletExternalSignerSim({ roundtripPlan, signedDrafts, signerName, signerVersion });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(simResults, null, 2)}\n`);

console.log(outPath);
console.log(`status=${simResults.status}`);
console.log(`passed=${simResults.summary.passed}/${simResults.summary.requests}`);
console.log(`fingerprintPreserved=${simResults.summary.fingerprintPreserved}`);
console.log(`payloadPreserved=${simResults.summary.payloadPreserved}`);
