import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiResearchBacklog } from "../src/defiBacklog.mjs";

const fixturePath = process.env.DEFI_BACKLOG_FIXTURE || "fixtures/DefiResearchBacklog.json";
const outPath = process.env.OUT || "artifacts/defi-backlog.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const backlog = buildDefiResearchBacklog(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(backlog, null, 2)}\n`);
console.log(outPath);
console.log(`briefs=${backlog.summary.total}`);
console.log(`researchOnly=${backlog.summary.researchOnly}`);
