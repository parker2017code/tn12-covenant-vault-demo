import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.CONTRACT_DRAFT || "artifacts/signed-drafts/escrow-funding.json";
const artifactPath = process.env.CONTRACT_ARTIFACT || "artifacts/Escrow.json";
const outPath = process.env.CONTRACT_OUT || "fixtures/EscrowContractOutpoint.json";
const lane = process.env.CONTRACT_LANE || "escrow";
const contract = process.env.CONTRACT_NAME || "Escrow";
const outputIndex = Number(process.env.CONTRACT_OUTPUT_INDEX || "0");
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const artifact = await readJson(artifactPath);
const fundingDraft = await readJson(draftPath);
const txid = process.env.CONTRACT_TXID || fundingDraft.transactionId;
const endpoint = `${endpointBase}/${txid}`;
const response = await fetch(endpoint);

if (!response.ok) {
  throw new Error(`Contract funding fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const output = tx.outputs.find((item) => Number(item.index) === outputIndex);

if (!output) {
  throw new Error(`Funding tx ${txid} is missing output ${outputIndex}.`);
}

const fixture = {
  schema: "tn12-contract-outpoint/v1",
  network: "kaspa-testnet-12",
  lane,
  contract,
  fetchedAt: new Date().toISOString(),
  endpoint,
  txid,
  outputIndex,
  amountTkas: Number(output.amount) / 100000000,
  amountSompi: String(output.amount),
  scriptType: output.script_public_key_type,
  scriptPublicKeyAddress: output.script_public_key_address,
  scriptPublicKey: output.script_public_key,
  redeemScriptHex: bytesToHex(artifact.script || []),
  redeemScriptBytes: artifact.script.length,
  status: tx.is_accepted ? "accepted" : "not-accepted",
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  explorerUrl: `https://tn12.kaspa.stream/txs/${txid}`,
  raw: {
    address: output.script_public_key_address,
    outpoint: {
      transactionId: txid,
      index: outputIndex
    },
    utxoEntry: {
      amount: String(output.amount),
      scriptPublicKey: {
        scriptPublicKey: output.script_public_key
      },
      blockDaaScore: String(tx.accepting_block_blue_score ?? "0"),
      isCoinbase: false
    }
  }
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`${outPath} ${fixture.status} ${txid}:${outputIndex} ${fixture.amountTkas} TKAS`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
