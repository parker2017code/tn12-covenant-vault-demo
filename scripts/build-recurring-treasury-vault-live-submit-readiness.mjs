import { readFile, writeFile } from "node:fs/promises";
import { buildRecurringTreasuryVaultLiveSubmitReadiness } from "../src/recurringTreasuryVaultLiveSubmitReadiness.mjs";

const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-live-submit-readiness.json";

async function readJson(path, fallback = {}) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

const artifact = buildRecurringTreasuryVaultLiveSubmitReadiness({
  ownerSigProof: await readJson("artifacts/recurring-treasury-vault-owner-sig-proof.json"),
  contractOutpoint: await readJson("fixtures/RecurringTreasuryVaultContractOutpoint.json")
});

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
