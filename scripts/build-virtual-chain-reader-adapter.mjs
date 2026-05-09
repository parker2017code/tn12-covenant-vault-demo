import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildVirtualChainReaderAdapter } from "../src/virtualChainReaderAdapter.mjs";

const fixturePath = process.env.VIRTUAL_CHAIN_READER_ADAPTER || "fixtures/VirtualChainReaderAdapter.json";
const checkpointPath = process.env.CHECKPOINT_INDEX || "artifacts/checkpointed-accepted-index.json";
const ingestionRunPath = process.env.VIRTUAL_CHAIN_RUN || "artifacts/virtual-chain-ingestion-run.json";
const outPath = process.env.OUT || "artifacts/virtual-chain-reader-adapter.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const checkpointIndex = JSON.parse(await readFile(checkpointPath, "utf8"));
const ingestionRun = JSON.parse(await readFile(ingestionRunPath, "utf8"));
const adapter = buildVirtualChainReaderAdapter({
  fixture,
  checkpointIndex,
  ingestionRun
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(adapter, null, 2)}\n`);

console.log(outPath);
console.log(`status=${adapter.status}`);
console.log(`endpointConfigured=${adapter.summary.endpointConfigured}`);
console.log(`virtualChainRows=${adapter.summary.virtualChainRows}`);
