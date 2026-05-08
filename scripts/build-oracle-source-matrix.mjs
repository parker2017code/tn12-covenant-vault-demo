import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildOracleSourceMatrix } from "../src/oracleSourceMatrix.mjs";

const fixturePath = process.env.ORACLE_SOURCE_MATRIX_FIXTURE || "fixtures/OracleSourceMatrix.json";
const outPath = process.env.OUT || "artifacts/oracle-source-matrix.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const matrix = buildOracleSourceMatrix(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(matrix, null, 2)}\n`);

console.log(outPath);
console.log(`status=${matrix.status}`);
console.log(`models=${matrix.summary.models}`);
console.log(`highRiskModels=${matrix.summary.highRiskModels}`);
