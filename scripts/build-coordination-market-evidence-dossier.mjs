import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildCoordinationMarketEvidenceDossier } from "../src/coordinationMarketEvidenceDossier.mjs";

const outPath = process.env.OUT || "artifacts/coordination-market-evidence-dossier.json";

const dossier = buildCoordinationMarketEvidenceDossier({
  coordinationPrototype: await readJson("artifacts/coordination-market-prototype.json"),
  settlementBrief: await readJson("artifacts/coordination-market-settlement-brief.json"),
  acceptedOutputs: await readJson("fixtures/AcceptedOutputEvidence.json"),
  custodyImports: await readJson("artifacts/batch-assurance-custody-imports.json"),
  settlementDrafts: await readJson("artifacts/batch-assurance-settlement-drafts.json"),
  checkpoint: await readJson("artifacts/checkpointed-accepted-index.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(dossier, null, 2)}\n`);
console.log(outPath);
console.log(`status=${dossier.status}`);
console.log(`participants=${dossier.summary.qualifyingIntendos}`);
console.log(`releaseAccepted=${dossier.summary.releaseAccepted}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
