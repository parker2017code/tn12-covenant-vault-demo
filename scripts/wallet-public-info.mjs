import { readFile } from "node:fs/promises";
import { PrivateKey, Keypair } from "kaspa-wasm";
import { assertSameTn12Address } from "../src/validation/address.mjs";

const walletPath = process.argv[2] || ".local/tn12-wallet.json";
const wallet = JSON.parse(await readFile(walletPath, "utf8"));
const privateKey = new PrivateKey(wallet.privateKey);
const keypair = Keypair.fromPrivateKey(privateKey);
const address = String(keypair.toAddress("testnet"));

assertSameTn12Address(address, wallet.address, "Derived and saved wallet addresses");

console.log(JSON.stringify({
  schema: "tn12-wallet-public-info/v1",
  network: "kaspa-testnet-12",
  address,
  publicKey: String(keypair.publicKey),
  xOnlyPublicKey: String(keypair.xOnlyPublicKey),
  warning: "Public metadata only. Private key was read locally and not printed."
}, null, 2));
