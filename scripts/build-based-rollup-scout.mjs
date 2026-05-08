import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildBasedRollupScout } from "../src/basedRollupScout.mjs";

const fixturePath = process.env.BASED_ROLLUP_SCOUT_FIXTURE || "fixtures/BasedRollupScout.json";
const outPath = process.env.OUT || "artifacts/based-rollup-scout.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const scout = buildBasedRollupScout(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(scout, null, 2)}\n`);

console.log(outPath);
console.log(`status=${scout.status}`);
console.log(`sources=${scout.summary.sourceCount}`);
console.log(`next=${scout.summary.nextActions}`);
