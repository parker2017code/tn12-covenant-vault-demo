import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicRolesPath = process.env.ROLE_PUBLIC_FIXTURE || "fixtures/RoleSeparatedWallets.public.json";
const ctorDir = process.env.ROLE_EXPIRED_CTOR_DIR || "fixtures/role-separated-expired";
const publicRoles = JSON.parse(await readFile(publicRolesPath, "utf8")).roles;
const now = Math.floor(Date.now() / 1000);
const past = Number(process.env.EXPIRED_ROLE_TIME || now - Number(process.env.EXPIRED_ROLE_DELAY_SECONDS || 3600));
const minerFee = Number(process.env.CONTRACT_FEE_SOMPI || "5000");

await mkdir(ctorDir, { recursive: true });
await writeJson(join(ctorDir, "DelayedRecoveryVault.ctor.json"), [
  hexToByteArrayArg(publicRoles.vaultOwner.xOnlyPublicKey),
  hexToByteArrayArg(publicRoles.vaultRecovery.xOnlyPublicKey),
  intArg(past),
  intArg(minerFee)
]);
await writeJson(join(ctorDir, "AssurancePledge.ctor.json"), [
  hexToByteArrayArg(publicRoles.pledgeContributor.xOnlyPublicKey),
  hexToByteArrayArg(publicRoles.pledgeRecipient.xOnlyPublicKey),
  intArg(past),
  intArg(minerFee)
]);
await writeJson(join(ctorDir, "Escrow.ctor.json"), [
  hexToByteArrayArg(publicRoles.escrowBuyer.xOnlyPublicKey),
  hexToByteArrayArg(publicRoles.escrowSeller.xOnlyPublicKey),
  intArg(past),
  intArg(minerFee)
]);

console.log(`Wrote expired role-separated constructor fixtures to ${ctorDir}/`);
console.log(`expiredTime=${past}`);

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
