import { mkdir, readFile, writeFile } from "node:fs/promises";

const basePath = process.env.BASE_CTOR || "fixtures/RecurringTreasuryVault.ctor.json";
const outPath = process.env.OUT || "fixtures/RecurringTreasuryVaultWindow.ctor.json";
const capSompi = Number(process.env.CAP_SOMPI || "7500000000");
const windowStart = Number(process.env.WINDOW_START || "9899000");
const spentInWindowSompi = Number(process.env.SPENT_IN_WINDOW_SOMPI || "6500000000");
const windowLength = Number(process.env.WINDOW_LENGTH || "1000");
const minerFeeSompi = Number(process.env.MINER_FEE_SOMPI || "20000");

const base = JSON.parse(await readFile(basePath, "utf8"));
const fixture = [
  base[0],
  base[1],
  { kind: "int", data: capSompi },
  { kind: "int", data: windowStart },
  { kind: "int", data: spentInWindowSompi },
  { kind: "int", data: windowLength },
  { kind: "int", data: minerFeeSompi }
];

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`${outPath} cap=${capSompi} spent=${spentInWindowSompi} window=${windowStart} length=${windowLength}`);
