import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "fixtures/SchedulerCovenantPayout.ctor.json";
const operatorPath = process.env.OPERATOR_PUBLIC_WALLET || "fixtures/SavedWallet.public.json";
const usersPath = process.env.DEFI_USERS_PUBLIC || "fixtures/DefiLocalUserWallets.public.json";
const recipientId = process.env.RECIPIENT_ID || "user-03";
const payoutSompi = Number(process.env.PAYOUT_SOMPI || "400000000");
const minerFeeSompi = Number(process.env.MINER_FEE_SOMPI || "5000");

const [operator, users] = await Promise.all([
  readJson(operatorPath),
  readJson(usersPath)
]);
const recipient = (users.users || users.wallets || []).find((row) => row.id === recipientId);
if (!recipient) {
  throw new Error(`Missing recipient ${recipientId} in ${usersPath}.`);
}

const fixture = [
  hexToByteArrayArg(operator.xOnlyPublicKey),
  hexToByteArrayArg(recipient.xOnlyPublicKey),
  { kind: "int", data: payoutSompi },
  { kind: "int", data: minerFeeSompi }
];

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`${outPath} recipient=${recipient.address} payoutSompi=${payoutSompi}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function hexToByteArrayArg(hex) {
  const clean = String(hex || "");
  if (!/^[0-9a-f]{64}$/i.test(clean)) {
    throw new Error("Expected 32-byte x-only public key hex.");
  }
  return {
    kind: "array",
    data: clean.match(/../g).map((chunk) => ({
      kind: "byte",
      data: Number.parseInt(chunk, 16)
    }))
  };
}
