import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildDefiV1OperatorLoop } from "../src/defiV1OperatorLoop.mjs";

const walletPath = process.env.WALLET_PATH || ".local/tn12-defi-v1-wallet.json";
const outPath = process.env.OUT || "artifacts/defi-v1-operator-loop.json";

const [
  wallet,
  firstReceipt,
  repeatReceipt,
  firstDraft,
  repeatDraft,
  thirdReceipt,
  thirdDraft,
  fundedOutpoint,
  previousCurrentOutpoint,
  thirdPreviousOutpoint,
  currentOutpoint
] = await Promise.all([
  readJson(walletPath),
  readJson("artifacts/payload-defi-v1-live-receipt-evidence.json"),
  readJson("artifacts/payload-defi-v1-repeat-receipt-evidence.json"),
  readJson("artifacts/signed-drafts/tn12-defi-v1-payload-receipt.json"),
  readJson("artifacts/signed-drafts/tn12-defi-v1-repeat-receipt.json"),
  readJson("artifacts/payload-defi-v1-third-receipt-evidence.json").catch(() => null),
  readJson("artifacts/signed-drafts/tn12-defi-v1-third-receipt.json").catch(() => null),
  readJson("artifacts/tn12-defi-v1-funded-outpoint.json"),
  readJson("artifacts/tn12-defi-v1-current-outpoint-before-repeat.json").catch(() => readJson("artifacts/tn12-defi-v1-first-change-outpoint.json")),
  readJson("artifacts/tn12-defi-v1-current-outpoint-before-third.json").catch(() => null),
  readJson("artifacts/tn12-defi-v1-current-outpoint.json")
]);

const loop = buildDefiV1OperatorLoop({
  firstReceipt: { ...firstReceipt, source: firstDraft.source },
  repeatReceipt: { ...repeatReceipt, source: repeatDraft.source },
  thirdReceipt: thirdReceipt && thirdDraft ? { ...thirdReceipt, source: thirdDraft.source } : null,
  fundedOutpoint,
  previousCurrentOutpoint,
  thirdPreviousOutpoint,
  currentOutpoint,
  walletAddress: wallet.address
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(loop, null, 2)}\n`);

console.log(outPath);
console.log(`status=${loop.status}`);
console.log(`current=${loop.currentSpendableOutpoint.txid}:${loop.currentSpendableOutpoint.outputIndex}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
