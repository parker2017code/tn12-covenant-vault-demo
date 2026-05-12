import { mkdir, writeFile } from "node:fs/promises";
import { buildCovenantExperimentMap } from "../src/covenantExperimentMap.mjs";

const outPath = process.env.OUT || "artifacts/covenant-experiment-map.json";
const map = buildCovenantExperimentMap();

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(map, null, 2)}\n`);

console.log(outPath);
console.log(`experiments=${map.summary.experiments}`);
console.log(`spotlight=${map.spotlight.join(",")}`);
