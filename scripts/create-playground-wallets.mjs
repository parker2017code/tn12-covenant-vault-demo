import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Address, Keypair } from "kaspa-wasm";
import { buildPlaygroundSession } from "../src/playgroundSession.mjs";

const outDir = process.env.PLAYGROUND_DIR || ".local/playground";
const privatePath = join(outDir, "wallets.private.json");
const publicPath = join(outDir, "wallets.public.json");
const sessionPath = join(outDir, "session.public.json");
const force = process.argv.includes("--force");

if ((existsSync(privatePath) || existsSync(publicPath) || existsSync(sessionPath)) && !force) {
  console.error(`Refusing to overwrite ${outDir}. Run with --force for a fresh playground session.`);
  process.exit(1);
}

const roles = [
  ["operator", "Operator / receipt submitter", "2"],
  ["pool", "Pool wallet", "25"],
  ["user-a", "User A / swapper", "10"],
  ["user-b", "User B / lender", "10"],
  ["executor", "Executor / scheduler bidder", "2"],
  ["reviewer", "Reviewer / oracle reporter", "2"]
];
const wallets = roles.map(([id, label, fundingTargetTkas]) => {
  const keypair = Keypair.random();
  const address = String(keypair.toAddress("testnet"));
  const parsed = new Address(address);
  return {
    id,
    label,
    fundingTargetTkas,
    network: "kaspa-testnet-12",
    address,
    addressPrefix: parsed.prefix,
    addressVersion: String(parsed.version),
    publicKey: String(keypair.publicKey),
    xOnlyPublicKey: String(keypair.xOnlyPublicKey),
    privateKey: String(keypair.privateKey)
  };
});
const publicAddresses = Object.fromEntries(wallets.map((wallet) => [wallet.id, wallet.address]));
const plan = {
  roles: roles.map(([id, label, suggestedFundingTkas]) => ({
    id,
    label,
    suggestedFundingTkas
  }))
};
const session = buildPlaygroundSession({ plan, publicAddresses });

await mkdir(outDir, { recursive: true, mode: 0o700 });
await writeFile(privatePath, `${JSON.stringify({
  warning: "TN12 TESTNET ONLY. Do not commit or share this file.",
  createdAt: new Date().toISOString(),
  wallets
}, null, 2)}\n`, { mode: 0o600 });
await writeFile(publicPath, `${JSON.stringify({
  schema: "tn12-playground-wallets-public/v1",
  network: "kaspa-testnet-12",
  createdAt: new Date().toISOString(),
  wallets: wallets.map(({ privateKey, ...wallet }) => wallet)
}, null, 2)}\n`, { mode: 0o600 });
await writeFile(sessionPath, `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600 });

console.log("Created TN12 playground wallets.");
console.log(`Private wallet file: ${privatePath}`);
console.log(`Public wallet file:  ${publicPath}`);
console.log(`Public session file: ${sessionPath}`);
console.log("");
console.log("Fund these kaspatest addresses through the TN12 faucet:");
for (const wallet of wallets) {
  console.log(`${wallet.id.padEnd(10)} ${wallet.fundingTargetTkas.padStart(2)} tKAS  ${wallet.address}`);
}
