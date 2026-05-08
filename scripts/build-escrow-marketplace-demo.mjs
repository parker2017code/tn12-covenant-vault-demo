import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEscrowMarketplaceDemo } from "../src/escrowMarketplaceDemo.mjs";

const escrowRegistryPath = process.env.ESCROW_REGISTRY || "artifacts/escrow-primitives.json";
const walletConnectorRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const proofEvidencePath = process.env.PROOF_EVIDENCE || "artifacts/proof-evidence.json";
const outPath = process.env.OUT || "artifacts/escrow-marketplace-demo.json";

const escrowRegistry = JSON.parse(await readFile(escrowRegistryPath, "utf8"));
const walletConnectorRequests = JSON.parse(await readFile(walletConnectorRequestsPath, "utf8"));
const proofEvidence = JSON.parse(await readFile(proofEvidencePath, "utf8"));
const demo = buildEscrowMarketplaceDemo({
  escrowRegistry,
  walletConnectorRequests,
  proofEvidence
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(demo, null, 2)}\n`);

console.log(outPath);
console.log(`status=${demo.status}`);
console.log(`listings=${demo.summary.listings}`);
console.log(`acceptedEscrowProofs=${demo.summary.acceptedEscrowProofs}`);
