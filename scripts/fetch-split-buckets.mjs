import { readFile, writeFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/signed-drafts/split-funding.json", "utf8"));
const txid = process.env.SPLIT_TXID || artifact.transactionId;
const endpoint = `https://api-tn12.kaspa.org/transactions/${txid}`;
const response = await fetch(endpoint);

if (!response.ok) {
  throw new Error(`Split transaction fetch failed: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const outputs = [...tx.outputs].sort((a, b) => Number(a.index) - Number(b.index));
const paths = [
  "fixtures/VaultBucketOutpoint.json",
  "fixtures/AssuranceBucketOutpoint.json",
  "fixtures/ChangeBucketOutpoint.json"
];

for (let index = 0; index < Math.min(outputs.length, paths.length); index += 1) {
  const output = outputs[index];
  const fixture = {
    schema: "tn12-manual-outpoint/v1",
    network: "kaspa-testnet-12",
    fetchedAt: new Date().toISOString(),
    endpoint,
    label: `Split bucket ${txid}:${output.index}`,
    address: output.script_public_key_address,
    txid,
    outputIndex: Number(output.index),
    amountTkas: Number(output.amount) / 100000000,
    scriptType: output.script_public_key_type,
    explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
    note: "Fetched from the accepted split transaction, not from current wallet UTXO sorting.",
    raw: {
      address: output.script_public_key_address,
      outpoint: {
        transactionId: txid,
        index: Number(output.index)
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
  await writeFile(paths[index], `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(`${paths[index]} ${txid}:${output.index} ${fixture.amountTkas} TKAS`);
}
