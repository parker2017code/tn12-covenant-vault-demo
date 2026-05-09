import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainEndpointRunbook } from "../src/virtualChainEndpointRunbook.mjs";

const adapter = JSON.parse(await readFile(process.env.VIRTUAL_CHAIN_ADAPTER || "artifacts/virtual-chain-reader-adapter.json", "utf8"));
const preflight = JSON.parse(await readFile(process.env.VIRTUAL_CHAIN_PREFLIGHT || "artifacts/virtual-chain-live-preflight.json", "utf8"));
const outPath = process.env.OUT || "artifacts/virtual-chain-endpoint-runbook.json";

const runbook = buildVirtualChainEndpointRunbook({ adapter, preflight });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(runbook, null, 2)}\n`);

console.log(outPath);
console.log(`status=${runbook.status}`);
console.log(`blockingChecks=${runbook.summary.blockingChecks}`);
