import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildCoordinationMarketPrototype } from "../src/coordinationMarket.mjs";

const fixturePath = process.env.COORDINATION_FIXTURE || "fixtures/CoordinationMarketPrototype.json";
const outPath = process.env.OUT || "artifacts/coordination-market-prototype.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const prototype = buildCoordinationMarketPrototype(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(prototype, null, 2)}\n`);
console.log(outPath);
console.log(`stags=${prototype.summary.stags}`);
console.log(`satisfiable=${prototype.summary.satisfiablePacks}`);
