import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.P2PK_DRAFT || process.argv[2] || "artifacts/signed-drafts/multi-p2pk-transfer.json";
const outPath = process.env.OUT || process.argv[3] || "artifacts/multi-p2pk-transfer-evidence.json";
const draft = JSON.parse(await readFile(draftPath, "utf8"));
const txid = process.env.TXID || draft.transactionId;

if (!txid) {
  throw new Error("Multi P2PK transfer txid is missing.");
}

const response = await fetch(`https://api-tn12.kaspa.org/transactions/${txid}`);
if (!response.ok) {
  throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const outputs = (draft.outputs || []).map((expected) => {
  const observed = tx.outputs?.find((output) => Number(output.index) === Number(expected.index)) || null;
  const amountMatches = String(observed?.amount || "") === String(expected.amountSompi || "");
  const addressMatches = String(observed?.script_public_key_address || "") === String(expected.address || "");
  return {
    index: Number(expected.index),
    label: expected.label || "",
    expected: {
      amountSompi: String(expected.amountSompi || ""),
      address: expected.address || ""
    },
    observed: observed
      ? {
          amountSompi: String(observed.amount),
          address: observed.script_public_key_address || "",
          type: observed.script_public_key_type || ""
        }
      : null,
    amountMatches,
    addressMatches,
    matches: amountMatches && addressMatches
  };
});
const evidence = {
  schema: "tn12-multi-p2pk-transfer-evidence/v1",
  network: draft.network || "kaspa-testnet-12",
  verifiedAt: new Date().toISOString(),
  status: tx.is_accepted && outputs.every((output) => output.matches) ? "accepted-transfer-matched" : "needs-review",
  txid,
  accepted: Boolean(tx.is_accepted),
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  acceptingBlockTime: tx.accepting_block_time ?? null,
  source: draft.source || null,
  outputs,
  explorerUrl: `https://tn12.kaspa.stream/txs/${txid}`
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(evidence, null, 2)}\n`);

if (evidence.status !== "accepted-transfer-matched") {
  throw new Error(`Multi P2PK transfer evidence is ${evidence.status}`);
}

console.log(outPath);
console.log(`txid=${evidence.txid}`);
console.log(`outputs=${evidence.outputs.length}`);
console.log(`status=${evidence.status}`);
