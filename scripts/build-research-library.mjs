import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildResearchLibrary } from "../src/appResearch.mjs";

const fixturePath = process.env.RESEARCH_FIXTURE || "fixtures/CrossChainResearchLibrary.json";
const outPath = process.env.OUT || "artifacts/research-library.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const library = buildResearchLibrary(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(library, null, 2)}\n`);
console.log(outPath);
console.log(`candidates=${library.summary.total}`);
console.log(`buildNow=${library.summary.buildNow}`);
