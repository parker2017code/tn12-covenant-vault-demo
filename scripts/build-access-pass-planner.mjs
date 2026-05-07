import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAccessPassPlanner } from "../src/accessPassPlanner.mjs";

const fixturePath = process.env.ACCESS_PASS_FIXTURE || "fixtures/AccessPassPlanner.json";
const outPath = process.env.OUT || "artifacts/access-pass-planner.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const planner = buildAccessPassPlanner(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(planner, null, 2)}\n`);
console.log(outPath);
console.log(`passes=${planner.summary.totalPasses}`);
console.log(`acceptedRedemptions=${planner.summary.acceptedRedemptions}`);
