import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiMultiWalletScenarioPack } from "../src/defiMultiWalletScenarioPack.mjs";

const outPath = process.env.OUT || "artifacts/defi-multi-wallet-scenario-pack.json";

const pack = buildDefiMultiWalletScenarioPack({
  scenario: await readJson("artifacts/defi-scenario-simulation.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json"),
  advanced: await readJson("artifacts/defi-advanced-simulation.json"),
  receiptGuard: await readJson("artifacts/defi-receipt-replay-guard.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(pack, null, 2)}\n`);

console.log(outPath);
console.log(`status=${pack.status}`);
console.log(`roles=${pack.summary.roles}`);
console.log(`acceptedIndexedRoles=${pack.summary.acceptedIndexedRoles}`);
console.log(`externalSignerClaims=${pack.summary.externalSignerClaims}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
