import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildStableValuePathRegistry } from "../src/stableValuePaths.mjs";

const fixturePath = process.env.STABLE_VALUE_FIXTURE || "fixtures/StableValuePaths.json";
const outPath = process.env.OUT || "artifacts/stable-value-paths.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const registry = buildStableValuePathRegistry(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`paths=${registry.summary.total}`);
console.log(`buildableNow=${registry.summary.buildableNow}`);
