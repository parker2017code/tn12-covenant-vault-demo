import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildWalletStandardSignerValidation } from "../src/walletStandardSignerValidation.mjs";

const standardRequestsPath = process.env.WALLET_STANDARD_REQUESTS || "artifacts/wallet-standard-requests.json";
const signerResultsPath = process.env.WALLET_STANDARD_SIGNER_RESULTS || "fixtures/WalletStandardSignerResults.json";
const outPath = process.env.OUT || "artifacts/wallet-standard-signer-validation.json";

const standardRequests = JSON.parse(await readFile(standardRequestsPath, "utf8"));
const signerResults = JSON.parse(await readFile(signerResultsPath, "utf8"));
const validation = buildWalletStandardSignerValidation({ standardRequests, signerResults });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(validation, null, 2)}\n`);

console.log(outPath);
console.log(`status=${validation.status}`);
console.log(`pending=${validation.summary.pending}`);
console.log(`negativeCasesCaught=${validation.summary.negativeCasesCaught}`);
