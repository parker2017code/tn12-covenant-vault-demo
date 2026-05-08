import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Keypair, PrivateKey } from "kaspa-wasm";

const localPath = ".local/tn12-role-wallets.json";
const publicPath = "fixtures/RoleSeparatedWallets.public.json";
const ctorDir = "fixtures/role-separated";
const force = process.argv.includes("--force");
const roles = [
  "vaultOwner",
  "vaultRecovery",
  "pledgeContributor",
  "pledgeRecipient",
  "escrowBuyer",
  "escrowSeller"
];

const roleWallets = await loadOrCreateRoleWallets();
const publicRoles = Object.fromEntries(Object.entries(roleWallets.roles).map(([role, wallet]) => [
  role,
  {
    address: wallet.address,
    publicKey: wallet.publicKey,
    xOnlyPublicKey: wallet.xOnlyPublicKey
  }
]));

const now = Math.floor(Date.now() / 1000);
const unlockTime = Number(process.env.UNLOCK_TIME || now + Number(process.env.UNLOCK_DELAY_SECONDS || 24 * 3600));
const deadline = Number(process.env.DEADLINE || now + Number(process.env.DEADLINE_DELAY_SECONDS || 24 * 3600));
const refundTime = Number(process.env.REFUND_TIME || now + Number(process.env.REFUND_DELAY_SECONDS || 24 * 3600));
const minerFee = Number(process.env.CONTRACT_FEE_SOMPI || "5000");

await mkdir("fixtures", { recursive: true });
await mkdir(ctorDir, { recursive: true });
await writeJson(publicPath, {
  schema: "tn12-role-separated-wallets-public/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  roles: publicRoles,
  constructorFixtures: {
    DelayedRecoveryVault: join(ctorDir, "DelayedRecoveryVault.ctor.json"),
    AssurancePledge: join(ctorDir, "AssurancePledge.ctor.json"),
    Escrow: join(ctorDir, "Escrow.ctor.json")
  },
  warning: "Public role metadata only. Private role keys remain in .local/tn12-role-wallets.json."
});
await writeJson(join(ctorDir, "DelayedRecoveryVault.ctor.json"), [
  hexToByteArrayArg(publicRoles.vaultOwner.xOnlyPublicKey),
  hexToByteArrayArg(publicRoles.vaultRecovery.xOnlyPublicKey),
  intArg(unlockTime),
  intArg(minerFee)
]);
await writeJson(join(ctorDir, "AssurancePledge.ctor.json"), [
  hexToByteArrayArg(publicRoles.pledgeContributor.xOnlyPublicKey),
  hexToByteArrayArg(publicRoles.pledgeRecipient.xOnlyPublicKey),
  intArg(deadline),
  intArg(minerFee)
]);
await writeJson(join(ctorDir, "Escrow.ctor.json"), [
  hexToByteArrayArg(publicRoles.escrowBuyer.xOnlyPublicKey),
  hexToByteArrayArg(publicRoles.escrowSeller.xOnlyPublicKey),
  intArg(refundTime),
  intArg(minerFee)
]);

console.log(`Wrote public role fixtures to ${publicPath}`);
console.log(`Wrote constructor fixtures to ${ctorDir}/`);
console.log(`Private role keys stay in ${localPath}`);

async function loadOrCreateRoleWallets() {
  if (existsSync(localPath) && !force) {
    return JSON.parse(await readFile(localPath, "utf8"));
  }
  const value = {
    warning: "TESTNET ONLY. Do not use these private keys for mainnet funds.",
    network: "kaspa-testnet-12",
    createdAt: new Date().toISOString(),
    roles: Object.fromEntries(roles.map((role) => [role, makeWallet()]))
  };
  await mkdir(".local", { recursive: true, mode: 0o700 });
  await writeFile(localPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  return value;
}

function makeWallet() {
  const keypair = Keypair.random();
  const address = String(keypair.toAddress("testnet"));
  return {
    address,
    privateKey: String(keypair.privateKey),
    publicKey: String(keypair.publicKey),
    xOnlyPublicKey: String(keypair.xOnlyPublicKey)
  };
}

async function writeJson(path, value) {
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

