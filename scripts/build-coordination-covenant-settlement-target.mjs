import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildCoordinationCovenantSettlementTarget } from "../src/coordinationCovenantSettlementTarget.mjs";

const outPath = process.env.OUT || "artifacts/coordination-covenant-settlement-target.json";

const [dossier, acceptedOutputs, settlementDrafts] = await Promise.all([
  readJson("artifacts/coordination-market-evidence-dossier.json"),
  readJson("fixtures/AcceptedOutputEvidence.json"),
  readJson("artifacts/batch-assurance-settlement-drafts.json")
]);

const artifact = buildCoordinationCovenantSettlementTarget({
  dossier,
  acceptedOutputs,
  settlementDrafts
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
