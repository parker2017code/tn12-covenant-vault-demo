import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEnforcementMatrix } from "../src/enforcementMatrix.mjs";

const fixturePath = process.env.ENFORCEMENT_FIXTURE || "fixtures/EnforcementMatrix.json";
const outPath = process.env.OUT || "artifacts/enforcement-matrix.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const matrix = buildEnforcementMatrix(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(matrix, null, 2)}\n`);
console.log(outPath);
console.log(`features=${matrix.summary.total}`);
console.log(`script=${matrix.summary.contractEnforced}`);
