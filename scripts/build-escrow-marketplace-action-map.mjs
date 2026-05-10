import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEscrowMarketplaceActionMap } from "../src/escrowMarketplaceActionMap.mjs";

const marketplaceFlowPath = process.env.ESCROW_MARKETPLACE_FLOW || "artifacts/escrow-marketplace-flow.json";
const unsignedTemplatesPath = process.env.WALLET_UNSIGNED_TEMPLATES || "artifacts/wallet-unsigned-request-templates.json";
const walletStandardRequestsPath = process.env.WALLET_STANDARD_REQUESTS || "artifacts/wallet-standard-requests.json";
const signerValidationPath = process.env.WALLET_SIGNER_VALIDATION || "artifacts/wallet-standard-signer-validation.json";
const signerSimPath = process.env.SIGNER_SIM || "artifacts/wallet-external-signer-sim-results.json";
const outPath = process.env.OUT || "artifacts/escrow-marketplace-action-map.json";

const marketplaceFlow = JSON.parse(await readFile(marketplaceFlowPath, "utf8"));
const unsignedTemplates = JSON.parse(await readFile(unsignedTemplatesPath, "utf8"));
const walletStandardRequests = JSON.parse(await readFile(walletStandardRequestsPath, "utf8"));
const signerValidation = JSON.parse(await readFile(signerValidationPath, "utf8"));
let signerSim = {};
try { signerSim = JSON.parse(await readFile(signerSimPath, "utf8")); } catch { /* optional */ }

const actionMap = buildEscrowMarketplaceActionMap({
  marketplaceFlow,
  unsignedTemplates,
  walletStandardRequests,
  signerValidation,
  signerSim
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(actionMap, null, 2)}\n`);

console.log(outPath);
console.log(`status=${actionMap.status}`);
console.log(`mappedActions=${actionMap.summary.mappedActions}`);
console.log(`simValidatedActions=${actionMap.summary.simValidatedActions}`);
console.log(`blockedActions=${actionMap.summary.blockedActions}`);
