import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildTreasuryVaultRegistry } from "../src/treasuryVault.mjs";

const fixturePath = process.env.TREASURY_FIXTURE || "fixtures/TreasuryVaults.json";
const outPath = process.env.OUT || "artifacts/treasury-vaults.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const registry = buildTreasuryVaultRegistry(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`vaults=${registry.summary.total}`);
console.log(`payroll=${registry.summary.plannedPayrollTkas} TKAS`);
