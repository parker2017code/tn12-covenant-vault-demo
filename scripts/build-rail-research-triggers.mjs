import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildRailResearchTriggers } from "../src/railResearchTriggers.mjs";

const fixturePath = process.env.RAIL_RESEARCH_TRIGGERS_FIXTURE || "fixtures/RailResearchTriggers.json";
const outPath = process.env.OUT || "artifacts/rail-research-triggers.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const triggers = buildRailResearchTriggers(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(triggers, null, 2)}\n`);

console.log(outPath);
console.log(`status=${triggers.status}`);
console.log(`triggers=${triggers.summary.triggers}`);
console.log(`externalSources=${triggers.summary.externalSourceRefs}`);
