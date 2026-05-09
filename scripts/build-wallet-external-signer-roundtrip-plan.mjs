import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletExternalSignerRoundtripPlan } from "../src/walletExternalSignerRoundtripPlan.mjs";

const standardRequestsPath = process.env.WALLET_STANDARD_REQUESTS || "artifacts/wallet-standard-requests.json";
const signerValidationPath = process.env.WALLET_SIGNER_VALIDATION || "artifacts/wallet-standard-signer-validation.json";
const endpointRunbookPath = process.env.VIRTUAL_CHAIN_ENDPOINT_RUNBOOK || "artifacts/virtual-chain-endpoint-runbook.json";
const outPath = process.env.OUT || "artifacts/wallet-external-signer-roundtrip-plan.json";

const standardRequests = JSON.parse(await readFile(standardRequestsPath, "utf8"));
const signerValidation = JSON.parse(await readFile(signerValidationPath, "utf8"));
const endpointRunbook = JSON.parse(await readFile(endpointRunbookPath, "utf8"));
const plan = buildWalletExternalSignerRoundtripPlan({ standardRequests, signerValidation, endpointRunbook });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(plan, null, 2)}\n`);

console.log(outPath);
console.log(`status=${plan.status}`);
console.log(`requests=${plan.summary.requests}`);
console.log(`pendingExternalSigner=${plan.summary.pendingExternalSigner}`);
