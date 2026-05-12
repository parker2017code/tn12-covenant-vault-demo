import { readFile, writeFile } from "node:fs/promises";
import { buildSilverscriptBuildDepthReview } from "../src/silverscriptBuildDepthReview.mjs";

const outPath = process.env.OUT || "artifacts/silverscript-build-depth-review.json";

async function readJson(path, fallback = {}) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

const status = await readJson("artifacts/recurring-treasury-vault-status.json");
const contractOutpoint = await readJson("fixtures/RecurringTreasuryVaultContractOutpoint.json");
const compiledArtifact = await readJson("artifacts/RecurringTreasuryVault.json");
const stateProof = await readJson("artifacts/recurring-treasury-vault-state-proof.json");
const ownerSigProof = await readJson("artifacts/recurring-treasury-vault-owner-sig-proof.json");
const liveSubmitReadiness = await readJson("artifacts/recurring-treasury-vault-live-submit-readiness.json");
const rustSubmitRouteProbe = await readJson("artifacts/recurring-treasury-vault-rust-submit-route-probe.json");

const artifact = buildSilverscriptBuildDepthReview({
  status,
  contractOutpoint,
  compiledArtifact,
  stateProof,
  ownerSigProof,
  liveSubmitReadiness,
  rustSubmitRouteProbe,
  jsWasm: {
    transactionOutputConstructor: "constructor(value: bigint, script_public_key: ScriptPublicKey)"
  }
});

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
