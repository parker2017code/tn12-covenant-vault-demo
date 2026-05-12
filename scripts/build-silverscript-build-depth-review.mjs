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

const artifact = buildSilverscriptBuildDepthReview({
  status,
  contractOutpoint,
  compiledArtifact,
  jsWasm: {
    transactionOutputConstructor: "constructor(value: bigint, script_public_key: ScriptPublicKey)"
  }
});

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
