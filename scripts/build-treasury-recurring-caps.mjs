import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildTreasuryRecurringCaps } from "../src/treasuryRecurringCaps.mjs";

const spendCapsPath = process.env.TREASURY_SPEND_CAPS || "artifacts/treasury-spend-caps.json";
const evidencePath = process.env.TREASURY_UNDER_CAP_EVIDENCE || "artifacts/treasury-recurring-cap-under-001-evidence.json";
const outPath = process.env.OUT || "artifacts/treasury-recurring-caps.json";

const artifact = buildTreasuryRecurringCaps({
  spendCaps: await readJson(spendCapsPath),
  underCapEvidence: await readJson(evidencePath)
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`acceptedUnderCapTxs=${artifact.summary.acceptedUnderCapTxs}`);
console.log(`blockedOverCapRows=${artifact.summary.blockedOverCapRows}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
