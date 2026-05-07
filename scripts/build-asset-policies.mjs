import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAssetPolicyRegistry } from "../src/assetPolicy.mjs";

const fixturePath = process.env.ASSET_POLICY_FIXTURE || "fixtures/SimpleAssetPolicies.json";
const outPath = process.env.OUT || "artifacts/simple-asset-policies.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const registry = buildAssetPolicyRegistry(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`policies=${registry.summary.total}`);
console.log(`covenantNative=${registry.summary.covenantNative}`);
