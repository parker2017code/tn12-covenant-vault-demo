import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildCoordinationMarketSettlementBrief } from "../src/coordinationMarketSettlementBrief.mjs";

const fixturePath = process.env.COORDINATION_SETTLEMENT_FIXTURE || "fixtures/CoordinationMarketSettlementBrief.json";
const prototypePath = process.env.COORDINATION_PROTOTYPE || "artifacts/coordination-market-prototype.json";
const outPath = process.env.OUT || "artifacts/coordination-market-settlement-brief.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const coordinationPrototype = JSON.parse(await readFile(prototypePath, "utf8"));
const brief = buildCoordinationMarketSettlementBrief({ fixture, coordinationPrototype });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(brief, null, 2)}\n`);

console.log(outPath);
console.log(`status=${brief.status}`);
console.log(`missingRails=${brief.summary.missingRails}`);
console.log(`productionReady=${brief.summary.productionReady}`);
