import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildProjectPlan } from "../src/projectPlan.mjs";

const fixturePath = process.env.BUILD_STATUS_FIXTURE || "fixtures/BuildStatus.json";
const outPath = process.env.OUT || "artifacts/project-plan.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const plan = buildProjectPlan(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(plan, null, 2)}\n`);
console.log(outPath);
console.log(`done=${plan.summary.done}`);
console.log(`wip=${plan.summary.wip}`);
console.log(`next=${plan.summary.next}`);
console.log(`later=${plan.summary.later}`);
