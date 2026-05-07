import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildStableIssuerRedemptionState } from "../src/stableIssuerRedemption.mjs";

const fixturePath = process.env.STABLE_ISSUER_FIXTURE || "fixtures/StableIssuerRedemptions.json";
const outPath = process.env.OUT || "artifacts/stable-issuer-redemptions.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const state = buildStableIssuerRedemptionState(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(state, null, 2)}\n`);
console.log(outPath);
console.log(`outstanding=${state.summary.acceptedOutstandingDisplay}`);
