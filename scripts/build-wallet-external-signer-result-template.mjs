import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletExternalSignerResultTemplate } from "../src/walletExternalSignerResultTemplate.mjs";

const roundtripPlanPath = process.env.WALLET_EXTERNAL_SIGNER_ROUNDTRIP_PLAN || "artifacts/wallet-external-signer-roundtrip-plan.json";
const outPath = process.env.OUT || "artifacts/wallet-external-signer-result-template.json";

const roundtripPlan = JSON.parse(await readFile(roundtripPlanPath, "utf8"));
const template = buildWalletExternalSignerResultTemplate({ roundtripPlan });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(template, null, 2)}\n`);

console.log(outPath);
console.log(`status=${template.status}`);
console.log(`templates=${template.summary.templates}`);
console.log(`recommendedFirstPass=${template.summary.recommendedFirstPass}`);
