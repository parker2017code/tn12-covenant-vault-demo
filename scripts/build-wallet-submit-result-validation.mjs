import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletSubmitResultValidation } from "../src/walletSubmitResultValidation.mjs";

const adapterRunPath = process.env.WALLET_CONNECTOR_ADAPTER_RUN || "artifacts/wallet-connector-adapter-run.json";
const submitResultsPath = process.env.WALLET_CONNECTOR_SUBMIT_RESULTS || "fixtures/WalletConnectorSubmitResults.json";
const virtualChainRunPath = process.env.VIRTUAL_CHAIN_RUN || "artifacts/virtual-chain-ingestion-run.json";
const validationFixturePath = process.env.WALLET_SUBMIT_RESULT_VALIDATION || "fixtures/WalletSubmitResultValidation.json";
const outPath = process.env.OUT || "artifacts/wallet-submit-result-validation.json";

const adapterRun = JSON.parse(await readFile(adapterRunPath, "utf8"));
const submitResults = JSON.parse(await readFile(submitResultsPath, "utf8"));
const virtualChainRun = JSON.parse(await readFile(virtualChainRunPath, "utf8"));
const validationFixture = JSON.parse(await readFile(validationFixturePath, "utf8"));
const validation = buildWalletSubmitResultValidation({
  adapterRun,
  submitResults,
  virtualChainRun,
  validationFixture
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(validation, null, 2)}\n`);

console.log(outPath);
console.log(`status=${validation.status}`);
console.log(`validClaims=${validation.summary.validClaims}`);
console.log(`caughtNegativeCases=${validation.summary.caughtNegativeCases}`);

if (validation.status !== "wallet-submit-result-validation-ready") {
  throw new Error(`Wallet submit result validation failed: ${validation.status}`);
}
