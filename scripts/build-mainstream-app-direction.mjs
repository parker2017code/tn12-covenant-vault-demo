import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildMainstreamAppDirection } from "../src/mainstreamAppDirection.mjs";

const fixturePath = process.env.MAINSTREAM_APP_DIRECTION_FIXTURE || "fixtures/MainstreamAppDirection.json";
const outPath = process.env.OUT || "artifacts/mainstream-app-direction.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const direction = buildMainstreamAppDirection(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(direction, null, 2)}\n`);

console.log(outPath);
console.log(`targets=${direction.summary.total}`);
console.log(`buildNow=${direction.summary.buildNow}`);
console.log(`researchOrLater=${direction.summary.researchOrLater}`);
