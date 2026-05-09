import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletConnectorSubmitLedger } from "../src/walletConnectorSubmitLedger.mjs";

const adapterRunPath = process.env.WALLET_CONNECTOR_ADAPTER_RUN || "artifacts/wallet-connector-adapter-run.json";
const submitResultsPath = process.env.WALLET_CONNECTOR_SUBMIT_RESULTS || "fixtures/WalletConnectorSubmitResults.json";
const virtualChainRunPath = process.env.VIRTUAL_CHAIN_RUN || "artifacts/virtual-chain-ingestion-run.json";
const outPath = process.env.OUT || "artifacts/wallet-connector-submit-ledger.json";

const adapterRun = JSON.parse(await readFile(adapterRunPath, "utf8"));
const submitResults = JSON.parse(await readFile(submitResultsPath, "utf8"));
const virtualChainRun = JSON.parse(await readFile(virtualChainRunPath, "utf8"));
const ledger = buildWalletConnectorSubmitLedger({ adapterRun, submitResults, virtualChainRun });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(ledger, null, 2)}\n`);

console.log(outPath);
console.log(`status=${ledger.status}`);
console.log(`acceptedEvidence=${ledger.summary.acceptedEvidence}`);
console.log(`pendingWalletSubmit=${ledger.summary.pendingWalletSubmit}`);
