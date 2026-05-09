import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainLivePreflight } from "../src/virtualChainLivePreflight.mjs";

const readerAdapterPath = process.env.VIRTUAL_CHAIN_READER_ADAPTER || "artifacts/virtual-chain-reader-adapter.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-live-preflight.json";

const readerAdapter = JSON.parse(await readFile(readerAdapterPath, "utf8"));
const preflight = buildVirtualChainLivePreflight({ readerAdapter });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(preflight, null, 2)}\n`);

console.log(outPath);
console.log(`status=${preflight.status}`);
console.log(`blocking=${preflight.summary.blocking}`);
