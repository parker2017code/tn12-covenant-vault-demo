import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildTreasuryVaultRegistry } from "../src/treasuryVault.mjs";
import { buildTreasuryConstrainedSpends } from "../src/treasuryConstrainedSpends.mjs";

const fixturePath = process.env.TREASURY_FIXTURE || "fixtures/TreasuryVaults.json";
const walletRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/treasury-constrained-spends.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const walletConnectorRequests = JSON.parse(await readFile(walletRequestsPath, "utf8"));
const treasuryRegistry = buildTreasuryVaultRegistry(fixture);
const drafts = buildTreasuryConstrainedSpends({ treasuryRegistry, walletConnectorRequests });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(drafts, null, 2)}\n`);

console.log(outPath);
console.log(`status=${drafts.status}`);
console.log(`drafts=${drafts.summary.drafts}`);
console.log(`blockedDrafts=${drafts.summary.blockedDrafts}`);
