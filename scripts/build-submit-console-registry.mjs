import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSubmitConsoleRegistry } from "../src/submitConsole.mjs";

const manifestPath = process.env.SUBMIT_MANIFEST || "fixtures/SubmitConsoleDrafts.json";
const outPath = process.env.OUT || "artifacts/submit-console-registry.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const artifactsByPath = {};

for (const draft of manifest.drafts || []) {
  artifactsByPath[draft.path] = JSON.parse(await readFile(draft.path, "utf8"));
}

const registry = buildSubmitConsoleRegistry(manifest, artifactsByPath);
await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`drafts=${registry.summary.total}`);
console.log(`payloadDrafts=${registry.summary.payloadDrafts}`);
