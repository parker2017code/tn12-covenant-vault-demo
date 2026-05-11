import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.P2PK_DRAFT || process.argv[2] || "artifacts/signed-drafts/self-send-p2pk.json";
const outPath = process.env.OUT || process.argv[3] || "artifacts/p2pk-transfer-evidence.json";
const draft = JSON.parse(await readFile(draftPath, "utf8"));
const txid = process.env.TXID || draft.transactionId;

if (!txid) {
  throw new Error("P2PK transfer txid is missing.");
}

const response = await fetch(`https://api-tn12.kaspa.org/transactions/${txid}`);
if (!response.ok) {
  throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const observedOutput = tx.outputs?.find((output) => Number(output.index) === 0) || null;
const amountMatches = String(observedOutput?.amount || "") === String(draft.payment?.amountSompi || "");
const addressMatches = String(observedOutput?.script_public_key_address || "") === String(draft.payment?.to || "");
const evidence = {
  schema: "tn12-p2pk-transfer-evidence/v1",
  network: draft.network || "kaspa-testnet-12",
  verifiedAt: new Date().toISOString(),
  status: tx.is_accepted && amountMatches && addressMatches ? "accepted-transfer-matched" : "needs-review",
  txid,
  accepted: Boolean(tx.is_accepted),
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  acceptingBlockTime: tx.accepting_block_time ?? null,
  source: draft.source || null,
  payment: draft.payment || null,
  output: {
    observed: observedOutput
      ? {
          index: Number(observedOutput.index),
          amountSompi: String(observedOutput.amount),
          address: observedOutput.script_public_key_address || "",
          type: observedOutput.script_public_key_type || ""
        }
      : null,
    amountMatches,
    addressMatches
  },
  explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(evidence, null, 2)}\n`);

if (evidence.status !== "accepted-transfer-matched") {
  throw new Error(`P2PK transfer evidence is ${evidence.status}`);
}

console.log(outPath);
console.log(`txid=${evidence.txid}`);
console.log(`status=${evidence.status}`);
