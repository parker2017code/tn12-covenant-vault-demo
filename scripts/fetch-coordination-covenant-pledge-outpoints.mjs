import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.COORDINATION_PLEDGE_FUNDING_DRAFT || "artifacts/signed-drafts/coordination-covenant-pledge-funding.json";
const contractPath = process.env.CONTRACT_ARTIFACT || "artifacts/AssurancePledge.json";
const outPath = process.env.OUT || "fixtures/CoordinationCovenantPledgeOutpoints.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const [draft, contractArtifact] = await Promise.all([
  readJson(draftPath),
  readJson(contractPath)
]);
const txid = process.env.COORDINATION_PLEDGE_FUNDING_TXID || draft.transactionId;
const endpoint = `${endpointBase}/${txid}`;
const response = await fetch(endpoint);
if (!response.ok) {
  throw new Error(`Coordination covenant pledge funding fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const pledgeOutputs = draft.outputs || [];
const outpoints = pledgeOutputs.map((pledge) => {
  const output = tx.outputs.find((item) => Number(item.index) === Number(pledge.index));
  if (!output) {
    throw new Error(`Funding tx ${txid} is missing pledge output ${pledge.index}.`);
  }
  return {
    schema: "tn12-contract-outpoint/v1",
    network: "kaspa-testnet-12",
    lane: "coordination-covenant-pledge",
    contract: draft.contract?.name || contractArtifact.contract_name || "AssurancePledge",
    pledgeId: pledge.pledgeId,
    fetchedAt: new Date().toISOString(),
    endpoint,
    txid,
    outputIndex: Number(pledge.index),
    amountTkas: Number(output.amount) / 100000000,
    amountSompi: String(output.amount),
    scriptType: output.script_public_key_type,
    scriptPublicKeyAddress: output.script_public_key_address,
    scriptPublicKey: output.script_public_key,
    covenant: pledge.covenant || null,
    redeemScriptHex: bytesToHex(contractArtifact.script || []),
    redeemScriptBytes: contractArtifact.script.length,
    status: tx.is_accepted ? "accepted" : "not-accepted",
    acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
    explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
    raw: {
      address: output.script_public_key_address,
      outpoint: {
        transactionId: txid,
        index: Number(pledge.index)
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
});

const artifact = {
  schema: "tn12-coordination-covenant-pledge-outpoints/v1",
  network: "kaspa-testnet-12",
  status: tx.is_accepted ? "accepted" : "not-accepted",
  fundingTxid: txid,
  fundingExplorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
  fetchedAt: new Date().toISOString(),
  pledgeOutputCount: outpoints.length,
  outpoints
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status} outputs=${artifact.pledgeOutputCount}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
