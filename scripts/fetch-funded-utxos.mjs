import { writeFile } from "node:fs/promises";
import { FUNDED_TN12_ADDRESS, normalizeManualOutpoint } from "../src/manualOutpoint.mjs";

const endpoint = `https://api-tn12.kaspa.org/addresses/${FUNDED_TN12_ADDRESS}/utxos`;
const response = await fetch(endpoint);

if (!response.ok) {
  throw new Error(`UTXO fetch failed: ${response.status} ${response.statusText}`);
}

const utxos = await response.json();
const sorted = [...utxos].sort((a, b) => Number(b.utxoEntry.amount) - Number(a.utxoEntry.amount));
const first = sorted[0];

if (!first) {
  throw new Error(`No UTXOs returned for ${FUNDED_TN12_ADDRESS}`);
}

const outpoint = normalizeManualOutpoint({
  label: "Fetched funded TN12 wallet UTXO",
  address: first.address,
  txid: first.outpoint.transactionId,
  outputIndex: first.outpoint.index,
  amountTkas: Number(first.utxoEntry.amount) / 100000000,
  scriptType: "p2pk",
  explorerUrl: `https://tn12.kaspa.stream/txs/${first.outpoint.transactionId}`,
  note: `Fetched from ${endpoint}`
});

const artifact = {
  schema: "tn12-manual-outpoint/v1",
  network: "kaspa-testnet-12",
  fetchedAt: new Date().toISOString(),
  endpoint,
  ...outpoint,
  raw: first
};

await writeFile("fixtures/FundedWalletOutpoint.json", `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile("fixtures/FundedWalletUtxos.json", `${JSON.stringify({
  schema: "tn12-funded-wallet-utxos/v1",
  network: "kaspa-testnet-12",
  fetchedAt: new Date().toISOString(),
  endpoint,
  utxos: utxos.map(toOutpointArtifact)
}, null, 2)}\n`);

console.log(JSON.stringify(artifact, null, 2));

function toOutpointArtifact(utxo) {
  return {
    schema: "tn12-manual-outpoint/v1",
    network: "kaspa-testnet-12",
    label: `Fetched TN12 UTXO ${utxo.outpoint.transactionId}:${utxo.outpoint.index}`,
    address: utxo.address,
    txid: utxo.outpoint.transactionId,
    outputIndex: utxo.outpoint.index,
    amountTkas: Number(utxo.utxoEntry.amount) / 100000000,
    scriptType: "p2pk",
    explorerUrl: `https://tn12.kaspa.stream/txs/${utxo.outpoint.transactionId}`,
    note: `Fetched from ${endpoint}`,
    raw: utxo
  };
}
