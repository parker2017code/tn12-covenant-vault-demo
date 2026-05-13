import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.DRAFT || "artifacts/signed-drafts/blitz-mux-route-to-worker-b.json";
const outPath = process.env.OUT || "fixtures/BlitzWorkerBRouteOutpoint.json";
const lane = process.env.LANE || "blitz-mux-worker-b-route";
const contract = process.env.CONTRACT_NAME || "BlitzWorkerB";
const outputIndex = Number(process.env.OUTPUT_INDEX || "0");
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const draft = await readJson(draftPath);
const txid = process.env.TXID || draft.transactionId;
const endpoint = `${endpointBase}/${txid}`;
const response = await fetch(endpoint);
if (!response.ok) {
  throw new Error(`Blitz outpoint fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const output = (tx.outputs || []).find((item) => Number(item.index) === outputIndex);
if (!output) {
  throw new Error(`Output ${outputIndex} not found on ${txid}`);
}

const expected = draft.submitPayload.transaction.outputs[outputIndex];
if (String(output.amount) !== String(expected.amount)) {
  throw new Error(`Output amount mismatch: expected ${expected.amount}, got ${output.amount}`);
}
if (output.script_public_key !== expected.scriptPublicKey.scriptPublicKey) {
  throw new Error("Output scriptPublicKey does not match the signed draft.");
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
  covenantId: draft.source.covenantId,
  redeemScriptHex: draft.scriptEvidence.nextRedeemScriptHex,
  redeemScriptBytes: draft.scriptEvidence.nextRedeemScriptHex.length / 2,
  status: tx.is_accepted ? "accepted" : "submitted-not-yet-accepted",
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
  state: draft.route.state,
  sourceDraft: draftPath,
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
      blockDaaScore: String(tx.accepting_block_blue_score ?? ""),
      isCoinbase: false
    }
  }
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`${outPath} ${fixture.status} ${txid}:${outputIndex}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
