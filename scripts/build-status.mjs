import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildProjectStatus } from "../src/buildStatus.mjs";

const fixturePath = process.env.BUILD_STATUS_FIXTURE || "fixtures/BuildStatus.json";
const outPath = process.env.OUT || "artifacts/build-status.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const status = buildProjectStatus(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(status, null, 2)}\n`);
console.log(outPath);
console.log(`builtBases=${status.summary.builtBases}`);
console.log(`nextBuilds=${status.summary.nextBuilds}`);
