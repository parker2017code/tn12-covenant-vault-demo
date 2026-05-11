import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiArtifactManifest } from "../src/defiArtifactManifest.mjs";

const outPath = process.env.OUT || "artifacts/defi-artifact-manifest.json";

const manifest = buildDefiArtifactManifest({
  artifacts: {
    planner: await readJson("artifacts/defi-planner-simulation.json"),
    scenario: await readJson("artifacts/defi-scenario-simulation.json"),
    reducer: await readJson("artifacts/defi-scenario-reducer.json"),
    advanced: await readJson("artifacts/defi-advanced-simulation.json"),
    "multi-wallet": await readJson("artifacts/defi-multi-wallet-scenario-pack.json")
  }
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(outPath);
console.log(`status=${manifest.status}`);
console.log(`readyArtifacts=${manifest.summary.readyArtifacts}/${manifest.summary.artifacts}`);
console.log(`problems=${manifest.summary.problems}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
