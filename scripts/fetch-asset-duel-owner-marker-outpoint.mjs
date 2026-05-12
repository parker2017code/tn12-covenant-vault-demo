import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.DRAFT || "artifacts/signed-drafts/asset-duel-owner-marker-genesis.json";
const outPath = process.env.OUT || "fixtures/AssetDuelOwnerMarkerOutpoint.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const draft = JSON.parse(await readFile(draftPath, "utf8"));
const txid = process.env.TXID || draft.transactionId;
const endpoint = `${endpointBase}/${txid}`;
const response = await fetch(endpoint);
if (!response.ok) throw new Error(`Owner marker fetch failed for ${txid}: ${response.status} ${response.statusText}`);
const tx = await response.json();
const output = (tx.outputs || []).find((item) => Number(item.index) === 0);
if (!output) throw new Error(`Output 0 not found on ${txid}`);

const artifact = {
  schema: "tn12-contract-outpoint/v1",
  network: "kaspa-testnet-12",
  lane: "asset-duel-owner-marker",
  contract: "P2pkOwnerMarker",
  fetchedAt: new Date().toISOString(),
  endpoint,
  txid,
  outputIndex: 0,
  amountTkas: Number(output.amount) / 100000000,
  amountSompi: String(output.amount),
  scriptType: output.script_public_key_type || "p2pk",
  scriptPublicKeyAddress: output.script_public_key_address || null,
  scriptPublicKey: output.script_public_key,
  covenantId: draft.ownerMarker.covenant.covenantId,
  redeemScriptHex: null,
  redeemScriptBytes: 0,
  status: tx.is_accepted ? "accepted" : "not-accepted",
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
  raw: {
    address: output.script_public_key_address || null,
    outpoint: { transactionId: txid, index: 0 },
    utxoEntry: {
      amount: String(output.amount),
      scriptPublicKey: { scriptPublicKey: output.script_public_key },
      blockDaaScore: String(tx.accepting_block_blue_score ?? "0"),
      isCoinbase: false
    }
  }
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status} ${txid}:0`);
