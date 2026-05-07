import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PrivateKey, Keypair } from "kaspa-wasm";

const walletPath = ".local/tn12-wallet.json";
const wallet = JSON.parse(await readFile(walletPath, "utf8"));
const privateKey = new PrivateKey(wallet.privateKey);
const keypair = Keypair.fromPrivateKey(privateKey);
const address = String(keypair.toAddress("testnet"));

if (address !== wallet.address || !address.startsWith("kaspatest:")) {
  throw new Error("Saved wallet is not the expected TN12/testnet wallet.");
}

const xOnlyPublicKey = String(keypair.xOnlyPublicKey);
const publicKeyArg = hexToByteArrayArg(xOnlyPublicKey);
const now = Math.floor(Date.now() / 1000);
const unlockTime = Number(process.env.UNLOCK_TIME || now + Number(process.env.UNLOCK_DELAY_SECONDS || 24 * 3600));
const deadline = Number(process.env.DEADLINE || now + Number(process.env.DEADLINE_DELAY_SECONDS || 24 * 3600));
const refundTime = Number(process.env.REFUND_TIME || now + Number(process.env.REFUND_DELAY_SECONDS || 24 * 3600));
const minerFee = Number(process.env.CONTRACT_FEE_SOMPI || "5000");

await mkdir("fixtures", { recursive: true });
await writeFixture("fixtures/DelayedRecoveryVault.ctor.json", [
  publicKeyArg,
  publicKeyArg,
  intArg(unlockTime),
  intArg(minerFee)
]);
await writeFixture("fixtures/AssurancePledge.ctor.json", [
  publicKeyArg,
  publicKeyArg,
  intArg(deadline),
  intArg(minerFee)
]);
await writeFixture("fixtures/Escrow.ctor.json", [
  publicKeyArg,
  publicKeyArg,
  intArg(refundTime),
  intArg(minerFee)
]);
await writeFixture("fixtures/SavedWallet.public.json", {
  schema: "tn12-saved-wallet-public/v1",
  network: "kaspa-testnet-12",
  address,
  publicKey: String(keypair.publicKey),
  xOnlyPublicKey,
  userReportedBalanceTkas: 10000,
  warning: "Public metadata only. Private key remains in .local/tn12-wallet.json."
});

console.log(`Wrote constructor fixtures for ${address}`);

async function writeFixture(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function intArg(value) {
  return { kind: "int", data: value };
}

function hexToByteArrayArg(hex) {
  const bytes = hex.match(/.{2}/g)?.map((chunk) => Number.parseInt(chunk, 16)) || [];
  if (bytes.length !== 32) {
    throw new Error(`Expected 32-byte x-only public key, got ${bytes.length} bytes.`);
  }

  return {
    kind: "array",
    data: bytes.map((byte) => ({ kind: "byte", data: byte }))
  };
}
