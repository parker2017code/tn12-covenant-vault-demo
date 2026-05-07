import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildMainnetReadiness } from "../src/mainnetReadiness.mjs";

const fixturePath = process.env.MAINNET_READINESS_FIXTURE || "fixtures/MainnetReadiness.json";
const outPath = process.env.OUT || "artifacts/mainnet-readiness.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const readiness = buildMainnetReadiness(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(readiness, null, 2)}\n`);
console.log(outPath);
console.log(`mainnetCapable=${readiness.summary.mainnetCapable}`);
console.log(`tn12Only=${readiness.summary.tn12Only}`);
