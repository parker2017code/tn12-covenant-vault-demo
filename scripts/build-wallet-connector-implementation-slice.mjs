import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletConnectorImplementationSlice } from "../src/walletConnectorImplementationSlice.mjs";

const walletMapping = JSON.parse(await readFile(process.env.WALLET_STANDARD_MAPPING || "artifacts/wallet-standard-mapping.json", "utf8"));
const unsignedTemplates = JSON.parse(await readFile(process.env.WALLET_UNSIGNED_TEMPLATES || "artifacts/wallet-unsigned-request-templates.json", "utf8"));
const outPath = process.env.OUT || "artifacts/wallet-connector-implementation-slice.json";

const slice = buildWalletConnectorImplementationSlice({ walletMapping, unsignedTemplates });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(slice, null, 2)}\n`);

console.log(outPath);
console.log(`status=${slice.status}`);
console.log(`firstUserFlow=${slice.firstUserFlow}`);
