import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAiCodingSourceDiscipline } from "../src/aiCodingSourceDiscipline.mjs";

const fixturePath = process.env.AI_DISCIPLINE_FIXTURE || "fixtures/AiCodingSourceDiscipline.json";
const outPath = process.env.OUT || "artifacts/ai-coding-source-discipline.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const discipline = buildAiCodingSourceDiscipline(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(discipline, null, 2)}\n`);

console.log(outPath);
console.log(`status=${discipline.status}`);
console.log(`failureModes=${discipline.summary.failureModes}`);
console.log(`sourcesNeedingContentImport=${discipline.summary.sourcesNeedingContentImport}`);
