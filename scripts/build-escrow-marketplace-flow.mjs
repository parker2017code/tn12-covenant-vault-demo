import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEscrowMarketplaceFlow } from "../src/escrowMarketplaceFlow.mjs";

const marketplaceDemoPath = process.env.ESCROW_MARKETPLACE_DEMO || "artifacts/escrow-marketplace-demo.json";
const unsignedTemplatesPath = process.env.WALLET_UNSIGNED_TEMPLATES || "artifacts/wallet-unsigned-request-templates.json";
const outPath = process.env.OUT || "artifacts/escrow-marketplace-flow.json";

const marketplaceDemo = JSON.parse(await readFile(marketplaceDemoPath, "utf8"));
const unsignedTemplates = JSON.parse(await readFile(unsignedTemplatesPath, "utf8"));
const flow = buildEscrowMarketplaceFlow({ marketplaceDemo, unsignedTemplates });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(flow, null, 2)}\n`);

console.log(outPath);
console.log(`status=${flow.status}`);
console.log(`flows=${flow.summary.flows}`);
