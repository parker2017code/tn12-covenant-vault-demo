import { readFile, writeFile } from "node:fs/promises";
import { buildRecurringTreasuryVaultNegatives } from "../src/recurringTreasuryVaultNegatives.mjs";

const status = JSON.parse(await readFile("artifacts/recurring-treasury-vault-status.json", "utf8"));
const negativeMap = buildRecurringTreasuryVaultNegatives({ status });

await writeFile("artifacts/recurring-treasury-vault-negative-map.json", `${JSON.stringify(negativeMap, null, 2)}\n`);
console.log("artifacts/recurring-treasury-vault-negative-map.json");
console.log(`status=${negativeMap.status}`);
