import { readFile } from "node:fs/promises";
import { PrivateKey, Keypair } from "kaspa-wasm";

const walletPath = process.argv[2] || ".local/tn12-wallet.json";
const wallet = JSON.parse(await readFile(walletPath, "utf8"));
const privateKey = new PrivateKey(wallet.privateKey);
const keypair = Keypair.fromPrivateKey(privateKey);
const address = String(keypair.toAddress("testnet"));

if (address !== wallet.address || !address.startsWith("kaspatest:")) {
  throw new Error("Saved wallet does not derive the expected TN12 address.");
}

console.log(JSON.stringify({
  schema: "tn12-wallet-public-info/v1",
  network: "kaspa-testnet-12",
  address,
  publicKey: String(keypair.publicKey),
  xOnlyPublicKey: String(keypair.xOnlyPublicKey),
  warning: "Public metadata only. Private key was read locally and not printed."
}, null, 2));
