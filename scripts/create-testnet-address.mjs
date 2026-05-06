import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Address, Keypair } from "kaspa-wasm";

const outDir = join(process.cwd(), ".local");
const outFile = join(outDir, "tn12-wallet.json");

if (existsSync(outFile) && !process.argv.includes("--force")) {
  console.error(`Refusing to overwrite ${outFile}`);
  console.error("Run with --force if you intentionally want a new testnet wallet.");
  process.exit(1);
}

const keypair = Keypair.random();
const address = String(keypair.toAddress("testnet"));
const privateKey = String(keypair.privateKey);
const parsed = new Address(address);

const wallet = {
  warning: "TESTNET ONLY. Do not use this seed or private key for mainnet funds.",
  network: "kaspa-testnet-12",
  address,
  addressPrefix: parsed.prefix,
  addressVersion: String(parsed.version),
  privateKey,
  derivation: "single random Rusty Kaspa WASM keypair",
  createdAt: new Date().toISOString()
};

await mkdir(outDir, { recursive: true, mode: 0o700 });
await writeFile(outFile, `${JSON.stringify(wallet, null, 2)}\n`, { mode: 0o600 });

console.log("TN12 testnet address:");
console.log(address);
console.log("");
console.log(`Saved testnet wallet material to ${outFile}`);
console.log("Paste the address into https://faucet-tn12.kaspanet.io/");
