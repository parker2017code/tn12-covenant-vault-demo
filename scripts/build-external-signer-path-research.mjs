import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildExternalSignerPathResearch } from "../src/externalSignerPathResearch.mjs";

const outPath = process.env.OUT || "artifacts/external-signer-path-research.json";
const research = buildExternalSignerPathResearch({
  roundtripPlan: await readJson("artifacts/wallet-external-signer-roundtrip-plan.json"),
  resultTemplate: await readJson("artifacts/wallet-external-signer-result-template.json"),
  signerValidation: await readJson("artifacts/wallet-standard-signer-validation.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(research, null, 2)}\n`);

console.log(outPath);
console.log(`status=${research.status}`);
console.log(`userApprovalRequired=${research.summary.userApprovalRequired}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
