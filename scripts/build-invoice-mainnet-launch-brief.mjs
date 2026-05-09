import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildInvoiceMainnetLaunchBrief } from "../src/invoiceMainnetLaunchBrief.mjs";

const mainnetReadinessPath = process.env.MAINNET_READINESS || "artifacts/mainnet-readiness.json";
const invoiceRegistryPath = process.env.INVOICE_REGISTRY || "artifacts/invoice-registry.json";
const livePreflightPath = process.env.VIRTUAL_CHAIN_LIVE_PREFLIGHT || "artifacts/virtual-chain-live-preflight.json";
const walletStandardMappingPath = process.env.WALLET_STANDARD_MAPPING || "artifacts/wallet-standard-mapping.json";
const outPath = process.env.OUT || "artifacts/invoice-mainnet-launch-brief.json";

const mainnetReadiness = JSON.parse(await readFile(mainnetReadinessPath, "utf8"));
const invoiceRegistry = JSON.parse(await readFile(invoiceRegistryPath, "utf8"));
const livePreflight = JSON.parse(await readFile(livePreflightPath, "utf8"));
const walletStandardMapping = JSON.parse(await readFile(walletStandardMappingPath, "utf8"));
const brief = buildInvoiceMainnetLaunchBrief({ mainnetReadiness, invoiceRegistry, livePreflight, walletStandardMapping });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(brief, null, 2)}\n`);

console.log(outPath);
console.log(`status=${brief.status}`);
console.log(`blockers=${brief.summary.blockers}`);
