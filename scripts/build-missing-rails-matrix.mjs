import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildMissingRailsMatrix } from "../src/missingRailsMatrix.mjs";

const fixturePath = process.env.MISSING_RAILS_FIXTURE || "fixtures/MissingRailsMatrix.json";
const outPath = process.env.OUT || "artifacts/missing-rails-matrix.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const matrix = buildMissingRailsMatrix(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(matrix, null, 2)}\n`);

console.log(outPath);
console.log(`status=${matrix.status}`);
console.log(`categories=${matrix.summary.categories}`);
console.log(`questions=${matrix.summary.questions}`);
